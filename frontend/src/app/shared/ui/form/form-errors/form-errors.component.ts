import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-form-errors',
  standalone: true,

  templateUrl: './form-errors.component.html',
  styleUrl: './form-errors.component.scss',
})
export class FormErrorsComponent {
  public readonly errors = input.required<Record<string, boolean> | string[]>();

  public readonly renderErrors = computed((): string[] => {
    const errors = this.errors();

    if (Array.isArray(errors)) {
      return errors;
    }

    return Object.entries(this.errors())
      .filter(([_, needRender]): boolean => needRender)
      .map(([errorText]): string => errorText);
  });
}
