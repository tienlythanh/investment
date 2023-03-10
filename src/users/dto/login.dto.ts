import { IsString, IsEmail, IsNotEmpty } from 'class-validator'
import { AutoMap } from '@automapper/classes'

export class LoginUserDto {
  @AutoMap()
  @IsString()
  @IsEmail()
  email: string

  @AutoMap()
  @IsString()
  @IsNotEmpty({ message: 'Password must not empty' })
  password: string
}
