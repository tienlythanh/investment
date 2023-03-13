import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipeCustom } from './validation.pipe'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipeCustom({ transform: true }))
  app.use(cookieParser())
  await app.listen(3000)
}
bootstrap()
