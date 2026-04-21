import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { emit, ref, resourceUsage } from 'process';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async generateToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
  async register(dto: RegisterDto) {
    const user = await this.userService.createUser(dto);

    // Lưu refresh token vào DB ngay khi register
    const token = await this.generateToken(user.id, user.email);
    await this.userService.updateRefreshToken(user.id, token.refreshToken);
    const { password, refreshToken, ...result } = user;
    return {
      message: 'dang ki thanh cong',
      user: result,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('email hoac mat khau ko dung');
    }
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const tokens = await this.generateToken(user.id, user.email);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    const { password, ...result } = user;
    return {
      message: 'dang nhap thanh cong',
      user: result,
    };
  }

  async refresh(userId: number, rawRefreshToken: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('truy cap bi tu choi');
    }
    const tokenMatch = await bcrypt.compare(rawRefreshToken, user.refreshToken);
    if (!tokenMatch) throw new ForbiddenException('refresh token k hop le');
    const tokens = await this.generateToken(user.id, user.email);
    this.userService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logOut(userId: number) {
    await this.userService.updateRefreshToken(userId, null);
    return { message: 'dang xuat thanh cong' };
  }
}
