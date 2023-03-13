import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsEnum,
  validate,
  Validate,
} from 'class-validator'
import { AutoMap } from '@automapper/classes'
import { plainToClass, Transform, Type } from 'class-transformer'

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
