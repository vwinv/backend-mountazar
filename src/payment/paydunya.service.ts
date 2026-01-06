import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PayDunyaService {
  private readonly logger = new Logger(PayDunyaService.name);
  private readonly apiBaseUrl: string;
  private readonly masterKey: string;
  private readonly privateKey: string;
  private readonly token: string;

  constructor(
    private readonly prisma: PrismaService,
  ) {
    // Utiliser les variables d'environnement pour les clés PayDunya
    this.apiBaseUrl = process.env.PAYDUNYA_API_URL || 'https://app.paydunya.com/api/v1';
    this.masterKey = process.env.PAYDUNYA_MASTER_KEY || '';
    this.privateKey = process.env.PAYDUNYA_PRIVATE_KEY || '';
    this.token = process.env.PAYDUNYA_TOKEN || '';
  }

  /**
   * Crée un checkout invoice PayDunya
   */
  async createCheckoutInvoice(orderId: number) {
    try {
      // Récupérer la commande avec tous les détails
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
          invoice: true,
        },
      });

      if (!order) {
        throw new BadRequestException(`Commande avec l'ID ${orderId} introuvable`);
      }

      // Créer ou récupérer la facture
      let invoice = order.invoice;
      if (!invoice) {
        // Générer un numéro de facture unique
        const invoiceNumber = `INV-${Date.now()}-${orderId}`;

        // Calculer les totaux (sans TVA)
        const subtotal = Number(order.total);
        const total = subtotal; // Pas de TVA

        invoice = await this.prisma.invoice.create({
          data: {
            invoiceNumber,
            orderId: order.id,
            subtotal,
            tax: 0, // Pas de TVA
            shipping: 0,
            discount: 0,
            total,
          },
        });
      }

      // Construire les items pour PayDunya
      const items: any = {};
      order.items.forEach((item, index) => {
        items[`item_${index}`] = {
          name: item.product.name,
          quantity: item.quantity,
          unit_price: String(Number(item.price)),
          total_price: String(Number(item.price) * item.quantity),
          description: item.product.description || '',
        };
      });

      // Construire le payload pour PayDunya (sans taxes)
      const payload = {
        invoice: {
          items,
          taxes: {}, // Pas de taxes
          total_amount: Math.round(Number(invoice.total)),
          description: `Commande #${order.id}`,
        },
        store: {
          name: process.env.STORE_NAME || 'Almadina',
          tagline: '',
          postal_address: '',
          phone: '',
          logo_url: '',
          website_url: '',
        },
        custom_data: {
          order_id: order.id,
          invoice_id: invoice.id,
        },
        actions: {
          callback_url: `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/payments/callback`,
        },
      };

      // Appel API PayDunya pour créer le checkout invoice
      const response = await fetch(`${this.apiBaseUrl}/checkout-invoice/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PAYDUNYA-MASTER-KEY': this.masterKey,
          'PAYDUNYA-PRIVATE-KEY': this.privateKey,
          'PAYDUNYA-TOKEN': this.token,
        },
        body: JSON.stringify(payload),
      });

      // Vérifier le statut HTTP
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Erreur HTTP checkout invoice (${response.status}):`, errorText);
        throw new BadRequestException(`Erreur API PayDunya: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Logger la réponse pour debug
      this.logger.log('Réponse checkout invoice:', JSON.stringify(data, null, 2));

      if (data.response_code !== '00') {
        const errorMessage = data.response_text || 'Erreur inconnue lors de la création de la facture';
        this.logger.error('Erreur checkout invoice:', errorMessage);
        throw new BadRequestException(`Erreur PayDunya: ${errorMessage}`);
      }

      // Extraire le token de paiement
      const paymentToken = data.token;

      // Créer ou mettre à jour le paiement
      const payment = await this.prisma.payment.upsert({
        where: { invoiceId: invoice.id },
        create: {
          invoiceId: invoice.id,
          amount: invoice.total,
          method: 'OTHER',
          status: 'PENDING',
          transactionId: paymentToken,
        },
        update: {
          transactionId: paymentToken,
        },
      });

      return {
        paymentToken,
        checkoutUrl: data.response_text,
        invoice,
        payment,
      };
    } catch (error) {
      this.logger.error('Erreur lors de la création du checkout invoice:', error);
      throw error;
    }
  }

  /**
   * Effectue un paiement via Wave Sénégal (avec QR code)
   */
  async payWithWaveSN(createPaymentDto: CreatePaymentDto) {
    const { orderId, phoneNumber, fullName, email } = createPaymentDto;

    // Créer le checkout invoice
    const { paymentToken } = await this.createCheckoutInvoice(orderId);

    // Récupérer les infos du client si non fournies
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new BadRequestException(`Commande avec l'ID ${orderId} introuvable`);
    }

    const customerName = fullName || `${order.user.firstName} ${order.user.lastName}`;
    const customerEmail = email || order.user.email || '';

    // S'assurer que le numéro de téléphone est bien formaté (sans espaces)
    // Pour Wave Sénégal, le numéro doit être au format: +221XXXXXXXXX (avec indicatif et +)
    let cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');

    // Si le numéro ne commence pas par +221 ou 221, l'ajouter
    if (!cleanPhoneNumber.startsWith('+221') && !cleanPhoneNumber.startsWith('221')) {
      // Retirer d'abord l'indicatif s'il existe
      cleanPhoneNumber = cleanPhoneNumber.replace(/^(\+?221)/, '');
      // Ajouter l'indicatif +221
      cleanPhoneNumber = `+221${cleanPhoneNumber}`;
    } else if (cleanPhoneNumber.startsWith('221') && !cleanPhoneNumber.startsWith('+221')) {
      // Ajouter le + si absent mais que 221 est présent
      cleanPhoneNumber = `+${cleanPhoneNumber}`;
    }

    // Préparer le payload pour Wave Sénégal
    const payload = {
      wave_senegal_fullName: customerName,
      wave_senegal_email: customerEmail || '',
      wave_senegal_phone: cleanPhoneNumber,
      wave_senegal_payment_token: paymentToken
    };

    // Logger la requête pour debug
    this.logger.log('Requête Wave SN:', JSON.stringify(payload, null, 2));

    // Appel API PayDunya pour Wave Sénégal
    const response = await fetch(`${this.apiBaseUrl}/softpay/wave-senegal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': this.masterKey,
        'PAYDUNYA-PRIVATE-KEY': this.privateKey,
        'PAYDUNYA-TOKEN': this.token,
      },
      body: JSON.stringify(payload),
    });

    // Vérifier le statut HTTP
    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Erreur HTTP Wave SN (${response.status}):`, errorText);
      throw new BadRequestException(`Erreur API PayDunya: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Logger la réponse pour debug
    this.logger.log('Réponse Wave SN complète:', JSON.stringify(data, null, 2));

    if (!data.success) {
      const errorMessage = data.message || data.response_text || 'Erreur lors du paiement Wave Sénégal';
      this.logger.error('Erreur Wave SN:', errorMessage);
      throw new BadRequestException(errorMessage);
    }

    // Mettre à jour le paiement
    await this.updatePaymentMethod(orderId, 'WAVE_SN');

    // Extraire l'URL du QR code depuis différents champs possibles
    const qrCodeUrl = data.url ||
      data.qr_code_url ||
      data.qr_code ||
      data.response_text ||
      data.checkout_url ||
      data.checkout_invoice_url ||
      (data.response && data.response.url) ||
      null;

    this.logger.log('URL QR Code extraite:', qrCodeUrl);

    // Retourner la réponse avec l'URL du QR code si disponible
    return {
      success: data.success,
      message: data.message || 'Paiement initié avec succès',
      url: qrCodeUrl,
      ...data
    };
  }

  /**
   * Effectue un paiement via Orange Money Sénégal (avec QR code)
   */
  async payWithOrangeMoneySN(createPaymentDto: CreatePaymentDto) {
    const { orderId, phoneNumber, fullName, email } = createPaymentDto;

    // Créer le checkout invoice
    const { paymentToken } = await this.createCheckoutInvoice(orderId);

    // Récupérer les infos du client si non fournies
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new BadRequestException(`Commande avec l'ID ${orderId} introuvable`);
    }

    const customerName = fullName || `${order.user.firstName} ${order.user.lastName}`;
    const customerEmail = email || order.user.email || '';

    // Formater le numéro de téléphone pour Orange Money Sénégal
    // Orange Money Sénégal accepte le format avec ou sans indicatif
    let cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');

    // Si le numéro commence par +221, retirer le + pour Orange Money
    if (cleanPhoneNumber.startsWith('+221')) {
      cleanPhoneNumber = cleanPhoneNumber.substring(1); // Retirer le +
    } else if (!cleanPhoneNumber.startsWith('221')) {
      // Si pas d'indicatif, ajouter 221
      cleanPhoneNumber = `221${cleanPhoneNumber}`;
    }

    // Préparer le payload pour Orange Money Sénégal selon la documentation
    const payload = {
      customer_name: customerName,
      customer_email: customerEmail,
      phone_number: cleanPhoneNumber,
      invoice_token: paymentToken,
    };

    // Logger la requête pour debug
    this.logger.log('Requête Orange Money SN:', JSON.stringify(payload, null, 2));

    // Appel API PayDunya pour Orange Money Sénégal
    const response = await fetch(`${this.apiBaseUrl}/softpay/orange-money-senegal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': this.masterKey,
        'PAYDUNYA-PRIVATE-KEY': this.privateKey,
        'PAYDUNYA-TOKEN': this.token,
      },
      body: JSON.stringify(payload),
    });

    // Vérifier le statut HTTP
    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Erreur HTTP Orange Money SN (${response.status}):`, errorText);
      throw new BadRequestException(`Erreur API PayDunya: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Logger la réponse pour debug
    this.logger.log('Réponse Orange Money SN complète:', JSON.stringify(data, null, 2));

    if (!data.success) {
      const errorMessage = data.message || data.response_text || 'Erreur lors du paiement Orange Money Sénégal';
      this.logger.error('Erreur Orange Money SN:', errorMessage);
      throw new BadRequestException(errorMessage);
    }

    // Mettre à jour le paiement
    await this.updatePaymentMethod(orderId, 'ORANGE_MONEY_SN');

    // Extraire maxit_url de other_url pour le QR code
    let qrCodeUrl = null;
    if (data.other_url && data.other_url.maxit_url) {
      qrCodeUrl = data.other_url.maxit_url;
      this.logger.log('URL maxit_url extraite pour QR code:', qrCodeUrl);
    } else {
      // Fallback sur les autres champs possibles
      qrCodeUrl = data.url ||
        data.qr_code_url ||
        data.qr_code ||
        data.response_text ||
        data.checkout_url ||
        data.checkout_invoice_url ||
        (data.response && data.response.url) ||
        null;
    }

    // Retourner la réponse avec l'URL du QR code
    return {
      success: data.success,
      message: data.message || 'Paiement initié avec succès',
      url: qrCodeUrl,
      ...data
    };
  }

  /**
   * Met à jour la méthode de paiement dans la base de données
   */
  private async updatePaymentMethod(orderId: number, method: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { invoice: { include: { payment: true } } },
    });

    if (order?.invoice?.payment) {
      await this.prisma.payment.update({
        where: { id: order.invoice.payment.id },
        data: {
          method: method as any,
        },
      });
    }
  }

  /**
   * Callback pour les notifications PayDunya
   */
  async handleCallback(data: any) {
    this.logger.log('Callback PayDunya reçu:', JSON.stringify(data, null, 2));

    try {
      // PayDunya envoie le token dans différents champs possibles
      const transactionToken = data.token || data.invoice_token || data.payment_token;

      if (!transactionToken) {
        this.logger.error('Token manquant dans le callback PayDunya');
        return { success: false, message: 'Token manquant' };
      }

      // Vérifier le statut du paiement
      // PayDunya peut envoyer 'completed', 'success', ou response_code === '00'
      const isCompleted =
        data.status === 'completed' ||
        data.status === 'success' ||
        data.response_code === '00' ||
        (data.response && data.response.status === 'completed');

      if (isCompleted) {
        // Mettre à jour le paiement dans la base de données
        const payment = await this.prisma.payment.findUnique({
          where: { transactionId: transactionToken },
          include: { invoice: { include: { order: true } } },
        });

        if (payment) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              paidAt: new Date(),
            },
          });

          // Mettre à jour le statut de la commande
          await this.prisma.order.update({
            where: { id: payment.invoice.orderId },
            data: { status: 'PROCESSING' },
          });

          this.logger.log(`Paiement ${transactionToken} marqué comme complété`);
        } else {
          this.logger.warn(`Paiement avec token ${transactionToken} non trouvé en base de données`);
        }
      } else {
        this.logger.log(`Paiement ${transactionToken} en attente (status: ${data.status})`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Erreur lors du traitement du callback PayDunya:', error);
      throw error;
    }
  }
}

