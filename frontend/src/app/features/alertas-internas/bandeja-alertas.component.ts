import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AlertaInterna,
  AlertasInternasService,
} from '../../core/services/alertas-internas.service';

@Component({
  selector: 'app-bandeja-alertas',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './bandeja-alertas.component.html',
  styleUrl: './bandeja-alertas.component.scss',
})
export class BandejaAlertasComponent implements OnInit {
  private readonly alertasService = inject(AlertasInternasService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly alertas = signal<AlertaInterna[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly filtro = signal<'todas' | 'nuevas' | 'atendidas'>('todas');

  readonly alertaSeleccionada = signal<AlertaInterna | null>(null);
  readonly procesando = signal(false);
  readonly errorAccion = signal<string | null>(null);
  readonly observacionCierre = signal('Situación atendida y controlada por seguridad.');

  readonly emitidasCount = computed(() =>
    this.alertas().filter((a) => this.codigoEstado(a) === 'EMITIDA').length
  );

  readonly atendidasCount = computed(() =>
    this.alertas().filter((a) => this.codigoEstado(a) === 'ATENDIDA').length
  );

  readonly alertasFiltradas = computed(() => {
    const f = this.filtro();
    const list = this.alertas();

    if (f === 'nuevas') {
      return list.filter((a) => this.codigoEstado(a) === 'EMITIDA');
    }
    if (f === 'atendidas') {
      return list.filter((a) => this.codigoEstado(a) === 'ATENDIDA');
    }
    return list;
  });

  ngOnInit(): void {
    void this.cargarBandeja();
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

  cambiarFiltro(f: 'todas' | 'nuevas' | 'atendidas'): void {
    this.filtro.set(f);
  }

  seleccionarAlerta(alerta: AlertaInterna): void {
    this.alertaSeleccionada.set(alerta);
    this.errorAccion.set(null);
    this.observacionCierre.set('Situación atendida y controlada por seguridad.');
    void this.router.navigate([], { queryParams: { id: alerta.id } });
  }

  deseleccionarAlerta(): void {
    this.alertaSeleccionada.set(null);
    this.errorAccion.set(null);
    void this.router.navigate([], { queryParams: {} });
  }

  async cargarBandeja(): Promise<void> {
    if (this.cargando()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      const resultado = await this.alertasService.obtenerBandeja();
      this.alertas.set(resultado);

      const idStr = this.route.snapshot.queryParamMap.get('id');
      if (idStr) {
        const id = Number(idStr);
        const refrescada = resultado.find((a) => a.id === id);
        if (refrescada) {
          this.alertaSeleccionada.set(refrescada);
        }
      }
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          this.error.set('Tu sesión ha expirado. Inicia sesión nuevamente.');
        } else if (err.status === 403) {
          this.error.set('No tienes permisos de seguridad para ver la bandeja.');
        } else {
          this.error.set('No se pudieron cargar las alertas internas.');
        }
      } else {
        this.error.set('Ocurrió un error al consultar las alertas.');
      }
    } finally {
      this.cargando.set(false);
    }
  }

  async avanzarFlujo(alerta: AlertaInterna): Promise<void> {
    if (this.procesando()) {
      return;
    }

    const estado = this.codigoEstado(alerta);
    this.procesando.set(true);
    this.errorAccion.set(null);

    try {
      if (estado === 'EMITIDA') {
        const actualizada = await this.alertasService.confirmarRecepcion(alerta.id);
        this.actualizarAlertaEnLista(actualizada);
      } else if (estado === 'RECIBIDA') {
        const actualizada = await this.alertasService.actualizarEstado(alerta.id, {
          nuevoEstadoCodigo: 'EN_ATENCION',
          observacion: 'Atención iniciada por portería y seguridad.',
        });
        this.actualizarAlertaEnLista(actualizada);
      } else if (estado === 'EN_ATENCION') {
        const obs = this.observacionCierre().trim() || 'Situación atendida y controlada por seguridad.';
        const actualizada = await this.alertasService.actualizarEstado(alerta.id, {
          nuevoEstadoCodigo: 'ATENDIDA',
          observacion: obs,
        });
        this.actualizarAlertaEnLista(actualizada);
      }
    } catch {
      this.errorAccion.set('No se pudo actualizar el estado de la alerta. Inténtalo de nuevo.');
    } finally {
      this.procesando.set(false);
    }
  }

  private actualizarAlertaEnLista(actualizada: AlertaInterna): void {
    this.alertas.update((actuales) =>
      actuales.map((item) => (item.id === actualizada.id ? actualizada : item))
    );
    this.alertaSeleccionada.set(actualizada);
  }

  codigoEstado(alerta: AlertaInterna): string {
    return alerta.estado?.codigo ?? 'DESCONOCIDO';
  }

  nombreEstado(alerta: AlertaInterna): string {
    return alerta.estado?.nombre ?? 'Desconocido';
  }

  esPasoCompletado(alerta: AlertaInterna, paso: number): boolean {
    const cod = this.codigoEstado(alerta);
    if (paso === 1) {
      return true;
    }
    if (paso === 2) {
      return cod === 'RECIBIDA' || cod === 'EN_ATENCION' || cod === 'ATENDIDA';
    }
    if (paso === 3) {
      return cod === 'EN_ATENCION' || cod === 'ATENDIDA';
    }
    if (paso === 4) {
      return cod === 'ATENDIDA';
    }
    return false;
  }
}
