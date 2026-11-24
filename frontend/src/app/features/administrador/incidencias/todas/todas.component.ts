import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EDIFICIO_NOMBRE } from '../../../../core/data/navigation.data';
import { IncidenciasAdminService } from '../../../../core/services/incidencias-admin.service';
import { PageHeroComponent } from '../../../../shared/page-hero/page-hero.component';
import { IncidenciaAdmin } from '../../../../models/incidencia-admin.model';

@Component({
  selector: 'app-admin-todas-incidencias',
  imports: [RouterLink, DatePipe, PageHeroComponent, FormsModule, NgClass],
  templateUrl: './todas.component.html',
  styleUrl: './todas.component.scss',
})
export class TodasComponent {
  private readonly service = inject(IncidenciasAdminService);

  eyebrow = `${EDIFICIO_NOMBRE} · Administración`;
  cargando = this.service.cargando;
  error = this.service.error;

  readonly filtroEstado = signal<string>('Todos');
  readonly filtroPrioridad = signal<string>('Todas');
  readonly filtroUbicacion = signal<string>('Todas');

  readonly estadosDisponibles = [
    'Todos',
    'Reportada',
    'Clasificada',
    'Asignada',
    'En atención',
    'Solucionada',
    'Cerrada',
    'Reabierta',
  ];

  readonly prioridadesDisponibles = ['Todas', 'Alta', 'Media', 'Baja', 'Sin asignar'];

  readonly ubicacionesDisponibles = computed(() => {
    const lista = this.service.incidencias();
    const conjunto = new Set<string>();
    for (const item of lista) {
      if (item.ubicacion?.trim()) {
        conjunto.add(item.ubicacion.trim());
      }
    }
    return ['Todas', ...Array.from(conjunto).sort()];
  });

  readonly hayFiltrosActivos = computed(() => {
    return (
      this.filtroEstado() !== 'Todos' ||
      this.filtroPrioridad() !== 'Todas' ||
      this.filtroUbicacion() !== 'Todas'
    );
  });

  readonly items = computed(() => {
    let resultado = this.service.incidencias();
    const estado = this.filtroEstado();
    const prioridad = this.filtroPrioridad();
    const ubicacion = this.filtroUbicacion();

    if (estado !== 'Todos') {
      resultado = resultado.filter(
        (i) => this.claveEstado(i) === this.normalizarClave(estado)
      );
    }

    if (prioridad !== 'Todas') {
      if (prioridad === 'Sin asignar') {
        resultado = resultado.filter(
          (i) => !i.prioridad || i.prioridad.toLowerCase().includes('sin')
        );
      } else {
        resultado = resultado.filter(
          (i) => i.prioridad?.toLowerCase() === prioridad.toLowerCase()
        );
      }
    }

    if (ubicacion !== 'Todas') {
      resultado = resultado.filter(
        (i) => i.ubicacion?.toLowerCase() === ubicacion.toLowerCase()
      );
    }

    return resultado;
  });

  private normalizarClave(valor: string | null | undefined): string {
    return (valor ?? '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  private claveEstado(incidencia: IncidenciaAdmin): string {
    const codigo = this.normalizarClave(incidencia.estadoCodigo);
    if (codigo) return codigo;
    // Compatibilidad con respuestas históricas que solo incluían el nombre.
    const nombre = this.normalizarClave(incidencia.estado);
    return nombre === 'SOLUCIONADA_PENDIENTE_DE_CONFIRMACION' ? 'SOLUCIONADA' : nombre;
  }

  constructor() {
    void this.service.cargar();
  }

  limpiarFiltros(): void {
    this.filtroEstado.set('Todos');
    this.filtroPrioridad.set('Todas');
    this.filtroUbicacion.set('Todas');
  }

  actualizar(): void {
    void this.service.cargar();
  }

  claseBadgeEstado(estado?: string | null): string {
    const est = (estado ?? '').toLowerCase().trim();
    if (est.includes('atenci') || est.includes('atencion')) return 'badge--en-atencion';
    if (est.includes('clasif')) return 'badge--clasificada';
    if (est.includes('asig')) return 'badge--asignada';
    if (est.includes('report')) return 'badge--reportada';
    if (est.includes('soluc')) return 'badge--solucionada';
    if (est.includes('cerr')) return 'badge--cerrada';
    if (est.includes('reab')) return 'badge--reabierta';
    return '';
  }

  esPrioridadAlta(prioridad?: string | null): boolean {
    return (prioridad ?? '').toLowerCase().includes('alta');
  }
}