import { IsByteLength, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class ValidateDto {
  @IsNotEmpty()
  @IsString()
  @IsByteLength(6, 6)
  code: string;

  @IsNotEmpty()
  @IsString()
  id: string;
}

export class createAccountDto {
  @IsNotEmpty()
  @IsString()
  @IsByteLength(6, 6)
  confirmation_code: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}

export class updateAccountDto {
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @IsNotEmpty()
  @IsString()
  id: string;
}
