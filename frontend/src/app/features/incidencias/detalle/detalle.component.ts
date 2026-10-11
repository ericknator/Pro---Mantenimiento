import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { IncidenciasService } from '../../../core/services/incidencias.service';
import { EstadoBadgeComponent } from '../../../shared/estado-badge/estado-badge.component';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-detalle-incidencia',
  imports: [DatePipe, RouterLink, PageHeroComponent, EstadoBadgeComponent],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss',
})
export class DetalleIncidenciaComponent {
  private readonly service = inject(IncidenciasService);
  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id'))), { initialValue: null });

  // HU-INC-02: solo se muestra un caso propio; ajeno o inexistente => acceso no permitido
  incidencia = computed(() => this.service.obtenerPropia(this.id()));
}
