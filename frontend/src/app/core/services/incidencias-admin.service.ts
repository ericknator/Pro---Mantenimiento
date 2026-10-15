import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { IncidenciaAdmin } from '../../models/incidencia-admin.model';

// ⚠️ Usar la misma URL base que el resto de servicios (p. ej. activo.service.ts).
// Con proxy de Angular sería '/promantenimiento/api'.
const API_BASE = 'http://localhost:8085/promantenimiento/api';

/** Forma esperada de IncidenciaEntity en las respuestas del backend. */
interface IncidenciaApi {
  id: number;
  codigo?: string;
  ubicacion?: string;
  descripcion?: string;
  categoria?: { id?: number; nombre?: string } | null;
  prioridad?: { id?: number; nombre?: string } | null;
  estado?: { codigo?: string; nombre?: string } | null;
  solicitante?: { nombres?: string; apellidos?: string; correo?: string } | null;
  fechaReporte?: string | number[] | null;
  responsableActual?: { id?: number; nombres?: string; apellidos?: string; correo?: string; } | null;
}

function aFecha(v: string | number[] | null | undefined): Date {
  if (Array.isArray(v)) {
    const [a, m, d, h = 0, mi = 0, s = 0] = v;
    return new Date(a, m - 1, d, h, mi, s);
  }
  return v ? new Date(v) : new Date();
}


function aModelo(r: IncidenciaApi): IncidenciaAdmin {
  const s = r.solicitante;
  const nombre =
    [s?.nombres, s?.apellidos].filter(Boolean).join(' ') ||
    s?.correo ||
    '—';

  const responsable = r.responsableActual
    ? [
        r.responsableActual.nombres,
        r.responsableActual.apellidos,
      ].filter(Boolean).join(' ') ||
      r.responsableActual.correo ||
      'No asignado'
    : 'No asignado';

  return {
    id: String(r.id),
    codigo: r.codigo ?? `#${r.id}`,
    categoriaId: r.categoria?.id ?? null,
    categoria: r.categoria?.nombre ?? '—',
    prioridadId: r.prioridad?.id ?? null,
    prioridad: r.prioridad?.nombre ?? 'Sin prioridad',
    estadoCodigo: r.estado?.codigo ?? '',
    estado: r.estado?.nombre ?? r.estado?.codigo ?? '—',
    ubicacion: r.ubicacion ?? '',
    descripcion: r.descripcion ?? '',
    solicitante: nombre,
    fecha: aFecha(r.fechaReporte),
    responsable,
  };
}

@Injectable({ providedIn: 'root' })
export class IncidenciasAdminService {
  private readonly http = inject(HttpClient);

  readonly incidencias = signal<IncidenciaAdmin[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');

  /** Lista las incidencias desde el servidor (GET /incidencia). */
  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    try {
      const datos = await firstValueFrom(
        this.http.get<IncidenciaApi[]>(`${API_BASE}/incidencia`, { headers: await this.cabeceras() }),
      );
      if (!Array.isArray(datos)) throw new Error('Formato de respuesta inesperado');
      this.incidencias.set(datos.map(aModelo).sort((a, b) => b.fecha.getTime() - a.fecha.getTime()));
    } catch (e) {
      this.error.set(this.mensaje(e, 'No se pudo cargar la lista de incidencias.'));
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * HU-INC-03: guarda categoría y prioridad.
   * La interfaz solo cambia si el servidor responde con éxito; si falla se lanza el error
   * y los valores anteriores se conservan.
   * ⚠️ Confirmar con Gean (PMS-109) el endpoint y el cuerpo definitivos.
   */
  async clasificar(
    id: string,
    categoriaId: number,
    prioridadId: number,
    responsableId: number
  ): Promise<IncidenciaAdmin> {

    const cuerpo = {
      categoria: { id: categoriaId },
      prioridad: { id: prioridadId },
      responsableActual: { id: responsableId }
    };

    const respuesta = await firstValueFrom(
      this.http.put<IncidenciaApi>(
        `${API_BASE}/incidencia/${id}/clasificacion`,
        cuerpo,
        { headers: await this.cabeceras() }
      )
    );

    const desdeServidor = aModelo(respuesta);

    this.incidencias.update((lista) =>
      lista.map((i) => (i.id === id ? desdeServidor : i))
    );

    return desdeServidor;
  }

  mensaje(error: unknown, porDefecto: string): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0: return 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
        case 400:
        case 422: return 'El servidor rechazó la categoría o la prioridad enviada. No se guardaron cambios.';
        case 401: return 'Tu sesión no es válida. Vuelve a iniciar sesión.';
        case 403: return 'Solo administración puede clasificar incidencias.';
        case 404: return 'La incidencia ya no existe en el servidor.';
        case 409: return 'La incidencia cambió mientras la editabas. Actualiza la lista e inténtalo de nuevo.';
        case 500: return 'El servidor no pudo procesar la clasificación (error 500). No se guardaron cambios y se mantiene el valor anterior.';
        default: return `${porDefecto} (error ${error.status}).`;
      }
    }
    return porDefecto;
  }

  private async cabeceras(): Promise<HttpHeaders> {
    const token = await getAuth().currentUser?.getIdToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
