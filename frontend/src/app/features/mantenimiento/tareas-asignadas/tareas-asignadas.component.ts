
import {
  Component,
  computed,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';
import { PreventivosService } from '../../../core/services/preventivos.service';
import { AuthService } from '../../../core/services/auth.service';

type FiltroEstado =
  | 'TODOS'
  | 'PROGRAMADA'
  | 'EN_EJECUCION'
  | 'EJECUTADA';

@Component({
  selector: 'app-tareas-asignadas',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeroComponent],
  templateUrl: './tareas-asignadas.component.html',
  styleUrl: './tareas-asignadas.component.scss',
})
export class TareasAsignadasComponent implements OnInit, OnDestroy {
  private readonly preventivos = inject(PreventivosService);
  private readonly auth = inject(AuthService);

  // Actualización automática cada 15 segundos.
  private readonly intervaloActualizacion = 15000;

  private temporizador: ReturnType<typeof setInterval> | null = null;

  readonly busqueda = signal('');

  readonly filtroEstado = signal<FiltroEstado>('TODOS');

  readonly cargando = this.preventivos.cargando;
  readonly preventivosError = this.preventivos.error;
  readonly usuario = this.auth.usuario;

  // Lista de tareas asignadas al técnico autenticado.
  readonly tareasAsignadas = this.preventivos.asignadas;

  // Filtrado reactivo por texto y estado.
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

    return `${total} ${total === 1
        ? 'tarea preventiva asignada'
        : 'tareas preventivas asignadas'
      } a tu cargo`;
  });

  ngOnInit(): void {
    // Carga inicial al ingresar a la pantalla.
    void this.actualizarTareas();

    // Consulta periódica mientras la pantalla permanezca abierta.
    this.temporizador = setInterval(() => {
      // Evita consultas cuando la pestaña está oculta.
      if (document.visibilityState !== 'visible') {
        return;
      }

      // Evita iniciar consultas superpuestas.
      if (this.cargando()) {
        return;
      }

      void this.actualizarTareas();
    }, this.intervaloActualizacion);
  }

  ngOnDestroy(): void {
    // Detiene las consultas al abandonar la pantalla.
    if (this.temporizador !== null) {
      clearInterval(this.temporizador);
      this.temporizador = null;
    }
  }

  private async actualizarTareas(): Promise<void> {
    if (this.cargando()) {
      return;
    }

    await this.preventivos.cargarTareas();
  }

  actualizarBusqueda(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.busqueda.set(valor);
  }

  cambiarFiltro(estado: FiltroEstado): void {
    this.filtroEstado.set(estado);
  }
}
