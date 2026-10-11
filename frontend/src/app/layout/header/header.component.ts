import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NOTIFICACIONES_ITEM } from '../../core/data/navigation.data';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  usuario = this.auth.usuario;
  notificaciones = NOTIFICACIONES_ITEM;

  salir(): void {
    this.auth.salir();
    this.router.navigateByUrl('/login');
  }
}
