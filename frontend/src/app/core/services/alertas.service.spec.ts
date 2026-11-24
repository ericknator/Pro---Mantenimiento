
import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AlertasService } from './alertas.service';

describe('AlertasService - PMS-188', () => {
    let service: AlertasService;
    let http: HttpTestingController;

    const apiUrl =
        'http://localhost:8086/promantenimiento/api/tarea-preventiva';

    const usuarioSimulado = {
        getIdToken: jasmine.createSpy('getIdToken'),
    };

    const fechaActual = new Date(2026, 10, 4, 15, 0, 0);

    beforeEach(() => {
        jasmine.clock().install();
        jasmine.clock().mockDate(fechaActual);

        usuarioSimulado.getIdToken.and.resolveTo('token-qa');

        TestBed.configureTestingModule({
            providers: [
                AlertasService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        service = TestBed.inject(AlertasService);
        http = TestBed.inject(HttpTestingController);

        spyOn<any>(service, 'esperarUsuario')
            .and.resolveTo(usuarioSimulado);
    });

    afterEach(() => {
        http.verify();
        jasmine.clock().uninstall();
    });

    function tarea(
        id: number,
        estado: string,
        fecha: string
    ) {
        return {
            id,
            titulo: `QA PMS-188 - Tarea ${id}`,
            programadaPara: fecha,
            estado: {
                codigo: estado,
                esEstadoFinal:
                    estado === 'EJECUTADA' ||
                    estado === 'CANCELADA',
            },
            activo: {
                codigo: 'ACT-QA-188',
                nombre: 'Activo de pruebas',
                ubicacion: 'Zona QA',
            },
        };
    }

    async function consultarAlertas(
        tareas: ReturnType<typeof tarea>[]
    ): Promise<void> {
        const carga = service.cargarAlertas();

        await Promise.resolve();
        await Promise.resolve();

        const peticion = http.expectOne(apiUrl);

        expect(peticion.request.method).toBe('GET');
        expect(
            peticion.request.headers.get('Authorization')
        ).toBe('Bearer token-qa');

        peticion.flush(tareas);

        await expectAsync(carga).toBeResolved();
    }

    it('mantiene visible EN_EJECUCION como PRÓXIMA', async () => {
        await consultarAlertas([
            tarea(
                188,
                'EN_EJECUCION',
                '2026-11-10T17:00:00'
            ),
        ]);

        expect(service.totalAlertas()).toBe(1);
        expect(service.totalProximas()).toBe(1);
        expect(service.alertas()[0].tipo).toBe('proxima');
        expect(service.alertas()[0].tareaId).toBe('188');
    });

    it('mantiene visible EN_EJECUCION como CRÍTICA', async () => {
        await consultarAlertas([
            tarea(
                189,
                'EN_EJECUCION',
                '2026-11-03T17:00:00'
            ),
        ]);

        expect(service.totalAlertas()).toBe(1);
        expect(service.totalVencidas()).toBe(1);
        expect(service.alertas()[0].tipo).toBe('vencida');
        expect(service.alertas()[0].tareaId).toBe('189');
    });

    it('excluye una tarea EJECUTADA', async () => {
        await consultarAlertas([
            tarea(
                190,
                'EJECUTADA',
                '2026-11-03T17:00:00'
            ),
        ]);

        expect(service.totalAlertas()).toBe(0);
        expect(service.totalProximas()).toBe(0);
        expect(service.totalVencidas()).toBe(0);
    });
});
