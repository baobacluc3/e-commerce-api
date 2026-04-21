import { RegisterDto } from "../dto/register.dto";
import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findById(userId: number): Promise<User | null>;
    createUser(dto: RegisterDto): Promise<User>;
    updateRefreshToken(userId: number, refreshToken: any): Promise<void>;
}
