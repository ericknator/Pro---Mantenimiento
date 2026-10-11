import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../../core/data/navigation.data';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  principales = NAV_ITEMS.filter((i) => i.bottom);
  otros = NAV_ITEMS.filter((i) => !i.bottom);
  abierto = signal(false);

  alternar(): void { this.abierto.update((v) => !v); }
  cerrar(): void { this.abierto.set(false); }

  salir(): void {
    this.cerrar();
    this.auth.salir();
    this.router.navigateByUrl('/login');
  }
}
