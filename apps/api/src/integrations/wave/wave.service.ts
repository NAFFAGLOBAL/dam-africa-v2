import axios, { AxiosInstance } from 'axios';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { BadRequestError } from '../../utils/errors';

interface CheckoutSessionResponse {
  id: string;
  wave_launch_url: string;
  checkout_status: string;
  amount: number;
  currency: string;
}

interface TransactionStatusResponse {
  id: string;
  checkout_status: 'pending' | 'complete' | 'expired' | 'cancelled';
  amount: number;
  currency: string;
  payment_status: 'pending' | 'successful' | 'failed';
  client_reference?: string;
}

interface WaveWebhookPayload {
  id: string;
  type: string;
  checkout_status: string;
  payment_status: string;
  amount: number;
  currency: string;
  client_reference?: string;
  when_completed?: string;
}

export class WavePaymentService {
  private client: AxiosInstance | null = null;

  constructor() {
    if (config.integrations.wave.enabled && config.integrations.wave.apiUrl && config.integrations.wave.apiKey) {
      this.client = axios.create({
        baseURL: config.integrations.wave.apiUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.integrations.wave.apiKey}`,
        },
        timeout: 30000,
      });
    }
  }

  private getMockResponse(amount: number, currency: string, _customerPhone: string): CheckoutSessionResponse {
    return {
      id: `mock_wave_${Date.now()}`,
      wave_launch_url: `https://wave.com/checkout/mock_${Date.now()}`,
      checkout_status: 'pending',
      amount,
      currency,
    };
  }

  async createCheckoutSession(
    amount: number,
    currency: string,
    customerPhone: string,
    description: string,
    clientReference?: string
  ): Promise<CheckoutSessionResponse> {
    if (config.integrations.mockMode || !this.client) {
      logger.info('Wave checkout session (MOCK MODE):', { amount, currency, customerPhone });
      return this.getMockResponse(amount, currency, customerPhone);
    }

    try {
      const response = await this.client.post<CheckoutSessionResponse>('/v1/checkout/sessions', {
        amount,
        currency,
        client_reference: clientReference,
        merchant_id: config.integrations.wave.merchantId,
        customer_phone_number: customerPhone,
        description,
        success_url: `${config.apiUrl}/api/v1/payments/wave/success`,
        error_url: `${config.apiUrl}/api/v1/payments/wave/error`,
      });

      logger.info('Wave checkout session created:', {
        sessionId: response.data.id,
        amount,
        currency,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Wave checkout session creation failed:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new BadRequestError(
        `Failed to create Wave checkout session: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatusResponse> {
    if (config.integrations.mockMode || !this.client) {
      logger.info('Wave transaction status check (MOCK MODE):', { transactionId });
      return {
        id: transactionId,
        checkout_status: 'complete',
        payment_status: 'successful',
        amount: 10000,
        currency: 'XOF',
      };
    }

    try {
      const response = await this.client.get<TransactionStatusResponse>(
        `/v1/checkout/sessions/${transactionId}`
      );

      logger.info('Wave transaction status retrieved:', {
        transactionId,
        status: response.data.payment_status,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Wave transaction status check failed:', {
        transactionId,
        error: error.message,
        response: error.response?.data,
      });
      throw new BadRequestError(
        `Failed to get Wave transaction status: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async handleWebhook(payload: WaveWebhookPayload, _signature?: string): Promise<{
    transactionId: string;
    status: 'success' | 'failed';
    amount: number;
    currency: string;
    clientReference?: string;
  }> {
    // In production, validate the webhook signature here
    // For now, we'll just process the payload

    logger.info('Wave webhook received:', {
      transactionId: payload.id,
      paymentStatus: payload.payment_status,
      amount: payload.amount,
    });

    const isSuccess = payload.payment_status === 'successful' && payload.checkout_status === 'complete';

    return {
      transactionId: payload.id,
      status: isSuccess ? 'success' : 'failed',
      amount: payload.amount,
      currency: payload.currency,
      clientReference: payload.client_reference,
    };
  }

  isEnabled(): boolean {
    return config.integrations.wave.enabled || config.integrations.mockMode;
  }
}

export const wavePaymentService = new WavePaymentService();
