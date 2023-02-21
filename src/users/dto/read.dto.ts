import { IsString, IsEmail, IsNotEmpty, IsDateString, IsBoolean } from 'class-validator'
import { AutoMap } from '@automapper/classes'

export class ReadUserDto {
  @AutoMap()
  @IsString()
  id: string

  @AutoMap()
  @IsBoolean()
  isActive: boolean

  @AutoMap()
  @IsDateString()
  createdAt: string

  @AutoMap()
  @IsDateString()
  lastLogin: string
}
