import { IsString, IsNotEmpty } from 'class-validator'
import { AutoMap } from '@automapper/classes'

export class JtiDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  userId: string

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  jti: string
}
