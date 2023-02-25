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
  @IsString()
  createdAt: string

  @AutoMap()
  @IsString()
  lastLogin: string

  @AutoMap()
  @IsString()
  verifiedAt: string
}
