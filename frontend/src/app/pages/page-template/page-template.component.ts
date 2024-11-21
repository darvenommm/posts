import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../widgets/header/header.component';

@Component({
  selector: 'app-page-template',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './page-template.component.html',
  styleUrl: './page-template.component.scss',
})
export class PageTemplateComponent {}
