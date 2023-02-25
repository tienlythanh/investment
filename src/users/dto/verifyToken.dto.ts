import { IsNotEmpty, IsString } from 'class-validator'
import { AutoMap } from '@automapper/classes'

export class VerifyTokenDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  token: string
}
