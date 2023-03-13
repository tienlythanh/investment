import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { TokenEntity } from './token.entity'

@Injectable()
export class TokenService {
  constructor(private prisma: PrismaService) {}

  async create(tokenEntity: TokenEntity): Promise<TokenEntity> {
    let token = await this.prisma.token.create({ data: tokenEntity })
    return token
  }

  async findByJti(tokenEntity: TokenEntity): Promise<TokenEntity> {
    let token = await this.prisma.token.findFirst({
      where: { jti: tokenEntity.jti },
    })
    return token
  }

  async findManyByUserId(tokenEntity: TokenEntity): Promise<TokenEntity[]> {
    let tokens = await this.prisma.token.findMany({
      where: {
        userId: tokenEntity.userId,
      },
    })
    return tokens
  }

  async deleteById(tokenEntity: TokenEntity): Promise<TokenEntity> {
    let token = await this.prisma.token.delete({ where: { id: tokenEntity.id } })
    return token
  }

  async deleteManyByUserIdWithoutJti(tokenEntity: TokenEntity): Promise<any> {
    let tokens = await this.prisma.token.deleteMany({
      where: {
        userId: tokenEntity.userId,
        jti: {
          not: tokenEntity.jti,
        },
      },
    })
    return tokens
  }

  async deleteManyByUserIdAndJti(tokenEntity: TokenEntity, jtiArray: string[]): Promise<any> {
    let tokens = await this.prisma.token.deleteMany({
      where: {
        userId: tokenEntity.userId,
        jti: {
          in: jtiArray,
        },
      },
    })
    return tokens
  }
  async updateByJti(tokenEntity: TokenEntity, updateData: object) {
    let token = await this.prisma.token.update({
      where: {
        jti: tokenEntity.jti,
      },
      data: updateData,
    })
    return token
  }
}
