import { NextRequest, NextResponse } from 'next/server';
import { VersiumService } from '@/lib/agent/VersiumService';
import { getOrCreateUser } from '@/lib/auth';
import { CreditsService } from '@/lib/agent/CreditsService';

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credits = new CreditsService(user.id);
    const balance = await credits.getBalance();
    if (balance.credits < 5) {
      return NextResponse.json(
        { error: 'Insufficient credits. Need 5 credits for demographic lookup.' },
        { status: 402 }
      );
    }

    const params = await req.json();
    const versium = new VersiumService();
    const result = await versium.demographicAppend(params);

    await credits.deduct(5, 'Demographic / property lookup');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Versium demographic error:', error);
    return NextResponse.json(
      { error: 'Failed to look up demographics' },
      { status: 500 }
    );
  }
}
