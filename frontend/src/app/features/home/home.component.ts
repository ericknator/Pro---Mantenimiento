import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TilePanelComponent } from '../../shared/tile-panel/tile-panel.component';
import { NAV_ITEMS } from '../../core/data/navigation.data';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TilePanelComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  modules = NAV_ITEMS.filter((i) => i.route !== '/inicio');
}