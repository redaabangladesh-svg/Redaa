'use client';

import { useState, useEffect } from 'react';

function secondsUntil(endAt: string) {
  return Math.max(0, Math.floor((new Date(endAt).getTime() - Date.now()) / 1000));
}

export default function CountdownTimer({ locale, endAt }: { locale: string; endAt: string }) {
  const [seconds, setSeconds] = useState(() => secondsUntil(endAt));

  useEffect(() => {
    setSeconds(secondsUntil(endAt));
    const id = setInterval(() => setSeconds(secondsUntil(endAt)), 1000);
    return () => clearInterval(id);
  }, [endAt]);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const units = [
    { value: hh, label_en: 'HRS', label_bn: 'ঘণ্টা' },
    { value: mm, label_en: 'MIN', label_bn: 'মিনিট' },
    { value: ss, label_en: 'SEC', label_bn: 'সেকেন্ড' },
  ];

  return (
    <div className="flex items-center gap-1">
      {units.map((u, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="flex flex-col items-center min-w-[30px]">
            <span className="text-xs font-bold text-brand-secondary font-mono leading-none tabular-nums">{u.value}</span>
            <span className="text-[6.5px] font-semibold text-brand-muted uppercase tracking-wider mt-0.5">
              {locale === 'bn' ? u.label_bn : u.label_en}
            </span>
          </div>
          {i < units.length - 1 && <span className="text-brand-muted font-bold text-xs">:</span>}
        </div>
      ))}
    </div>
  );
}
