import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TodasComponent } from './todas.component';
import { IncidenciasAdminService } from '../../../../core/services/incidencias-admin.service';
import { IncidenciaAdmin } from '../../../../models/incidencia-admin.model';

describe('PMS-214: filtros por código del catálogo', () => {
  let component: TodasComponent;
  const registro = (id: string, codigo: string, estado: string, prioridad: string): IncidenciaAdmin => ({
    id, codigo: `QA-${id}`, categoriaId: 1, categoria: 'Prueba', prioridadId: 1,
    prioridad, estadoCodigo: codigo, estado, ubicacion: 'Torre 1', descripcion: 'Dato sintético de prueba',
    solicitante: 'Residente QA', fecha: new Date('2026-11-24T09:00:00'), responsable: 'Técnico QA',
  });

  beforeEach(() => {
    const incidencias = signal([
      registro('1', 'SOLUCIONADA', 'Solucionada - pendiente de confirmación', 'Alta'),
      registro('2', 'SOLUCIONADA', 'Solucionada - pendiente de confirmación', 'Baja'),
      registro('3', 'EN_ATENCION', 'En atención', 'Alta'),
      registro('4', 'CERRADA', 'Cerrada', 'Alta'),
    ]);
    TestBed.configureTestingModule({ providers: [{ provide: IncidenciasAdminService, useValue: {
      incidencias, cargando: signal(false), error: signal(''), cargar: async () => undefined,
    } }] });
    component = TestBed.runInInjectionContext(() => new TodasComponent());
  });

  it('Solucionada + Alta incluye la incidencia con el nombre largo real del catálogo', () => {
    component.filtroEstado.set('Solucionada'); component.filtroPrioridad.set('Alta');
    expect(component.items().map(i => i.id)).toEqual(['1']);
  });

  it('Solucionada sin prioridad incluye ambos niveles y excluye los otros estados', () => {
    component.filtroEstado.set('Solucionada');
    expect(component.items().map(i => i.id)).toEqual(['1', '2']);
  });

  it('limpiar filtros restituye el listado completo y los tres controles', () => {
    component.filtroEstado.set('Solucionada'); component.filtroPrioridad.set('Alta');
    component.filtroUbicacion.set('Torre 1'); component.limpiarFiltros();
    expect(component.items().length).toBe(4);
    expect(component.hayFiltrosActivos()).toBeFalse();
  });

  it('En atención coincide con el código EN_ATENCION', () => {
    component.filtroEstado.set('En atención'); component.filtroPrioridad.set('Alta');
    expect(component.items().map(i => i.id)).toEqual(['3']);
  });

  it('Cerrada no incluye incidencias que siguen pendientes de confirmación', () => {
    component.filtroEstado.set('Cerrada');
    expect(component.items().map(i => i.id)).toEqual(['4']);
  });

  it('admite el nombre histórico del catálogo cuando falta el código', () => {
    const service = TestBed.inject(IncidenciasAdminService);
    service.incidencias.set([registro('5', '', 'Solucionada - pendiente de confirmación', 'Alta')]);
    component.filtroEstado.set('Solucionada'); component.filtroPrioridad.set('Alta');
    expect(component.items().map(i => i.id)).toEqual(['5']);
  });
});
