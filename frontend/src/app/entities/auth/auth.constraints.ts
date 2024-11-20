export const USERNAME_CONSTRAINTS = {
  minLength: 6,
  maxLength: 32,

  get pattern(): RegExp {
    return new RegExp(`^[a-zA-Z_][a-zA-Z0-9_]{${this.minLength - 1},${this.maxLength - 1}}$`);
  },

  get beautyPattern(): string {
    return String(this.pattern).replaceAll('/', '');
  },
} as const;

export const PASSWORD_CONSTRAINTS = {
  minLength: 6,
  maxLength: 32,
} as const;

export const EMAIL_CONSTRAINTS = {
  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/,
} as const;
