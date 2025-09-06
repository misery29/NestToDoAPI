import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RegisterSchema } from './dto/register.schema';
import { LoginSchema } from './dto/login.schema';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body(new ZodValidationPipe(RegisterSchema)) body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body(new ZodValidationPipe(LoginSchema)) body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const userId = this.authService.verifyRefreshToken(body.refreshToken);
    return this.authService.refreshTokens(userId, body.refreshToken);
  }

  @Post('logout')
  async logout(@Body() body: { userId: string }) {
    // clear stored hashed refresh token
    // implemented in UsersService or directly:
    // await this.userModel.findByIdAndUpdate(body.userId, { currentHashedRefreshToken: null});
    return { ok: true };
  }
}