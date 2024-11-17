import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, SignInDTO } from '@entities/auth';
import { emailOrUsernameValidator } from './sign-in-page.validator';
import { PASSWORD_CONSTRAINTS, USERNAME_CONSTRAINTS } from '@shared/constraints/auth';
import { BaseForm } from '@shared/base/form';
import { FormErrorsComponent } from '@shared/ui/form/form-errors';
import { ButtonComponent } from '@shared/ui/button';
import { LinkComponent } from '@shared/ui/link';
import { InputComponent } from '@shared/ui/form/input';
import { HttpErrorResponse } from '@angular/common/http';

interface SignInForm {
  emailOrUsername: FormControl<string>;
  password: FormControl<string>;
}

type FieldsName = keyof SignInForm;
type ErrorsName = 'required' | 'minlength' | 'maxlength' | 'pattern';

@Component({
  selector: 'app-sign-in-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormErrorsComponent,
    ButtonComponent,
    LinkComponent,
    InputComponent,
  ],
  templateUrl: './sign-in-page.component.html',
  styleUrl: './sign-in-page.component.scss',
})
export class SignInPageComponent extends BaseForm<FieldsName, ErrorsName> {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public isSubmitting = false;
  public formErrors: string[] = [];

  public readonly formFields: FormGroup<SignInForm> = this.formBuilder.group({
    emailOrUsername: ['', [Validators.required, emailOrUsernameValidator]],
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

  public getEmailOrUsernameErrorsMessage(): Record<string, boolean> {
    let incorrectPattern: string;

    if (Boolean(~this.formFields.controls.emailOrUsername.value.indexOf('@'))) {
      incorrectPattern = 'Invalid email format';
    } else {
      incorrectPattern = `Username contains invalid characters (${USERNAME_CONSTRAINTS.beautyPattern})`;
    }

    const minUsernameLengthMessage = `Username must be at least ${USERNAME_CONSTRAINTS.minLength} characters`;
    const maxUsernameLengthMessage = `Username cannot exceed ${USERNAME_CONSTRAINTS.maxLength} characters`;

    return {
      'Email or username is required': this.hasError('emailOrUsername', 'required'),
      [minUsernameLengthMessage]: this.hasError('emailOrUsername', 'minlength'),
      [maxUsernameLengthMessage]: this.hasError('emailOrUsername', 'maxlength'),
      [incorrectPattern]: this.hasError('emailOrUsername', 'pattern'),
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
    const { emailOrUsername } = this.formFields.controls;
    this.formFields.patchValue({
      emailOrUsername: emailOrUsername.value.trim(),
    });
    this.formFields.updateValueAndValidity({ emitEvent: false });
  }

  private sendUserData(): void {
    this.isSubmitting = true;

    const { emailOrUsername, password } = this.formFields.controls;

    // Email and username should be checked by on trimming before sending!
    const signInData: SignInDTO = {
      emailOrUsername: emailOrUsername.value,
      password: password.value,
    } as const;

    this.authService.signIn(signInData).subscribe({
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
