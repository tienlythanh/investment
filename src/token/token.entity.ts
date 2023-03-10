import { IsString, IsNotEmpty } from 'class-validator'
import { AutoMap } from '@automapper/classes'

export class TokenEntity {
  constructor(userId: string, jti: string, createdAt: string, expiredAt: string) {
    this.userId = userId
    this.jti = jti
    this.createdAt = createdAt
    this.expiredAt = expiredAt
  }

  @AutoMap()
  @IsString()
  id: string

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
