'use client';

import { Home, Search, Activity, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Diary', href: '/', icon: Home, isFab: false },
    { name: 'Search', href: '/search', icon: Search, isFab: true },
    { name: 'Progress', href: '/progress', icon: Activity, isFab: false },
    { name: 'Profile', href: '/profile', icon: User, isFab: false },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around items-center h-[68px] px-2 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isFab) {
            return (
              <li key={item.name} className="flex-1 flex justify-center h-full relative z-10">
                <button
                  type="button"
                  className="absolute -top-5 w-14 h-14 bg-gradient-brand text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                >
                  <Icon size={24} />
                </button>
              </li>
            );
          }

          return (
            <li key={item.name} className="flex-1 h-full">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
