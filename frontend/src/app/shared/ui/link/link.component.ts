import { Component, input } from '@angular/core';
import { RouterLinkActive, RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-link',
  standalone: true,
  imports: [RouterLinkWithHref, RouterLinkActive],
  templateUrl: './link.component.html',
  styleUrl: './link.component.scss',
})
export class LinkComponent {
  public readonly path = input.required<string[]>();
}
