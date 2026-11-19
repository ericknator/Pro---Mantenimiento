import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { IncidenciasService } from '../../../core/services/incidencias.service';
import { EvidenciaIncidencia } from '../../../models/incidencia.model';
import { EstadoBadgeComponent } from '../../../shared/estado-badge/estado-badge.component';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-detalle-incidencia',
  imports: [DatePipe, RouterLink, PageHeroComponent, EstadoBadgeComponent, FormsModule],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss',
})
export class DetalleIncidenciaComponent {
  private readonly service = inject(IncidenciasService);
  private readonly auth = inject(AuthService);
  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id'))),
    { initialValue: null }
  );

  eyebrow = 'CONDOMINIO NUEVO ALCÁZAR · MANTENIMIENTO';

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        void this.cargarIncidencia(id);
      }
    });
  }

  private async cargarIncidencia(id: string): Promise<void> {
    this.reaperturaConfirmada.set(false);
    await this.auth.inicializacion;
    await this.service.cargarDetalle(id);
  }

  incidencia = computed(() => this.service.obtenerPropia(this.id()));

  readonly motivoReaperturaPersistido = computed(
    () => this.incidencia()?.motivoReapertura?.trim() || null
  );

  readonly esPersonalTecnico = computed(() => {
    const rol = this.auth.usuario()?.rol;
    return rol === 'mantenimiento' || rol === 'seguridad' || rol === 'administrador';
  });

  readonly puedeAceptar = computed(() => {
    const rol = this.auth.usuario()?.rol;
    return rol === 'mantenimiento' || rol === 'seguridad';
  });

  readonly cargando = this.service.cargando;

  readonly evidenciasSolucion = computed(
    () => this.incidencia()?.evidenciasSolucion ?? []
  );

  estadoIntervencion = signal<'Asignada' | 'En atención' | 'Solucionada' | 'Cerrada' | 'Reabierta' | null>(null);

  estadoActual = computed(() => {
    return this.estadoIntervencion() ?? (this.incidencia()?.estado as string) ?? 'Asignada';
  });

  pasoActivo = computed(() => {
    const est = (this.estadoActual() ?? '').toLowerCase();
    if (est.includes('cerrada')) return 6;
    if (est.includes('solucionada')) return 5;
    if (est.includes('atenci') || est.includes('atencion') || est.includes('proceso')) return 4;
    if (est.includes('asignada') || est.includes('reabierta')) return 3;
    if (est.includes('clasificada')) return 2;
    if (est.includes('reportada')) return 1;
    return 1;
  });

  diagnostico = signal('');
  acciones = signal('');
  errorValidacion = signal<string | null>(null);
  aceptacionError = signal<string | null>(null);
  aceptando = signal(false);
  guardando = signal(false);
  exito = signal(false);

  archivos = signal<File[]>([]);
  previews = signal<string[]>([]);

  readonly modoReapertura = signal(false);
  readonly reaperturaConfirmada = signal(false);
  readonly motivoReapertura = signal('');
  readonly archivosReapertura = signal<File[]>([]);
  readonly guardandoConformidad = signal(false);
  readonly errorConformidad = signal<string | null>(null);

  readonly puedeReabrir = computed(() => {
    return this.motivoReapertura().trim().length >= 5 && !this.guardandoConformidad();
  });

  readonly diagnosticoSolucion = computed(() => {
    const inc = this.incidencia() as
      | (typeof this.incidencia extends never ? never : {
        diagnosticoTecnico?: string | null;
        diagnostico?: string | null;
      })
      | undefined;

    return (
      inc?.diagnosticoTecnico?.trim() ||
      inc?.diagnostico?.trim() ||
      'Diagnóstico no disponible.'
    );
  });

  readonly accionesSolucion = computed(() => {
    const inc = this.incidencia() as
      | { accionesRealizadas?: string | null }
      | undefined;

    return (
      inc?.accionesRealizadas?.trim() ||
      'Acciones realizadas no disponibles.'
    );
  });

  mostrarFormularioReapertura(): void {
    this.errorConformidad.set(null);
    this.modoReapertura.set(true);
  }

  cancelarReapertura(): void {
    this.modoReapertura.set(false);
    this.motivoReapertura.set('');
    this.archivosReapertura.set([]);
    this.errorConformidad.set(null);
  }

  onSeleccionarArchivosReapertura(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const seleccionados = Array.from(input.files);
    const total = [...this.archivosReapertura(), ...seleccionados].slice(0, 3);
    this.archivosReapertura.set(total);
    input.value = '';
  }

  eliminarArchivoReapertura(index: number): void {
    this.archivosReapertura.update((archivos) => archivos.filter((_, i) => i !== index));
  }

  async confirmarSolucion(): Promise<void> {
    const idActual = this.id();

    if (!idActual || this.guardandoConformidad()) return;

    this.guardandoConformidad.set(true);
    this.errorConformidad.set(null);

    try {
      const incidencia = await this.service.confirmarSolucion(idActual);

      if (incidencia.estado !== 'Cerrada') {
        throw new Error(
          'El servidor no confirmó el cierre de la incidencia.'
        );
      }

      this.estadoIntervencion.set('Cerrada');
      this.modoReapertura.set(false);

    } catch (error: unknown) {
      this.errorConformidad.set(
        error instanceof Error
          ? error.message
          : 'No se pudo confirmar la solución.'
      );
    } finally {
      this.guardandoConformidad.set(false);
    }
  }

  async confirmarReapertura(): Promise<void> {
    const idActual = this.id();

    if (
      !idActual ||
      !this.puedeReabrir() ||
      this.guardandoConformidad()
    ) return;

    this.guardandoConformidad.set(true);
    this.errorConformidad.set(null);

    try {
      const incidencia = await this.service.reabrirIncidencia(
        idActual,
        this.motivoReapertura().trim(),
        this.archivosReapertura()
      );

      if (incidencia.estado !== 'Reabierta') {
        throw new Error(
          'El servidor no confirmó la reapertura de la incidencia.'
        );
      }

      this.estadoIntervencion.set('Reabierta');
      this.reaperturaConfirmada.set(true);
      this.modoReapertura.set(false);
      this.motivoReapertura.set('');
      this.archivosReapertura.set([]);

    } catch (error: unknown) {
      this.errorConformidad.set(
        error instanceof Error
          ? error.message
          : 'No se pudo reabrir la incidencia.'
      );
    } finally {
      this.guardandoConformidad.set(false);
    }
  }

  async aceptarIncidencia(): Promise<void> {
    const incidencia = this.incidencia();
    if (!incidencia || this.aceptando() || this.estadoActual() !== 'Asignada') {
      return;
    }

    this.aceptando.set(true);
    this.aceptacionError.set(null);
    this.errorValidacion.set(null);

    try {
      await this.service.aceptarIncidencia(incidencia.id);
      this.estadoIntervencion.set('En atención');
    } catch (error) {
      console.error('Error al aceptar la incidencia:', error);
      this.aceptacionError.set(this.mensajeErrorAceptacion(error));
    } finally {
      this.aceptando.set(false);
    }
  }

  private statusError(error: unknown): number {
    if (error instanceof HttpErrorResponse) {
      return error.status;
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof error.status === 'number'
    ) {
      return error.status;
    }

    return -1;
  }

  private mensajeErrorAceptacion(error: unknown): string {
    switch (this.statusError(error)) {
      case 0:
        return 'No se pudo conectar con el servidor. Verifica la conexión e inténtalo nuevamente.';
      case 401:
        return 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.';
      case 403:
        return 'No tienes permiso para aceptar esta incidencia o no está asignada a tu usuario.';
      case 404:
        return 'La incidencia ya no existe o no está disponible para tu usuario.';
      case 409:
        return 'La incidencia ya no se encuentra en estado Asignada. Se actualizará la vista.';
      default:
        return 'No se pudo aceptar la incidencia. Inténtalo nuevamente.';
    }
  }

  private mensajeErrorFinalizacion(error: unknown): string {
    switch (this.statusError(error)) {
      case 0:
        return 'No se pudo conectar con el servidor. Verifica la conexión e inténtalo nuevamente.';
      case 400:
        return 'Las acciones realizadas son obligatorias.';
      case 401:
        return 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.';
      case 403:
        return 'No tienes permiso para finalizar esta atención o la incidencia no está asignada a tu usuario.';
      case 404:
        return 'La incidencia ya no existe o no está disponible para tu usuario.';
      case 409:
        return 'La incidencia ya no está en atención. Actualiza la vista antes de intentar finalizarla.';
      default:
        if (error instanceof Error && error.message) {
          return error.message;
        }
        return 'No se pudo confirmar la solución en el servidor. Inténtalo nuevamente.';
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
    const permitidos = ['image/png', 'image/jpeg', 'image/webp'];
    const invalidos = nuevos.filter(
      (f) => !permitidos.includes(f.type) && !/\.(png|jpe?g|webp)$/i.test(f.name)
    );
    if (invalidos.length > 0) {
      this.errorValidacion.set('Solo se permiten fotografías e imágenes (PNG, JPG, WEBP).');
      return;
    }

    if (this.archivos().length + nuevos.length > 3) {
      this.errorValidacion.set('Solo puedes adjuntar un máximo de 3 archivos de evidencia.');
      return;
    }

    this.errorValidacion.set(null);
    this.archivos.set([...this.archivos(), ...nuevos]);

    nuevos.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.previews.update((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  eliminarArchivo(index: number): void {
    this.archivos.update((archs) => archs.filter((_, i) => i !== index));
    this.previews.update((prevs) => prevs.filter((_, i) => i !== index));
  }

  esImagenEvidencia(evidencia: EvidenciaIncidencia): boolean {
    return (
      evidencia.tipoCodigo?.toUpperCase() === 'FOTO' ||
      /\.(png|jpe?g|webp)$/i.test(evidencia.nombreArchivo)
    );
  }

  async finalizarSolucion(): Promise<void> {
    if (!this.acciones().trim()) {
      this.errorValidacion.set(
        'Debes ingresar las acciones realizadas para declarar la incidencia como Solucionada.'
      );
      return;
    }

    const idActual = this.id();
    if (!idActual) return;

    this.errorValidacion.set(null);
    this.exito.set(false);
    this.guardando.set(true);

    try {
      const incidenciaConfirmada = await this.service.solucionarIncidencia(
        idActual,
        this.diagnostico(),
        this.acciones(),
        this.archivos()
      );

      if (incidenciaConfirmada.estado.trim().toLowerCase() !== 'solucionada') {
        throw new Error(
          'El backend no confirmó la incidencia en estado Solucionada.'
        );
      }

      this.estadoIntervencion.set('Solucionada');
      this.exito.set(true);
    } catch (err) {
      console.error(err);
      this.errorValidacion.set(this.mensajeErrorFinalizacion(err));
    } finally {
      this.guardando.set(false);
    }
  }
}