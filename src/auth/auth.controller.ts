import { Controller, HttpCode, Get, Put, Post, Body, Req, UseGuards, Query } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterUserDto } from '../users/dto/register.dto'
import { ReadUserDto } from 'src/users/dto/read.dto'
import { AccessTokenJwtAuthGuard, RefreshTokenJwtAuthGuard } from './strategies/jwt-auth.guard'
import { VerifyTokenDto } from 'src/users/dto/verifyToken.dto'
import { LoginUserDto } from '../users/dto/login.dto'
import { TokenLoginDto } from './dto/token.login.dto'
import { TokenEntity } from 'src/token/token.entity'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Put('register')
  async register(@Body() registration: RegisterUserDto): Promise<ReadUserDto> {
    const user = await this.authService.register(registration)
    return user
  }

  @HttpCode(200)
  @Get('verify')
  async verify(@Query() tokenQuery: VerifyTokenDto): Promise<ReadUserDto> {
    const user = await this.authService.verify(tokenQuery)
    return user
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() validateUserData: LoginUserDto): Promise<TokenLoginDto> {
    const token = await this.authService.validateUser(validateUserData)
    return token
  }

  @HttpCode(200)
  @UseGuards(RefreshTokenJwtAuthGuard)
  @Post('logout')
  async logout(@Req() request): Promise<TokenEntity> {
    const { jti, userId } = request.user
    const tokenEntity = await this.authService.logout({ jti, userId })
    return tokenEntity
  }
}
