import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesPruebaComponent } from './roles-prueba.component';

describe('RolesPruebaComponent', () => {
  let component: RolesPruebaComponent;
  let fixture: ComponentFixture<RolesPruebaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesPruebaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesPruebaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
