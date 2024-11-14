import { Component } from '@angular/core';

import { ThemeService } from '@entities/theme';

@Component({
  selector: 'theme-toggle',
  standalone: true,
  imports: [],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
})
export class ThemeToggleComponent {
  public constructor(private readonly themeService: ThemeService) {}

  public toggle(): void {
    const newTheme = this.themeService.getTheme() === 'dark' ? 'light' : 'dark';

    this.themeService.setTheme(newTheme);
  }
}
