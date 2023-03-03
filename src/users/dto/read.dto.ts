import { IsString, IsOptional, IsBoolean } from 'class-validator'
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
  username: string

  @AutoMap()
  @IsString()
  createdAt: string

  @AutoMap()
  @IsOptional()
  @IsString()
  verifiedAt?: string
}
