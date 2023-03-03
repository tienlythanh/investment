/* istanbul ignore file */
import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core'
import { JtiDto } from '../dto/jti.dto'
import { TokenEntity } from '../token.entity'

@Injectable()
export class TokenProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, JtiDto, TokenEntity)
    }
  }
}
