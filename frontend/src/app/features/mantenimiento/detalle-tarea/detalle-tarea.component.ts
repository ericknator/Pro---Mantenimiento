import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';
import { PreventivosService } from '../../../core/services/preventivos.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  IntervencionPreventivaApi,
  TareaPreventiva,
} from '../../../models/tarea-preventiva.model';

type EstadoOperativo = 'Programada' | 'En ejecución' | 'Ejecutada';

interface HistorialIntervencion {
  fecha: string;
  titulo: string;
  estado: string;
  esActual?: boolean;
}

interface DatosIntervencion {
  observaciones: string;
  trabajo: string;
  fecha: string;
  tecnico: string;
  estadoTarea: string;
  archivosNoPersistidos: number;
}

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
  readonly historialCargando = signal(false);
  readonly historialError = signal(false);

  readonly usuario = this.auth.usuario;

  // Refleja el estado de la tarea devuelto por el backend. El paso "En ejecución"
  // es una señal operativa local hasta que el backend exponga una transición.
  readonly estadoOperativo = signal<EstadoOperativo>('Programada');

  // HU-MAN-05: Formulario de registro de la intervención
  readonly fechaEjecucion = signal('');
  readonly diagnostico = signal('');
  readonly trabajoEfectuado = signal('');
  readonly errorValidacion = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly intervencionRegistrada = signal(false);

  // Selección local para la futura integración multipart. No se envía al POST JSON actual.
  readonly archivos = signal<File[]>([]);
  readonly previews = signal<{ nombre: string; url: string; esPdf: boolean }[]>([]);

  readonly datosIntervencion = signal<DatosIntervencion | null>(null);
  readonly historialActivo = signal<HistorialIntervencion[]>([]);

  // HU-MAN-04-CA-02: Verificar si el técnico autenticado es el responsable asignado
  readonly tieneAcceso = computed(() => {
    const t = this.tarea();
    const u = this.usuario();
    if (!t || !u) return false;

    if (u.rol === 'administrador') return true;
    return t.responsableId === u.id;
  });

  readonly pasoActivo = computed(() => {
    const est = this.estadoOperativo();
    if (est === 'En ejecución') return 2;
    if (est === 'Ejecutada') return 3;
    return 1;
  });

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id.set(idParam);
    this.inicializarFechaActual();

    if (!idParam) {
      this.errorCarga.set('ID de tarea no especificado.');
      this.cargando.set(false);
      return;
    }

    let encontrada = this.preventivos.obtenerPorId(idParam);
    if (!encontrada) {
      encontrada = (await this.preventivos.consultarDetalleBackend(idParam)) ?? undefined;
    }

    if (!encontrada) {
      this.errorCarga.set(
        this.preventivos.error() ??
          'No se encontró la tarea solicitada en el sistema.'
      );
      this.cargando.set(false);
      return;
    }

    this.tarea.set(encontrada);
    this.estadoOperativo.set(this.estadoDesdeBackend(encontrada));
    await this.cargarHistorialReal(encontrada);
    this.cargando.set(false);
  }

  private inicializarFechaActual(): void {
    const ahora = new Date();
    const pad = (valor: number) => String(valor).padStart(2, '0');
    this.fechaEjecucion.set(
      `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`
    );
  }

  private estadoDesdeBackend(tarea: TareaPreventiva): EstadoOperativo {
    const codigo = tarea.estadoCodigo?.trim().toUpperCase() ?? '';
    if (codigo.includes('EJECUT') || codigo.includes('COMPLET')) return 'Ejecutada';
    if (codigo.includes('EN_EJEC') || codigo.includes('PROCES')) return 'En ejecución';
    return 'Programada';
  }

  private referenciaTarea(intervencion: IntervencionPreventivaApi): string | null {
    const referencia = intervencion.tareaPreventiva;
    if (typeof referencia === 'number') return String(referencia);
    return referencia?.id === undefined ? null : String(referencia.id);
  }

  private intervencionesDeTarea(
    idTarea: string,
    intervenciones: IntervencionPreventivaApi[]
  ): IntervencionPreventivaApi[] {
    return intervenciones
      .filter((intervencion) => this.referenciaTarea(intervencion) === idTarea)
      .sort((a, b) => this.milisegundos(b.ejecutadoEn) - this.milisegundos(a.ejecutadoEn));
  }

  private milisegundos(valor: string | undefined): number {
    const fecha = valor ? new Date(valor).getTime() : Number.NEGATIVE_INFINITY;
    return Number.isNaN(fecha) ? Number.NEGATIVE_INFINITY : fecha;
  }

  private async cargarHistorialReal(tarea: TareaPreventiva): Promise<void> {
    this.historialCargando.set(true);
    this.historialError.set(false);
    try {
      const intervenciones = await this.preventivos.obtenerHistorialIntervenciones();
      const relacionadas = this.intervencionesDeTarea(tarea.id, intervenciones);
      this.historialActivo.set(
        relacionadas.map((intervencion, indice) => ({
          fecha: this.formatearFecha(intervencion.ejecutadoEn),
          titulo: tarea.titulo,
          estado: `Intervención registrada · estado de tarea: ${tarea.estado}`,
          esActual: indice === 0,
        }))
      );

      const ultima = relacionadas[0];
      if (ultima && !this.datosIntervencion()) {
        this.intervencionRegistrada.set(true);
        this.datosIntervencion.set(
          this.mapearDatosIntervencion(ultima, tarea, 0)
        );
      }
    } catch (error) {
      console.error('No se pudo consultar el historial preventivo:', error);
      this.historialError.set(true);
      this.historialActivo.set([]);
    } finally {
      this.historialCargando.set(false);
    }
  }

  private mapearDatosIntervencion(
    intervencion: IntervencionPreventivaApi,
    tarea: TareaPreventiva,
    archivosNoPersistidos: number
  ): DatosIntervencion {
    const ejecutor = intervencion.ejecutorUsuario;
    const nombreEjecutor = ejecutor
      ? `${ejecutor.nombres ?? ''} ${ejecutor.apellidos ?? ''}`.trim()
      : '';

    return {
      observaciones: intervencion.observaciones?.trim() || 'Sin observaciones registradas.',
      trabajo: intervencion.accionesRealizadas?.trim() || 'Sin detalle registrado.',
      fecha: this.formatearFecha(intervencion.ejecutadoEn),
      tecnico: nombreEjecutor || this.usuario()?.nombre || 'Técnico no informado por el backend',
      estadoTarea: tarea.estado,
      archivosNoPersistidos,
    };
  }

  private formatearFecha(valor: string | Date | undefined): string {
    if (!valor) return 'Fecha no disponible';
    const fecha = valor instanceof Date ? valor : new Date(valor);
    if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible';
    return fecha.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private normalizarFechaEjecucion(valor: string): string | null {
    const fecha = valor.trim();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(fecha)) {
      return null;
    }

    const fechaValida = new Date(fecha);
    if (Number.isNaN(fechaValida.getTime())) return null;
    return fecha.length === 16 ? `${fecha}:00` : fecha;
  }

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
      (archivo) =>
        !permitidos.includes(archivo.type) &&
        !/\.(png|jpe?g|webp|pdf)$/i.test(archivo.name)
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
    nuevos.forEach((archivo) => {
      const esPdf = archivo.type === 'application/pdf' || /\.pdf$/i.test(archivo.name);
      if (esPdf) {
        this.previews.update((prev) => [
          ...prev,
          { nombre: archivo.name, url: '', esPdf: true },
        ]);
        return;
      }

      const reader = new FileReader();
      reader.onload = (evento) => {
        const resultado = evento.target?.result;
        if (resultado) {
          this.previews.update((prev) => [
            ...prev,
            { nombre: archivo.name, url: resultado as string, esPdf: false },
          ]);
        }
      };
      reader.readAsDataURL(archivo);
    });
  }

  eliminarArchivo(index: number): void {
    this.archivos.update((archivos) => archivos.filter((_, i) => i !== index));
    this.previews.update((previews) => previews.filter((_, i) => i !== index));
  }

  async finalizarMantenimiento(): Promise<void> {
    if (!this.trabajoEfectuado().trim()) {
      this.errorValidacion.set(
        'Debes registrar el trabajo efectuado para registrar la intervención.'
      );
      return;
    }

    const fechaEjecucion = this.normalizarFechaEjecucion(this.fechaEjecucion());
    if (!fechaEjecucion) {
      this.errorValidacion.set('Ingresa una fecha de ejecución válida.');
      return;
    }

    const tarea = this.tarea();
    const usuario = this.usuario();
    if (!tarea || !usuario) return;

    const archivosNoPersistidos = this.archivos().length;
    this.errorValidacion.set(null);
    this.guardando.set(true);

    try {
      const intervencion = await this.preventivos.registrarIntervencion({
        tareaPreventivaId: Number(tarea.id),
        ejecutorUsuarioId: Number(usuario.id),
        accionesRealizadas: this.trabajoEfectuado(),
        observaciones: this.diagnostico(),
        ejecutadoEn: fechaEjecucion,
      });

      // Relee el estado de la tarea. No se fuerza EJECUTADA a partir del POST.
      const tareaConfirmada =
        (await this.preventivos.consultarDetalleBackend(tarea.id)) ?? tarea;
      this.tarea.set(tareaConfirmada);
      this.estadoOperativo.set(this.estadoDesdeBackend(tareaConfirmada));

      this.datosIntervencion.set(
        this.mapearDatosIntervencion(
          {
            ...intervencion,
            accionesRealizadas:
              intervencion.accionesRealizadas || this.trabajoEfectuado(),
            observaciones: intervencion.observaciones ?? this.diagnostico(),
            ejecutadoEn: intervencion.ejecutadoEn || fechaEjecucion,
          },
          tareaConfirmada,
          archivosNoPersistidos
        )
      );
      this.intervencionRegistrada.set(true);

      // Las selecciones locales no se presentan como evidencias persistidas.
      this.archivos.set([]);
      this.previews.set([]);
      await this.cargarHistorialReal(tareaConfirmada);
    } catch (error) {
      console.error(error);
      this.errorValidacion.set(
        'No se pudo registrar la intervención en el servidor. La tarea no fue marcada como Ejecutada por la interfaz.'
      );
    } finally {
      this.guardando.set(false);
    }
  }
}
