'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { User, Mail, ShieldCheck, ShoppingBag, ArrowRight, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is logged in via localStorage
    const savedUser = localStorage.getItem('sicily_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }

    // Load user orders
    const savedOrders = localStorage.getItem('sicily_orders_list');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders).slice(0, 3)); // show last 3 orders
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        name: 'Robiul Islam',
        email: 'robiul.official96@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
      };
      localStorage.setItem('sicily_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.removeItem('sicily_user');
    setUser(null);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 min-h-[60vh] flex flex-col justify-center">
      {user ? (
        /* ── LOGGED IN PROFILE CARD ── */
        <div className="bg-white border border-brand-border rounded-2xl shadow-xl overflow-hidden animate-fade-up">
          <div className="p-6 space-y-6">
            {/* User Meta */}
            <div className="flex items-center gap-4 border-b border-brand-border pb-5">
              <img src={user.avatar} alt={user.name} className="h-14 w-14 rounded-full object-cover border-2 border-brand-primary/30" />
              <div>
                <h2 className="font-serif text-lg font-semibold text-brand-text">{user.name}</h2>
                <p className="text-xs text-brand-muted font-semibold">{user.email}</p>
              </div>
              <span className="ml-auto px-2.5 py-1 bg-[#C6A15B]/10 border border-[#C6A15B]/30 text-[#8A6A2E] text-[9px] font-bold rounded-full uppercase tracking-wider">
                {locale === 'bn' ? 'ভেরিফাইড' : 'Verified'}
              </span>
            </div>

            {/* Orders History Preview */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-brand-primary" strokeWidth={1.75} />
                <span>{locale === 'bn' ? 'সাম্প্রতিক অর্ডার' : 'Recent Orders'}</span>
              </h3>

              {orders.length > 0 ? (
                <div className="space-y-2">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-3 bg-brand-surface border border-brand-border rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-brand-text block">{ord.id}</span>
                        <span className="text-[10px] text-brand-muted block mt-0.5">{ord.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-brand-secondary block">৳{ord.amount}</span>
                        <span className="px-2 py-0.5 bg-[#C6A15B]/10 text-[#8A6A2E] text-[9px] font-bold rounded-full uppercase tracking-wider mt-0.5 inline-block">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-brand-muted italic py-2 text-center">
                  {locale === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি।' : 'No orders found yet.'}
                </p>
              )}
            </div>

            {/* CTA & Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => router.push(`/${locale}/shop`)}
                className="w-full py-3 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-alt text-white font-bold text-xs shadow-sm hover:shadow-lg hover:shadow-brand-primary/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{locale === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Continue Shopping'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-full border border-brand-border text-brand-muted hover:text-brand-secondary hover:border-brand-secondary/30 hover:bg-brand-surface text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                <span>{locale === 'bn' ? 'লগআউট করুন' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── MOCK GOOGLE LOGIN CARD ── */
        <div className="bg-white border border-brand-border rounded-2xl shadow-xl overflow-hidden text-center animate-fade-up">
          <div className="p-6 space-y-6">
            <div className="space-y-2.5">
              <div className="h-14 w-14 rounded-full bg-brand-primary/8 flex items-center justify-center text-brand-primary mx-auto">
                <User className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-xl font-semibold text-brand-text">
                {locale === 'bn' ? 'অ্যাকাউন্টে সাইন ইন করুন' : 'Sign in to Account'}
              </h2>
              <p className="text-xs text-brand-muted font-semibold max-w-[280px] mx-auto leading-relaxed">
                {locale === 'bn'
                  ? 'আপনার অর্ডার ট্র্যাকিং এবং প্রোফাইল ভিউ অ্যাক্সেস করতে জিমেইল দিয়ে সাইন ইন করুন।'
                  : 'Sign in with your Google account to track orders and manage your profile.'}
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg border border-brand-border bg-white hover:bg-brand-surface hover:shadow-md text-brand-text font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
              ) : (
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11C3.25 21.3 7.31 24 12 24Z"/>
                  <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.76 1.27 5.39l4-3.11Z"/>
                  <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"/>
                </svg>
              )}
              <span>
                {loading
                  ? (locale === 'bn' ? 'সাইন ইন হচ্ছে...' : 'Signing in...')
                  : (locale === 'bn' ? 'গুগল দিয়ে সাইন ইন করুন' : 'Sign in with Google')}
              </span>
            </button>

            {/* Trust badges strip */}
            <div className="border-t border-brand-border pt-4 flex items-center justify-around text-[10px] text-brand-muted font-semibold">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand-primary" strokeWidth={1.75} /> {locale === 'bn' ? 'নিরাপদ লগইন' : 'Secure Login'}</span>
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-brand-secondary" strokeWidth={1.75} /> {locale === 'bn' ? 'জিমেইল ভেরিফাইড' : 'Gmail Verified'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
