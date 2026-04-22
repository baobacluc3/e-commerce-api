import { Order } from 'src/orders/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  txnRef: string; // mã giao dịch của mình tự tạo

  @Column('decimal', { precision: 12, scale: 0 })
  amount: number;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'SUCCESS' | 'FAILED';

  @Column({ nullable: true })
  vnpayTransactionId: string; // mã GD từ VNPay trả về

  @Column({ nullable: true })
  bankCode: string;

  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;

  @CreateDateColumn()
  createdAt: Date;
}
