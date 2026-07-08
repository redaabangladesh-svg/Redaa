'use client';

import { useState, useEffect } from 'react';
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
  Menu,
  X
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile drawer automatically whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // The login screen and printable invoices render full-bleed, without the sidebar/header chrome
  if (pathname === '/admin/login' || pathname.endsWith('/invoice')) {
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
    { label: 'কাস্টমার', icon: Users, href: '/admin/customers' },
    { label: 'রিপোর্ট', icon: BarChart3, href: '/admin/reports' },
    { label: 'অফার', icon: Tag, href: '/admin/offers' },
    { label: 'সেটিংস', icon: Settings, href: '/admin/settings' },
  ];

  const activeLabel = menuItems.find((item) => pathname === item.href)?.label || 'ড্যাশবোর্ড';

  return (
    <div className="flex h-screen bg-brand-surface font-sans antialiased text-brand-text overflow-hidden">
      {/* Mobile backdrop, closes the drawer on outside tap */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static column on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-ink text-white flex flex-col justify-between border-r border-white/5 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
            <Link href={`/${currentLocale}`} className="flex items-center gap-2.5 group">
              <img
                src="/Sicily_icon.png"
                alt="Sicily"
                className="h-8 w-8 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="leading-none">
                <span className="block text-[15px] font-serif font-semibold tracking-tight text-white">Sicily</span>
                <span className="block text-[7px] font-semibold tracking-[0.18em] uppercase text-brand-accent mt-0.5">অ্যাডমিন প্যানেল</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all-custom lg:hidden"
              aria-label="মেনু বন্ধ করুন"
            >
              <X className="h-4 w-4" />
            </button>
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
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-brand-text hover:bg-brand-surface transition-all-custom lg:hidden flex-shrink-0"
              aria-label="মেনু খুলুন"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-base sm:text-xl font-serif font-semibold text-brand-text truncate">{activeLabel}</h2>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* User Info */}
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-brand-secondary text-white flex items-center justify-center text-xs font-bold shadow-md shadow-brand-secondary/20">
                AD
              </div>
              <span className="text-sm font-semibold hidden sm:inline">অ্যাডমিন</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-brand-surface">
          {children}
        </main>
      </div>
    </div>
  );
}
