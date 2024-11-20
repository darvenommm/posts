import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { AuthService, SignInDTO, PASSWORD_CONSTRAINTS, USERNAME_CONSTRAINTS } from '@entities/auth';
import { BaseForm } from '@shared/base-components/base-form';
import { emailOrUsernameValidator } from './email-or-username.validator';

interface SignInForm {
  readonly [key: string]: AbstractControl<string>;
  readonly emailOrUsername: FormControl<string>;
  readonly password: FormControl<string>;
}

@Component({
  selector: 'app-sign-in-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in-page.component.html',
  styleUrl: './sign-in-page.component.scss',
})
export class SignInPageComponent extends BaseForm<SignInForm> {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public readonly USERNAME_CONSTRAINTS = USERNAME_CONSTRAINTS;
  public readonly PASSWORD_CONSTRAINTS = PASSWORD_CONSTRAINTS;
  public isSubmitting = false;
  public formErrors: string[] = [];

  public readonly formFields = this.formBuilder.group({
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

  public isEmailOrUsernameEqualedEmail(): boolean {
    return Boolean(~this.formFields.controls.emailOrUsername.value.indexOf('@'));
  }

  private trimFieldsAndCheckValidation(): void {
    const { emailOrUsername } = this.formFields.controls;
    this.formFields.patchValue({
      emailOrUsername: emailOrUsername.value.trim(),
    });
    this.formFields.updateValueAndValidity({ emitEvent: false });
  }

  private sendUserData(): void {
    this.isSubmitting = true;

    const { emailOrUsername, password } = this.formFields.controls;
    const signInData: SignInDTO = {
      emailOrUsername: emailOrUsername.value,
      password: password.value,
    } as const;

    this.authService.signIn(signInData).subscribe({
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
