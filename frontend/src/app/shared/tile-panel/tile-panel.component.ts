import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'app-tile-panel',
  imports: [RouterLink],
  templateUrl: './tile-panel.component.html',
  styleUrl: './tile-panel.component.scss',
})
export class TilePanelComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  items = input.required<NavItem[]>();
}
