'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { X } from 'lucide-react';
import { fetchSettings } from '@/lib/settings';

export default function AnnouncementBar() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const [text, setText] = useState('');
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const dismissedAt = localStorage.getItem('sicily_announcement_dismissed_at');
    const isDismissedToday = dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000;

    fetchSettings([
      'announcement_active', 'announcement_text_en', 'announcement_text_bn',
      'seasonal_banner_active',
    ]).then((s) => {
      // Seasonal banner takes visual priority — don't show both at once
      if (s.seasonal_banner_active === 'true') return;

      if (s.announcement_active === 'true') {
        const message = isBn ? s.announcement_text_bn : s.announcement_text_en;
        if (!message) return;
        setText(message);
        setDismissed(!!isDismissedToday);
      }
    });
  }, [isBn]);

  const handleDismiss = () => {
    localStorage.setItem('sicily_announcement_dismissed_at', String(Date.now()));
    setDismissed(true);
  };

  if (!text || dismissed) return null;

  return (
    <div className="text-white text-center py-2 px-4 relative bg-brand-primary">
      <p className="text-[11px] sm:text-xs font-bold">{text}</p>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-full transition-all-custom"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
