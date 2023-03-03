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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    @InjectMapper() private readonly classMapper: Mapper
  ) {}

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
      console.log(error)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == 'P2002') {
          throw new HttpException('Email exist', HttpStatus.BAD_REQUEST)
        }
      }
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

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
    if (payload.exp * 1000 < Date.now()) {
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

  getJwtToken(id: string, uuid: string) {
    const payload = { userId: id }
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

  async logout(jtiDto: JtiDto): Promise<TokenEntity> {
    let tokenEntity = this.classMapper.map(jtiDto, JtiDto, TokenEntity)
    console.log(tokenEntity)
    tokenEntity = await this.tokenService.findByJtiAndId(tokenEntity)
    console.log(tokenEntity)
    if (!tokenEntity) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }
    return await this.tokenService.deleteById(tokenEntity)
  }
}
