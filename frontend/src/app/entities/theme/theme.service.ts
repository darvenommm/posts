import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Theme, DEFAULT_THEME } from './theme.constants';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public readonly theme$ = new BehaviorSubject<Theme>(DEFAULT_THEME);

  public setTheme(newTheme: Theme): void {
    this.theme$.next(newTheme);
  }

  public getTheme(): Theme {
    return this.theme$.getValue();
  }
}
