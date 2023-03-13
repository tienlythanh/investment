import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { RegisterUserDto } from '../users/dto/register.dto'
import { ReadUserDto } from '../users/dto/read.dto'
import { Prisma } from '@prisma/client'
import { Mapper } from '@automapper/core'
import { InjectMapper } from '@automapper/nestjs'
import { UserEntity } from '../users/users.entity'
import { sentVerifyEmail } from './utils/email'
import { VerifyTokenDto } from '../users/dto/verifyToken.dto'
import { LoginUserDto } from 'src/users/dto/login.dto'
import { TokenService } from '../token/token.service'
import { TokenEntity } from 'src/token/token.entity'
import { TokenLoginDto } from './dto/token.login.dto'
import { randomUUID } from 'crypto'
import { JtiDto } from '../token/dto/jti.dto'
import { TokenPayloadDto } from 'src/token/dto/payload.token.dto'
import { TokenDto } from 'src/token/dto/token.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    @InjectMapper() private readonly classMapper: Mapper
  ) {}

  /*
   * * Register new account
   */
  async register(registration: RegisterUserDto): Promise<ReadUserDto> {
    registration.password = await bcrypt.hash(registration.password, 10)

    let userInfo = this.classMapper.map(registration, RegisterUserDto, UserEntity)
    userInfo.createdAt = Date.now().toString()

    try {
      const user = await this.usersService.create(userInfo)
      user.verifyToken = this.jwtService.sign(
        { id: user.id, createdAt: user.createdAt },
        { secret: process.env.JWT_SECRET_KEY, expiresIn: process.env.JWT_EXPIRED_TIME }
      )
      await this.usersService.updateById(user, { verifyToken: user.verifyToken })
      sentVerifyEmail(userInfo.email, user.verifyToken)

      return this.classMapper.map(user, UserEntity, ReadUserDto)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == 'P2002') {
          throw new HttpException('Email exist', HttpStatus.BAD_REQUEST)
        }
      }
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /*
   * * Verify email of new account
   */
  async verify(tokenQuery: VerifyTokenDto): Promise<ReadUserDto> {
    const token = tokenQuery.token
    let userEntity = this.classMapper.map(tokenQuery, VerifyTokenDto, UserEntity)
    let user = await this.usersService.findByToken(userEntity)

    /* Not found user with token */
    if (!user) {
      throw new HttpException("Verify token doesn't exist", HttpStatus.UNAUTHORIZED)
    }

    try {
      var payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET_KEY })
    } catch (error) {
      throw error
    }

    /* Case 1: Token expired */
    if (this.isTokenExpired(payload)) {
      /* Delete user info if user don't active */
      if (!user.isActive) {
        await this.usersService.deleteById(user)
      }
      throw new HttpException('Verify token expired', HttpStatus.UNAUTHORIZED)
    }

    /* Case 2: Token doesn't expire */
    if (!user.isActive) {
      user = await this.usersService.updateById(user, {
        verifiedAt: Date.now().toString(),
        isActive: true,
      })
    }
    return this.classMapper.map(user, UserEntity, ReadUserDto)
  }

  /*
   * * Login user
   */
  async validateUser(validateUserData: LoginUserDto): Promise<TokenLoginDto> {
    const userEntity = this.classMapper.map(validateUserData, LoginUserDto, UserEntity)
    const user = await this.usersService.findByEmail(userEntity)
    if (!user) {
      throw new HttpException('Email not exist', HttpStatus.UNAUTHORIZED)
    }

    if (!user.isActive) {
      throw new HttpException(
        'Account not verify, verify your email before login',
        HttpStatus.UNAUTHORIZED
      )
    }

    let isMatch = await bcrypt.compare(validateUserData.password, user.hash)
    if (isMatch) {
      let jti = randomUUID()
      const token = this.getJwtToken(user.id, jti)
      const { iat, exp } = this.jwtService.verify(token.refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET_KEY,
      })

      let tokenEntity = new TokenEntity(
        user.id,
        jti,
        (iat * 1000).toString(),
        (exp * 1000).toString()
      )

      await this.tokenService.create(tokenEntity)
      return token
    }
    throw new HttpException('Password not match', HttpStatus.UNAUTHORIZED)
  }

  /*
   * * Logout user
   */
  async logout(jtiDto: JtiDto): Promise<TokenDto> {
    let tokenEntity = this.classMapper.map(jtiDto, JtiDto, TokenEntity)
    tokenEntity = await this.tokenService.findByJti(tokenEntity)

    if (!tokenEntity) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }
    tokenEntity = await this.tokenService.deleteById(tokenEntity)
    return this.classMapper.map(tokenEntity, TokenEntity, TokenDto)
  }

  /*
   * * Refresh new access token for user
   */
  async refreshAccessToken(tokenPayload: TokenPayloadDto): Promise<TokenLoginDto> {
    let tokenEntity = this.classMapper.map(tokenPayload, TokenPayloadDto, TokenEntity)
    let deviceToken: TokenEntity = await this.tokenService.findByJti(tokenEntity)

    if (!deviceToken) {
      throw new HttpException('Refresh token not valid', HttpStatus.UNAUTHORIZED)
    }

    let jti = randomUUID()
    let token = this.getJwtToken(deviceToken.userId, jti)

    const { iat, exp } = this.jwtService.verify(token.refreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET_KEY,
    })

    tokenEntity = await this.tokenService.updateByJti(deviceToken, {
      createdAt: (iat * 1000).toString(),
      expiredAt: (exp * 1000).toString(),
      jti: jti,
    })

    return token
  }

  /*
   * * Revoke one or more device of user
   */
  async revokeDevices(tokenPayload: TokenPayloadDto, jtiDtoArr: JtiDto[]): Promise<any> {
    let tokenEntity = this.classMapper.map(tokenPayload, TokenPayloadDto, TokenEntity)
    const userDevices = await this.tokenService.findManyByUserId(tokenEntity)
    const userDeviceJtis = userDevices.map((device) => {
      return device.jti
    })
    const revokeJtis = []
    jtiDtoArr.forEach((jtiDto) => {
      if (userDeviceJtis.includes(jtiDto.jti)) {
        revokeJtis.push(jtiDto.jti)
      }
    })

    return await this.tokenService.deleteManyByUserIdAndJti(tokenEntity, revokeJtis)
  }

  /*
   * * Revoke all devices of user except device that takes this action
   */
  async revokeAllDevice(tokenPayload: TokenPayloadDto): Promise<any> {
    let tokenEntity = this.classMapper.map(tokenPayload, TokenPayloadDto, TokenEntity)
    return await this.tokenService.deleteManyByUserIdWithoutJti(tokenEntity)
  }

  getJwtToken(userId: string, uuid: string) {
    const payload = { userId: userId }
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET_KEY,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRED_TIME,
      jwtid: uuid,
    })
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET_KEY,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRED_TIME,
      jwtid: uuid,
    })
    return { accessToken, refreshToken }
  }

  isTokenExpired(payload: TokenPayloadDto): boolean {
    if (1000 * parseInt(payload.exp) < Date.now()) {
      return true
    }
    return false
  }
}
