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
        this.evidenciasNoVisualizables.set(new Set());
        void this.cargarIncidenciaDelUsuario(id);
      }
    });
  }

  private async cargarIncidenciaDelUsuario(id: string): Promise<void> {
    await this.auth.inicializacion;
    await this.service.cargarDetalle(id);
  }

  incidencia = computed(() => this.service.obtenerPropia(this.id()));

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
  readonly evidenciasNoVisualizables = signal<Set<string>>(new Set());

  // Estado operativo local para transición: Asignada -> En atención -> Solucionada
  estadoIntervencion = signal<'Asignada' | 'En atención' | 'Solucionada' | null>(null);

  // Determina el estado actual del caso
  estadoActual = computed(() => {
    return this.estadoIntervencion() ?? (this.incidencia()?.estado as string) ?? 'Asignada';
  });

  // Calcula el número del stepper (1 al 5)
  pasoActivo = computed(() => {
    const est = (this.estadoActual() ?? '').toLowerCase();
    if (est.includes('reportada')) return 1;
    if (est.includes('clasificada')) return 2;
    if (est.includes('asignada')) return 3;
    if (est.includes('atenci') || est.includes('atencion') || est.includes('proceso')) return 4;
    if (est.includes('solucionada')) return 5;
    return 1;
  });

  // HU-INC-06: Campos para la solución
  diagnostico = signal('');
  acciones = signal('');
  errorValidacion = signal<string | null>(null);
  aceptacionError = signal<string | null>(null);
  aceptando = signal(false);
  guardando = signal(false);
  exito = signal(false);

  // PMS-160: Manejo de evidencias
  archivos = signal<File[]>([]);
  previews = signal<string[]>([]);

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
      // Forzamos el estado reactivo inmediato al paso 4
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

  onArchivosSeleccionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const nuevosArchivos = Array.from(input.files);
    if (this.archivos().length + nuevosArchivos.length > 3) {
      this.errorValidacion.set('Solo puedes adjuntar un máximo de 3 fotos de evidencia.');
      return;
    }

    this.errorValidacion.set(null);
    this.archivos.set([...this.archivos(), ...nuevosArchivos]);

    nuevosArchivos.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.previews.update((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
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

  urlVisualizable(evidencia: EvidenciaIncidencia): string | null {
    const url = evidencia.urlRecurso?.trim();
    return url && /^https?:\/\//i.test(url) ? url : null;
  }

  esEvidenciaNoVisualizable(evidencia: EvidenciaIncidencia): boolean {
    return this.evidenciasNoVisualizables().has(evidencia.id);
  }

  marcarEvidenciaNoVisualizable(id: string): void {
    this.evidenciasNoVisualizables.update((ids) => {
      const siguientes = new Set(ids);
      siguientes.add(id);
      return siguientes;
    });
  }

  async finalizarSolucion(): Promise<void> {
    // CA-02: Validación obligatoria de acciones realizadas
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

      // El servicio solo resuelve después de volver a leer el estado desde el
      // backend y verificar que sea Solucionada.
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
