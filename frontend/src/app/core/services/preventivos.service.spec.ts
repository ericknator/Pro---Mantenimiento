import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { PreventivosService } from './preventivos.service';

describe('PreventivosService PMS-178', () => {
  let service: PreventivosService;
  let http: HttpTestingController;

  const usuarioSimulado = {
    getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('firebase-token'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PreventivosService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            usuario: () => ({
              id: '21',
              nombre: 'Mantenimiento Prueba',
              rol: 'mantenimiento',
            }),
          },
        },
      ],
    });

    service = TestBed.inject(PreventivosService);
    http = TestBed.inject(HttpTestingController);
    spyOn<any>(service, 'esperarUsuario').and.resolveTo(usuarioSimulado);
  });

  afterEach(() => {
    http.verify();
  });

  it('mapea la frecuencia y el estado que devuelve la tarea', async () => {
    const promise = service.cargarTareas();
    await Promise.resolve();
    await Promise.resolve();

    const request = http.expectOne(
      'http://localhost:8085/promantenimiento/api/tarea-preventiva'
    );
    request.flush([
      {
        id: 44,
        titulo: 'Revisión del ascensor',
        descripcion: 'Revisión preventiva',
        programadaPara: '2026-11-20T09:30:00',
        activo: {
          id: 10,
          codigo: 'ACT-ASC-001',
          nombre: 'Ascensor principal',
          ubicacion: 'Torre A',
        },
        responsable: {
          id: 21,
          nombres: 'Mantenimiento',
          apellidos: 'Prueba',
        },
        planMantenimiento: {
          frecuencia: {
            id: 1,
            codigo: 'MENSUAL',
            nombre: 'Mensual',
          },
        },
        estado: {
          id: 1,
          codigo: 'PROGRAMADA',
          nombre: 'Programada',
          esEstadoFinal: false,
          activo: true,
        },
      },
    ]);

    await expectAsync(promise).toBeResolved();
    expect(service.tareas()[0]).toEqual(
      jasmine.objectContaining({
        frecuenciaCodigo: 'MENSUAL',
        frecuenciaNombre: 'Mensual',
        estadoCodigo: 'PROGRAMADA',
        estado: 'Programada',
      })
    );
  });

  it('envía la fecha elegida y no incluye archivos en el POST JSON', async () => {
    const promise = service.registrarIntervencion({
      tareaPreventivaId: 44,
      ejecutorUsuarioId: 999,
      accionesRealizadas: '  Se lubricaron guías y poleas.  ',
      observaciones: '  Sin desgaste crítico.  ',
      ejecutadoEn: '2026-11-20T10:30:00',
    });
    await Promise.resolve();
    await Promise.resolve();

    const request = http.expectOne(
      'http://localhost:8085/promantenimiento/api/intervencion-preventiva'
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer firebase-token');
    expect(request.request.body).toEqual(
      jasmine.objectContaining({
        tareaPreventiva: { id: 44 },
        ejecutorUsuario: { id: 21 },
        accionesRealizadas: 'Se lubricaron guías y poleas.',
        observaciones: 'Sin desgaste crítico.',
        ejecutadoEn: '2026-11-20T10:30:00',
      })
    );
    expect(request.request.body.archivos).toBeUndefined();
    expect(request.request.body.ejecutadoEn).not.toContain('Z');

    request.flush({
      id: 8,
      tareaPreventiva: { id: 44 },
      accionesRealizadas: 'Se lubricaron guías y poleas.',
      ejecutadoEn: '2026-11-20T10:30:00',
      creadoEn: '2026-11-20T10:31:00',
    });

    await expectAsync(promise).toBeResolvedTo(
      jasmine.objectContaining({ id: 8 })
    );
  });

  it('no cambia localmente PROGRAMADA a EJECUTADA después de crear la intervención', async () => {
    const carga = service.cargarTareas();
    await Promise.resolve();
    await Promise.resolve();
    http
      .expectOne('http://localhost:8085/promantenimiento/api/tarea-preventiva')
      .flush([
        {
          id: 44,
          titulo: 'Revisión del ascensor',
          descripcion: '',
          programadaPara: '2026-11-20T09:30:00',
          activo: { id: 10, codigo: 'ACT-ASC-001', nombre: 'Ascensor principal' },
          responsable: { id: 21, nombres: 'Mantenimiento', apellidos: 'Prueba' },
          estado: {
            id: 1,
            codigo: 'PROGRAMADA',
            nombre: 'Programada',
            esEstadoFinal: false,
            activo: true,
          },
        },
      ]);
    await expectAsync(carga).toBeResolved();

    const registro = service.registrarIntervencion({
      tareaPreventivaId: 44,
      ejecutorUsuarioId: 21,
      accionesRealizadas: 'Trabajo realizado',
      ejecutadoEn: '2026-11-20T10:30:00',
    });
    await Promise.resolve();
    await Promise.resolve();
    http
      .expectOne('http://localhost:8085/promantenimiento/api/intervencion-preventiva')
      .flush({
        id: 9,
        tareaPreventiva: { id: 44 },
        accionesRealizadas: 'Trabajo realizado',
        ejecutadoEn: '2026-11-20T10:30:00',
        creadoEn: '2026-11-20T10:31:00',
      });
    await expectAsync(registro).toBeResolved();

    expect(service.tareas()[0].estadoCodigo).toBe('PROGRAMADA');
    expect(service.tareas()[0].estado).toBe('Programada');
  });
});
