
import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MantenimientoService } from './mantenimiento.service';

describe('MantenimientoService', () => {
  let service: MantenimientoService;
  let http: HttpTestingController;

  const apiBaseUrl = 'http://localhost:8085/promantenimiento/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(MantenimientoService);
    http = TestBed.inject(HttpTestingController);

    spyOn<any>(service, 'obtenerHeaders').and.resolveTo(
      new HttpHeaders({
        Authorization: 'Bearer test-token',
      })
    );
  });

  afterEach(() => {
    http.verify();
  });

  /**
   * Procesa las continuaciones asíncronas de las promesas
   * utilizadas por obtenerHeaders() y firstValueFrom().
   *
   * No utiliza temporizadores ni realiza peticiones reales.
   */
  async function procesarMicrotareas(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  }

  it('carga activos, frecuencias y responsables desde los catálogos reales', async () => {
    const promise = service.cargarCatalogos();

    await procesarMicrotareas();

    const activosRequest = http.expectOne(
      `${apiBaseUrl}/activo`
    );

    expect(activosRequest.request.method).toBe('GET');

    activosRequest.flush([
      {
        id: 10,
        codigo: 'ACT-ASC-001',
        nombre: 'Ascensor principal',
        ubicacion: 'Torre A',
        tipoActivo: {
          id: 1,
          codigo: 'ASCENSOR',
          nombre: 'Ascensor',
          activo: true,
        },
        estadoActivo: {
          id: 1,
          codigo: 'OPERATIVO',
          nombre: 'Operativo',
          activo: true,
        },
        activo: true,
      },
    ]);

    const frecuenciasRequest = http.expectOne(
      `${apiBaseUrl}/frecuencia-mantenimiento`
    );

    expect(frecuenciasRequest.request.method).toBe('GET');

    frecuenciasRequest.flush([
      {
        id: 2,
        codigo: 'TRIMESTRAL',
        nombre: 'Trimestral',
        cantidad: 3,
        unidad: 'MES',
        activo: true,
      },
      {
        id: 3,
        codigo: 'ANUAL',
        nombre: 'Anual',
        cantidad: 12,
        unidad: 'MES',
        activo: false,
      },
    ]);

    const rolesRequest = http.expectOne(
      `${apiBaseUrl}/rol`
    );

    expect(rolesRequest.request.method).toBe('GET');

    rolesRequest.flush([
      {
        id: 1,
        codigo: 'ADMINISTRADOR',
        nombre: 'Administrador',
        activo: true,
      },
      {
        id: 3,
        codigo: 'MANTENIMIENTO',
        nombre: 'Mantenimiento',
        activo: true,
      },
    ]);

    // La consulta de responsables ocurre después de que
    // Promise.all() resuelve las tres consultas anteriores.
    await procesarMicrotareas();

    const responsablesRequest = http.expectOne(
      `${apiBaseUrl}/usuario-perfil/responsables/rol/3`
    );

    expect(responsablesRequest.request.method).toBe('GET');

    responsablesRequest.flush([
      {
        id: 21,
        nombres: 'Mantenimiento',
        apellidos: 'Prueba',
        correo: 'mantenimiento@example.test',
        activo: true,
      },
    ]);

    await expectAsync(promise).toBeResolved();

    expect(
      service.activos().map((activo) => activo.codigo)
    ).toEqual(['ACT-ASC-001']);

    expect(
      service.frecuencias().map((frecuencia) => frecuencia.codigo)
    ).toEqual(['TRIMESTRAL']);

    expect(service.responsables().length).toBe(1);

    expect(service.responsables()[0].id).toBe(21);

    expect(service.catalogosError()).toBeNull();

    expect(service.cargandoCatalogos()).toBeFalse();
  });

  it('envía el payload del plan y no crea una tarea por un endpoint distinto', async () => {
    spyOn(service, 'cargarMantenimientos').and.resolveTo();

    const promise = service.programarMantenimiento({
      activoId: 10,
      frecuenciaId: 2,
      responsableId: 21,
      titulo: 'Revisión preventiva del ascensor',
      descripcion: 'Revisión de frenos y sensores',
      primeraTareaProgramadaPara: '2026-11-15T09:30:00',
    });

    await procesarMicrotareas();

    const request = http.expectOne(
      `${apiBaseUrl}/plan-mantenimiento`
    );

    expect(request.request.method).toBe('POST');

    expect(
      request.request.headers.get('Authorization')
    ).toBe('Bearer test-token');

    expect(request.request.body).toEqual({
      activo: {
        id: 10,
      },
      frecuencia: {
        id: 2,
      },
      responsable: {
        id: 21,
      },
      titulo: 'Revisión preventiva del ascensor',
      descripcion: 'Revisión de frenos y sensores',
      primeraTareaProgramadaPara: '2026-11-15T09:30:00',
    });

    request.flush({
      id: 55,
    });

    await expectAsync(promise).toBeResolvedTo({
      id: 55,
    });

    expect(service.cargarMantenimientos).toHaveBeenCalled();

    expect(
      http.match(`${apiBaseUrl}/tarea-preventiva`)
    ).toEqual([]);
  });

  it('conserva el permiso denegado como error de programación', async () => {
    spyOn(service, 'cargarMantenimientos').and.resolveTo();

    const promise = service.programarMantenimiento({
      activoId: 10,
      frecuenciaId: 2,
      responsableId: 21,
      titulo: 'Revisión preventiva',
      primeraTareaProgramadaPara: '2026-11-15T09:30:00',
    });

    await procesarMicrotareas();

    const request = http.expectOne(
      `${apiBaseUrl}/plan-mantenimiento`
    );

    expect(request.request.method).toBe('POST');

    request.flush(
      {
        message:
          'Solo un administrador puede programar mantenimientos.',
      },
      {
        status: 403,
        statusText: 'Forbidden',
      }
    );

    await expectAsync(promise).toBeRejected();

    expect(service.error()).toBe(
      'No tienes permiso para gestionar mantenimientos preventivos.'
    );

    expect(service.cargarMantenimientos).not.toHaveBeenCalled();
  });
});
