import { TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { Theme, ThemeService } from '@entities/theme';

@Component({
  selector: 'app-switch-theme-button',
  imports: [TitleCasePipe],
  providers: [ThemeService],
  templateUrl: './switch-theme-button.component.html',
  styleUrl: './switch-theme-button.component.scss',
})
export class SwitchThemeButtonComponent {
  private readonly themeService = inject(ThemeService);

  public readonly currentTheme = toSignal(this.themeService.theme$);
  public readonly themes = Object.values(Theme);

  public updateTheme(newTheme: Theme): void {
    this.themeService.setTheme(newTheme);
  }
}
