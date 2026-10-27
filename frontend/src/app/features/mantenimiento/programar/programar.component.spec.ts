import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgramarMantenimientoComponent } from './programar.component';
import { MantenimientoService } from '../../../core/services/mantenimiento.service';

describe('ProgramarMantenimientoComponent', () => {
  let fixture: ComponentFixture<ProgramarMantenimientoComponent>;
  let component: ProgramarMantenimientoComponent;
  let serviceMock: {
    activos: ReturnType<typeof signal>;
    frecuencias: ReturnType<typeof signal>;
    responsables: ReturnType<typeof signal>;
    mantenimientos: ReturnType<typeof signal>;
    cargando: ReturnType<typeof signal>;
    cargandoCatalogos: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
    catalogosError: ReturnType<typeof signal>;
    cargarCatalogos: jasmine.Spy;
    cargarMantenimientos: jasmine.Spy;
    programarMantenimiento: jasmine.Spy;
  };

  beforeEach(async () => {
    serviceMock = {
      activos: signal([]),
      frecuencias: signal([]),
      responsables: signal([]),
      mantenimientos: signal([]),
      cargando: signal(false),
      cargandoCatalogos: signal(false),
      error: signal(null),
      catalogosError: signal(null),
      cargarCatalogos: jasmine.createSpy('cargarCatalogos').and.resolveTo(),
      cargarMantenimientos: jasmine.createSpy('cargarMantenimientos').and.resolveTo(),
      programarMantenimiento: jasmine
        .createSpy('programarMantenimiento')
        .and.resolveTo({ id: 55 }),
    };

    await TestBed.configureTestingModule({
      imports: [ProgramarMantenimientoComponent],
      providers: [
        provideRouter([]),
        { provide: MantenimientoService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramarMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('rechaza una fecha pasada antes de llamar al backend', async () => {
    component.form.patchValue({
      activoId: 10,
      frecuenciaId: 2,
      responsableId: 21,
      titulo: 'Revisión preventiva',
      primeraTareaProgramadaPara: '2020-01-01T09:30',
    });

    await component.enviar();

    expect(serviceMock.programarMantenimiento).not.toHaveBeenCalled();
    expect(component.mensajeError()).toBe(
      'La fecha y hora de la primera tarea deben ser futuras.'
    );
  });

  it('envía fecha y hora, frecuencia y responsable al servicio', async () => {
    component.form.patchValue({
      activoId: 10,
      frecuenciaId: 2,
      responsableId: 21,
      titulo: 'Revisión preventiva',
      descripcion: 'Revisión de sensores',
      primeraTareaProgramadaPara: '2099-11-15T09:30',
    });

    await component.enviar();

    expect(serviceMock.programarMantenimiento).toHaveBeenCalledOnceWith({
      activoId: 10,
      frecuenciaId: 2,
      responsableId: 21,
      titulo: 'Revisión preventiva',
      descripcion: 'Revisión de sensores',
      primeraTareaProgramadaPara: '2099-11-15T09:30:00',
    });
    expect(component.mensajeExito()).toBe(
      'Plan guardado. El listado de tareas preventivas se actualizó.'
    );
  });
});
