/* istanbul ignore file */
import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core'
import { RegisterUserDto } from '../dto/register.dto'
import { UserEntity } from '../users.entity'
import { ReadUserDto } from '../dto/read.dto'

@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        RegisterUserDto,
        UserEntity,
        forMember(
          (dest) => dest.hash,
          mapFrom((source) => source.password)
        )
      ),
        createMap(mapper, UserEntity, ReadUserDto)
    }
  }
}
