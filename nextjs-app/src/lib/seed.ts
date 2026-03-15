import { db } from '@/db';
import { users, userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Seed test users for development/testing
export async function seedTestUsers() {
  const testUsers = [
    {
      email: 'test@example.com',
      name: 'Test User',
      dailyCalorieGoal: 2000,
    },
    {
      email: 'demo@example.com',
      name: 'Demo User',
      dailyCalorieGoal: 2500,
    },
    {
      email: 'alice@example.com',
      name: 'Alice',
      dailyCalorieGoal: 1800,
    },
    {
      email: 'bob@example.com',
      name: 'Bob',
      dailyCalorieGoal: 2200,
    },
  ];

  for (const testUser of testUsers) {
    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, testUser.email))
      .limit(1);

    if (existing.length === 0) {
      // Create user
      const userId = crypto.randomUUID();
      await db.insert(users).values({
        id: userId,
        email: testUser.email,
        name: testUser.name,
      });

      // Create default settings
      await db.insert(userSettings).values({
        userId: userId,
        dailyCalorieGoal: testUser.dailyCalorieGoal,
      });

      console.log(`Created test user: ${testUser.email}`);
    } else {
      console.log(`Test user already exists: ${testUser.email}`);
    }
  }

  console.log('Seed complete!');
}
