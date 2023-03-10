import { IsString, IsEmail, IsNotEmpty } from 'class-validator'
import { AutoMap } from '@automapper/classes'

export class RegisterUserDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty({ message: 'Username must not empty' })
  username: string

  @AutoMap()
  @IsString()
  @IsEmail()
  email: string

  @AutoMap()
  @IsString()
  @IsNotEmpty({ message: 'Password must not empty' })
  password: string
}
