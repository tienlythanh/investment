import { IsString, IsNotEmpty, IsOptional } from 'class-validator'
import { AutoMap } from '@automapper/classes'

export class TokenPayloadDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  iat: string

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  jti: string

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  exp: string

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  userId: string
}
