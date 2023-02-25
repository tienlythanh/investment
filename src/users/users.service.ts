import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { Mapper } from '@automapper/core'
import { InjectMapper } from '@automapper/nestjs'
import { UserEntity } from '../users/users.entity'

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @InjectMapper() private readonly classMapper: Mapper
  ) {}

  async create(userEntity: UserEntity): Promise<UserEntity> {
    const user = await this.prisma.user.create({ data: userEntity })
    return user
  }

  async findByEmail(userEntity: UserEntity): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email: userEntity.email } })
      return user
    } catch (error) {
      throw error
    }
  }

  async findById(userEntity: UserEntity): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userEntity.id } })
      return user
    } catch (error) {
      throw error
    }
  }

  async findByToken(userEntity: UserEntity): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { verifyToken: userEntity.verifyToken },
      })
      return user
    } catch (error) {
      throw error
    }
  }

  async deleteById(userEntity: UserEntity): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.delete({ where: { id: userEntity.id } })
      return user
    } catch (error) {
      throw error
    }
  }

  async updateById(userEntity: UserEntity, updateData: object): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.update({ where: { id: userEntity.id }, data: updateData })
      return user
    } catch (error) {
      throw error
    }
  }
}
