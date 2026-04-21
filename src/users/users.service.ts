import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/dto/register.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(userId: number) {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  async createUser(dto: RegisterDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('email da duoc su dung');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      fullname: dto.fullName,
    });
    return this.userRepo.save(user);
  }

  // Lưu hashed refresh token vào DB
  async updateRefreshToken(userId: number, refreshToken: any) {
    const hashed = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.userRepo.update(userId, { refreshToken: hashed });
  }
}
