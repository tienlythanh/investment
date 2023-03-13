import { IsString, IsNotEmpty } from 'class-validator'
import { AutoMap } from '@automapper/classes'

export class TokenDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  createdAt: string

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  jti: string

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  expiredAt: string

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  userId: string
}
