import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface RolOpcion {
  id: string;
  label: string;
  icon: string;
  disponible: boolean;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})

export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // El MVP actual cubre el flujo del residente; los demás roles llegan en versiones posteriores.
  roles: RolOpcion[] = [
    { id: 'residente', label: 'Residente', icon: 'person', disponible: true },
    { id: 'administrador', label: 'Administrador', icon: 'apartment', disponible: true },
    { id: 'seguridad', label: 'Seguridad', icon: 'shield', disponible: true },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: 'build', disponible: true },
  ];
  rolActivo = signal('residente');

  form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(6)]],
  });

  error = signal('');
  aviso = signal('');
  cargando = signal(false);

  elegirRol(r: RolOpcion): void {
    if (r.disponible) this.rolActivo.set(r.id);
  }

  invalido(campo: 'correo' | 'clave'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  recuperar(): void {
    this.aviso.set('La recuperación de contraseña se habilitará con Firebase Authentication.');
  }

  async ingresar(): Promise<void> {
    this.error.set('');
    this.aviso.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);

    const { correo, clave } = this.form.getRawValue();

    try {
      const correcto = await this.auth.ingresar(correo, clave);

      if (!correcto) {
        this.error.set('Correo o contraseña no válidos, o usuario sin perfil activo.');
        return;
      }

      const usuario = this.auth.usuario();

      if (!usuario) {
        this.error.set('No se pudo obtener el perfil del usuario.');
        return;
      }

      const rutasPorRol: Record<string, string> = {
        residente: '/inicio',
        administrador: '/administrador/dashboard',
        mantenimiento: '/mantenimiento/inicio',
        seguridad: '/seguridad/inicio',
      };

      await this.router.navigateByUrl(
        rutasPorRol[usuario.rol] ?? '/inicio'
      );
    } catch {
      this.error.set('No se pudo iniciar sesión. Inténtalo nuevamente.');
    } finally {
      this.cargando.set(false);
    }
  }


}
