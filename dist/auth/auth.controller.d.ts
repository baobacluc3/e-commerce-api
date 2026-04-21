import { AuthService } from './auth.service';
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import type { Request as ExpressRequest } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(req: ExpressRequest): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(req: ExpressRequest): Promise<{
        message: string;
    }>;
}
