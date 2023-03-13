import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class AccessTokenJwtAuthGuard extends AuthGuard('access-token') {}

export class RefreshTokenJwtAuthGuard extends AuthGuard('refresh-token') {}

export class AccessTokenLogoutJwtAuthGuard extends AuthGuard('access-token-logout') {}
