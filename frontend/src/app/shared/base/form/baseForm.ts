import { inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';

export abstract class BaseForm<
  FieldsName extends string = string,
  ErrorsName extends string = string,
> {
  protected readonly formBuilder = inject(NonNullableFormBuilder);

  public abstract formFields: FormGroup<any>;

  public hasError(fieldName: FieldsName, error: ErrorsName): boolean {
    const field = this.formFields.get(fieldName);

    if (field === null) {
      return true;
    }

    return field.hasError(error) && field.touched;
  }

  public isValid(fieldName: FieldsName): boolean {
    const control = this.formFields.controls[fieldName];

    return !control.touched || control.valid;
  }

  public onSubmit(): void {
    if (this.formFields.invalid) {
      return this.formFields.markAllAsTouched();
    }
  }

  protected abstract trimFieldsAndCheckValidation(): void;
}
