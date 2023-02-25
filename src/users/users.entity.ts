import { IsString, IsEmail, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator'
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
  @IsOptional()
  @IsString()
  lastLogin?: string

  @AutoMap()
  @IsOptional()
  @IsString()
  verifyToken?: string

  @AutoMap()
  @IsOptional()
  @IsString()
  verifiedAt?: string

  @AutoMap()
  @IsOptional()
  @IsString()
  apiToken?: string
}
