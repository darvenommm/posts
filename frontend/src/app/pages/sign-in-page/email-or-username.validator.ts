import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { EMAIL_CONSTRAINTS, USERNAME_CONSTRAINTS } from '@entities/auth';

export const emailOrUsernameValidator: ValidatorFn = (
  control: AbstractControl<string, string>,
): ValidationErrors | null => {
  if (~control.value.indexOf('@')) {
    return Validators.pattern(EMAIL_CONSTRAINTS.pattern)(control);
  }

  let usernameErrors: ValidationErrors = {};
  const usernameValidators: ValidatorFn[] = [
    Validators.minLength(USERNAME_CONSTRAINTS.minLength),
    Validators.maxLength(USERNAME_CONSTRAINTS.maxLength),
    Validators.pattern(USERNAME_CONSTRAINTS.pattern),
  ];

  for (const validator of usernameValidators) {
    const usernameValidationResult = validator(control);

    if (usernameValidationResult) {
      usernameErrors = { ...usernameErrors, ...usernameValidationResult };
    }
  }

  if (!Object.keys(usernameErrors).length) {
    return null;
  }

  return usernameErrors;
};
