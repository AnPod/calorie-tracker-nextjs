import { auth } from '@/auth';
import { db } from '@/db';
import { savedMeals, savedMealItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/saved-meals - Returns meals with their items
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const meals = await db
    .select()
    .from(savedMeals)
    .where(eq(savedMeals.userId, session.user.id));

  // Get items for each meal
  const mealsWithItems = await Promise.all(
    meals.map(async (meal) => {
      const items = await db
        .select()
        .from(savedMealItems)
        .where(eq(savedMealItems.mealId, meal.id));
      return { ...meal, foods: items };
    })
  );

  return NextResponse.json(mealsWithItems);
}

// POST /api/saved-meals
// Body: { name: string, foods: [{ name, grams, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g }] }
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const mealId = crypto.randomUUID();

  // Insert meal
  await db.insert(savedMeals).values({
    id: mealId,
    userId: session.user.id,
    name: body.name,
  });

  // Insert meal items
  if (body.foods && body.foods.length > 0) {
    await db.insert(savedMealItems).values(
      body.foods.map((food: any) => ({
        id: crypto.randomUUID(),
        mealId: mealId,
        name: food.name,
        grams: food.grams,
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g || 0,
        carbsPer100g: food.carbsPer100g || 0,
        fatPer100g: food.fatPer100g || 0,
      }))
    );
  }

  // Return the created meal with items
  const items = await db
    .select()
    .from(savedMealItems)
    .where(eq(savedMealItems.mealId, mealId));

  return NextResponse.json({
    id: mealId,
    userId: session.user.id,
    name: body.name,
    foods: items,
  });
}

// DELETE /api/saved-meals?id=xxx
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
  const meal = await db
    .select()
    .from(savedMeals)
    .where(and(
      eq(savedMeals.id, id),
      eq(savedMeals.userId, session.user.id)
    ))
    .limit(1);

  if (meal.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  // Cascade delete will handle items
  await db.delete(savedMeals).where(eq(savedMeals.id, id));
  return new Response('Deleted', { status: 200 });
}
