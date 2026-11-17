import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Activo } from '../../../../models/activo.model';
import { HistorialActivosService, ItemHistorial } from '../../../../core/services/historial-activos.service';
import { PageHeroComponent } from '../../../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-historial-activo',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, PageHeroComponent, FormsModule],
  templateUrl: './historial-activo.component.html',
  styleUrl: './historial-activo.component.scss',
})
export class HistorialActivoComponent implements OnInit {
  private readonly service = inject(HistorialActivosService);
  private readonly route = inject(ActivatedRoute);

  readonly cargando = this.service.cargando;
  readonly activos = this.service.activos;
  readonly activoSeleccionado = signal<Activo | null>(null);
  readonly registros = signal<ItemHistorial[]>([]);
  readonly pestanaActiva = signal<'TODOS' | 'MANTENIMIENTO' | 'FALLA'>('TODOS');

  readonly totalRegistros = computed(() => this.registros().length);
  readonly totalMantenimientos = computed(
    () => this.registros().filter((r) => r.tipo === 'MANTENIMIENTO').length
  );
  readonly totalFallas = computed(
    () => this.registros().filter((r) => r.tipo === 'FALLA').length
  );

  readonly registrosFiltrados = computed(() => {
    const tab = this.pestanaActiva();
    const list = this.registros();
    if (tab === 'MANTENIMIENTO') {
      return list.filter((r) => r.tipo === 'MANTENIMIENTO');
    }
    if (tab === 'FALLA') {
      return list.filter((r) => r.tipo === 'FALLA');
    }
    return list;
  });

  async ngOnInit(): Promise<void> {
    const lista = await this.service.cargarActivos();
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam && lista.length > 0) {
      const match = lista.find((a) => String(a.id) === idParam || a.codigo === idParam);
      if (match) {
        await this.seleccionarActivo(match);
        return;
      }
    }

    if (lista.length > 0) {
      await this.seleccionarActivo(lista[0]);
    }
  }

  async seleccionarActivo(activo: Activo): Promise<void> {
    this.activoSeleccionado.set(activo);
    this.pestanaActiva.set('TODOS');
    const items = await this.service.obtenerHistorialDeActivo(activo);
    this.registros.set(items);
  }

  onCambioActivo(idString: string): void {
    const encontrado = this.activos().find((a) => String(a.id) === idString);
    if (encontrado) {
      void this.seleccionarActivo(encontrado);
    }
  }

  cambiarPestana(tab: 'TODOS' | 'MANTENIMIENTO' | 'FALLA'): void {
    this.pestanaActiva.set(tab);
  }
}