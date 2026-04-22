export const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE,
  hashSecret: process.env.VNPAY_HASH_SECRET,
  url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: process.env.VNPAY_RETURN_URL, // http://localhost:3000/payments/return
  ipnUrl: process.env.VNPAY_IPN_URL, // URL public để VNPay gọi về
};
