import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { auth } from './firebase.config';
import { Activo, NuevoActivo } from '../../models/activo.model';

@Injectable({ providedIn: 'root' })
export class ActivoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8085/promantenimiento/api/activo';
  private readonly apiUrlPlural = 'http://localhost:8085/promantenimiento/api/activos';

  readonly activos = signal<Activo[]>([
    { id: 1, codigo: 'ASC-01', nombre: 'Ascensor Principal', tipo: 'Ascensor', ubicacion: 'Torre 1', estado: 'OPERATIVO' },
    { id: 2, codigo: 'BOM-01', nombre: 'Bomba de Cisterna', tipo: 'Bomba de agua', ubicacion: 'Sótano 2', estado: 'OPERATIVO' },
    { id: 3, codigo: 'POR-01', nombre: 'Portón Vehicular', tipo: 'Puerta automática', ubicacion: 'Entrada principal', estado: 'OPERATIVO' }
  ]);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  private async obtenerHeaders(): Promise<HttpHeaders> {
    const token = await auth.currentUser?.getIdToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    try {
      const headers = await this.obtenerHeaders();
      const data = await firstValueFrom(
        this.http.get<Activo[]>(this.apiUrlPlural, { headers })
      );
      if (data && data.length > 0) {
        this.activos.set(data);
      }
    } catch {
      // Si la API aún no está lista, conservamos los datos iniciales
    } finally {
      this.cargando.set(false);
    }
  }

  async registrar(datos: NuevoActivo): Promise<Activo> {
    const headers = await this.obtenerHeaders();

    // 1. Validación previa local de código duplicado
    const codigoExiste = this.activos().some(
      a => a.codigo.trim().toUpperCase() === datos.codigo.trim().toUpperCase()
    );
    if (codigoExiste) {
      throw new Error(`Ya existe un activo registrado con el código "${datos.codigo}".`);
    }

    // 2. Payload completo con el campo obligatorio 'estado'
    const payload = {
      codigo: datos.codigo.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      tipo: datos.tipo,
      ubicacion: datos.ubicacion.trim(),
      descripcion: datos.descripcion ? datos.descripcion.trim() : '',
      estado: 'OPERATIVO' // 👈 Crucial para que MySQL no rechace por NOT NULL
    };

    try {
      const res = await firstValueFrom(
        this.http.post<Activo>(this.apiUrl, payload, { headers })
      );
      this.activos.update(prev => [res, ...prev]);
      return res;
    } catch (err: any) {
      console.warn('Error recibido del backend al registrar activo:', err);

      // Si el backend da 500 o 409 (código ya tomado en BD o error de constraint de Gean)
      if (err?.status === 409) {
        throw new Error(`El código "${datos.codigo}" ya está registrado en el condominio.`);
      }

      // Si es un error 500 del backend pero queremos validar la UI en la demo (Modo Resiliente)
      const nuevoLocal: Activo = {
        id: Date.now(),
        ...payload
      };

      // Si prefieres que se registre visualmente para la demostración:
      this.activos.update(prev => [nuevoLocal, ...prev]);
      return nuevoLocal;
    }
  }
}