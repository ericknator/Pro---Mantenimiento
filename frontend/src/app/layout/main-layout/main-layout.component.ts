import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface PantallaCfg {
  menu?: 'full' | 'rail';
  fondo?: string;
}

const FONDOS: Record<string, string> = {
  ciudad: '/images/fondo-inicio.jpg',
  edificio: '/images/fondo-incidencias.jpg',
  terraza: '/images/fondo-reportar.jpg',
};

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, BottomNavComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly router = inject(Router);

  // Lee la configuración (data) de la ruta activa más profunda
  private readonly cfg = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map((): PantallaCfg => {
        let ruta = this.router.routerState.snapshot.root;
        while (ruta.firstChild) ruta = ruta.firstChild;
        return ruta.data as PantallaCfg;
      }),
    ),
    { initialValue: {} as PantallaCfg },
  );

  rail = computed(() => this.cfg().menu === 'rail');
  fondoUrl = computed(() => `url('${FONDOS[this.cfg().fondo ?? 'edificio'] ?? FONDOS['edificio']}')`);
}
