import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { AutomapperModule } from '@automapper/nestjs'
import { classes } from '@automapper/classes'
import { ConfigModule } from '@nestjs/config'
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TokenModule,
  ],
})
export class AppModule {}
