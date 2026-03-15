import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';
import LogoutButton from '@/components/LogoutButton';
import { User, Settings, Target, Bell, HelpCircle, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
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
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Profile</h1>
        <p className="text-slate-500 mb-6">Manage your account and preferences</p>

        {/* Profile Card */}
        <div className="glass rounded-[2rem] p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-16 h-16 rounded-full border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-brand text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-800">{session.user.name || 'User'}</h2>
              <p className="text-sm text-slate-500">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="glass rounded-[2rem] overflow-hidden">
          <div className="divide-y divide-slate-100">
            <button type="button" className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors">
              <Target className="text-primary" size={20} />
              <div className="flex-1">
                <span className="font-medium text-slate-800">Daily Goals</span>
                <p className="text-xs text-slate-500">Set calorie and macro targets</p>
              </div>
              <span className="text-slate-400 text-sm">Soon</span>
            </button>

            <button type="button" className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors">
              <Bell className="text-primary" size={20} />
              <div className="flex-1">
                <span className="font-medium text-slate-800">Notifications</span>
                <p className="text-xs text-slate-500">Reminders and alerts</p>
              </div>
              <span className="text-slate-400 text-sm">Soon</span>
            </button>

            <button type="button" className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors">
              <Settings className="text-primary" size={20} />
              <div className="flex-1">
                <span className="font-medium text-slate-800">Preferences</span>
                <p className="text-xs text-slate-500">App settings and display</p>
              </div>
              <span className="text-slate-400 text-sm">Soon</span>
            </button>

            <button type="button" className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors">
              <HelpCircle className="text-primary" size={20} />
              <div className="flex-1">
                <span className="font-medium text-slate-800">Help & Support</span>
                <p className="text-xs text-slate-500">FAQs and contact</p>
              </div>
              <span className="text-slate-400 text-sm">Soon</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}