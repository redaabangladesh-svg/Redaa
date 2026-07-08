'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

function hashToRange(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}

export default function ViewerCount({ productId, locale }: { productId: string; locale: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const key = `sicily_viewer_${productId}`;
    const stored = sessionStorage.getItem(key);
    if (stored) {
      setCount(Number(stored));
      return;
    }
    const value = hashToRange(productId + Date.now().toString().slice(0, 8), 8, 25);
    sessionStorage.setItem(key, String(value));
    setCount(value);
  }, [productId]);

  if (count === null) return null;

  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-brand-secondary whitespace-nowrap">
      <Eye className="h-3 w-3 flex-shrink-0" strokeWidth={1.75} />
      {locale === 'bn' ? `${count} জন এখন দেখছে` : `${count} people viewing now`}
    </span>
  );
}
