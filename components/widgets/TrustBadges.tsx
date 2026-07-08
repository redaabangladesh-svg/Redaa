'use client';

import { useLocale } from 'next-intl';
import { ShieldCheck, Truck, RefreshCw, BadgeCheck } from 'lucide-react';

export default function TrustBadges({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const badges = [
    { icon: ShieldCheck, en: 'Cash on Delivery', bn: 'ক্যাশ অন ডেলিভারি' },
    { icon: Truck, en: 'Fast Delivery', bn: 'দ্রুত ডেলিভারি' },
    { icon: RefreshCw, en: '7-Day Easy Return', bn: '৭ দিনের রিটার্ন' },
    { icon: BadgeCheck, en: '100% Genuine Product', bn: '১০০% অরিজিনাল পণ্য' },
  ];

  return (
    <div className={`grid grid-cols-2 ${compact ? '' : 'sm:grid-cols-4'} gap-3`}>
      {badges.map((b, i) => {
        const Icon = b.icon;
        return (
          <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-brand-surface border border-brand-border">
            <Icon className="h-5 w-5 text-brand-primary flex-shrink-0" strokeWidth={1.75} />
            <span className="text-[10px] font-bold text-brand-text leading-tight">
              {isBn ? b.bn : b.en}
            </span>
          </div>
        );
      })}
    </div>
  );
}
