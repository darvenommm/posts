import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Theme } from './theme.constants';
import { DOCUMENT, isPlatformServer } from '@angular/common';

@Injectable()
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ssrDocument = inject(DOCUMENT, { optional: true });

  private readonly themeBehaviorSubject = new BehaviorSubject<Theme>(Theme.SYSTEM);

  public readonly theme$ = this.themeBehaviorSubject.asObservable();

  private get theme(): Theme {
    return this.themeBehaviorSubject.getValue();
  }

  private set theme(newTheme: Theme) {
    this.themeBehaviorSubject.next(newTheme);
  }

  public setTheme(newTheme: Theme): void {
    this.theme = newTheme;
    this.setRootThemeElement();
  }

  public setRootThemeElement(): void {
    const currentDocument = isPlatformServer(this.platformId) ? this.ssrDocument! : document;

    currentDocument.body.dataset['theme'] = this.theme;
  }
}
