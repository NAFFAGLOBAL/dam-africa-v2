import { Request, Response } from 'express';
import { wavePaymentService } from './wave.service';
import { paymentService } from '../../modules/payments/payment.service';
import { logger } from '../../utils/logger';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';

export class WaveWebhookController {
  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body;
    const signature = req.headers['x-wave-signature'] as string | undefined;

    logger.info('Wave webhook received:', { payload });

    try {
      const result = await wavePaymentService.handleWebhook(payload, signature);

      // Find the payment by provider reference (Wave transaction ID)
      const payment = await paymentService.getPaymentByProviderReference(result.transactionId);

      if (!payment) {
        logger.warn('Payment not found for Wave transaction:', { transactionId: result.transactionId });
        // Still return 200 to acknowledge receipt
        return sendSuccess(res, { received: true }, 'Webhook received but payment not found');
      }

      if (result.status === 'success') {
        await paymentService.processSuccessfulPayment(payment.id);
        logger.info('Wave payment processed successfully:', {
          paymentId: payment.id,
          transactionId: result.transactionId,
        });
      } else {
        await paymentService.markPaymentAsFailed(payment.id, 'Wave payment failed');
        logger.error('Wave payment failed:', {
          paymentId: payment.id,
          transactionId: result.transactionId,
        });
      }

      sendSuccess(res, { received: true, processed: true });
    } catch (error: any) {
      logger.error('Wave webhook processing error:', { error: error.message, payload });
      // Still return 200 to acknowledge receipt
      sendSuccess(res, { received: true, processed: false, error: error.message });
    }
  });
}

export const waveWebhookController = new WaveWebhookController();
