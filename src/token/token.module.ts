import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { TokenProfile } from './profiles/token.profile'
import { TokenController } from './token.controller'
import { TokenService } from './token.service'

@Module({
  controllers: [TokenController],
  providers: [TokenService, PrismaService, TokenProfile],
  exports: [TokenService],
})
export class TokenModule {}
