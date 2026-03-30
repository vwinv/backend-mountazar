import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

/**
 * Paiement mobile via **Samir Pay** (collection Postman « SAMIR API CALL PARTNERS »).
 * - Init : POST /samirpays/api/tiers/initPayment  body: { amount, orderId }
 * - En-têtes : X-API-KEY, X-SECRET-KEY
 *
 * Variables d'env :
 * - SAMIR_PAY_BASE_URL (défaut https://sandbox.samirpay.com)
 * - SAMIR_PAY_API_KEY
 * - SAMIR_PAY_SECRET_KEY
 */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor(private readonly prisma: PrismaService) {
    this.baseUrl = (process.env.SAMIR_PAY_BASE_URL || 'https://sandbox.samirpay.com').replace(
      /\/$/,
      '',
    );
    this.apiKey = process.env.SAMIR_PAY_API_KEY || '';
    this.secretKey = process.env.SAMIR_PAY_SECRET_KEY || '';
  }

  async payWithWaveSN(createPaymentDto: CreatePaymentDto) {
    return this.initSamirPayment(createPaymentDto, 'WAVE');
  }

  async payWithOrangeMoneySN(createPaymentDto: CreatePaymentDto) {
    return this.initSamirPayment(createPaymentDto, 'ORANGE_MONEY');
  }

  /**
   * Webhook / retour Samir Pay : format exact à confirmer avec leur support.
   * On met à jour le paiement si on retrouve transactionId ou orderId (réf. envoyée à l'init).
   */
  async handleCallback(payload: any) {
    this.logger.log('Callback Samir Pay reçu:', JSON.stringify(payload, null, 2));

    const transactionId =
      payload.transactionId ??
      payload.transaction_id ??
      payload.id ??
      payload.data?.transactionId ??
      payload.data?.id;
    const orderRef =
      payload.orderId ??
      payload.order_id ??
      payload.externalOrderId ??
      payload.data?.orderId;
    const statusRaw = String(
      payload.status ?? payload.transactionStatus ?? payload.data?.status ?? '',
    ).toUpperCase();

    if (!transactionId && !orderRef) {
      this.logger.warn('Callback Samir Pay : aucun transactionId / orderId exploitable');
      return { success: false, message: 'Payload incomplet' };
    }

    let payment = null as any;
    if (transactionId) {
      payment = await (this.prisma as any).payment.findFirst({
        where: { transactionId: String(transactionId) },
        include: {
          invoice: {
            include: {
              order: { include: { quote: true } },
            },
          },
        },
      });
    }
    if (!payment && orderRef) {
      const ref = String(orderRef);
      payment = await (this.prisma as any).payment.findFirst({
        where: { invoiceData: { contains: ref } },
        include: {
          invoice: {
            include: {
              order: { include: { quote: true } },
            },
          },
        },
      });
    }

    if (!payment || !payment.invoice) {
      this.logger.error(
        `Paiement introuvable (transactionId=${transactionId}, orderRef=${orderRef})`,
      );
      return { success: false };
    }

    const ok =
      statusRaw === 'SUCCESS' ||
      statusRaw === 'COMPLETED' ||
      statusRaw === 'PAID' ||
      statusRaw === '00' ||
      payload.success === true ||
      payload.data?.status === 'SUCCESS';

    const failed =
      statusRaw === 'FAILED' ||
      statusRaw === 'CANCELLED' ||
      statusRaw === 'ERROR' ||
      payload.success === false;

    const isSuccess = ok && !failed;

    let prevMeta: Record<string, unknown> = {};
    try {
      const raw = payment.invoiceData;
      if (typeof raw === 'string' && raw.trim().startsWith('{')) {
        prevMeta = JSON.parse(raw) as Record<string, unknown>;
      } else if (raw) {
        prevMeta = { previousInvoiceData: raw };
      }
    } catch {
      prevMeta = {};
    }

    await (this.prisma as any).payment.update({
      where: { id: payment.id },
      data: {
        status: isSuccess ? 'COMPLETED' : failed ? 'FAILED' : payment.status,
        paidAt: isSuccess ? new Date() : payment.paidAt,
        invoiceData: JSON.stringify({ ...prevMeta, lastCallback: payload }),
      },
    });

    const invoice = payment.invoice as any;
    const order = invoice.order as any;

    if (order && isSuccess) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'PROCESSING' as any },
      });

      if (order.quote) {
        await (this.prisma as any).quote.update({
          where: { id: order.quote.id },
          data: { status: 'PAID' },
        });
      }
    }

    return { success: true };
  }

  private async initSamirPayment(
    createPaymentDto: CreatePaymentDto,
    method: 'WAVE' | 'ORANGE_MONEY',
  ) {
    if (!this.apiKey || !this.secretKey) {
      throw new BadRequestException(
        'Paiement Samir Pay non configuré (SAMIR_PAY_API_KEY / SAMIR_PAY_SECRET_KEY).',
      );
    }

    const { orderId, phoneNumber, fullName, email } = createPaymentDto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: true } },
        shippingAddress: true,
        invoice: true,
      },
    });

    if (!order) {
      throw new BadRequestException(`Commande avec l'ID ${orderId} introuvable`);
    }

    let invoice = order.invoice as any | null;
    if (!invoice) {
      const invoiceNumber = `INV-${Date.now()}-${order.id}`;
      const subtotal = Number(order.total);
      const total = subtotal;

      invoice = await (this.prisma as any).invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          subtotal,
          tax: 0,
          shipping: 0,
          discount: 0,
          total,
        },
      });
    }

    const amount = Math.round(Number(invoice.total));
    const customerName = fullName || `${order.user.firstName} ${order.user.lastName}`;
    const customerEmail = email || order.user.email || '';
    const customerPhone = this.normalizePhone(phoneNumber || order.user.phone || '');

    const samirOrderId = `MOUNT-${order.id}-${invoice.id}-${method}-${Date.now()}`;

    // Doc Postman : uniquement amount + orderId. La méthode (Wave / OM) est encodée dans orderId pour suivi interne.
    const body: Record<string, string> = {
      amount: String(amount),
      orderId: samirOrderId,
    };

    const url = `${this.baseUrl}/samirpays/api/tiers/initPayment`;
    this.logger.log(`Samir Pay initPayment → ${url} orderId=${samirOrderId} amount=${amount} method=${method}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
        'X-SECRET-KEY': this.secretKey,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      this.logger.error(`Samir Pay réponse non-JSON (${response.status}):`, text);
      throw new BadRequestException(
        `Réponse Samir Pay invalide (${response.status} ${response.statusText})`,
      );
    }

    if (!response.ok) {
      this.logger.error(`Samir Pay HTTP ${response.status}:`, text);
      const msg =
        data.message ||
        data.msg ||
        data.error ||
        data.description ||
        `Erreur Samir Pay (${response.status})`;
      throw new BadRequestException(String(msg));
    }

    this.logger.log('Samir Pay réponse:', JSON.stringify(data, null, 2));

    const transactionId =
      data.transactionId ??
      data.transaction_id ??
      data.id ??
      data.data?.transactionId ??
      data.data?.id ??
      null;

    const redirectUrl = this.extractPaymentUrl(data);

    const explicitFail = data.error === true || data.success === false;
    const success = !explicitFail;

    const meta = {
      provider: 'samir_pay',
      samirOrderId,
      customerName,
      customerEmail,
      method,
      raw: data,
    };

    await this.upsertPayment(
      invoice.id,
      amount,
      method,
      transactionId ? String(transactionId) : samirOrderId,
      meta,
    );

    if (!success && !redirectUrl) {
      const message =
        data.message ||
        data.msg ||
        data.description ||
        data.error ||
        'Erreur lors de l’initiation du paiement Samir Pay';
      throw new BadRequestException(String(message));
    }

    return {
      success: true,
      url: redirectUrl,
      message:
        data.message ||
        data.msg ||
        data.description ||
        'Paiement initié. Suivez les instructions sur le lien ou l’application.',
    };
  }

  private extractPaymentUrl(data: any): string | null {
    const candidates = [
      data.paymentUrl,
      data.payment_url,
      data.url,
      data.link,
      data.redirectUrl,
      data.redirect_url,
      data.checkoutUrl,
      data.qrCodeUrl,
      data.qr_code_url,
      data.data?.paymentUrl,
      data.data?.payment_url,
      data.data?.url,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.startsWith('http')) return c;
    }
    return null;
  }

  private async upsertPayment(
    invoiceId: number,
    amount: number,
    method: 'WAVE' | 'ORANGE_MONEY',
    transactionId: string | null,
    meta: Record<string, unknown>,
  ) {
    const existing = await (this.prisma as any).payment.findUnique({
      where: { invoiceId },
    });

    const base = {
      amount,
      method,
      status: 'PENDING',
      transactionId,
      invoiceData: JSON.stringify(meta),
    };

    if (existing) {
      await (this.prisma as any).payment.update({
        where: { id: existing.id },
        data: base,
      });
    } else {
      await (this.prisma as any).payment.create({
        data: {
          invoiceId,
          ...base,
        },
      });
    }
  }

  private normalizePhone(phone: string): string {
    if (!phone) return phone;
    let p = phone.replace(/\s+/g, '');
    if (p.startsWith('00')) p = p.slice(2);
    if (p.startsWith('+')) p = p.slice(1);
    if (p.startsWith('7') && p.length === 9) p = `221${p}`;
    return p;
  }
}
