import { Component, computed, input } from '@angular/core';

type ButtonType = 'submit' | 'button' | 'menu' | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  public readonly type = input<ButtonType>('button');
  public readonly disabled = input<boolean>(false);
}
