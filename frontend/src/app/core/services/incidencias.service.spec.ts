import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { User } from 'firebase/auth';
import { auth } from './firebase.config';
import { IncidenciasService } from './incidencias.service';
import type { IncidenciaApi } from '../../models/incidencia.model';

describe('IncidenciasService PMS-157', () => {
  let service: IncidenciasService;
  let http: HttpTestingController;
  let currentUserSpy: jasmine.Spy;

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
    estado: { nombre: 'Solucionada', codigo: 'SOLUCIONADA' },
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
  });

  beforeAll(() => {
    currentUserSpy = spyOnProperty(auth, 'currentUser', 'get').and.returnValue({
      getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('firebase-token'),
    } as unknown as User);
  });

  afterEach(() => {
    http.verify();
  });

  afterAll(() => {
    currentUserSpy.and.callThrough();
  });

  it('envía el body exacto a finalizar-atencion y confirma el estado con una consulta posterior', async () => {
    const promise = service.solucionarIncidencia('17', '  Diagnóstico  ', '  Acciones realizadas  ');
    await Promise.resolve();

    const patch = http.expectOne(
      'http://localhost:8085/promantenimiento/api/incidencia/17/finalizar-atencion'
    );
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({
      diagnosticoTecnico: 'Diagnóstico',
      accionesRealizadas: 'Acciones realizadas',
    });
    expect(patch.request.headers.get('Authorization')).toBe('Bearer firebase-token');
    patch.flush({});

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
    const patch = http.expectOne(
      'http://localhost:8085/promantenimiento/api/incidencia/17/finalizar-atencion'
    );
    patch.flush({ message: 'No autorizado' }, { status: 403, statusText: 'Forbidden' });

    await expectAsync(promise).toBeRejected();
    http.expectNone('http://localhost:8085/promantenimiento/api/incidencia/asignadas');
  });
});
