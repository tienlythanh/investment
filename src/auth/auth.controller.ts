import {
  Controller,
  HttpCode,
  Get,
  Put,
  Post,
  Body,
  Req,
  UseGuards,
  Query,
  ParseArrayPipe,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterUserDto } from '../users/dto/register.dto'
import { ReadUserDto } from 'src/users/dto/read.dto'
import {
  AccessTokenJwtAuthGuard,
  RefreshTokenJwtAuthGuard,
  AccessTokenLogoutJwtAuthGuard,
} from './strategies/jwt-auth.guard'
import { VerifyTokenDto } from 'src/users/dto/verifyToken.dto'
import { LoginUserDto } from '../users/dto/login.dto'
import { TokenLoginDto } from './dto/token.login.dto'

import { TokenDto } from 'src/token/dto/token.dto'
import { JtiDto } from 'src/token/dto/jti.dto'

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
  @UseGuards(AccessTokenLogoutJwtAuthGuard)
  @Post('logout')
  async logout(@Req() request): Promise<TokenDto> {
    const { jti, userId } = request.user
    const tokenEntity = await this.authService.logout({ jti, userId })
    return tokenEntity
  }

  @HttpCode(200)
  @UseGuards(RefreshTokenJwtAuthGuard)
  @Post('refresh-access-token')
  async refreshAccessToken(@Req() request): Promise<TokenLoginDto> {
    const payload = request.user
    let token = await this.authService.refreshAccessToken(payload)
    return token
  }

  @HttpCode(200)
  @UseGuards(AccessTokenJwtAuthGuard)
  @Post('revoke-device')
  async revokeDevices(
    @Body(new ParseArrayPipe({ items: JtiDto })) jtiDtoArr: JtiDto[],
    @Req() request
  ): Promise<any> {
    const payload = request.user
    return await this.authService.revokeDevices(payload, jtiDtoArr)
  }

  @HttpCode(200)
  @UseGuards(AccessTokenJwtAuthGuard)
  @Post('revoke-all-device')
  async revokeAllDevice(@Req() request): Promise<any> {
    const payload = request.user
    return await this.authService.revokeAllDevice(payload)
  }
}
