import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET')!, // Dấu ! khẳng định nó không undefined
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.userService.findById(Number(payload.sub));
    if (!user) throw new UnauthorizedException();
    return user; // cho qua va gan vao req.user
  }
}
