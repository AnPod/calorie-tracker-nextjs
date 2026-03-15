import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';
import LogoutButton from '@/components/LogoutButton';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Top Header */}
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

      {/* Content */}
      <div className="p-4 pt-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Progress</h1>
        <p className="text-slate-500 mb-6">Track your nutrition journey over time</p>

        {/* Coming Soon Card */}
        <div className="glass rounded-[2rem] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-brand/10 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="text-primary" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Coming Soon</h2>
          <p className="text-slate-500 text-sm mb-6">
            Progress charts and weekly summaries are being built. Check back soon!
          </p>

          {/* Preview Features */}
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="text-primary" size={20} />
              <span className="text-sm font-medium text-slate-700">Weekly calorie trends</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Target className="text-primary" size={20} />
              <span className="text-sm font-medium text-slate-700">Goal achievement tracking</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Award className="text-primary" size={20} />
              <span className="text-sm font-medium text-slate-700">Streaks and milestones</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}