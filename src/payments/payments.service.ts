import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { DataSource, Repository } from 'typeorm';
import { Order } from 'src/orders/order.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { vnpayConfig } from 'src/config/vnpay.config';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  // ─── 1. Tạo payment URL gửi về client ───────────────────────────
  async createPaymentUrl(orderId: string, userId: string, ipAddr: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING')
      throw new BadRequestException('Order already processed');

    const txnRef = `${orderId}-${Date.now()}`; // unique per attempt

    // Lưu payment record trạng thái PENDING
    await this.paymentRepo.save({
      txnRef,
      amount: order.totalAmount,
      status: 'PENDING',
      order,
    });

    return this.buildPaymentUrl(txnRef, order.totalAmount, ipAddr);
  }

  // ─── 2. Build URL theo chuẩn VNPay ──────────────────────────────
  private buildPaymentUrl(
    txnRef: string,
    amount: number,
    ipAddr: string,
  ): string {
    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.tmnCode,
      vnp_Amount: String(amount * 100), // VNPay tính đơn vị x100
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${txnRef}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: vnpayConfig.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: this.getVnpayDate(),
      vnp_Locale: 'vn',
    };

    // Sort key theo alphabet — bắt buộc của VNPay
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (acc, key) => ({ ...acc, [key]: params[key] }),
        {} as Record<string, string>,
      );

    const signData = new URLSearchParams(sortedParams).toString();
    const signature = crypto
      .createHmac('sha512', vnpayConfig.hashSecret)
      .update(signData)
      .digest('hex');

    return `${vnpayConfig.url}?${signData}&vnp_SecureHash=${signature}`;
  }

  // ─── 3. Xử lý IPN (VNPay gọi server-to-server) ──────────────────
  async handleIpn(query: Record<string, string>) {
    const { vnp_SecureHash, ...params } = query;

    // Bước 1: Verify signature
    if (!this.verifySignature(params, vnp_SecureHash)) {
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    const payment = await this.paymentRepo.findOne({
      where: { txnRef: params.vnp_TxnRef },
      relations: ['order'],
    });

    if (!payment) return { RspCode: '01', Message: 'Order not found' };
    if (payment.status !== 'PENDING')
      return { RspCode: '02', Message: 'Order already confirmed' };

    const isSuccess = params.vnp_ResponseCode === '00';

    // Bước 2: Dùng transaction để cập nhật đồng thời payment + order
    await this.dataSource.transaction(async (manager) => {
      await manager.update(Payment, payment.id, {
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        vnpayTransactionId: params.vnp_TransactionNo,
        bankCode: params.vnp_BankCode,
      });

      if (isSuccess) {
        await manager.update(Order, payment.order.id, {
          status: 'CONFIRMED',
        });
      }
    });

    // VNPay yêu cầu phải trả về đúng format này
    return { RspCode: '00', Message: 'Confirm Success' };
  }

  // ─── 4. Xử lý Return URL (redirect từ VNPay về browser) ─────────
  async handleReturn(query: Record<string, string>) {
    const { vnp_SecureHash, ...params } = query;

    if (!this.verifySignature(params, vnp_SecureHash)) {
      throw new BadRequestException('Invalid signature');
    }

    return {
      success: params.vnp_ResponseCode === '00',
      txnRef: params.vnp_TxnRef,
      amount: Number(params.vnp_Amount) / 100,
      bankCode: params.vnp_BankCode,
    };
  }

  // ─── Helper: Verify chữ ký từ VNPay ─────────────────────────────
  private verifySignature(
    params: Record<string, string>,
    receivedHash: string,
  ): boolean {
    const sortedParams = Object.keys(params)
      .filter((k) => k.startsWith('vnp_') && k !== 'vnp_SecureHash')
      .sort()
      .reduce(
        (acc, k) => ({ ...acc, [k]: params[k] }),
        {} as Record<string, string>,
      );

    const signData = new URLSearchParams(sortedParams).toString();
    const expectedHash = crypto
      .createHmac('sha512', vnpayConfig.hashSecret)
      .update(signData)
      .digest('hex');

    return expectedHash === receivedHash;
  }

  private getVnpayDate(): string {
    const now = new Date();
    return now
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);
  }
}
