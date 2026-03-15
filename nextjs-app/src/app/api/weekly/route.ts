import { auth } from '@/auth';
import { db } from '@/db';
import { foodEntries } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/weekly - Returns last 7 days of calorie data
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = new Date();
  const days = [];

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    days.push({
      date: dateKey,
      dayName: dayName,
      calories: 0,
      hasData: false,
    });
  }

  // Get entries for the date range
  const startDate = days[0].date;
  const endDate = days[6].date;

  const entries = await db
    .select()
    .from(foodEntries)
    .where(and(
      eq(foodEntries.userId, session.user.id),
      gte(foodEntries.date, startDate),
      lte(foodEntries.date, endDate)
    ));

  // Calculate calories for each day
  const dayMap = new Map(days.map(d => [d.date, d]));

  for (const entry of entries) {
    const day = dayMap.get(entry.date);
    if (day) {
      const ratio = entry.grams / 100;
      day.calories += Math.round(entry.caloriesPer100g * ratio);
      day.hasData = true;
    }
  }

  const resultDays = Array.from(dayMap.values());
  const avgCalories = Math.round(
    resultDays.reduce((sum, d) => sum + d.calories, 0) / 7
  );

  return NextResponse.json({ days: resultDays, average: avgCalories });
}
