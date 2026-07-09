'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Users,
  BarChart3,
  Settings,
  Tag,
  LogOut,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; avatarUrl: string | null } | null>(null);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      const meta = user.user_metadata || {};
      setAdminUser({
        name: meta.full_name || meta.name || user.email || 'অ্যাডমিন',
        avatarUrl: meta.avatar_url || meta.picture || null,
      });
    });
  }, []);

  // Prevent hydration flash by rendering empty body or simple container until mounted on client
  if (!mounted) {
    return <div className="min-h-screen bg-brand-primary/5 animate-pulse" />;
  }

  // The login screen and printable invoices render full-bleed, without the sidebar/header chrome
  const isFullBleed = pathname.includes('/admin/login') || pathname.endsWith('/invoice');
  if (isFullBleed) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Admin routes are locale-free — only the storefront uses /${currentLocale}
  const menuItems = [
    { label: 'ওভারভিউ', icon: LayoutDashboard, href: '/admin' },
    { label: 'অর্ডার', icon: ShoppingBag, href: '/admin/orders' },
    { label: 'প্রোডাক্টস', icon: Layers, href: '/admin/products' },
    { label: 'ক্যাটাগরি', icon: Layers, href: '/admin/categories' },
    { label: 'কাস্টমার', icon: Users, href: '/admin/customers' },
    { label: 'রিপোর্ট', icon: BarChart3, href: '/admin/reports' },
    { label: 'অফার', icon: Tag, href: '/admin/offers' },
    { label: 'সেটিংস', icon: Settings, href: '/admin/settings' },
  ];

  const activeLabel = menuItems.find((item) => pathname === item.href)?.label || 'ড্যাশবোর্ড';

  return (
    <div className="flex h-screen bg-brand-surface font-sans antialiased text-brand-text overflow-hidden">
      {/* Sidebar — desktop only, bottom nav takes over on mobile */}
      <aside className="hidden lg:flex w-64 bg-brand-ink text-white flex-col justify-between border-r border-white/5 flex-shrink-0">
        <div>
          {/* Header */}
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <Link href={`/${currentLocale}`} className="flex items-center gap-2.5 group">
              <img
                src="/logo.svg"
                alt="Redaa"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-200 invert"
              />
              <div className="leading-none">
                <span className="block text-[7px] font-semibold tracking-[0.18em] uppercase text-brand-accent">অ্যাডমিন প্যানেল</span>
              </div>
            </Link>
          </div>

          {/* Menu */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all-custom ${
                    isActive
                      ? 'bg-white/8 text-white'
                      : 'text-white/55 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-brand-accent" />
                  )}
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-brand-accent' : ''}`} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <Link
            href={`/${currentLocale}`}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/55 hover:bg-white/5 hover:text-white transition-all-custom"
          >
            <Globe className="h-4.5 w-4.5" strokeWidth={1.75} />
            <span>ওয়েবসাইট দেখুন</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/55 hover:bg-white/5 hover:text-white transition-all-custom"
          >
            <LogOut className="h-4.5 w-4.5" strokeWidth={1.75} />
            <span>লগ আউট</span>
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-base sm:text-xl font-serif font-semibold text-brand-text truncate">{activeLabel}</h2>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* User Info */}
            <div className="flex items-center gap-2.5">
              {adminUser?.avatarUrl ? (
                <img
                  src={adminUser.avatarUrl}
                  alt={adminUser.name}
                  className="h-8 w-8 rounded-full object-cover shadow-md shadow-brand-secondary/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-brand-secondary text-white flex items-center justify-center text-xs font-bold shadow-md shadow-brand-secondary/20">
                  {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'AD'}
                </div>
              )}
              <span className="text-sm font-semibold hidden sm:inline truncate max-w-[120px]">{adminUser?.name || 'অ্যাডমিন'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="hidden lg:flex p-2 rounded-lg text-brand-muted hover:bg-brand-surface hover:text-brand-text transition-all-custom"
              aria-label="লগ আউট"
            >
              <LogOut className="h-4.5 w-4.5" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 lg:pb-8 bg-brand-surface">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-ink border-t border-white/10 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-stretch min-w-max">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2.5 min-w-[76px] transition-colors duration-150 ${
                  isActive ? 'text-brand-accent' : 'text-white/55'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.75} />
                <span className="text-[9px] font-bold whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
