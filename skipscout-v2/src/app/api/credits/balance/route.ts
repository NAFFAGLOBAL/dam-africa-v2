import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      credits: user.credits,
      plan: user.plan,
    });
  } catch (error) {
    console.error('Credits balance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
