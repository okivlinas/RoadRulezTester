import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';


export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(['guest', 'student', 'admin'])
  role: string;
}
