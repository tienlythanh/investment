import { Injectable, ArgumentMetadata, BadRequestException, ValidationPipe } from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'

@Injectable()
export class ValidationPipeCustom extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata

    if (!metatype || !this.toValidate(metadata)) {
      return value
    }

    const object = plainToInstance(metatype, value)
    const errors = await validate(object)

    if (errors.length > 0) {
      let errorMessages = []
      errors.forEach((error) => {
        errorMessages.push(...Object.values(error.constraints))
      })

      throw new BadRequestException(errorMessages)
    }

    return value
  }

  toValidate(metadata: ArgumentMetadata): boolean {
    const metatype = metadata.metatype
    const types: Function[] = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype)
  }
}
