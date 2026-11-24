import { API_BASE_URL } from '../config/api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Activo } from '../../models/activo.model';
import { auth } from './firebase.config';
import { onAuthStateChanged, User } from 'firebase/auth';

export interface ItemHistorial {
  id: string;
  tipo: 'MANTENIMIENTO' | 'FALLA' | 'REGISTRO';
  titulo: string;
  estado: string;
  descripcion: string;
  responsable: string;
  codigoReferencia?: string;
  fecha: Date;
}

@Injectable({ providedIn: 'root' })
export class HistorialActivosService {
  private readonly http = inject(HttpClient);

  private readonly apiActivosUrl = `${API_BASE_URL}/activo`;
  private readonly apiTareasUrl = `${API_BASE_URL}/tarea-preventiva`;
  private readonly apiIncidenciasUrl = `${API_BASE_URL}/incidencia`;

  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly advertencia = signal<string | null>(null);
  readonly activos = signal<Activo[]>([]);

  private esperarUsuario(): Promise<User | null> {
    if (auth.currentUser) {
      return Promise.resolve(auth.currentUser);
    }
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (usuario) => {
          unsubscribe();
          resolve(usuario);
        },
        () => resolve(null)
      );
    });
  }

  private async getHeaders(): Promise<HttpHeaders> {
    const usuario = await this.esperarUsuario();
    if (!usuario) {
      return new HttpHeaders();
    }
    const token = await usuario.getIdToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  async cargarActivos(): Promise<Activo[]> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const headers = await this.getHeaders();
      const res = await firstValueFrom(this.http.get<any[]>(this.apiActivosUrl, { headers }));
      if (!Array.isArray(res)) throw new Error('Respuesta de activos inválida');

      const listaMapeada: Activo[] = (res || []).map((item) => ({
        id: item.id,
        codigo: item.codigo || (item.id != null ? `#${item.id}` : 'Código no informado'),
        nombre: item.nombre || 'Activo sin nombre',
        tipo: item.tipoActivo?.nombre || item.tipo || 'Tipo no informado',
        tipoActivoId: item.tipoActivo?.id,
        ubicacion: item.ubicacion || 'Ubicación no especificada',
        descripcion: item.descripcion,
        marca: item.marca,
        modelo: item.modelo,
        numeroSerie: item.numeroSerie,
        fechaInstalacion: item.fechaInstalacion,
        esCritico: item.esCritico ?? false,
        estado: item.estadoActivo?.nombre || item.estado || 'Estado no informado',
        creadoEn: item.creadoEn,
        actualizadoEn: item.actualizadoEn,
      }));

      this.activos.set(listaMapeada);
      return listaMapeada;
    } catch (err: any) {
      this.activos.set([]);
      this.error.set('No se pudo cargar la lista de activos. Intenta nuevamente.');
      return [];
    } finally {
      this.cargando.set(false);
    }
  }

  async obtenerHistorialDeActivo(activo: Activo): Promise<ItemHistorial[]> {
    this.cargando.set(true);
    this.error.set(null);
    this.advertencia.set(null);

    const historial: ItemHistorial[] = [];

    try {
      const headers = await this.getHeaders();

      const [tareas, incidencias] = await Promise.all([
        firstValueFrom(this.http.get<any[]>(this.apiTareasUrl, { headers })),
        firstValueFrom(this.http.get<any[]>(this.apiIncidenciasUrl, { headers })),
      ]);

      if (!Array.isArray(tareas) || !Array.isArray(incidencias)) {
        throw new Error('Respuesta de historial inválida');
      }
      // activo: null es una incidencia explícitamente sin relación en el nuevo contrato.
      // La ausencia del campo sigue distinguiendo respuestas históricas incompletas.
      if (tareas.some((registro) => !this.tieneRelacion(registro)) ||
          incidencias.some((registro) => !this.tieneRelacion(registro) && registro.activo !== null)) {
        this.advertir('Hay intervenciones sin un activo identificado; su historial puede estar incompleto.');
      }
      const tareasDeActivo = tareas.filter((t) => this.correspondeAlActivo(t, activo));

      for (const t of tareasDeActivo) {
        const fecha = this.fechaRegistrada(
          t.fechaFin, t.fechaInicio, t.programadaPara,
          t.fechaEjecucion, t.fechaProgramada, t.actualizadoEn
        );
        if (!fecha) { this.advertirFecha(); continue; }
        const responsable = t.responsable ?? t.tecnico;
        historial.push({
          id: `tarea-${t.id}`,
          tipo: 'MANTENIMIENTO',
          titulo: `${t.titulo || 'Mantenimiento Preventivo'} · ${t.estado?.nombre || t.estado || 'Sin estado registrado'}`,
          estado: t.estado?.nombre || t.estado || 'Sin estado registrado',
          descripcion:
            t.descripcion ||
            t.observaciones ||
            'Sin descripción registrada.',
          responsable: [responsable?.nombres, responsable?.apellidos]
            .filter(Boolean).join(' ') || 'Responsable no registrado',
          codigoReferencia: t.codigo || (t.id != null ? `#${t.id}` : undefined),
          fecha,
        });
      }

      const fallasDeActivo = incidencias.filter((inc) => this.correspondeAlActivo(inc, activo));

      for (const f of fallasDeActivo) {
        const fecha = this.fechaRegistrada(f.fechaReporte, f.actualizadoEn);
        if (!fecha) { this.advertirFecha(); continue; }
        historial.push({
          id: `falla-${f.id}`,
          tipo: 'FALLA',
          titulo: `Falla: ${f.descripcion || 'Incidencia en activo'} · ${f.estado?.nombre || f.estado || 'Sin estado registrado'}`,
          estado: f.estado?.nombre || f.estado || 'Sin estado registrado',
          descripcion:
            f.accionesRealizadas ||
            f.diagnosticoTecnico ||
            'Sin descripción registrada.',
          responsable: f.solicitante ? `${f.solicitante.nombres} ${f.solicitante.apellidos}` : 'Responsable no registrado',
          codigoReferencia: f.codigo || (f.id ? `#${f.id}` : undefined),
          fecha,
        });
      }

      const fechaAlta = this.fechaRegistrada(activo.creadoEn);
      if (fechaAlta) {
        historial.push({
          id: `registro-${activo.id || 'ini'}`,
          tipo: 'REGISTRO',
          titulo: 'Registro del activo en el sistema',
          estado: 'Activo',
          descripcion: `Alta del activo ${activo.nombre} con código ${activo.codigo}.`,
          responsable: 'No informado en el registro del activo',
          codigoReferencia: activo.codigo,
          fecha: fechaAlta,
        });
      }

      historial.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
      return historial;
    } catch {
      this.error.set('No se pudo consultar el historial. Intenta nuevamente; no se ha confirmado la ausencia de intervenciones.');
      return [];
    } finally {
      this.cargando.set(false);
    }
  }

  private tieneRelacion(registro: any): boolean {
    const ref = registro.activo;
    return (ref?.id ?? registro.activoId ??
      (typeof ref === 'number' || typeof ref === 'string' ? ref : null)) != null ||
      Boolean(ref?.codigo || registro.activoCodigo);
  }

  private correspondeAlActivo(registro: any, activo: Activo): boolean {
    const ref = registro.activo;
    const id = ref?.id ?? registro.activoId ??
      (typeof ref === 'number' || typeof ref === 'string' ? ref : null);
    if (id != null) return activo.id != null && String(id) === String(activo.id);
    const codigo = ref?.codigo ?? registro.activoCodigo;
    return Boolean(codigo && activo.codigo && codigo === activo.codigo);
  }

  private fechaRegistrada(...valores: unknown[]): Date | null {
    for (const valor of valores) {
      if (typeof valor !== 'string' || !valor.trim()) continue;
      const fecha = new Date(valor);
      if (!Number.isNaN(fecha.getTime())) return fecha;
    }
    return null;
  }

  private advertir(mensaje: string): void {
    const actual = this.advertencia();
    if (!actual?.includes(mensaje)) this.advertencia.set(actual ? `${actual} ${mensaje}` : mensaje);
  }

  private advertirFecha(): void {
    this.advertir('Hay intervenciones sin fecha válida; no se incluyen en la secuencia cronológica.');
  }

}
