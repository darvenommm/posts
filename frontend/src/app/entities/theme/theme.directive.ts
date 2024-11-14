import {
  Directive,
  ElementRef,
  input,
  OnInit,
  AfterViewInit,
  RendererFactory2,
  Renderer2,
} from '@angular/core';

import { ThemeService } from './theme.service';
import { Theme, DEFAULT_THEME } from './theme.constants';

@Directive({
  selector: '[theme]',
  standalone: true,
})
export class ThemeDirective implements OnInit, AfterViewInit {
  private readonly renderer: Renderer2;

  public readonly theme = input<'' | Theme>(DEFAULT_THEME);

  public constructor(
    rendererFactory: RendererFactory2,
    private readonly element: ElementRef<HTMLElement>,
    private readonly themeService: ThemeService,
  ) {
    this.renderer = rendererFactory.createRenderer(element.nativeElement, null);
  }

  public ngOnInit(): void {
    this.themeService.theme$.subscribe({
      next: this.setThemeIntoElement.bind(this),
    });
  }

  public ngAfterViewInit(): void {
    this.setThemeIntoElement(this.themeService.getTheme());
  }

  private setThemeIntoElement(newTheme: Theme): void {
    if (this.element && this.element.nativeElement) {
      this.renderer.setAttribute(this.element.nativeElement, 'data-theme', newTheme);
    }
  }
}
