import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { UsersService } from "../users/users.service";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private readonly userService;
    private jwtService;
    private configService;
    constructor(userService: UsersService, jwtService: JwtService, configService: ConfigService);
    private generateToken;
    register(dto: RegisterDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            fullname: string;
            role: string;
            createAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            fullname: string;
            role: string;
            createAt: Date;
            refreshToken: string | null;
        };
    }>;
    refresh(userId: number, rawRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logOut(userId: number): Promise<{
        message: string;
    }>;
}
