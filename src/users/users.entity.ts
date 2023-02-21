import { IsString, IsEmail, IsNotEmpty, IsBoolean } from 'class-validator'
import { AutoMap } from '@automapper/classes'

export class UserEntity {
  @AutoMap()
  @IsString()
  id: string

  @AutoMap()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @AutoMap()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  hash: string

  @AutoMap()
  @IsBoolean()
  isActive: boolean

  @AutoMap()
  @IsString()
  createdAt: string

  @AutoMap()
  @IsString()
  lastLogin: string
}
