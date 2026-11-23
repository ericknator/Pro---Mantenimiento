import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AlertasInternasService,
  AlertaInterna,
  TipoAlertaInterna,
} from '../../core/services/alertas-internas.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reportar-alerta',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './reportar-alerta.component.html',
  styleUrl: './reportar-alerta.component.scss',
})
export class ReportarAlertaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AlertasInternasService);
  private readonly auth = inject(AuthService);

  readonly tipos = signal<TipoAlertaInterna[]>([]);
  readonly cargandoTipos = signal(false);
  readonly enviando = signal(false);
  readonly error = signal<string | null>(null);
  readonly creada = signal<AlertaInterna | null>(null);

  readonly usuarioNombre = computed(() => {
    const u = this.auth.usuario();
    return u?.nombre ?? 'Residente Prueba';
  });

  readonly tipoSeleccionadoNombre = computed(() => {
    const id = this.form.controls.tipoAlertaId.value;
    return this.tipos().find((t) => t.id === id)?.nombre ?? '—';
  });

  readonly form = this.fb.group({
    tipoAlertaId: [null as number | null, Validators.required],
    ubicacion: [
      '',
      [Validators.required, Validators.pattern(/.*\S.*/), Validators.maxLength(255)],
    ],
    descripcion: [''],
  });

  ngOnInit(): void {
    void this.cargarTipos();
  }

  invalido(campo: 'tipoAlertaId' | 'ubicacion'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  seleccionarTipo(id: number): void {
    this.form.controls.tipoAlertaId.setValue(id);
    this.form.controls.tipoAlertaId.markAsTouched();
    this.limpiarConfirmacion();
  }

  async cargarTipos(): Promise<void> {
    this.cargandoTipos.set(true);
    this.error.set(null);

    try {
      const tipos = await this.service.obtenerTipos();
      this.tipos.set(tipos);

      if (tipos.length === 0) {
        this.error.set('No hay tipos de alerta disponibles actualmente.');
      }
    } catch {
      this.tipos.set([]);
      this.error.set(
        'No se pudieron cargar los tipos de alerta. Verifica tu conexión e inténtalo nuevamente.'
      );
    } finally {
      this.cargandoTipos.set(false);
    }
  }

  async registrar(): Promise<void> {
    if (this.enviando() || this.cargandoTipos()) {
      return;
    }

    const tipoAlertaId = this.form.controls.tipoAlertaId.value;
    const ubicacion = this.form.controls.ubicacion.value?.trim();

    if (tipoAlertaId == null || !ubicacion) {
      this.form.markAllAsTouched();
      this.error.set('Completa los campos obligatorios para enviar la alerta.');
      return;
    }

    if (ubicacion.length > 255) {
      this.error.set('La ubicación no puede superar los 255 caracteres.');
      return;
    }

    this.enviando.set(true);
    this.error.set(null);

    try {
      const resultado = await this.service.registrar({
        tipoAlertaId,
        ubicacion,
        descripcion: this.form.controls.descripcion.value?.trim() || null,
      });

      this.creada.set(resultado);
    } catch (err) {
      this.creada.set(null);

      if (err instanceof HttpErrorResponse) {
        switch (err.status) {
          case 400:
            this.error.set('Verifica los datos ingresados e inténtalo nuevamente.');
            break;
          case 401:
            this.error.set('Tu sesión ha expirado. Inicia sesión nuevamente.');
            break;
          case 403:
            this.error.set('Tu usuario no tiene permiso para registrar alertas.');
            break;
          default:
            this.error.set(
              'No se pudo registrar la alerta. Verifica tu conexión e inténtalo nuevamente.'
            );
        }
      } else {
        this.error.set('Ocurrió un problema al enviar la alerta.');
      }
    } finally {
      this.enviando.set(false);
    }
  }

  nuevaAlerta(): void {
    this.creada.set(null);
    this.form.reset();
  }

  limpiarConfirmacion(): void {
    if (this.creada()) {
      this.creada.set(null);
    }
  }
}