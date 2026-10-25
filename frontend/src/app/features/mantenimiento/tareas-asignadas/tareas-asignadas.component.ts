import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';
import { PreventivosService } from '../../../core/services/preventivos.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-tareas-asignadas',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeroComponent],
  templateUrl: './tareas-asignadas.component.html',
  styleUrl: './tareas-asignadas.component.scss',
})
export class TareasAsignadasComponent {
  private readonly preventivos = inject(PreventivosService);
  private readonly auth = inject(AuthService);

  readonly busqueda = signal('');
  readonly filtroEstado = signal<'TODOS' | 'PROGRAMADA' | 'EN_EJECUCION' | 'EJECUTADA'>('TODOS');

  readonly cargando = this.preventivos.cargando;
  readonly usuario = this.auth.usuario;

  // Lista de tareas asignadas al técnico autenticado
  readonly tareasAsignadas = this.preventivos.asignadas;

  // Filtrado reactivo por texto y estado
  readonly tareasFiltradas = computed(() => {
    const query = this.busqueda().toLowerCase().trim();
    const estado = this.filtroEstado();

    return this.tareasAsignadas().filter((t) => {
      const coincideTexto =
        !query ||
        t.titulo.toLowerCase().includes(query) ||
        t.activoNombre.toLowerCase().includes(query) ||
        t.activoCodigo.toLowerCase().includes(query) ||
        t.ubicacion.toLowerCase().includes(query);

      const coincideEstado =
        estado === 'TODOS' || t.estadoCodigo === estado;

      return coincideTexto && coincideEstado;
    });
  });

  readonly subtituloHero = computed(() => {
    const total = this.tareasAsignadas().length;
    return `${total} ${total === 1 ? 'tarea preventiva asignada' : 'tareas preventivas asignadas'} a tu cargo`;
  });

  actualizarBusqueda(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.busqueda.set(valor);
  }

  cambiarFiltro(estado: 'TODOS' | 'PROGRAMADA' | 'EN_EJECUCION' | 'EJECUTADA'): void {
    this.filtroEstado.set(estado);
  }
}