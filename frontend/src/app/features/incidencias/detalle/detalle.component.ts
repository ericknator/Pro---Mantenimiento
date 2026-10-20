import { DatePipe } from '@angular/common';
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
    const rol = this.auth.usuario()?.rol;
    if (rol === 'mantenimiento' || rol === 'seguridad') {
      void this.service.cargarAsignadas();
    } else {
      void this.service.cargar();
    }
  }

  incidencia = computed(() => this.service.obtenerPropia(this.id()));

  readonly esPersonalTecnico = computed(() => {
    const rol = this.auth.usuario()?.rol;
    return rol === 'mantenimiento' || rol === 'seguridad' || rol === 'administrador';
  });

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
  guardando = signal(false);
  exito = signal(false);

  // PMS-160: Manejo de evidencias
  archivos = signal<File[]>([]);
  previews = signal<string[]>([]);

  iniciarAtencion(): void {
    this.estadoIntervencion.set('En atención');
    this.errorValidacion.set(null);
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