import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PaymentsService } from './payments.service';
import { User } from 'src/users/user.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Body('orderId') orderId: string,
    @CurrentUser() user: User,
    @Req() req: Request,
  ) {
    const ipAddr =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const paymentUrl = await this.paymentsService.createPaymentUrl(
      orderId,
      user.id,
      ipAddr,
    );
    return { paymentUrl };
  }

  // VNPay gọi endpoint này server-to-server (không cần auth)
  @Get('ipn')
  async handleIpn(@Query() query: Record<string, string>) {
    return this.paymentsService.handleIpn(query);
  }

  // User bị redirect về đây sau khi thanh toán xong
  @Get('return')
  async handleReturn(@Query() query: Record<string, string>) {
    return this.paymentsService.handleReturn(query);
  }
}
