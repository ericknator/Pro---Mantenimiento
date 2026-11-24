import { API_BASE_URL } from '../config/api.config';
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Incidencia,
  IncidenciaApi,
  EvidenciaIncidencia,
  NuevaIncidencia,
  EstadoIncidencia
} from '../../models/incidencia.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { auth } from './firebase.config';
import { onAuthStateChanged, type User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class IncidenciasService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${API_BASE_URL}/incidencia`;

  private readonly apiAsignadasUrl = `${API_BASE_URL}/incidencia/asignadas`;

  private readonly apiEvidenciasUrl = `${API_BASE_URL}/evidencia-incidencia`;

  private mapearEvidencias(
    incidencia: IncidenciaApi
  ): EvidenciaIncidencia[] {
    if (!Array.isArray(incidencia.evidencias)) {
      return [];
    }

    return incidencia.evidencias
      .filter((evidencia) => {
        const referencia = evidencia.incidencia;
        if (referencia === undefined || referencia === null) {
          return true;
        }

        const incidenciaId =
          typeof referencia === 'object' ? referencia.id : referencia;

        return incidenciaId === undefined || String(incidenciaId) === String(incidencia.id);
      })
      .map((evidencia) => {
        const creadoEn = evidencia.creadoEn
          ? new Date(evidencia.creadoEn)
          : null;

        return {
          id: String(evidencia.id),
          nombreArchivo: evidencia.nombreArchivo?.trim() || 'Evidencia',
          urlRecurso: evidencia.urlRecurso?.trim() || null,
          descripcion: evidencia.descripcion?.trim() || null,
          tipoCodigo: evidencia.tipoEvidencia?.codigo?.trim() || null,
          tipoNombre: evidencia.tipoEvidencia?.nombre?.trim() || null,
          creadoEn:
            creadoEn && !Number.isNaN(creadoEn.getTime()) ? creadoEn : null,
        };
      });
  }

  private normalizarEstado(
    codigo?: string | null,
    nombre?: string | null
  ): EstadoIncidencia {
    const claveCodigo = this.normalizarClaveEstado(codigo);

    switch (claveCodigo) {
      case 'CLASIFICADA':
        return 'Clasificada';
      case 'ASIGNADA':
        return 'Asignada';
      case 'SOLUCIONADA':
        return 'Solucionada';
      case 'CERRADA':
        return 'Cerrada';
      case 'REABIERTA':
        return 'Reabierta';
      case 'EN_ATENCION':
        return 'En atención';
      case 'REPORTADA':
        return 'Reportada';
    }

    const claveNombre = this.normalizarClaveEstado(nombre);
    if (claveNombre.startsWith('CLASIFICADA')) return 'Clasificada';
    if (claveNombre.startsWith('ASIGNADA')) return 'Asignada';
    if (claveNombre.startsWith('SOLUCIONADA')) return 'Solucionada';
    if (claveNombre.startsWith('CERRADA')) return 'Cerrada';
    if (claveNombre.startsWith('REABIERTA')) return 'Reabierta';
    if (claveNombre.startsWith('EN_ATENCION')) return 'En atención';
    if (claveNombre.startsWith('REPORTADA')) return 'Reportada';

    throw new Error(
      `Estado de incidencia no reconocido (código: ${codigo ?? 'sin código'}, nombre: ${nombre ?? 'sin nombre'})`
    );
  }

  private normalizarClaveEstado(valor?: string | null): string {
    return (valor ?? '')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }


  private mapearIncidencias(respuesta: IncidenciaApi[]): Incidencia[] {
    return respuesta.map((item) => {
      const fecha = new Date(item.fechaReporte);
      const actualizada = new Date(item.actualizadoEn);
      const evidenciasConsultaDisponible = Array.isArray(item.evidencias);

      return {
        id: String(item.id),
        autorId: String(item.solicitante.id),
        autor: `${item.solicitante.nombres} ${item.solicitante.apellidos}`,
        categoria: item.categoria.nombre,
        ubicacion: item.ubicacion,
        descripcion: item.descripcion,
        motivoReapertura: item.motivoReapertura?.trim() || null,
        evidencias: [],
        evidenciasSolucion: this.mapearEvidencias(item),
        evidenciasConsultaDisponible,

        estado: this.normalizarEstado(
          item.estado?.codigo,
          item.estado?.nombre
        ),

        creada: fecha,
        actualizada,

        historial: [
          {
            estado: this.normalizarEstado(
              item.estado?.codigo,
              item.estado?.nombre
            ),
            fecha: actualizada
          }
        ],

        // Nombre del responsable asignado registrado en el backend
        responsableNombre: item.responsableActual
          ? [
            item.responsableActual.nombres,
            item.responsableActual.apellidos
          ].filter(Boolean).join(' ') || null
          : null,

        // Fecha real de solución registrada en el backend
        fechaSolucion: item.fechaSolucion
          ? new Date(item.fechaSolucion)
          : null,
      };
    });
  }



  async cargarDetalle(id: string): Promise<void> {
    this._todas.set([]);
    this.cargando.set(true);
    this.error.set(null);

    try {
      const usuario = await this.esperarUsuario();
      if (!usuario) {
        this.error.set('Debes iniciar sesión para consultar esta incidencia.');
        return;
      }

      const token = await usuario.getIdToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const [respuesta, listaEvidencias] = await Promise.all([
        firstValueFrom(
          this.http.get<IncidenciaApi>(
            `${this.apiUrl}/${encodeURIComponent(id)}`,
            { headers }
          )
        ),
        firstValueFrom(
          this.http.get<any[]>(this.apiEvidenciasUrl, { headers })
        ).catch(() => [] as any[])
      ]);

      const evidenciasDeIncidencia = (listaEvidencias || []).filter(
        (ev: any) => String(ev.incidencia?.id ?? ev.incidencia) === String(id)
      );

      respuesta.evidencias = evidenciasDeIncidencia;

      this._todas.set(this.mapearIncidencias([respuesta]));
    } catch (error) {
      console.error('Error al cargar el detalle de la incidencia:', error);
      this.error.set(this.mensajeErrorConsulta(error));
    } finally {
      this.cargando.set(false);
    }
  }

  private async cargarAsignadasDesdeBackend(usuario: User): Promise<void> {
    const token = await usuario.getIdToken();
    const respuesta = await firstValueFrom(
      this.http.get<IncidenciaApi[]>(this.apiAsignadasUrl, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      })
    );

    this._todas.set(this.mapearIncidencias(respuesta));
  }

  async cargarAsignadas(): Promise<void> {
    this._todas.set([]);
    this.cargando.set(true);
    this.error.set(null);

    const usuario = await this.esperarUsuario();
    if (!usuario) {
      this.error.set(
        'Debes iniciar sesión para consultar las incidencias asignadas.'
      );
      this.cargando.set(false);
      return;
    }

    try {
      await this.cargarAsignadasDesdeBackend(usuario);
    } catch (error) {
      console.error('Error al cargar incidencias asignadas:', error);
      this.error.set('No se pudieron cargar las incidencias asignadas.');
    } finally {
      this.cargando.set(false);
    }
  }

  private readonly _todas = signal<Incidencia[]>([]);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly propias = computed(() =>
    [...this._todas()].sort(
      (a, b) => b.creada.getTime() - a.creada.getTime()
    )
  );

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

  async cargar(): Promise<void> {
    this._todas.set([]);
    this.cargando.set(true);
    this.error.set(null);

    const usuario = await this.esperarUsuario();

    if (!usuario) {
      this.error.set(
        'Debes iniciar sesión para consultar tus incidencias.'
      );
      this.cargando.set(false);
      return;
    }

    try {
      const token = await usuario.getIdToken();

      const respuesta = await firstValueFrom(
        this.http.get<IncidenciaApi[]>(this.apiUrl, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`
          })
        })
      );

      this._todas.set(this.mapearIncidencias(respuesta));
    } catch (error) {
      console.error('Error al cargar incidencias:', error);
      this.error.set(
        'No se pudieron cargar las incidencias. Inténtalo nuevamente.'
      );
    } finally {
      this.cargando.set(false);
    }
  }

  private mensajeErrorConsulta(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          return 'No se pudo conectar con el servidor. Verifica la conexión e inténtalo nuevamente.';
        case 401:
          return 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.';
        case 403:
          return 'No tienes permiso para consultar esta incidencia.';
        case 404:
          return 'La incidencia no existe o no está disponible para tu usuario.';
      }
    }

    return 'No se pudo consultar la incidencia. Inténtalo nuevamente.';
  }

  async crearConEvidencias(
    incidencia: {
      categoria: { id: number };
      ubicacion: string;
      descripcion: string;
    },
    archivos: File[]
  ): Promise<unknown> {
    const usuario = await this.esperarUsuario();

    if (!usuario) {
      throw new Error(
        'Debes iniciar sesión para reportar una incidencia.'
      );
    }

    if (archivos.length > 3) {
      throw new Error('Solo puedes adjuntar un máximo de 3 archivos.');
    }

    const token = await usuario.getIdToken();
    const formData = new FormData();

    formData.append('incidencia', JSON.stringify(incidencia));

    archivos.forEach((archivo) => {
      formData.append('archivos', archivo, archivo.name);
    });

    const respuesta = await firstValueFrom(
      this.http.post<unknown>(this.apiUrl, formData, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      })
    );

    await this.cargar();

    return respuesta;
  }

  obtenerPropia(id: string | null): Incidencia | undefined {
    if (!id) {
      return undefined;
    }

    return this.propias().find(
      (incidencia) => incidencia.id === id
    );
  }

  private esSolucionada(incidencia: Incidencia): boolean {
    return incidencia.estado.trim().toLowerCase() === 'solucionada';
  }

  async aceptarIncidencia(id: string): Promise<Incidencia> {
    const usuario = await this.esperarUsuario();

    if (!usuario) {
      throw new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Debes iniciar sesión para aceptar la incidencia.' }
      });
    }

    this.cargando.set(true);

    try {
      const token = await usuario.getIdToken();

      await firstValueFrom(
        this.http.patch<unknown>(
          `${this.apiUrl}/${encodeURIComponent(id)}/aceptar`,
          null,
          {
            headers: new HttpHeaders({
              Authorization: `Bearer ${token}`
            })
          }
        )
      );

      await this.cargarAsignadasDesdeBackend(usuario);
      const incidenciaActualizada = this.obtenerPropia(id);

      if (!incidenciaActualizada) {
        throw new Error(
          'La incidencia aceptada no apareció en la respuesta actualizada.'
        );
      }

      return incidenciaActualizada;
    } finally {
      this.cargando.set(false);
    }
  }

  async solucionarIncidencia(
    id: string,
    diagnostico: string,
    acciones: string,
    archivos: File[] = []
  ): Promise<Incidencia> {
    if (!acciones.trim()) {
      throw new Error('Debes ingresar las acciones realizadas.');
    }

    if (archivos.length > 3) {
      throw new Error('Solo puedes adjuntar un máximo de 3 evidencias.');
    }

    const usuario = await this.esperarUsuario();

    if (!usuario) {
      throw new Error('Debes iniciar sesión para finalizar la incidencia.');
    }

    const token = await usuario.getIdToken();

    const formData = new FormData();
    formData.append('diagnosticoTecnico', diagnostico.trim());
    formData.append('accionesRealizadas', acciones.trim());

    for (const archivo of archivos) {
      formData.append('archivos', archivo, archivo.name);
    }

    await firstValueFrom(
      this.http.patch<unknown>(
        `${this.apiUrl}/${encodeURIComponent(id)}/finalizar-atencion`,
        formData,
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        }
      )
    );

    await this.cargarDetalle(id);

    const incidenciaActualizada = this.obtenerPropia(id);

    if (
      !incidenciaActualizada ||
      !this.esSolucionada(incidenciaActualizada)
    ) {
      throw new Error(
        'El backend no confirmó la incidencia en estado Solucionada.'
      );
    }

    return incidenciaActualizada;
  }

  async confirmarSolucion(id: string | number): Promise<Incidencia> {
    const numericId = String(id).replace(/\D/g, '') || String(id);
    const usuario = await this.esperarUsuario();

    if (!usuario) {
      throw new Error('Debes iniciar sesión para confirmar la solución.');
    }

    this.cargando.set(true);

    try {
      const token = await usuario.getIdToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      await firstValueFrom(
        this.http.patch<unknown>(
          `${this.apiUrl}/${encodeURIComponent(numericId)}/confirmar-solucion`,
          {},
          { headers }
        )
      );

      await this.cargarDetalle(String(numericId));

      const incidenciaActualizada = this.obtenerPropia(String(numericId));
      if (!incidenciaActualizada) {
        throw new Error('La incidencia actualizada no se pudo recuperar.');
      }

      return incidenciaActualizada;
    } finally {
      this.cargando.set(false);
    }
  }

  async reabrirIncidencia(
    id: string | number,
    motivo: string,
    archivos: File[] = []
  ): Promise<Incidencia> {
    const numericId = String(id).replace(/\D/g, '') || String(id);
    const usuario = await this.esperarUsuario();

    if (!usuario) {
      throw new Error('Debes iniciar sesión para reabrir la incidencia.');
    }

    this.cargando.set(true);

    try {
      const token = await usuario.getIdToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      // Ambas versiones devuelven una incidencia, pero con formatos distintos:
      // antiguo: IncidenciaEntity; nuevo: { incidencia, motivoReapertura }.
      // Ninguno de los formatos sustituye a un endpoint de historial.
      const respuesta = await firstValueFrom(
        this.http.patch<{
          id?: number;
          estado?: { codigo?: string } | null;
          incidencia?: { id?: number; estado?: { codigo?: string } | null } | null;
          motivoReapertura?: string | null;
        }>(
          `${this.apiUrl}/${encodeURIComponent(numericId)}/reabrir`,
          { motivo },
          { headers }
        )
      );

      const formatoNuevo = respuesta?.incidencia != null;
      const estadoRespuesta = formatoNuevo
        ? respuesta.incidencia?.estado?.codigo
        : respuesta?.estado?.codigo;

      // Comprobar siempre el estado realmente almacenado (GET), no solo el HTTP 200.
      await this.cargarDetalle(String(numericId));
      const incidenciaActualizada = this.obtenerPropia(String(numericId));

      if (!incidenciaActualizada || incidenciaActualizada.estado !== 'Reabierta') {
        throw new Error('El backend no confirmó la reapertura persistida de la incidencia.');
      }

      if (estadoRespuesta !== 'REABIERTA') {
        throw new Error('La respuesta de reapertura no coincide con el estado persistido.');
      }

      // Solo el contrato nuevo permite verificar que el motivo fue devuelto.
      if (formatoNuevo && respuesta.motivoReapertura?.trim() !== motivo.trim()) {
        throw new Error('El servidor no devolvió correctamente el motivo de reapertura.');
      }

      return incidenciaActualizada;
    } finally {
      this.cargando.set(false);
    }
  }
}