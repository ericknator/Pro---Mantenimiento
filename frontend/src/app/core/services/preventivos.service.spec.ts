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
      'http://localhost:8086/promantenimiento/api/tarea-preventiva'
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

  it('inicia la atención con PATCH y conserva el estado persistido', async () => {
    const promise = service.iniciarAtencion('44');
    await Promise.resolve();
    await Promise.resolve();

    const request = http.expectOne(
      'http://localhost:8086/promantenimiento/api/tarea-preventiva/44/iniciar-atencion'
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toBeNull();
    expect(request.request.headers.get('Authorization')).toBe('Bearer firebase-token');

    request.flush({
      id: 44,
      titulo: 'Revisión del ascensor',
      descripcion: 'Revisión preventiva',
      programadaPara: '2026-11-20T09:30:00',
      activo: { id: 10, codigo: 'ACT-ASC-001', nombre: 'Ascensor principal' },
      responsable: { id: 21, nombres: 'Mantenimiento', apellidos: 'Prueba' },
      estado: {
        id: 2,
        codigo: 'EN_EJECUCION',
        nombre: 'En ejecución',
        esEstadoFinal: false,
        activo: true,
      },
    });

    await expectAsync(promise).toBeResolvedTo(
      jasmine.objectContaining({ estadoCodigo: 'EN_EJECUCION' })
    );
    expect(service.tareas()[0].estado).toBe('En ejecución');
  });

  it('envía fecha, campos y archivos mediante multipart sin convertir la hora local', async () => {
    const archivo = new File(['imagen'], 'mantenimiento.jpg', { type: 'image/jpeg' });
    const promise = service.registrarIntervencion({
      tareaPreventivaId: 44,
      accionesRealizadas: '  Se lubricaron guías y poleas.  ',
      observaciones: '  Sin desgaste crítico.  ',
      fechaEjecucion: '2026-11-20T10:30:00',
    }, [archivo]);
    await Promise.resolve();
    await Promise.resolve();

    const request = http.expectOne(
      'http://localhost:8086/promantenimiento/api/tarea-preventiva/44/registrar-intervencion'
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer firebase-token');
    expect(request.request.headers.get('Content-Type')).toBeNull();
    expect(request.request.body).toEqual(jasmine.any(FormData));

    const formulario = request.request.body as FormData;
    expect(formulario.get('fechaEjecucion')).toBe('2026-11-20T10:30:00');
    expect(formulario.get('fechaEjecucion')).not.toContain('Z');
    expect(formulario.get('accionesRealizadas')).toBe('Se lubricaron guías y poleas.');
    expect(formulario.get('observaciones')).toBe('Sin desgaste crítico.');
    expect(formulario.getAll('archivos')).toEqual([archivo]);

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

  it('rechaza PDF antes de crear una petición multipart', async () => {
    const archivo = new File(['documento'], 'manual.pdf', { type: 'application/pdf' });

    await expectAsync(
      service.registrarIntervencion(
        {
          tareaPreventivaId: 44,
          accionesRealizadas: 'Trabajo realizado',
          fechaEjecucion: '2026-11-20T10:30:00',
        },
        [archivo]
      )
    ).toBeRejectedWithError(/se permiten archivos/i);
  });
});
