/* istanbul ignore file */
import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core'
import { JtiDto } from '../dto/jti.dto'
import { TokenEntity } from '../token.entity'
import { TokenPayloadDto } from '../dto/payload.token.dto'
import { TokenDto } from '../dto/token.dto'

@Injectable()
export class TokenProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, JtiDto, TokenEntity),
        createMap(
          mapper,
          TokenPayloadDto,
          TokenEntity,
          forMember(
            (dest) => dest.expiredAt,
            mapFrom((source) => source.exp)
          ),
          forMember(
            (dest) => dest.createdAt,
            mapFrom((source) => source.iat)
          )
        ),
        createMap(mapper, TokenEntity, TokenDto)
    }
  }
}
