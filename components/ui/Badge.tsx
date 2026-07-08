import { ReactNode } from 'react';

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';

const TONE_CLASSES: Record<Tone, string> = {
  primary: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
  secondary: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/30',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-rose-50 text-rose-700 border-rose-100',
  neutral: 'bg-brand-surface text-brand-muted border-brand-border',
};

export default function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
