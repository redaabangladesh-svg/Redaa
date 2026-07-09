'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const [signingIn, setSigningIn] = useState(false);
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get('error') === 'unauthorized';

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    const supabase = createClient();
    // Admin routes are locale-free — do not prefix `next` with the locale
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/admin` },
    });
  };

  return (
    <div className="min-h-screen bg-brand-primary flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <div className="h-14 w-14 rounded-full bg-brand-primary/8 flex items-center justify-center text-brand-primary mx-auto">
          <ShieldCheck className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-black text-brand-text">অ্যাডমিন প্যানেল</h1>
          <p className="text-xs text-brand-muted font-semibold">
            স্টোর পরিচালনা করতে অনুমোদিত গুগল অ্যাকাউন্ট দিয়ে সাইন ইন করুন।
          </p>
        </div>

        {unauthorized && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2 text-left">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span>এই গুগল অ্যাকাউন্টটি অ্যাডমিন অ্যাক্সেসের জন্য অনুমোদিত নয়।</span>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={signingIn}
          className="w-full py-3 px-6 rounded-lg border border-brand-border bg-white hover:bg-brand-surface hover:shadow-md text-brand-text font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-60"
        >
          {signingIn ? (
            <div className="h-5 w-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          ) : (
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11C3.25 21.3 7.31 24 12 24Z"/>
              <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.76 1.27 5.39l4-3.11Z"/>
              <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"/>
            </svg>
          )}
          <span>{signingIn ? 'সাইন ইন হচ্ছে...' : 'গুগল দিয়ে সাইন ইন করুন'}</span>
        </button>
      </div>
    </div>
  );
}
