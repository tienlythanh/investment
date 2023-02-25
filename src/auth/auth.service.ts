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
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectMapper() private readonly classMapper: Mapper
  ) {}

  async register(registration: RegisterUserDto): Promise<ReadUserDto> {
    registration.password = await bcrypt.hash(registration.password, 10)

    let userInfo = this.classMapper.map(registration, RegisterUserDto, UserEntity)
    userInfo.createdAt = Date.now().toString()
    userInfo.isActive = false

    try {
      const user = await this.usersService.create(userInfo)
      user.verifyToken = this.jwtService.sign({ id: user.id, createdAt: user.createdAt })
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

  async verify(tokenQuery: VerifyTokenDto): Promise<ReadUserDto | any> {
    const token = tokenQuery.token
    let userEntity = this.classMapper.map(tokenQuery, VerifyTokenDto, UserEntity)
    try {
      /* Case 1: JWT verify token does not expire */
      let payload = this.jwtService.verify(token)
      let user = await this.usersService.findByToken(userEntity)

      /* If account does not active */
      if (!user.isActive) {
        user = await this.usersService.updateById(user, {
          verifiedAt: Date.now().toString(),
          isActive: true,
        })
      }

      return this.classMapper.map(user, UserEntity, ReadUserDto)
    } catch (error) {
      /* Case 2: If JWT verify token expired */
      let user = await this.usersService.findByToken(userEntity)

      /* Can't find account with token */
      if (!user) {
        throw new HttpException('Token does not exist', HttpStatus.UNAUTHORIZED)
      }

      /* Exist account match token but this account didn't verify */
      if (!user.isActive) {
        await this.usersService.deleteById(user)
      }

      /* Exist account match token and this account verified */
      throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED)
    }
  }

  async validateUser(validateUserData: RegisterUserDto): Promise<ReadUserDto> {
    const userEntity = this.classMapper.map(validateUserData, RegisterUserDto, UserEntity)
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
      user.lastLogin = Date.now().toString()
      await this.usersService.updateById(user, { lastLogin: user.lastLogin })
      return this.classMapper.map(user, UserEntity, ReadUserDto)
    }
    throw new HttpException('Password not match', HttpStatus.UNAUTHORIZED)
  }

  getJwtToken(id: string) {
    const payload = { id }
    const token = this.jwtService.sign(payload)
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRED_TIME}`
  }

  getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`
  }
}
