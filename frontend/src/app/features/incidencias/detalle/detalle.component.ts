import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { IncidenciasService } from '../../../core/services/incidencias.service';
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
    void this.cargarIncidenciasDelUsuario();
  }

  private async cargarIncidenciasDelUsuario(): Promise<void> {
    await this.auth.inicializacion;

    const rol = this.auth.usuario()?.rol;
    if (rol === 'mantenimiento' || rol === 'seguridad') {
      await this.service.cargarAsignadas();
      return;
    }

    await this.service.cargar();
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

  // Estado operativo local para transición: Asignada -> En atención -> Solucionada
  estadoIntervencion = signal<'Asignada' | 'En atención' | 'Solucionada' | null>(null);

  // Determina el estado actual del caso
  estadoActual = computed(() => {
    return this.estadoIntervencion() ?? (this.incidencia()?.estado as string) ?? 'Asignada';
  });

  // Calcula el número del stepper (1 al 5)
  pasoActivo = computed(() => {
    const est = this.estadoActual();
    switch (est) {
      case 'Reportada':
        return 1;
      case 'Clasificada':
        return 2;
      case 'Asignada':
        return 3;
      case 'En atención':
      case 'En proceso':
        return 4;
      case 'Solucionada':
      case 'Cerrada':
        return 5;
      default:
        return 3;
    }
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
      const incidenciaActualizada = await this.service.aceptarIncidencia(incidencia.id);

      if (incidenciaActualizada.estado !== 'En atención') {
        this.aceptacionError.set(
          'El backend respondió, pero no se pudo confirmar el estado En atención. Recarga la vista antes de continuar.'
        );
      }
    } catch (error) {
      console.error('Error al aceptar la incidencia:', error);
      this.aceptacionError.set(this.mensajeErrorAceptacion(error));

      // En conflictos o cambios de permisos, sincronizar para no dejar un estado
      // visual que ya no coincide con el backend.
      const status = this.statusError(error);
      if (status === 401 || status === 403 || status === 404 || status === 409) {
        await this.service.cargarAsignadas();
        if (this.incidencia()?.estado === 'En atención') {
          this.aceptacionError.set(null);
        }
      }
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
    this.guardando.set(true);

    try {
      await this.service.solucionarIncidencia(
        idActual,
        this.diagnostico(),
        this.acciones(),
        this.archivos()
      );
      this.estadoIntervencion.set('Solucionada');
      this.exito.set(true);
    } catch (err) {
      console.error(err);
      this.errorValidacion.set('Ocurrió un error al guardar la solución.');
    } finally {
      this.guardando.set(false);
    }
  }
}
