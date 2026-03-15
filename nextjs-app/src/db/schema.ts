import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// NextAuth tables
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('session_token').unique().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

// App data tables with user isolation
export const foodEntries = sqliteTable('food_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD
  name: text('name').notNull(),
  brand: text('brand'),
  grams: real('grams').notNull(),
  caloriesPer100g: real('calories_per_100g').notNull(),
  proteinPer100g: real('protein_per_100g').default(0),
  carbsPer100g: real('carbs_per_100g').default(0),
  fatPer100g: real('fat_per_100g').default(0),
  isCustom: integer('is_custom', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const customFoods = sqliteTable('custom_foods', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  caloriesPer100g: real('calories_per_100g').notNull(),
  proteinPer100g: real('protein_per_100g').default(0),
  carbsPer100g: real('carbs_per_100g').default(0),
  fatPer100g: real('fat_per_100g').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const savedMeals = sqliteTable('saved_meals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const savedMealItems = sqliteTable('saved_meal_items', {
  id: text('id').primaryKey(),
  mealId: text('meal_id').notNull().references(() => savedMeals.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  grams: real('grams').notNull(),
  caloriesPer100g: real('calories_per_100g').notNull(),
  proteinPer100g: real('protein_per_100g').default(0),
  carbsPer100g: real('carbs_per_100g').default(0),
  fatPer100g: real('fat_per_100g').default(0),
});

export const userSettings = sqliteTable('user_settings', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  dailyCalorieGoal: integer('daily_calorie_goal').default(2000),
  age: integer('age'),
  gender: text('gender'),
  weightKg: real('weight_kg'),
  heightCm: integer('height_cm'),
  hasCompletedOnboarding: integer('has_completed_onboarding', { mode: 'boolean' }).default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  foodEntries: many(foodEntries),
  customFoods: many(customFoods),
  savedMeals: many(savedMeals),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
}));

export const savedMealsRelations = relations(savedMeals, ({ many }) => ({
  items: many(savedMealItems),
}));
