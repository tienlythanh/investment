import {
  Controller,
  HttpCode,
  Get,
  Put,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterUserDto } from '../users/dto/register.dto'
import { ReadUserDto } from 'src/users/dto/read.dto'
import { JwtAuthGuard } from './jwt-auth.guard'

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
  async verify(@Query('userId') userId: string): Promise<ReadUserDto> {
    const user = await this.authService.verify(userId)
    return user
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() validateUserData: RegisterUserDto,
    @Res({ passthrough: true }) response
  ): Promise<ReadUserDto> {
    const user = await this.authService.validateUser(validateUserData)
    const token = this.authService.getJwtToken(user.id)
    response.setHeader('Set-Cookie', token)
    return user
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() request, @Res({ passthrough: true }) response) {
    let token = this.authService.getCookieForLogOut()
    response.setHeader('Set-Cookie', token)
    return request.user
  }
}
