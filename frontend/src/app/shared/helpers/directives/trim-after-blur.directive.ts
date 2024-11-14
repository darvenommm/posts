import { Directive, ElementRef, HostListener, Renderer2, RendererFactory2 } from '@angular/core';

type TextElement = HTMLInputElement | HTMLTextAreaElement;

@Directive({
  selector: '[trimAfterBlur]',
  standalone: true,
})
export class TrimAfterBlurDirective {
  private readonly renderer: Renderer2;
  private readonly element: TextElement;

  @HostListener('blur')
  public onBlur(): void {
    this.renderer.setProperty(this.element, 'value', this.element.value.trim());
  }

  constructor(
    rendererFactory: RendererFactory2,
    private readonly elementRef: ElementRef<TextElement>,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.element = elementRef.nativeElement;
  }
}
