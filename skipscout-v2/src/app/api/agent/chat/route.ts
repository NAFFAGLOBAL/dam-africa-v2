import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent/AgentService';
import { getOrCreateUser } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const messages = [
      ...history,
      { role: 'user' as const, content: message },
    ];

    const agent = new AgentService(user.id);
    const result = await agent.chat(messages);

    // Log the search
    if (result.toolsUsed.length > 0) {
      await prisma.search.create({
        data: {
          userId: user.id,
          type: result.toolsUsed[0],
          query: { message },
          result: { reply: result.reply.substring(0, 500) },
          credits: 0,
          status: 'success',
        },
      });
    }

    return NextResponse.json({
      reply: result.reply,
      history: result.messages,
      toolsUsed: result.toolsUsed,
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
