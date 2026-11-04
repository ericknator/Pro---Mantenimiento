
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth } from './firebase.config';
import { FERIADOS_PERU } from '../data/feriados-peru.data';
import { restarDiasHabiles } from '../utils/dias-habiles.util';

export type TipoAlertaMantenimiento = 'proxima' | 'vencida';

export interface AlertaMantenimiento {
  id: string;
  tareaId: string;
  titulo: string;
  activoCodigo: string;
  activoNombre: string;
  ubicacion: string;
  fechaProgramada: Date;
  tipo: TipoAlertaMantenimiento;
  badgeTexto: string;
  diasDiferencia: number;
}

@Injectable({ providedIn: 'root' })
export class AlertasService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8085/promantenimiento/api/tarea-preventiva';

  // Anticipación acordada por el equipo.
  private readonly umbralDiasProximos = 7;

  // Calendario nacional configurado para 2026.
  // Pendiente: cobertura para 2027 y años posteriores.
  private readonly feriados: ReadonlySet<string> = FERIADOS_PERU;

  /**
   * Estados del catálogo real de tareas preventivas.
   *
   * EN_EJECUCION se excluye provisionalmente de las alertas
   * pendientes de ejecución. Esta regla requiere validación
   * funcional con el equipo.
   */
  // Solo se excluyen tareas finalizadas o canceladas.
  // Las tareas EN_EJECUCION permanecen visibles para seguimiento.
  private readonly estadosExcluidos: ReadonlySet<string> = new Set([
    'EJECUTADA',
    'CANCELADA',
  ]);;

  private readonly _alertas = signal<AlertaMantenimiento[]>([]);

  readonly alertas = this._alertas.asReadonly();
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Filtros reactivos de PMS-190.
  readonly filtroActivo = signal<
    'todas' | 'proxima' | 'vencida'
  >('todas');

  readonly alertasFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    const lista = this._alertas();

    if (filtro === 'todas') {
      return lista;
    }

    return lista.filter((alerta) => alerta.tipo === filtro);
  });

  readonly totalAlertas = computed(() => this._alertas().length);

  readonly totalProximas = computed(
    () => this._alertas().filter((alerta) => alerta.tipo === 'proxima').length
  );

  readonly totalVencidas = computed(
    () => this._alertas().filter((alerta) => alerta.tipo === 'vencida').length
  );

  private async esperarUsuario(): Promise<User | null> {
    if (auth.currentUser) {
      return auth.currentUser;
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (usuario) => {
        unsubscribe();
        resolve(usuario);
      });
    });
  }

  /**
   * HU-MAN-03-CA-01 y CA-02.
   *
   * Consulta tareas preventivas y genera alertas:
   *
   * - CRÍTICA: después de superar la fecha y hora programada.
   * - PRÓXIMA: desde 7 días hábiles antes de la programación.
   * - No genera alertas para tareas ejecutadas o canceladas.
   *
   * Las tareas EN_EJECUCION se excluyen provisionalmente,
   * pendiente de validación con el equipo.
   *
   * El calendario de feriados está configurado para 2026.
   */
  async cargarAlertas(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const usuario = await this.esperarUsuario();

      if (!usuario) {
        this._alertas.set([]);
        this.error.set(
          'Debes iniciar sesión para consultar las alertas.'
        );
        return;
      }

      const token = await usuario.getIdToken();

      const tareasApi = await firstValueFrom(
        this.http.get<any[]>(this.apiUrl, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        })
      );

      const ahora = new Date();
      const alertasGeneradas: AlertaMantenimiento[] = [];

      for (const tarea of tareasApi ?? []) {
        const codigoEstado = String(
          tarea.estado?.codigo ?? ''
        ).trim().toUpperCase();

        // HU-MAN-03-CA-02:
        // Filtrar mediante códigos exactos del catálogo.
        if (this.estadosExcluidos.has(codigoEstado)) {
          continue;
        }

        // Solo procesar estados del catálogo que requieren
        // evaluación de fecha.
        if (
          codigoEstado !== 'PROGRAMADA' &&
          codigoEstado !== 'EN_EJECUCION' &&
          codigoEstado !== 'VENCIDA'
        ) {
          continue;
        }

        const fechaProgramada = new Date(tarea.programadaPara);

        // Evitar clasificaciones basadas en fechas inválidas.
        if (Number.isNaN(fechaProgramada.getTime())) {
          continue;
        }

        const diferenciaMs =
          fechaProgramada.getTime() - ahora.getTime();

        // Días calendario utilizados únicamente en la interfaz.
        // No determinan el umbral de siete días hábiles.
        const milisegundosPorDia = 1000 * 60 * 60 * 24;

        const diasDiferencia = diferenciaMs < 0
          ? Math.floor(Math.abs(diferenciaMs) / milisegundosPorDia)
          : Math.ceil(diferenciaMs / milisegundosPorDia);

        // Inicio del período de anticipación.
        const inicioAlerta = restarDiasHabiles(
          fechaProgramada,
          this.umbralDiasProximos,
          this.feriados
        );

        const datosBase = {
          tareaId: String(tarea.id),
          titulo: tarea.titulo,
          activoCodigo: tarea.activo?.codigo ?? 'ACTIVO',
          activoNombre:
            tarea.activo?.nombre ?? 'Activo no especificado',
          ubicacion:
            tarea.activo?.ubicacion ?? 'Ubicación central',
          fechaProgramada,
        };

        // CASO 1: fecha y hora programada superadas.
        if (diferenciaMs < 0) {
          alertasGeneradas.push({
            ...datosBase,
            id: `alert-venc-${tarea.id}`,
            tipo: 'vencida',
            badgeTexto: 'CRÍTICA',
            diasDiferencia,
          });

          continue;
        }

        // CASO 2: dentro de los siete días hábiles previos.
        if (ahora.getTime() >= inicioAlerta.getTime()) {
          alertasGeneradas.push({
            ...datosBase,
            id: `alert-prox-${tarea.id}`,
            tipo: 'proxima',
            badgeTexto: 'PRÓXIMA',
            diasDiferencia,
          });
        }
      }

      // Alertas críticas primero; dentro de cada grupo,
      // ordenar de la fecha más antigua a la más reciente.
      alertasGeneradas.sort((a, b) => {
        if (a.tipo !== b.tipo) {
          return a.tipo === 'vencida' ? -1 : 1;
        }

        return (
          a.fechaProgramada.getTime() -
          b.fechaProgramada.getTime()
        );
      });

      this._alertas.set(alertasGeneradas);
    } catch (err) {
      console.error(
        'Error al cargar alertas de mantenimiento:',
        err
      );

      this.error.set(
        'No se pudieron consultar las alertas de mantenimiento.'
      );

      // No mostrar alertas antiguas tras un error de consulta.
      this._alertas.set([]);
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarFiltro(
    filtro: 'todas' | 'proxima' | 'vencida'
  ): void {
    this.filtroActivo.set(filtro);
  }
}
