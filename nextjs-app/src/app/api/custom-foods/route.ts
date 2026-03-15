import { auth } from '@/auth';
import { db } from '@/db';
import { customFoods } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/custom-foods
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const foods = await db
    .select()
    .from(customFoods)
    .where(eq(customFoods.userId, session.user.id));

  return NextResponse.json(foods);
}

// POST /api/custom-foods
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();

  const newFood = await db.insert(customFoods).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    name: body.name,
    caloriesPer100g: body.caloriesPer100g,
    proteinPer100g: body.proteinPer100g || 0,
    carbsPer100g: body.carbsPer100g || 0,
    fatPer100g: body.fatPer100g || 0,
  }).returning();

  return NextResponse.json(newFood[0]);
}

// DELETE /api/custom-foods?id=xxx
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('ID parameter required', { status: 400 });
  }

  // Verify ownership
  const food = await db
    .select()
    .from(customFoods)
    .where(and(
      eq(customFoods.id, id),
      eq(customFoods.userId, session.user.id)
    ))
    .limit(1);

  if (food.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  await db.delete(customFoods).where(eq(customFoods.id, id));
  return new Response('Deleted', { status: 200 });
}
