export interface SignUpDTO {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
}

export interface SignInDTO {
  readonly emailOrUsername: string;
  readonly password: string;
}
