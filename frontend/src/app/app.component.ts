import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { ThemeDirective } from '@entities/theme';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThemeDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'frontend';
}
