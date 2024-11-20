import { inject } from '@angular/core';
import { AbstractControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';

type FormControlsBase = { [K: string]: AbstractControl };

export abstract class BaseForm<FormControls extends FormControlsBase = FormControlsBase> {
  protected readonly formBuilder = inject(NonNullableFormBuilder);

  public abstract readonly formFields: FormGroup<FormControls>;

  public hasError(fieldName: string, error: string): boolean {
    const field = this.formFields.get(fieldName);

    if (field === null) {
      throw new Error('Not found a field by its name!');
    }

    return field.hasError(error) && field.touched;
  }

  public isValid(fieldName: string): boolean {
    const control = this.formFields.controls[fieldName];

    return !control.touched || control.valid;
  }

  public onSubmit(): void {
    if (this.formFields.invalid) {
      return this.formFields.markAllAsTouched();
    }
  }
}
