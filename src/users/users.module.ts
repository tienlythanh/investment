import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { PrismaService } from '../prisma.service'
import { UserProfile } from './profiles/user.profile'

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, UserProfile],
  exports: [UsersService],
})
export class UsersModule {}
