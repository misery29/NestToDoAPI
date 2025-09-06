import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { UserDoc } from '../users/users.schema';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private userModel: Model<UserDoc>) {}

  async register({name,email,password}: {name:string,email:string,password:string}){
    const exists = await this.userModel.findOne({email});
    if (exists) throw new Error('email exists');
    const hashed = await bcrypt.hash(password, 12);
    const user = await this.userModel.create({name,email,password:hashed});
    return { id: user._id, name: user.name, email: user.email };
  }

  async validateUser(email:string, plain:string){
    const user = await this.userModel.findOne({email});
    if (!user) return null;
    const ok = await bcrypt.compare(plain, user.password);
    if (!ok) return null;
    return user;
  }

  signTokens(userId: string){
    const payload = { sub: userId };
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: process.env.ACCESS_EXPIRES || '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: process.env.REFRESH_EXPIRES || '7d' });
    return { accessToken, refreshToken };
  }

  async setRefreshTokenHash(userId: string, refreshToken: string){
    const hashed = await bcrypt.hash(refreshToken, 12);
    await this.userModel.findByIdAndUpdate(userId, { currentHashedRefreshToken: hashed });
  }

  async login(email:string, password:string){
    const user = await this.validateUser(email,password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const userIdString = (user._id as any).toString();
    const tokens = this.signTokens(userIdString);
    await this.setRefreshTokenHash(userIdString, tokens.refreshToken);
    return { user: { id: userIdString, name: user.name, email: user.email }, ...tokens };
  }

  async refreshTokens(userId:string, refreshToken:string){
    const user = await this.userModel.findById(userId as string);
    if (!user || !user.currentHashedRefreshToken) throw new UnauthorizedException();
    const isMatch = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);
    if (!isMatch) throw new UnauthorizedException();
    const tokens = this.signTokens(userId as string);
    await this.setRefreshTokenHash(userId, tokens.refreshToken);
    return tokens;
  }

  verifyRefreshToken(token: string){
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
      return decoded.sub as string;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}