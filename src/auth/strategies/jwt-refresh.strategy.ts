import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { raw, Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_REFRESH_SECRET')!,
      passReqToCallback: true, //Cho phép lấy req trong validate()
    });
  }

  validate(req: Request, payload: { sub: string; email: string }) {
    const rawToken = req.get('Authorization')?.replace('Bearer ', '');
    if (!rawToken) throw new ForbiddenException();
    return { ...payload, refreshToken: rawToken };
    /*
    req.user = {
    sub,
    email,
    refreshToken
    }
  */
  }
}
