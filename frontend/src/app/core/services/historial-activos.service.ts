import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Activo, ActivoApi } from '../../models/activo.model';
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

  private readonly apiActivosUrl = 'http://localhost:8085/promantenimiento/api/activo';
  private readonly apiTareasUrl = 'http://localhost:8085/promantenimiento/api/tarea-preventiva';
  private readonly apiIncidenciasUrl = 'http://localhost:8085/promantenimiento/api/incidencia';

  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);
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
      let res: any[] = [];
      try {
        res = await firstValueFrom(this.http.get<any[]>(this.apiActivosUrl, { headers }));
      } catch {
        res = await firstValueFrom(
          this.http.get<any[]>('http://localhost:8085/promantenimineto/api/activos', { headers })
        ).catch(() => []);
      }

      const listaMapeada: Activo[] = (res || []).map((item) => ({
        id: item.id,
        codigo: item.codigo || `ACT-${item.id}`,
        nombre: item.nombre || 'Activo sin nombre',
        tipo: item.tipoActivo?.nombre || item.tipo || 'General',
        tipoActivoId: item.tipoActivo?.id,
        ubicacion: item.ubicacion || 'Ubicación no especificada',
        descripcion: item.descripcion,
        marca: item.marca,
        modelo: item.modelo,
        numeroSerie: item.numeroSerie,
        fechaInstalacion: item.fechaInstalacion,
        esCritico: item.esCritico ?? false,
        estado: item.estadoActivo?.nombre || item.estado || 'OPERATIVO',
        creadoEn: item.creadoEn,
        actualizadoEn: item.actualizadoEn,
      }));

      if (listaMapeada.length === 0) {
        listaMapeada.push({
          id: 1,
          codigo: 'ACT-DEC7219F',
          nombre: '[QA] Ascensor Torre 1',
          tipo: 'Ascensor',
          ubicacion: 'Torre 1 · Hall principal',
          estado: 'OPERATIVO',
          esCritico: true,
          creadoEn: '2026-09-01T09:00:00',
        });
      }

      this.activos.set(listaMapeada);
      return listaMapeada;
    } catch (err: any) {
      this.error.set('No se pudo cargar la lista de activos.');
      return [];
    } finally {
      this.cargando.set(false);
    }
  }

  async obtenerHistorialDeActivo(activo: Activo): Promise<ItemHistorial[]> {
    this.cargando.set(true);
    this.error.set(null);

    const historial: ItemHistorial[] = [];

    try {
      const headers = await this.getHeaders();

      const [tareas, incidencias] = await Promise.all([
        firstValueFrom(this.http.get<any[]>(this.apiTareasUrl, { headers })).catch(() => []),
        firstValueFrom(this.http.get<any[]>(this.apiIncidenciasUrl, { headers })).catch(() => []),
      ]);

      const tareasDeActivo = (tareas || []).filter((t: any) => {
        const actId = t.activo?.id ?? t.activoId ?? t.activo;
        const actCod = t.activo?.codigo ?? t.activoCodigo;
        return (
          (activo.id && String(actId) === String(activo.id)) ||
          (activo.codigo && actCod === activo.codigo) ||
          (t.titulo && t.titulo.toLowerCase().includes(activo.tipo.toLowerCase()))
        );
      });

      for (const t of tareasDeActivo) {
        historial.push({
          id: `tarea-${t.id}`,
          tipo: 'MANTENIMIENTO',
          titulo: `${t.titulo || 'Mantenimiento Preventivo'} · ${t.estado?.nombre || t.estado || 'Ejecutada'}`,
          estado: t.estado?.nombre || t.estado || 'Ejecutada',
          descripcion:
            t.descripcion ||
            t.observaciones ||
            'Mantenimiento e inspección técnica realizada al equipo.',
          responsable: t.tecnico?.nombres ? `${t.tecnico.nombres} ${t.tecnico.apellidos || ''}` : 'Mantenimiento Prueba',
          codigoReferencia: t.codigo || `TAR-${t.id}`,
          fecha: new Date(t.fechaEjecucion || t.fechaProgramada || t.actualizadoEn || Date.now()),
        });
      }

      const fallasDeActivo = (incidencias || []).filter((inc: any) => {
        const ubi = (inc.ubicacion || '').toLowerCase();
        const desc = (inc.descripcion || '').toLowerCase();
        const cat = (inc.categoria?.nombre || inc.categoria || '').toLowerCase();
        const tipoAct = activo.tipo.toLowerCase();
        const nomAct = activo.nombre.toLowerCase();

        return (
          ubi.includes(tipoAct) ||
          desc.includes(tipoAct) ||
          nomAct.includes(cat) ||
          (activo.id && inc.activoId === activo.id)
        );
      });

      for (const f of fallasDeActivo) {
        historial.push({
          id: `falla-${f.id}`,
          tipo: 'FALLA',
          titulo: `Falla: ${f.descripcion || 'Incidencia en activo'} · ${f.estado?.nombre || f.estado || 'Solucionada'}`,
          estado: f.estado?.nombre || f.estado || 'Solucionada',
          descripcion:
            f.accionesRealizadas ||
            f.diagnosticoTecnico ||
            'Se reportó un desperfecto en el activo y se derivó a atención.',
          responsable: f.solicitante ? `${f.solicitante.nombres} ${f.solicitante.apellidos}` : 'Residente Prueba',
          codigoReferencia: f.codigo || (f.id ? `INC-2026-000${f.id}` : undefined),
          fecha: new Date(f.actualizadoEn || f.fechaReporte || Date.now()),
        });
      }

      if (activo.creadoEn || activo.fechaInstalacion) {
        historial.push({
          id: `registro-${activo.id || 'ini'}`,
          tipo: 'REGISTRO',
          titulo: 'Registro del activo en el sistema',
          estado: 'Activo',
          descripcion: `Administrador Prueba · Alta del activo ${activo.nombre} con código ${activo.codigo}.`,
          responsable: 'Administrador Prueba',
          codigoReferencia: activo.codigo,
          fecha: new Date(activo.fechaInstalacion || activo.creadoEn || '2026-09-01T09:00:00'),
        });
      }

      historial.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
      return historial;
    } catch {
      return [];
    } finally {
      this.cargando.set(false);
    }
  }
}