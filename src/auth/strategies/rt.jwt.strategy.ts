import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { UsersService } from '../../users/users.service'

@Injectable()
export class RefreshTokenJwtStrategy extends PassportStrategy(Strategy, 'refresh-token') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET_KEY,
    })
  }

  async validate(payload: any) {
    return payload
  }
}
