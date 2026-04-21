import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullname: string;

  @Column({ default: 'customer' })
  role: string;

  @CreateDateColumn()
  createAt: Date;

  @Column({ nullable: true })
  refreshToken: string | null;
}
