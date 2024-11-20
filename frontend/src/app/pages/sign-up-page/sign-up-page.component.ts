import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { v4 as createUUID } from 'uuid';

import {
  AuthService,
  SignUpDTO,
  EMAIL_CONSTRAINTS,
  PASSWORD_CONSTRAINTS,
  USERNAME_CONSTRAINTS,
} from '@entities/auth';
import { BaseForm } from '@shared/base-components/base-form';
import { HttpErrorResponse } from '@angular/common/http';

interface SignUpForm {
  readonly [key: string]: AbstractControl<string>;
  readonly email: FormControl<string>;
  readonly username: FormControl<string>;
  readonly password: FormControl<string>;
}

@Component({
  selector: 'app-sign-up-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up-page.component.html',
  styleUrl: './sign-up-page.component.scss',
})
export class SignUpPageComponent extends BaseForm<SignUpForm> {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly userId = createUUID();

  public readonly USERNAME_CONSTRAINTS = USERNAME_CONSTRAINTS;
  public readonly PASSWORD_CONSTRAINTS = PASSWORD_CONSTRAINTS;
  public isSubmitting = false;
  public formErrors: string[] = [];

  public readonly formFields = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_CONSTRAINTS.pattern)]],
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(USERNAME_CONSTRAINTS.minLength),
        Validators.maxLength(USERNAME_CONSTRAINTS.maxLength),
        Validators.pattern(USERNAME_CONSTRAINTS.pattern),
      ],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(PASSWORD_CONSTRAINTS.minLength),
        Validators.maxLength(PASSWORD_CONSTRAINTS.maxLength),
      ],
    ],
  });

  public override onSubmit(): void {
    super.onSubmit();

    this.trimFieldsAndCheckValidation();

    if (this.formFields.valid) {
      console.log('Submitted form:', this.formFields.getRawValue());
      this.sendUserData();
    }
  }

  private trimFieldsAndCheckValidation(): void {
    const { email, username } = this.formFields.controls;
    this.formFields.patchValue({
      email: email.value.trim(),
      username: username.value.trim(),
    });
    this.formFields.updateValueAndValidity({ emitEvent: false });
  }

  private sendUserData(): void {
    this.isSubmitting = true;

    const { email, username, password } = this.formFields.controls;
    const signUpData: SignUpDTO = {
      id: this.userId,
      email: email.value,
      username: username.value,
      password: password.value,
    } as const;

    this.authService.signUp(signUpData).subscribe({
      next: (): void => {
        this.isSubmitting = false;
        this.router.navigateByUrl('/');
      },
      error: (error): void => {
        const internalError = ['Internal server error'];

        if (error instanceof HttpErrorResponse) {
          this.formErrors = error.error?.errors ?? internalError;
        } else {
          this.formErrors = internalError;
        }

        this.isSubmitting = false;
      },
    });
  }
}
