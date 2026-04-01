import { IsString, MinLength, IsNotEmpty, IsEmail } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
