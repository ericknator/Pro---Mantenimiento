import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';
import { PreventivosService } from '../../../core/services/preventivos.service';
import { AuthService } from '../../../core/services/auth.service';
import { TareaPreventiva } from '../../../models/tarea-preventiva.model';

@Component({
  selector: 'app-detalle-tarea',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeroComponent],
  templateUrl: './detalle-tarea.component.html',
  styleUrl: './detalle-tarea.component.scss',
})
export class DetalleTareaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly preventivos = inject(PreventivosService);
  private readonly auth = inject(AuthService);

  readonly id = signal<string | null>(null);
  readonly tarea = signal<TareaPreventiva | null>(null);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);

  readonly usuario = this.auth.usuario;

  // HU-MAN-04-CA-02: Verificar si el técnico autenticado es el responsable asignado
  readonly tieneAcceso = computed(() => {
    const t = this.tarea();
    const u = this.usuario();
    if (!t || !u) return false;

    // Administrador siempre tiene acceso; Mantenimiento o Seguridad solo si es su tarea
    if (u.rol === 'administrador') return true;
    return t.responsableId === u.id;
  });

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id.set(idParam);

    if (!idParam) {
      this.errorCarga.set('ID de tarea no especificado.');
      this.cargando.set(false);
      return;
    }

    // 1. Buscamos primero en el estado en memoria
    let encontrada = this.preventivos.obtenerPorId(idParam);

    // 2. Si no está en memoria, la consultamos al backend
    if (!encontrada) {
      const desdeApi = await this.preventivos.consultarDetalleBackend(idParam);
      if (desdeApi) {
        encontrada = desdeApi;
      }
    }

    if (encontrada) {
      this.tarea.set(encontrada);
    } else {
      this.errorCarga.set(
        this.preventivos.error() ??
          'No se encontró la tarea solicitada en el sistema.'
      );
    }

    this.cargando.set(false);
  }
}
