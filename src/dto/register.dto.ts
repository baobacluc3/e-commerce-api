import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @IsString()
  password: string;

  @IsOptional()
  fullName: string;
}
