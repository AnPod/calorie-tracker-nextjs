'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-medium transition-colors shadow-sm"
    >
      Sign out
    </button>
  );
}
