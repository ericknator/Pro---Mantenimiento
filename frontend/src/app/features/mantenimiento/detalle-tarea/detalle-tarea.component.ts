import { Component, computed, inject, signal, OnDestroy, OnInit } from '@angular/core';
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

interface ArchivoPreview {
  nombre: string;
  url: string;
  esVideo: boolean;
}

interface DatosIntervencion {
  observaciones: string;
  trabajo: string;
  fecha: string;
  tecnico: string;
  estadoTarea: string;
  archivosEnviados: number;
  estadoConfirmado: boolean;
}

@Component({
  selector: 'app-detalle-tarea',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeroComponent, FormsModule, DatePipe],
  templateUrl: './detalle-tarea.component.html',
  styleUrl: './detalle-tarea.component.scss',
})
export class DetalleTareaComponent implements OnInit, OnDestroy {
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

  // Refleja únicamente el estado devuelto por el backend.
  readonly estadoOperativo = signal<EstadoOperativo>('Programada');

  // HU-MAN-05: Formulario de registro de la intervención
  readonly fechaEjecucion = signal('');
  readonly diagnostico = signal('');
  readonly trabajoEfectuado = signal('');
  readonly errorValidacion = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly iniciandoAtencion = signal(false);
  readonly intervencionRegistrada = signal(false);

  // Archivos seleccionados para el multipart y sus previsualizaciones locales.
  readonly archivos = signal<File[]>([]);
  readonly previews = signal<ArchivoPreview[]>([]);

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

  readonly puedeOperar = computed(() => {
    const t = this.tarea();
    const u = this.usuario();
    return Boolean(
      t &&
        u &&
        u.rol === 'mantenimiento' &&
        t.responsableId === u.id
    );
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
    archivosEnviados: number,
    estadoConfirmado = true
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
      archivosEnviados,
      estadoConfirmado,
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
    const partes = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(fecha);
    if (!partes) return null;

    const [, anio, mes, dia, hora, minuto, segundo = '00'] = partes;
    const fechaUtc = new Date(
      Date.UTC(
        Number(anio),
        Number(mes) - 1,
        Number(dia),
        Number(hora),
        Number(minuto),
        Number(segundo)
      )
    );

    if (
      fechaUtc.getUTCFullYear() !== Number(anio) ||
      fechaUtc.getUTCMonth() !== Number(mes) - 1 ||
      fechaUtc.getUTCDate() !== Number(dia) ||
      fechaUtc.getUTCHours() !== Number(hora) ||
      fechaUtc.getUTCMinutes() !== Number(minuto) ||
      fechaUtc.getUTCSeconds() !== Number(segundo)
    ) {
      return null;
    }

    // LocalDateTime no lleva Z ni offset: se conserva la hora elegida por el técnico.
    return `${anio}-${mes}-${dia}T${hora}:${minuto}:${segundo}`;
  }

  async iniciarAtencion(): Promise<void> {
    if (this.iniciandoAtencion()) return;

    const tarea = this.tarea();
    if (!tarea || !this.puedeOperar()) {
      this.errorValidacion.set(
        'Solo el técnico de mantenimiento asignado puede iniciar esta tarea.'
      );
      return;
    }

    this.errorValidacion.set(null);
    this.iniciandoAtencion.set(true);

    try {
      const tareaConfirmada = await this.preventivos.iniciarAtencion(tarea.id);
      this.tarea.set(tareaConfirmada);
      this.estadoOperativo.set(this.estadoDesdeBackend(tareaConfirmada));
      await this.cargarHistorialReal(tareaConfirmada);
    } catch (error) {
      console.error('No se pudo iniciar la atención preventiva:', error);
      this.errorValidacion.set(
        this.preventivos.mensajeError(
          error,
          'No se pudo iniciar la atención en el servidor.'
        )
      );
    } finally {
      this.iniciandoAtencion.set(false);
    }
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
    const permitidos = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
    ]);
    const invalidos = nuevos.filter(
      (archivo) => !permitidos.has(archivo.type) || archivo.size > 20 * 1024 * 1024
    );

    if (invalidos.length > 0) {
      this.errorValidacion.set(
        'Solo se permiten JPG, PNG, WEBP, MP4 o WEBM, con un máximo de 20 MB por archivo. No se aceptan PDF.'
      );
      return;
    }

    if (this.archivos().length + nuevos.length > 3) {
      this.errorValidacion.set('Solo puedes adjuntar un máximo de 3 archivos de evidencia.');
      return;
    }

    this.errorValidacion.set(null);
    this.archivos.set([...this.archivos(), ...nuevos]);
    nuevos.forEach((archivo) => {
      this.previews.update((prev) => [
        ...prev,
        {
          nombre: archivo.name,
          url: URL.createObjectURL(archivo),
          esVideo: archivo.type.startsWith('video/'),
        },
      ]);
    });
  }

  eliminarArchivo(index: number): void {
    const preview = this.previews()[index];
    if (preview) URL.revokeObjectURL(preview.url);
    this.archivos.update((archivos) => archivos.filter((_, i) => i !== index));
    this.previews.update((previews) => previews.filter((_, i) => i !== index));
  }

  private limpiarArchivos(): void {
    this.previews().forEach((preview) => URL.revokeObjectURL(preview.url));
    this.archivos.set([]);
    this.previews.set([]);
  }

  ngOnDestroy(): void {
    this.previews().forEach((preview) => URL.revokeObjectURL(preview.url));
  }

  async finalizarMantenimiento(): Promise<void> {
    if (this.guardando()) return;

    if (!this.puedeOperar()) {
      this.errorValidacion.set(
        'Solo el técnico de mantenimiento asignado puede registrar esta intervención.'
      );
      return;
    }

    if (this.estadoOperativo() !== 'En ejecución') {
      this.errorValidacion.set(
        'La tarea debe estar en ejecución antes de registrar la intervención.'
      );
      return;
    }

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
    if (!tarea) return;

    const archivosEnviados = this.archivos().length;
    this.errorValidacion.set(null);
    this.guardando.set(true);

    try {
      const intervencion = await this.preventivos.registrarIntervencion({
        tareaPreventivaId: Number(tarea.id),
        accionesRealizadas: this.trabajoEfectuado(),
        observaciones: this.diagnostico(),
        fechaEjecucion,
      }, this.archivos());

      // Relee el estado persistido. No se fuerza EJECUTADA a partir del POST.
      const tareaPersistida = await this.preventivos.consultarDetalleBackend(tarea.id);
      const tareaConfirmada = tareaPersistida ?? tarea;
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
          archivosEnviados,
          Boolean(tareaPersistida)
        )
      );
      this.intervencionRegistrada.set(true);

      this.limpiarArchivos();
      await this.cargarHistorialReal(tareaConfirmada);
    } catch (error) {
      console.error(error);
      this.errorValidacion.set(
        this.preventivos.mensajeError(
          error,
          'No se pudo registrar la intervención en el servidor.'
        )
      );
    } finally {
      this.guardando.set(false);
    }
  }
}
