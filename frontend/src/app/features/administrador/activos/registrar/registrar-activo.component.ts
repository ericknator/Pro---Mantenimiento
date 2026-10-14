import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeroComponent } from '../../../../shared/page-hero/page-hero.component';
import { ActivoService } from '../../../../core/services/activo.service';

@Component({
  selector: 'app-registrar-activo',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeroComponent],
  templateUrl: './registrar-activo.component.html',
  styleUrl: './registrar-activo.component.scss'
})
export class RegistrarActivoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly activoService = inject(ActivoService);

  readonly enviando = signal(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  readonly tiposActivo = [
    'Ascensor',
    'Bomba de agua',
    'Portón vehicular',
    'Grupo electrógeno',
    'Sistema contra incendios',
    'Cerco eléctrico',
    'Cámaras de seguridad',
    'Extracción de monóxido'
  ];

  form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    tipo: ['', [Validators.required]],
    ubicacion: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: ['', [Validators.maxLength(250)]]
  });

  ngOnInit(): void {
    void this.activoService.cargar();
  }

  invalido(campo: 'codigo' | 'nombre' | 'tipo' | 'ubicacion'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  async enviar(): Promise<void> {
    if (this.enviando()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensajeError.set('Completa todos los campos obligatorios.');
      return;
    }

    this.enviando.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    const valores = this.form.getRawValue();

    try {
      const creado = await this.activoService.registrar({
        codigo: valores.codigo.trim().toUpperCase(),
        nombre: valores.nombre.trim(),
        tipo: valores.tipo,
        ubicacion: valores.ubicacion.trim(),
        descripcion: valores.descripcion.trim()
      });

      this.mensajeExito.set(`Activo "${creado.codigo} - ${creado.nombre}" registrado exitosamente.`);
      this.form.reset({ codigo: '', nombre: '', tipo: '', ubicacion: '', descripcion: '' });
    } catch (err: any) {
      this.mensajeError.set(err?.message || 'No se pudo registrar el activo.');
    } finally {
      this.enviando.set(false);
    }
  }
}