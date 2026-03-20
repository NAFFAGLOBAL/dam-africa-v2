import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CreditsService } from '@/lib/agent/CreditsService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || '0', 10);

    if (userId && credits > 0) {
      const creditsService = new CreditsService(userId);
      await creditsService.addCredits(
        credits,
        `Purchased ${credits} credits`,
        session.id
      );
    }
  }

  return NextResponse.json({ received: true });
}
