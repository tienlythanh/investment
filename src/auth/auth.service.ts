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
    userInfo.lastLogin = ''

    try {
      const user = this.classMapper.map(
        await this.usersService.create(userInfo),
        UserEntity,
        ReadUserDto
      )
      sentVerifyEmail(userInfo.email, user.id)
      return user
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == 'P2002') {
          throw new HttpException('Email exist', HttpStatus.BAD_REQUEST)
        }
      }
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async verify(userId: string): Promise<ReadUserDto> {
    let user = await this.usersService.findById(userId)

    if (!user) {
      throw new HttpException('Token not exist', HttpStatus.UNAUTHORIZED)
    }

    if (user.isActive) {
      throw new HttpException('Account verified', HttpStatus.BAD_REQUEST)
    }

    const createdAt = parseInt(user.createdAt)
    const verifiedAt = Date.now()
    const VERIFY_EXPIRED_TIME = parseInt(process.env.VERIFY_EXPIRED_TIME)

    if (verifiedAt - createdAt > VERIFY_EXPIRED_TIME) {
      let user = await this.usersService.deleteById(userId)
      throw new HttpException('Token expired, please register again', HttpStatus.UNAUTHORIZED)
    }

    let userUpdated = this.classMapper.map(
      await this.usersService.updateById(userId, { isActive: true }),
      UserEntity,
      ReadUserDto
    )
    return userUpdated
  }

  async validateUser(validateUserData: RegisterUserDto): Promise<ReadUserDto> {
    const user = await this.usersService.findByEmail(validateUserData.email)
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
      await this.usersService.updateById(user.id, { lastLogin: user.lastLogin })
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
