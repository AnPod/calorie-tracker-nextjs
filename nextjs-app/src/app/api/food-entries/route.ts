import { db } from '@/db';
import { foodEntries } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/withAuth';
import { foodEntrySchema } from '@/lib/schemas/food';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (request, { session }) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
  }

  const entries = await db
    .select()
    .from(foodEntries)
    .where(and(
      eq(foodEntries.userId, session.user!.id),
      eq(foodEntries.date, date)
    ));

  return NextResponse.json(entries);
});

export const POST = withAuth(async (request, { session }) => {
  let body;
  try {
    body = await request.json();
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  
  // Zod Validation (Secures DB against malformed inputs & handles idempotency ID)
  const validation = foodEntrySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: validation.error.format() }, 
      { status: 400 }
    );
  }

  const data = validation.data;

  // Insert safely into the DB
  const newEntry = await db.insert(foodEntries).values({
    id: data.id, // Client-generated UUID for idempotency
    userId: session.user!.id,
    date: data.date,
    name: data.name,
    brand: data.brand || null,
    grams: data.grams,
    caloriesPer100g: data.caloriesPer100g,
    proteinPer100g: data.proteinPer100g,
    carbsPer100g: data.carbsPer100g,
    fatPer100g: data.fatPer100g,
    isCustom: data.isCustom,
  }).returning();

  // Structured Logging (Observability)
  console.log(JSON.stringify({
    event: 'food_entry_created',
    userId: session.user!.id,
    foodId: data.id,
    grams: data.grams,
    macros: {
      cals: data.caloriesPer100g,
      p: data.proteinPer100g,
      c: data.carbsPer100g,
      f: data.fatPer100g
    }
  }));

  return NextResponse.json(newEntry[0]);
});

export const DELETE = withAuth(async (request, { session }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
  }

  // Verify the entry belongs to the current user before deleting
  const entry = await db
    .select()
    .from(foodEntries)
    .where(and(
      eq(foodEntries.id, id),
      eq(foodEntries.userId, session.user!.id)
    ))
    .limit(1);

  if (entry.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.delete(foodEntries).where(eq(foodEntries.id, id));

  // Structured Logging (Observability)
  console.log(JSON.stringify({
    event: 'food_entry_deleted',
    userId: session.user!.id,
    foodId: id
  }));

  return NextResponse.json({ success: true }, { status: 200 });
});
