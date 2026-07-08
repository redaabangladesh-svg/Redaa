import { PackageCheck, PackageX, Flame } from 'lucide-react';

export default function StockBadge({ stock, lowStockThreshold, locale }: { stock: number; lowStockThreshold: number; locale: string }) {
  if (stock === 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-brand-muted whitespace-nowrap">
        <PackageX className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
        {locale === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}
      </span>
    );
  }

  if (stock <= lowStockThreshold) {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-brand-primary whitespace-nowrap">
        <Flame className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
        {locale === 'bn' ? `${stock}টি বাকি` : `${stock} left`}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs font-bold text-brand-primary whitespace-nowrap">
      <PackageCheck className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
      {locale === 'bn' ? 'স্টকে আছে' : 'In Stock'}
    </span>
  );
}
