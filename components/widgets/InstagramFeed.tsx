'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { fetchSettings } from '@/lib/settings';

const FALLBACK_IMAGES = [
  '/product-1.webp',
  '/product-2.webp',
  '/product-3.webp',
  '/product-4.webp',
  '/header-image-1.webp',
  '/header-image-2.webp'
];
const FACEBOOK_URL = 'https://www.facebook.com/redaabangladesh';

export default function InstagramFeed({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const [images, setImages] = useState<string[]>(FALLBACK_IMAGES);

  useEffect(() => {
    fetchSettings(['instagram_feed_images']).then((s) => {
      if (s.instagram_feed_images) {
        const urls = s.instagram_feed_images.split(',').map((u) => u.trim()).filter(Boolean);
        if (urls.length > 0) setImages(urls);
      }
    });
  }, []);

  return (
    <section className={compact ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8'}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-base sm:text-lg font-semibold text-brand-text tracking-tight flex items-center gap-2">
          <Camera className="h-4 w-4 text-[#C6A15B]" strokeWidth={1.75} />
          <span>{isBn ? 'আমাদের কাস্টমারদের ছবি' : 'From Our Customers'}</span>
        </h2>
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-wide"
        >
          {isBn ? 'ফেসবুকে দেখুন' : 'View on Facebook'}
        </a>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {images.slice(0, 6).map((img, i) => (
          <a
            key={i}
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-lg overflow-hidden bg-brand-surface border border-brand-border group"
          >
            <Image
              src={img}
              alt={isBn ? 'কাস্টমারের ছবি' : 'Customer photo'}
              fill
              sizes="(max-width: 640px) 33vw, 16vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
