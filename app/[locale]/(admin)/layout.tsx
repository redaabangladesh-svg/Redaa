'use client';

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
  ChevronRight,
  Globe
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

  // The login screen renders full-bleed, without the sidebar/header chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Admin routes are locale-free — only the storefront uses /${currentLocale}
  const menuItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
    { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
    { label: 'Products', icon: Layers, href: '/admin/products' },
    { label: 'Customers', icon: Users, href: '/admin/customers' },
    { label: 'Reports', icon: BarChart3, href: '/admin/reports' },
    { label: 'Offers', icon: Tag, href: '/admin/offers' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-brand-surface font-sans antialiased text-brand-text">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-primary text-white flex flex-col justify-between border-r border-brand-primary-alt">
        <div>
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-brand-primary-alt">
            <span className="font-extrabold tracking-tight text-lg">Admin Panel</span>
            <Link 
              href={`/${currentLocale}`} 
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all-custom"
              title="View Website"
            >
              <Globe className="h-4 w-4" />
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
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all-custom ${
                    isActive 
                      ? 'bg-white/15 text-white shadow-md' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-brand-primary-alt">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all-custom"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-8">
          <h2 className="text-xl font-bold text-brand-text">Dashboard Overview</h2>
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-secondary text-white flex items-center justify-center text-xs font-bold shadow-md shadow-brand-secondary/20">
                AD
              </div>
              <span className="text-sm font-semibold">Admin User</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-brand-surface">
          {children}
        </main>
      </div>
    </div>
  );
}
