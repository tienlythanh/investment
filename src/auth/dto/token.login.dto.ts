import { IsString, IsNotEmpty } from 'class-validator'

export class TokenLoginDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string

  @IsString()
  @IsNotEmpty()
  refreshToken: string
}
