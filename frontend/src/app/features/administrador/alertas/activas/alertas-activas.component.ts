import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../../../shared/page-hero/page-hero.component';
import { AlertasService } from '../../../../core/services/alertas.service';

@Component({
  selector: 'app-alertas-activas',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeroComponent, DatePipe],
  templateUrl: './alertas-activas.component.html',
  styleUrl: './alertas-activas.component.scss',
})
export class AlertasActivasComponent implements OnInit {
  readonly service = inject(AlertasService);

  readonly alertas = this.service.alertasFiltradas;
  readonly cargando = this.service.cargando;
  readonly error = this.service.error;

  readonly filtro = this.service.filtroActivo;
  readonly total = this.service.totalAlertas;
  readonly totalProximas = this.service.totalProximas;
  readonly totalVencidas = this.service.totalVencidas;

  ngOnInit(): void {
    void this.service.cargarAlertas();
  }

  setFiltro(f: 'todas' | 'proxima' | 'vencida'): void {
    this.service.cambiarFiltro(f);
  }
}