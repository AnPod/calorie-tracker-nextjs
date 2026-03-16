import { auth } from '@/auth';
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const settingsSchema = z.object({
  dailyCalorieGoal: z.number().int().min(500).max(10000).optional(),
  age: z.number().int().min(13).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  weightKg: z.number().min(20).max(300).optional(),
  heightCm: z.number().int().min(50).max(250).optional(),
  hasCompletedOnboarding: z.boolean().optional(),
}).strict();

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json({ dailyCalorieGoal: 2000 });
    }

    return NextResponse.json(settings[0]);
  } catch (error) {
    console.error('[Settings API GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parseResult = settingsSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parseResult.error.issues },
      { status: 400 }
    );
  }

  const validatedData = parseResult.data;

  try {
    const existing = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    const updateData: Record<string, unknown> = {
      ...validatedData,
      updatedAt: new Date(),
    };

    if (existing.length === 0) {
      const newSettings = await db.insert(userSettings).values({
        userId: session.user.id,
        dailyCalorieGoal: validatedData.dailyCalorieGoal ?? 2000,
        age: validatedData.age,
        gender: validatedData.gender,
        weightKg: validatedData.weightKg,
        heightCm: validatedData.heightCm,
        hasCompletedOnboarding: validatedData.hasCompletedOnboarding ?? false,
      }).returning();
      return NextResponse.json(newSettings[0]);
    } else {
      const updated = await db
        .update(userSettings)
        .set(updateData)
        .where(eq(userSettings.userId, session.user.id))
        .returning();
      return NextResponse.json(updated[0]);
    }
  } catch (error) {
    console.error('[Settings API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}