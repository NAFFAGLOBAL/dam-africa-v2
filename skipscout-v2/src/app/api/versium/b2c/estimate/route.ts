import { NextRequest, NextResponse } from 'next/server';
import { VersiumService } from '@/lib/agent/VersiumService';
import { getOrCreateUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await req.json();
    const versium = new VersiumService();
    const result = await versium.b2cEstimate(params);

    return NextResponse.json(result);
  } catch (error) {
    console.error('B2C estimate error:', error);
    return NextResponse.json(
      { error: 'Failed to estimate B2C list' },
      { status: 500 }
    );
  }
}
