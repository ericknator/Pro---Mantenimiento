import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EXIT_ITEM } from '../../core/data/navigation.data';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  exit = EXIT_ITEM;
}