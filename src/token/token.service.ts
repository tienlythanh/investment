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

  async findByJtiAndId(tokenEntity: TokenEntity): Promise<TokenEntity> {
    let token = await this.prisma.token.findFirst({
      where: { jti: tokenEntity.jti, userId: tokenEntity.userId },
    })
    return token
  }

  async deleteById(tokenEntity: TokenEntity): Promise<TokenEntity> {
    let token = await this.prisma.token.delete({ where: { id: tokenEntity.id } })
    return token
  }
}
