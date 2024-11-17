import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-form-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './form-page.component.html',
  styleUrl: './form-page.component.scss',
})
export class FormPageComponent {}
