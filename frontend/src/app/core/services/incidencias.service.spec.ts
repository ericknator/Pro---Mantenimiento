import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IncidenciasService } from './incidencias.service';
import type { IncidenciaApi } from '../../models/incidencia.model';

describe('IncidenciasService PMS-157', () => {
  let service: IncidenciasService;
  let http: HttpTestingController;

  const usuarioSimulado = {
    getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('firebase-token'),
  };

  const incidenciaSolucionada: IncidenciaApi = {
    id: 17,
    codigo: 'INC-2026-00017',
    solicitante: {
      id: 1,
      nombres: 'Residente',
      apellidos: 'Prueba',
      correo: 'residente@example.com',
    },
    categoria: { nombre: 'Plomería' },
    estado: { nombre: 'Solucionada - pendiente de confirmación', codigo: 'SOLUCIONADA' },
    ubicacion: 'Torre A',
    descripcion: 'Fuga en baño',
    fechaReporte: '2026-10-24T10:00:00',
    fechaSolucion: '2026-10-24T11:00:00',
    fechaCierre: null,
    creadoEn: '2026-10-24T10:00:00',
    actualizadoEn: '2026-10-24T11:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IncidenciasService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(IncidenciasService);
    http = TestBed.inject(HttpTestingController);
    spyOn<any>(service, 'esperarUsuario').and.resolveTo(usuarioSimulado);
  });

  afterEach(() => {
    http.verify();
  });

  it('normaliza SOLUCIONADA por código aunque el nombre sea descriptivo', async () => {
    const promise = service.cargarAsignadas();
    await Promise.resolve();
    await Promise.resolve();

    const request = http.expectOne(
      'http://localhost:8085/promantenimiento/api/incidencia/asignadas'
    );
    request.flush([incidenciaSolucionada]);

    await expectAsync(promise).toBeResolved();
    const incidencia = service.obtenerPropia('17');
    expect(incidencia?.estado).toBe('Solucionada');
    expect(incidencia?.historial[0].estado).toBe('Solucionada');
  });

  it('conserva ASIGNADA como estado válido para iniciar la atención', async () => {
    const promise = service.cargarAsignadas();
    await Promise.resolve();
    await Promise.resolve();

    const request = http.expectOne(
      'http://localhost:8085/promantenimiento/api/incidencia/asignadas'
    );
    request.flush([
      {
        ...incidenciaSolucionada,
        estado: { nombre: 'Asignada', codigo: 'ASIGNADA' },
        fechaSolucion: null,
      },
    ]);

    await expectAsync(promise).toBeResolved();
    expect(service.obtenerPropia('17')?.estado).toBe('Asignada');
  });

  it('envía el body exacto a finalizar-atencion y confirma el estado con una consulta posterior', async () => {
    const promise = service.solucionarIncidencia('17', '  Diagnóstico  ', '  Acciones realizadas  ');
    await Promise.resolve();
    await Promise.resolve();

    const patch = http.expectOne(
      'http://localhost:8085/promantenimiento/api/incidencia/17/finalizar-atencion'
    );
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body instanceof FormData).toBeTrue();
    expect((patch.request.body as FormData).get('diagnosticoTecnico')).toBe('Diagnóstico');
    expect((patch.request.body as FormData).get('accionesRealizadas')).toBe('Acciones realizadas');
    expect(patch.request.headers.get('Authorization')).toBe('Bearer firebase-token');
    patch.flush({});
    await Promise.resolve();
    await Promise.resolve();

    const refresh = http.expectOne(
      'http://localhost:8085/promantenimiento/api/incidencia/asignadas'
    );
    expect(refresh.request.method).toBe('GET');
    refresh.flush([incidenciaSolucionada]);

    await expectAsync(promise).toBeResolvedTo(jasmine.objectContaining({
      id: '17',
      estado: 'Solucionada',
    }));
  });

  it('no ejecuta la confirmación ni resuelve cuando el PATCH responde con error', async () => {
    const promise = service.solucionarIncidencia('17', '', 'Acciones');
    await Promise.resolve();
    await Promise.resolve();
    const patch = http.expectOne(
      'http://localhost:8085/promantenimiento/api/incidencia/17/finalizar-atencion'
    );
    patch.flush({ message: 'No autorizado' }, { status: 403, statusText: 'Forbidden' });

    await expectAsync(promise).toBeRejected();
    http.expectNone('http://localhost:8085/promantenimiento/api/incidencia/asignadas');
  });

  it('carga el detalle autorizado y conserva las evidencias que el contrato devuelva', async () => {
    const promise = service.cargarDetalle('17');
    await Promise.resolve();
    await Promise.resolve();

    const request = http.expectOne(
      'http://localhost:8085/promantenimiento/api/incidencia/17'
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer firebase-token');
    request.flush({
      ...incidenciaSolucionada,
      evidencias: [
        {
          id: 41,
          incidencia: { id: 17 },
          nombreArchivo: 'solucion.jpg',
          urlRecurso: 'https://cdn.example.test/solucion.jpg',
          descripcion: 'Evidencia de solución',
          tipoEvidencia: { codigo: 'FOTO', nombre: 'Fotografía' },
          creadoEn: '2026-10-24T11:01:00',
        },
      ],
    });

    await expectAsync(promise).toBeResolved();
    const incidencia = service.obtenerPropia('17');
    expect(incidencia?.evidenciasConsultaDisponible).toBeTrue();
    expect(incidencia?.evidenciasSolucion).toEqual([
      jasmine.objectContaining({
        id: '41',
        nombreArchivo: 'solucion.jpg',
        urlRecurso: 'https://cdn.example.test/solucion.jpg',
      }),
    ]);
  });

  it('expone el estado de permiso cuando el detalle responde 403', async () => {
    const promise = service.cargarDetalle('17');
    await Promise.resolve();
    await Promise.resolve();

    const request = http.expectOne(
      'http://localhost:8085/promantenimiento/api/incidencia/17'
    );
    request.flush({}, { status: 403, statusText: 'Forbidden' });

    await expectAsync(promise).toBeResolved();
    expect(service.error()).toBe('No tienes permiso para consultar esta incidencia.');
    expect(service.obtenerPropia('17')).toBeUndefined();
  });
});
