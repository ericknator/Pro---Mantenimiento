import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../../core/data/navigation.data';
import { NavItem } from '../../models/nav-item.model';


@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  items = input<NavItem[]>(NAV_ITEMS);
  /** true: solo íconos (pantallas de acción como Reportar incidencia) */
  collapsed = input(false);
}
