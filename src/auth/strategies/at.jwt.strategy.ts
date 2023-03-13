import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { UsersService } from '../../users/users.service'

@Injectable()
export class AccessTokenJwtStrategy extends PassportStrategy(Strategy, 'access-token') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET_KEY,
    })
  }

  async validate(payload: any) {
    return payload
  }
}
