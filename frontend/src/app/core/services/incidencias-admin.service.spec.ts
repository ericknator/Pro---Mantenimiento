import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IncidenciasAdminService } from './incidencias-admin.service';

describe('IncidenciasAdminService: clasificación confirmada por el servidor', () => {
  let service: IncidenciasAdminService;
  let http: HttpTestingController;
  const url = 'http://localhost:8085/promantenimiento/api/incidencia/1/clasificacion';
  const respuesta = {
    id: 1,
    codigo: 'INC-QA-1',
    categoria: { id: 2, nombre: 'Categoría del servidor' },
    prioridad: { id: 3, nombre: 'Prioridad del servidor' },
    estado: { codigo: 'REPORTADA', nombre: 'Reportada' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(IncidenciasAdminService);
    http = TestBed.inject(HttpTestingController);
    spyOn<any>(service, 'cabeceras').and.resolveTo(new HttpHeaders());
  });

  afterEach(() => http.verify());

  it('usa el endpoint de clasificación y los valores devueltos por el servidor', async () => {
    const promise = service.clasificar('1', 2, 3);
    await Promise.resolve();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ categoria: { id: 2 }, prioridad: { id: 3 } });
    req.flush(respuesta);
    const result = await promise;
    expect(result.categoria).toBe('Categoría del servidor');
    expect(result.prioridad).toBe('Prioridad del servidor');
  });

  for (const [nombre, body] of [
    ['vacía', null],
    ['con otra categoría', { ...respuesta, categoria: { id: 1, nombre: 'Anterior' } }],
    ['con otra prioridad', { ...respuesta, prioridad: { id: 1, nombre: 'Anterior' } }],
    ['de otra incidencia', { ...respuesta, id: 9 }],
  ] as const) {
    it(`rechaza una respuesta ${nombre} y conserva la lista anterior`, async () => {
      const carga = service.cargar();
      await Promise.resolve();
      http.expectOne('http://localhost:8085/promantenimiento/api/incidencia').flush([
        { ...respuesta, categoria: { id: 1, nombre: 'Electricidad' }, prioridad: { id: 1, nombre: 'Baja' } },
      ]);
      await carga;
      const anterior = service.incidencias();
      const promise = service.clasificar('1', 2, 3);
      const rechazo = expectAsync(promise).toBeRejected();
      await Promise.resolve();
      http.expectOne(url).flush(body);
      await rechazo;
      expect(service.incidencias()).toBe(anterior);
    });
  }

  it('propaga el rechazo HTTP sin alterar la lista', async () => {
    const anterior = service.incidencias();
    const promise = service.clasificar('1', 2, 3);
    const rechazo = expectAsync(promise).toBeRejected();
    await Promise.resolve();
    http.expectOne(url).flush({}, { status: 400, statusText: 'Bad Request' });
    await rechazo;
    expect(service.incidencias()).toBe(anterior);
  });
});
