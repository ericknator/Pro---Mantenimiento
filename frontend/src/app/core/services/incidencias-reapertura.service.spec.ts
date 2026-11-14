import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IncidenciasService } from './incidencias.service';
import type { IncidenciaApi } from '../../models/incidencia.model';

describe('IncidenciasService - PMS-202 reapertura', () => {
  let service: IncidenciasService;
  let http: HttpTestingController;

  const base = 'http://localhost:8085/promantenimiento/api';
  const motivo = 'QA-PMS-202: la falla ficticia continúa.';
  const usuario = { getIdToken: jasmine.createSpy('getIdToken') };

  function incidencia(estadoCodigo: string): IncidenciaApi {
    return {
      id: 3,
      codigo: 'INC-2026-0003',
      solicitante: { id: 2, nombres: 'Residente', apellidos: 'Prueba', correo: 'qa@example.test' },
      categoria: { nombre: 'Electricidad' },
      estado: { codigo: estadoCodigo, nombre: estadoCodigo === 'REABIERTA' ? 'Reabierta' : 'Solucionada' },
      ubicacion: 'Zona de pruebas QA',
      descripcion: 'Incidencia ficticia',
      fechaReporte: '2026-11-13T19:42:24',
      fechaSolucion: '2026-11-13T19:56:12',
      fechaCierre: null,
      creadoEn: '2026-11-13T19:42:24',
      actualizadoEn: '2026-11-13T20:00:33',
    };
  }

  beforeEach(() => {
    usuario.getIdToken.and.resolveTo('token-simulado');
    TestBed.configureTestingModule({
      providers: [IncidenciasService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IncidenciasService);
    http = TestBed.inject(HttpTestingController);
    // Ni Firebase ni servidor real: todas las solicitudes HTTP están simuladas.
    spyOn<any>(service, 'esperarUsuario').and.resolveTo(usuario);
  });

  afterEach(() => http.verify());

  async function avanzarPromesas(): Promise<void> {
    for (let i = 0; i < 6; i++) await Promise.resolve();
  }

  async function responderPatch(respuesta: object): Promise<void> {
    await avanzarPromesas();
    const patch = http.expectOne(`${base}/incidencia/3/reabrir`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ motivo });
    expect(patch.request.headers.get('Authorization')).toBe('Bearer token-simulado');
    patch.flush(respuesta);
  }

  async function responderGet(estado: string): Promise<void> {
    await avanzarPromesas();
    const detalle = http.expectOne(`${base}/incidencia/3`);
    const evidencias = http.expectOne(`${base}/evidencia-incidencia`);
    expect(detalle.request.method).toBe('GET');
    expect(evidencias.request.method).toBe('GET');
    detalle.flush(incidencia(estado));
    evidencias.flush([]);
  }

  it('acepta el contrato anterior y confirma REABIERTA mediante GET', async () => {
    const operacion = service.reabrirIncidencia(3, motivo);
    await responderPatch(incidencia('REABIERTA'));
    await responderGet('REABIERTA');
    expect((await operacion).estado).toBe('Reabierta');
  });

  it('acepta el contrato nuevo y valida el motivo devuelto', async () => {
    const operacion = service.reabrirIncidencia(3, motivo);
    await responderPatch({ incidencia: incidencia('REABIERTA'), motivoReapertura: motivo });
    await responderGet('REABIERTA');
    expect((await operacion).estado).toBe('Reabierta');
  });

  it('no declara éxito si GET conserva SOLUCIONADA', async () => {
    const operacion = service.reabrirIncidencia(3, motivo);
    await responderPatch(incidencia('REABIERTA'));
    await responderGet('SOLUCIONADA');
    await expectAsync(operacion).toBeRejectedWithError(
      'El backend no confirmó la reapertura persistida de la incidencia.'
    );
  });

  it('detecta un motivo discrepante en la respuesta nueva', async () => {
    const operacion = service.reabrirIncidencia(3, motivo);
    await responderPatch({ incidencia: incidencia('REABIERTA'), motivoReapertura: 'distinto' });
    await responderGet('REABIERTA');
    await expectAsync(operacion).toBeRejectedWithError(
      'El servidor no devolvió correctamente el motivo de reapertura.'
    );
  });
});
