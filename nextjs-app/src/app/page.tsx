import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { foodEntries, userSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getTodayStr } from '@/lib/date';
import Dashboard from '@/features/diary/Dashboard';
import LogoutButton from '@/components/LogoutButton';
import BottomNav from '@/components/layout/BottomNav';

export const dynamic = 'force-dynamic';

async function checkOnboardingStatus(userId: string): Promise<{ needsOnboarding: boolean; settings: Record<string, unknown> | null }> {
  try {
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      return { needsOnboarding: true, settings: null };
    }

    const userSettingsData = settings[0];
    const hasCompletedOnboarding = userSettingsData.hasCompletedOnboarding;

    if (hasCompletedOnboarding === null || hasCompletedOnboarding === undefined || hasCompletedOnboarding === false) {
      return { needsOnboarding: true, settings: userSettingsData as Record<string, unknown> };
    }

    return { needsOnboarding: false, settings: userSettingsData as Record<string, unknown> };
  } catch {
    return { needsOnboarding: true, settings: null };
  }
}

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { needsOnboarding } = await checkOnboardingStatus(session.user.id);

  if (needsOnboarding) {
    redirect('/onboarding');
  }

  const queryClient = new QueryClient();
  const todayStr = getTodayStr();

  await queryClient.prefetchQuery({
    queryKey: ['settings', session.user.id],
    queryFn: async () => {
      try {
        const settings = await db
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, session.user.id))
          .limit(1);
        return settings[0] || { dailyCalorieGoal: 2000 };
      } catch {
        return { dailyCalorieGoal: 2000 };
      }
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ['diary', todayStr],
    queryFn: async () => {
      try {
        const entries = await db
          .select()
          .from(foodEntries)
          .where(
            and(
              eq(foodEntries.userId, session.user.id),
              eq(foodEntries.date, todayStr)
            )
          );
        return entries;
      } catch {
        return [];
      }
    },
  });

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-brand text-white flex items-center justify-center font-bold shadow-sm">
              {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-slate-800">{session.user.name || session.user.email}</span>
        </div>
        <LogoutButton />
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Dashboard initialDate={todayStr} />
      </HydrationBoundary>

      <BottomNav />
    </div>
  );
}