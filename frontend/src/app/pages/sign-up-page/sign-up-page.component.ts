import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as createUUID } from 'uuid';

import { AuthService, SignUpDTO } from '@entities/auth';
import {
  USERNAME_CONSTRAINTS,
  PASSWORD_CONSTRAINTS,
  EMAIL_CONSTRAINTS,
} from '@shared/constraints/auth';
import { InputComponent } from '@shared/ui/form/input';
import { FormErrorsComponent } from '@shared/ui/form/form-errors';
import { ButtonComponent } from '@shared/ui/button';
import { LinkComponent } from '@shared/ui/link';
import { BaseForm } from '@shared/base/form';
import { HttpErrorResponse } from '@angular/common/http';

interface SignUpForm {
  email: FormControl<string>;
  username: FormControl<string>;
  password: FormControl<string>;
}

type FieldsName = keyof SignUpForm;
type ErrorsName = 'required' | 'minlength' | 'maxlength' | 'pattern';

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    FormErrorsComponent,
    ButtonComponent,
    LinkComponent,
  ],
  templateUrl: './sign-up-page.component.html',
  styleUrl: './sign-up-page.component.scss',
})
export class SignUpPageComponent extends BaseForm<FieldsName, ErrorsName> {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly userId = createUUID();
  public isSubmitting = false;
  public formErrors: string[] = [];

  public readonly formFields: FormGroup<SignUpForm> = this.formBuilder.group(
    {
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
    },
    {},
  );

  public override onSubmit(): void {
    super.onSubmit();

    this.trimFieldsAndCheckValidation();

    if (this.formFields.valid) {
      console.log('Submitted form:', this.formFields.getRawValue());
      this.sendUserData();
    }
  }

  public getEmailErrorsMessage(): Record<string, boolean> {
    return {
      'Email is required': this.hasError('email', 'required'),
      'Invalid email format': this.hasError('email', 'pattern'),
    };
  }

  public getUsernameErrorsMessage(): Record<string, boolean> {
    const minUsernameLengthMessage = `Username must be at least ${USERNAME_CONSTRAINTS.minLength} characters`;
    const maxUsernameLengthMessage = `Username cannot exceed ${USERNAME_CONSTRAINTS.maxLength} characters`;
    const incorrectUsernamePatternMessage = `Username contains invalid characters (${USERNAME_CONSTRAINTS.beautyPattern})`;

    return {
      'Username is required': this.hasError('username', 'required'),
      [minUsernameLengthMessage]: this.hasError('username', 'minlength'),
      [maxUsernameLengthMessage]: this.hasError('username', 'maxlength'),
      [incorrectUsernamePatternMessage]: this.hasError('username', 'pattern'),
    };
  }

  public getPasswordErrorsMessage(): Record<string, boolean> {
    const minPasswordLengthMessage = `Password must be at least ${PASSWORD_CONSTRAINTS.minLength} characters`;
    const maxPasswordLengthMessage = `Password cannot exceed ${PASSWORD_CONSTRAINTS.maxLength} characters`;

    return {
      'Password is required': this.hasError('password', 'required'),
      [minPasswordLengthMessage]: this.hasError('password', 'minlength'),
      [maxPasswordLengthMessage]: this.hasError('password', 'maxlength'),
    };
  }

  protected trimFieldsAndCheckValidation(): void {
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

    // Email and username should be checked by on trimming before sending!
    const signUpData: SignUpDTO = {
      id: this.userId,
      email: email.value,
      username: username.value,
      password: password.value,
    } as const;

    this.authService.signUp(signUpData).subscribe({
      next: (): void => {
        this.isSubmitting = false;
        this.router.navigate(['/']);
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
