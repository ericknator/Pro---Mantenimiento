import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AlertaInterna,
  AlertasInternasService,
} from '../../core/services/alertas-internas.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mis-alertas',
  imports: [DatePipe, RouterLink],
  templateUrl: './mis-alertas.component.html',
  styleUrl: './mis-alertas.component.scss',
})
export class MisAlertasComponent implements OnInit {
  private readonly service = inject(AlertasInternasService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly alertas = signal<AlertaInterna[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly filtroActual = signal<'todas' | 'en_curso' | 'atendidas'>('todas');
  readonly alertaSeleccionada = signal<AlertaInterna | null>(null);

  readonly usuarioNombre = computed(() => {
    const u = this.auth.usuario();
    return u?.nombre ?? 'Residente Prueba';
  });

  readonly enCursoCount = computed(
    () => this.alertas().filter((a) => a.estado?.codigo !== 'ATENDIDA' && a.estado?.codigo !== 'CANCELADA').length
  );

  readonly atendidasCount = computed(
    () => this.alertas().filter((a) => a.estado?.codigo === 'ATENDIDA').length
  );

  readonly alertasFiltradas = computed(() => {
    const f = this.filtroActual();
    if (f === 'en_curso') {
      return this.alertas().filter((a) => a.estado?.codigo !== 'ATENDIDA' && a.estado?.codigo !== 'CANCELADA');
    }
    if (f === 'atendidas') {
      return this.alertas().filter((a) => a.estado?.codigo === 'ATENDIDA');
    }
    return this.alertas();
  });

  ngOnInit(): void {
    void this.cargarAlertas();
    this.route.queryParamMap.subscribe((params) => {
      const idStr = params.get('id');
      if (idStr) {
        const id = Number(idStr);
        const encontrada = this.alertas().find((a) => a.id === id);
        if (encontrada) {
          this.alertaSeleccionada.set(encontrada);
        }
      } else {
        this.alertaSeleccionada.set(null);
      }
    });
  }

  cambiarFiltro(f: 'todas' | 'en_curso' | 'atendidas'): void {
    this.filtroActual.set(f);
  }

  seleccionarAlerta(alerta: AlertaInterna): void {
    this.alertaSeleccionada.set(alerta);
    void this.router.navigate([], { queryParams: { id: alerta.id } });
  }

  deseleccionarAlerta(): void {
    this.alertaSeleccionada.set(null);
    void this.router.navigate([], { queryParams: {} });
  }

  async cargarAlertas(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const data = await this.service.obtenerMisAlertas();
      this.alertas.set(data);

      const idStr = this.route.snapshot.queryParamMap.get('id');
      if (idStr) {
        const id = Number(idStr);
        const refrescada = data.find((a) => a.id === id);
        if (refrescada) {
          this.alertaSeleccionada.set(refrescada);
        }
      }
    } catch (err: unknown) {
      this.alertas.set([]);
      if (err instanceof HttpErrorResponse) {
        if (err.status === 403 || err.status === 401) {
          this.error.set('No tienes autorización para consultar estas alertas.');
        } else {
          this.error.set('No se pudieron cargar tus alertas.');
        }
      } else {
        this.error.set('Ocurrió un problema al consultar tus alertas.');
      }
    } finally {
      this.cargando.set(false);
    }
  }

  codigoEstado(alerta: AlertaInterna): string {
    return alerta.estado?.codigo ?? 'DESCONOCIDO';
  }

  nombreEstado(alerta: AlertaInterna): string {
    return alerta.estado?.nombre ?? 'Estado no disponible';
  }

  nombreTipo(alerta: AlertaInterna): string {
    return alerta.tipoAlerta?.nombre ?? 'Tipo no disponible';
  }

  acuseTexto(alerta: AlertaInterna): string {
    if (alerta.fechaRecepcion) {
      return `Acuse: recibida por Portería`;
    }
    return 'Sin acuse de recepción aún';
  }

  esPasoCompletado(alerta: AlertaInterna, paso: number): boolean {
    const cod = this.codigoEstado(alerta);
    if (paso === 1) {
      return true;
    }
    if (paso === 2) {
      return alerta.fechaRecepcion != null || cod === 'RECIBIDA' || cod === 'EN_ATENCION' || cod === 'ATENDIDA';
    }
    if (paso === 3) {
      return cod === 'ATENDIDA';
    }
    return false;
  }
}
