import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';
import { PreventivosService } from '../../../core/services/preventivos.service';
import { AuthService } from '../../../core/services/auth.service';
import { TareaPreventiva } from '../../../models/tarea-preventiva.model';

@Component({
  selector: 'app-detalle-tarea',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeroComponent, FormsModule, DatePipe],
  templateUrl: './detalle-tarea.component.html',
  styleUrl: './detalle-tarea.component.scss',
})
export class DetalleTareaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly preventivos = inject(PreventivosService);
  private readonly auth = inject(AuthService);

  readonly id = signal<string | null>(null);
  readonly tarea = signal<TareaPreventiva | null>(null);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);

  readonly usuario = this.auth.usuario;

  // Estado operativo: 'Programada' (1) | 'En ejecución' (2) | 'Ejecutada' (3)
  estadoOperativo = signal<'Programada' | 'En ejecución' | 'Ejecutada'>('Programada');

  // HU-MAN-05: Formulario de ejecución del mantenimiento
  fechaEjecucion = signal<string>('');
  diagnostico = signal<string>('');
  trabajoEfectuado = signal<string>('');
  errorValidacion = signal<string | null>(null);
  guardando = signal<boolean>(false);
  mantenimientoExitoso = signal<boolean>(false);

  // Evidencias (PNG, JPG, WEBP, PDF · Máx. 3)
  archivos = signal<File[]>([]);
  previews = signal<{ nombre: string; url: string; esPdf: boolean }[]>([]);

  // Datos registrados para mostrar en el estado EJECUTADA
  datosEjecutados = signal<{
    observaciones: string;
    trabajo: string;
    fecha: string;
    tecnico: string;
    evidencias: { nombre: string; url: string; esPdf: boolean }[];
  } | null>(null);

  // Historial del activo
  historialActivo = signal<Array<{ fecha: string; titulo: string; estado: string; esActual?: boolean }>>([]);

  // HU-MAN-04-CA-02: Verificar si el técnico autenticado es el responsable asignado
  readonly tieneAcceso = computed(() => {
    const t = this.tarea();
    const u = this.usuario();
    if (!t || !u) return false;

    if (u.rol === 'administrador') return true;
    return t.responsableId === u.id;
  });

  // Paso activo del stepper (1: Programada, 2: En ejecución, 3: Ejecutada)
  pasoActivo = computed(() => {
    const est = this.estadoOperativo();
    if (est === 'Programada') return 1;
    if (est === 'En ejecución') return 2;
    if (est === 'Ejecutada') return 3;
    return 1;
  });

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id.set(idParam);

    // Inicializamos la fecha de ejecución con la fecha y hora actual formateada para input datetime-local
    this.inicializarFechaActual();

    if (!idParam) {
      this.errorCarga.set('ID de tarea no especificado.');
      this.cargando.set(false);
      return;
    }

    let encontrada = this.preventivos.obtenerPorId(idParam);

    if (encontrada) {
      this.tarea.set(encontrada);

      // Verificamos si ya existe una intervención guardada en la BD para esta tarea
      const intervenciones = await this.preventivos.obtenerHistorialIntervenciones();
      const intervencionExistente = intervenciones.find(
        (i: any) => String(i.tareaPreventiva?.id ?? i.tareaPreventiva) === String(idParam)
      );

      const codigo = encontrada.estadoCodigo?.toUpperCase() ?? '';

      if (intervencionExistente || codigo.includes('EJECUT') || codigo.includes('COMPLET')) {
        this.estadoOperativo.set('Ejecutada');
        this.mantenimientoExitoso.set(true);

        if (intervencionExistente) {
          const fechaEjec = intervencionExistente.ejecutadoEn
            ? new Date(intervencionExistente.ejecutadoEn).toLocaleString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : this.fechaEjecucion();

          this.datosEjecutados.set({
            observaciones: intervencionExistente.observaciones || 'Sin observaciones registradas.',
            trabajo: intervencionExistente.accionesRealizadas || 'Trabajo completado según protocolo.',
            fecha: fechaEjec,
            tecnico: this.usuario()?.nombre ?? 'Mantenimiento Prueba (Tú)',
            evidencias: [],
          });
        }
      }

      this.cargarHistorialMock(encontrada);
    } else {
      this.errorCarga.set(
        this.preventivos.error() ??
          'No se encontró la tarea solicitada en el sistema.'
      );
    }

    this.cargando.set(false);
  }

  private inicializarFechaActual(): void {
    const ahora = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const fechaStr = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())} ${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
    this.fechaEjecucion.set(fechaStr);
  }

  private cargarHistorialMock(t: TareaPreventiva): void {
    this.historialActivo.set([
      {
        fecha: '01/10/2026',
        titulo: 'Revisión Mensual',
        estado: 'Ejecutada por Mantenimiento Prueba',
      },
      {
        fecha: '15/11/2026',
        titulo: t.titulo,
        estado: this.estadoOperativo() === 'Ejecutada' ? 'Ejecutada' : 'En ejecución (esta tarea)',
        esActual: true,
      },
    ]);
  }

  /**
   * Cambia de PROGRAMADA (1) a EN EJECUCIÓN (2)
   */
  iniciarAtencion(): void {
    this.estadoOperativo.set('En ejecución');
    this.errorValidacion.set(null);
  }

  onDropArchivos(event: DragEvent): void {
    event.preventDefault();
    if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) return;
    this.procesarArchivos(Array.from(event.dataTransfer.files));
  }

  onArchivosSeleccionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.procesarArchivos(Array.from(input.files));
    input.value = '';
  }

  private procesarArchivos(nuevos: File[]): void {
    const permitidos = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
    const invalidos = nuevos.filter(
      (f) => !permitidos.includes(f.type) && !/\.(png|jpe?g|webp|pdf)$/i.test(f.name)
    );

    if (invalidos.length > 0) {
      this.errorValidacion.set('Solo se permiten imágenes (PNG, JPG, WEBP) o documentos PDF.');
      return;
    }

    if (this.archivos().length + nuevos.length > 3) {
      this.errorValidacion.set('Solo puedes adjuntar un máximo de 3 archivos de evidencia.');
      return;
    }

    this.errorValidacion.set(null);
    this.archivos.set([...this.archivos(), ...nuevos]);

    nuevos.forEach((file) => {
      const esPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      if (esPdf) {
        this.previews.update((prev) => [
          ...prev,
          { nombre: file.name, url: '', esPdf: true },
        ]);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            this.previews.update((prev) => [
              ...prev,
              { nombre: file.name, url: e.target!.result as string, esPdf: false },
            ]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  eliminarArchivo(index: number): void {
    this.archivos.update((archs) => archs.filter((_, i) => i !== index));
    this.previews.update((prevs) => prevs.filter((_, i) => i !== index));
  }

  /**
   * CUMPLIMIENTO HU-MAN-05-CA-01 y CA-02:
   * Valida datos obligatorios y finaliza el mantenimiento registrando la trazabilidad
   */
  async finalizarMantenimiento(): Promise<void> {
    // HU-MAN-05-CA-02: Exige datos mínimos (trabajo efectuado obligatorio)
    if (!this.trabajoEfectuado().trim()) {
      this.errorValidacion.set(
        'Debes registrar el trabajo efectuado para finalizar el mantenimiento. La tarea sigue programada.'
      );
      return;
    }

    const t = this.tarea();
    if (!t) return;

    this.errorValidacion.set(null);
    this.guardando.set(true);

    try {
      await this.preventivos.registrarIntervencion({
        tareaId: t.id,
        accionesRealizadas: this.trabajoEfectuado(),
        observaciones: this.diagnostico(),
        ejecutadoEn: new Date().toISOString(),
        archivos: this.archivos(),
      });

      // Guardamos la instantánea de datos para la vista de éxito
      this.datosEjecutados.set({
        observaciones: this.diagnostico() || 'Sin observaciones registradas.',
        trabajo: this.trabajoEfectuado(),
        fecha: this.fechaEjecucion(),
        tecnico: this.usuario()?.nombre ?? 'Mantenimiento Prueba (Tú)',
        evidencias: [...this.previews()],
      });

      // Pasamos reactivamente al paso 3 (EJECUTADA)
      this.estadoOperativo.set('Ejecutada');
      this.mantenimientoExitoso.set(true);

      // Actualizamos el historial del activo
      this.cargarHistorialMock(t);
    } catch (error) {
      console.error(error);
      this.errorValidacion.set('Ocurrió un error al registrar el mantenimiento en el servidor.');
    } finally {
      this.guardando.set(false);
    }
  }
}