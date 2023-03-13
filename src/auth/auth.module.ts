import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { TokenModule } from 'src/token/token.module'
import { AccessTokenJwtStrategy } from './strategies/at.jwt.strategy'
import { RefreshTokenJwtStrategy } from './strategies/rt.jwt.strategy'
import { AccessTokenLogoutJwtStrategy } from './strategies/logout.at.jwt.strategy'

@Module({
  imports: [
    TokenModule,
    UsersModule,
    PassportModule,
    JwtModule.register({ verifyOptions: { ignoreExpiration: true } }),
  ],
  providers: [
    AuthService,
    AccessTokenJwtStrategy,
    RefreshTokenJwtStrategy,
    AccessTokenLogoutJwtStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
