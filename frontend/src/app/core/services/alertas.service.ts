import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { auth } from './firebase.config';
import { onAuthStateChanged, type User } from 'firebase/auth';

export type TipoAlertaMantenimiento = 'proxima' | 'vencida';

export interface AlertaMantenimiento {
  id: string;
  tareaId: string;
  titulo: string;
  activoCodigo: string;
  activoNombre: string;
  ubicacion: string;
  fechaProgramada: Date;
  tipo: TipoAlertaMantenimiento; // 'proxima' | 'vencida'
  badgeTexto: string; // 'PRÓXIMO' | 'CRÍTICA'
  diasDiferencia: number;
}

@Injectable({ providedIn: 'root' })
export class AlertasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8085/promantenimiento/api/tarea-preventiva';

  private readonly _alertas = signal<AlertaMantenimiento[]>([]);
  readonly alertas = this._alertas.asReadonly();
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Filtros reactivos (PMS-190)
  readonly filtroActivo = signal<'todas' | 'proxima' | 'vencida'>('todas');

  readonly alertasFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    const lista = this._alertas();
    if (filtro === 'todas') return lista;
    return lista.filter((a) => a.tipo === filtro);
  });

  readonly totalAlertas = computed(() => this._alertas().length);
  readonly totalProximas = computed(() => this._alertas().filter((a) => a.tipo === 'proxima').length);
  readonly totalVencidas = computed(() => this._alertas().filter((a) => a.tipo === 'vencida').length);

  private async esperarUsuario(): Promise<User | null> {
    if (auth.currentUser) return auth.currentUser;
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (usuario) => {
        unsubscribe();
        resolve(usuario);
      });
    });
  }

  /**
   * HU-MAN-03-CA-01 y CA-02:
   * Consulta las tareas preventivas y evalúa avisos de próximos y vencidos.
   * Excluye automáticamente tareas ya ejecutadas/completadas.
   */
  async cargarAlertas(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    const usuario = await this.esperarUsuario();
    if (!usuario) {
      this.cargando.set(false);
      this.error.set('Debes iniciar sesión para consultar las alertas.');
      return;
    }

    try {
      const token = await usuario.getIdToken();
      const tareasApi = await firstValueFrom(
        this.http.get<any[]>(this.apiUrl, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        })
      );

      const ahora = new Date();
      // Umbral configurable: por defecto avisar tareas dentro de los próximos 7 días
      const umbralDiasProximos = 7;

      const alertasGeneradas: AlertaMantenimiento[] = [];

      for (const t of tareasApi ?? []) {
        const codigoEstado = (t.estado?.codigo ?? '').toUpperCase();

        // HU-MAN-03-CA-02: Excluir tareas ya completadas o ejecutadas
        if (
          codigoEstado.includes('EJECUT') ||
          codigoEstado.includes('COMPLET') ||
          codigoEstado.includes('CANCEL')
        ) {
          continue;
        }

        const fechaProg = new Date(t.programadaPara);
        const diffMs = fechaProg.getTime() - ahora.getTime();
        const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // HU-MAN-03-CA-01:
        // Caso 1: Vencida (fecha programada anterior a hoy)
        if (diffDias < 0) {
          alertasGeneradas.push({
            id: `alert-venc-${t.id}`,
            tareaId: String(t.id),
            titulo: t.titulo,
            activoCodigo: t.activo?.codigo ?? 'ACTIVO',
            activoNombre: t.activo?.nombre ?? 'Activo no especificado',
            ubicacion: t.activo?.ubicacion ?? 'Ubicación central',
            fechaProgramada: fechaProg,
            tipo: 'vencida',
            badgeTexto: 'CRÍTICA',
            diasDiferencia: Math.abs(diffDias),
          });
        }
        // Caso 2: Próxima (dentro del umbral acordado de días)
        else if (diffDias <= umbralDiasProximos) {
          alertasGeneradas.push({
            id: `alert-prox-${t.id}`,
            tareaId: String(t.id),
            titulo: t.titulo,
            activoCodigo: t.activo?.codigo ?? 'ACTIVO',
            activoNombre: t.activo?.nombre ?? 'Activo no especificado',
            ubicacion: t.activo?.ubicacion ?? 'Ubicación central',
            fechaProgramada: fechaProg,
            tipo: 'proxima',
            badgeTexto: 'PRÓXIMA',
            diasDiferencia: diffDias,
          });
        }
      }

      // Ordenar: primero las vencidas (críticas) y luego las más próximas
      alertasGeneradas.sort((a, b) => a.fechaProgramada.getTime() - b.fechaProgramada.getTime());

      this._alertas.set(alertasGeneradas);
    } catch (err) {
      console.error('Error al cargar alertas de mantenimiento:', err);
      this.error.set('No se pudieron consultar las alertas de mantenimiento.');
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarFiltro(filtro: 'todas' | 'proxima' | 'vencida'): void {
    this.filtroActivo.set(filtro);
  }
}