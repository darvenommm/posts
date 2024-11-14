import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as createUUID } from 'uuid';

import { AuthService, SignUpDTO } from '@entities/auth';

type FieldsName = 'email' | 'username' | 'password';
type ErrorsName = 'required' | 'email' | 'minlength' | 'maxlength' | 'pattern';

@Component({
  selector: 'sign-up-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [AuthService],
  templateUrl: './sign-up-page.component.html',
  styleUrl: './sign-up-page.component.scss',
})
export class SignUpPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly userId = createUUID();

  public readonly formFields: FormGroup;
  public isSubmitting = false;
  public requestErrors: string[] = [];

  public constructor(formBuilder: FormBuilder) {
    this.formFields = formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(32),
          Validators.pattern(/^[a-zA-Z_][a-zA-Z0-9_]{5,31}$/),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]],
    });
  }

  public hasError(fieldName: FieldsName, error: ErrorsName): boolean {
    const field = this.formFields.get(fieldName);

    if (field === null) {
      return true;
    }

    return field.hasError(error) && (field.dirty || field.touched);
  }

  public onSubmit(): void {
    if (this.formFields.invalid) {
      return this.formFields.markAllAsTouched();
    }

    this.formFields.patchValue({
      email: this.getTrimmedField('email'),
      username: this.getTrimmedField('username'),
    });
    this.formFields.updateValueAndValidity({ emitEvent: false });

    if (this.formFields.valid) {
      console.log('Submitted form:', this.formFields.getRawValue());

      this.isSubmitting = true;
      this.sendUserData();
    }
  }

  private sendUserData(): void {
    // Email and username should be trimmed before sending in the onSubmit!
    const signUpData: SignUpDTO = {
      id: this.userId,
      email: this.getField('email'),
      username: this.getField('username'),
      password: this.getField('password'),
    } as const;

    this.authService.signUp(signUpData).subscribe({
      next: (): void => {
        this.router.navigate(['/posts']);
      },
      error: (errors): void => {
        this.isSubmitting = false;
        console.error(errors);
      },
    });
  }

  private getField(fieldName: FieldsName): string {
    const field = this.formFields.get(fieldName);

    if (!field) {
      throw new Error('Not found field by name');
    }

    return field.getRawValue();
  }

  private getTrimmedField(fieldName: FieldsName): string {
    return this.getField(fieldName).trim();
  }
}
