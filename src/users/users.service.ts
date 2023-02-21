import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { RegisterUserDto } from './dto/register.dto'
import { Mapper } from '@automapper/core'
import { InjectMapper } from '@automapper/nestjs'
import { UserEntity } from '../users/users.entity'
import { ReadUserDto } from './dto/read.dto'

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @InjectMapper() private readonly classMapper: Mapper
  ) {}

  async create(registration: UserEntity): Promise<UserEntity> {
    const user = await this.prisma.user.create({ data: registration })
    return user
  }

  async findByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } })
      return user
    } catch (error) {
      throw error
    }
  }

  async findById(id: string): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } })
      return user
    } catch (error) {
      throw error
    }
  }

  async deleteById(id: string): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.delete({ where: { id } })
      return user
    } catch (error) {
      throw error
    }
  }

  async updateById(id: string, updateData: object): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.update({ where: { id: id }, data: updateData })
      return user
    } catch (error) {
      throw error
    }
  }
}
