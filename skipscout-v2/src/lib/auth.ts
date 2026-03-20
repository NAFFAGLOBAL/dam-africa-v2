import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function getOrCreateUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    const clerkUser = await fetch(
      `https://api.clerk.com/v1/users/${clerkId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    ).then((r) => r.json());

    user = await prisma.user.create({
      data: {
        clerkId,
        email:
          clerkUser.email_addresses?.[0]?.email_address ?? `${clerkId}@skipscout.com`,
        name: [clerkUser.first_name, clerkUser.last_name]
          .filter(Boolean)
          .join(' ') || null,
        credits: 10,
      },
    });
  }

  return user;
}
