'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { X } from 'lucide-react';
import { fetchSettings } from '@/lib/settings';

export const SEASONAL_BANNERS: Record<string, { en: string; bn: string; color: string }> = {
  eid: { en: '🌙 Eid Special Offer — Shop Now!', bn: '🌙 ঈদ স্পেশাল অফার', color: '#2D6A4F' },
  valentine: { en: '❤️ Valentine\'s Day Collection', bn: '❤️ ভালোবাসা দিবসের অফার', color: '#C1121F' },
  newyear: { en: '🎉 New Year Offer', bn: '🎉 নববর্ষ অফার', color: '#B45309' },
};

export default function SeasonalBanner() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const [preset, setPreset] = useState<{ en: string; bn: string; color: string } | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const dismissedAt = localStorage.getItem('sicily_seasonal_dismissed_at');
    const isDismissedToday = dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000;

    fetchSettings(['seasonal_banner_active', 'seasonal_banner_type']).then((s) => {
      if (s.seasonal_banner_active === 'true' && SEASONAL_BANNERS[s.seasonal_banner_type]) {
        setPreset(SEASONAL_BANNERS[s.seasonal_banner_type]);
        setDismissed(!!isDismissedToday);
      }
    });
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('sicily_seasonal_dismissed_at', String(Date.now()));
    setDismissed(true);
  };

  if (!preset || dismissed) return null;

  return (
    <div className="text-white text-center py-2 px-4 relative" style={{ backgroundColor: preset.color }}>
      <p className="text-[11px] sm:text-xs font-bold">{isBn ? preset.bn : preset.en}</p>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-full transition-all-custom"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
