import { config } from '../../config';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

interface WaveCheckoutResponse {
  id: string;
  checkout_status: 'pending' | 'complete' | 'failed' | 'expired';
  wave_launch_url: string;
  amount: string;
  currency: string;
  when_completed?: string;
  when_created: string;
  client_reference: string;
}

interface WavePaymentStatus {
  id: string;
  checkout_status: 'pending' | 'complete' | 'failed' | 'expired';
  amount: string;
  currency: string;
  when_completed?: string;
  receipt_url?: string;
}

interface WaveWebhookPayload {
  type: string;
  data: {
    id: string;
    checkout_status: string;
    amount: string;
    currency: string;
    client_reference: string;
    when_completed?: string;
  };
}

export class WaveService {
  private apiUrl: string;
  private apiKey: string;
  private webhookSecret: string;

  constructor() {
    this.apiUrl = config.WAVE_API_URL;
    this.apiKey = config.WAVE_API_KEY;
    this.webhookSecret = config.WAVE_WEBHOOK_SECRET;
  }

  async initiateCheckout(
    amount: number,
    phone: string,
    reference: string,
    successUrl?: string,
    errorUrl?: string,
  ): Promise<WaveCheckoutResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: 'XOF',
          client_reference: reference,
          success_url: successUrl || `${config.CORS_ORIGINS}/payments/success`,
          error_url: errorUrl || `${config.CORS_ORIGINS}/payments/error`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Wave checkout failed: ${response.status} - ${errorData}`);
      }

      const data = (await response.json()) as WaveCheckoutResponse;
      logger.info('Wave checkout initiated', { reference, amount, checkoutId: data.id });
      return data;
    } catch (error) {
      logger.error('Wave checkout error:', { error: (error as Error).message, reference });
      throw error;
    }
  }

  async checkPaymentStatus(checkoutId: string): Promise<WavePaymentStatus> {
    try {
      const response = await fetch(`${this.apiUrl}/checkout/sessions/${checkoutId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Wave status check failed: ${response.status}`);
      }

      return (await response.json()) as WavePaymentStatus;
    } catch (error) {
      logger.error('Wave status check error:', { error: (error as Error).message, checkoutId });
      throw error;
    }
  }

  processWebhook(payload: WaveWebhookPayload, signature?: string): {
    valid: boolean;
    reference?: string;
    status?: string;
    amount?: number;
    checkoutId?: string;
  } {
    // Verify webhook signature if secret is configured
    if (this.webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== expectedSignature) {
        logger.warn('Wave webhook signature mismatch');
        return { valid: false };
      }
    }

    if (payload.type === 'checkout.session.completed') {
      const { data } = payload;
      logger.info('Wave payment completed', {
        reference: data.client_reference,
        amount: data.amount,
        checkoutId: data.id,
      });

      return {
        valid: true,
        reference: data.client_reference,
        status: data.checkout_status,
        amount: parseFloat(data.amount),
        checkoutId: data.id,
      };
    }

    return { valid: true, reference: payload.data?.client_reference, status: payload.data?.checkout_status };
  }
}

export const waveService = new WaveService();
