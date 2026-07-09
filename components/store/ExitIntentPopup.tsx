'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { X, Gift, Copy, Check } from 'lucide-react';

export default function ExitIntentPopup() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if already shown in this session
    const shown = sessionStorage.getItem('redaa_exit_intent_shown');
    if (shown) return;

    // Desktop Mouse Leave Trigger
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 20) { // Cursor left near the top bar
        triggerPopup();
      }
    };

    // Mobile Time Out Trigger (15s fallback)
    const mobileTimer = setTimeout(() => {
      triggerPopup();
    }, 15000);

    const triggerPopup = () => {
      setIsOpen(true);
      sessionStorage.setItem('redaa_exit_intent_shown', 'true');
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(mobileTimer);
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(mobileTimer);
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('WELCOME10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#14201D]/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Card container */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-brand-border shadow-2xl overflow-hidden z-10 animate-scale-up">
        <div className="flex flex-col items-center text-center gap-5 p-6 md:p-8">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-brand-muted hover:bg-brand-surface hover:text-brand-text transition-all-custom"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>

          {/* Header Icon — gold ring badge */}
          <div className="h-14 w-14 rounded-full border-2 border-[#C6A15B] flex items-center justify-center text-[#C6A15B]">
            <Gift className="h-6 w-6" strokeWidth={1.5} />
          </div>

          {/* Text Copy */}
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.25em] text-[#C6A15B] uppercase">
              <span className="h-px w-4 bg-[#C6A15B]" />
              {locale === 'bn' ? 'বিশেষ অফার' : 'Special Offer'}
              <span className="h-px w-4 bg-[#C6A15B]" />
            </span>
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-brand-text leading-tight">
              {locale === 'bn' ? 'যাওয়ার আগে উপহার নিন!' : "Wait! Don't Leave Empty Handed"}
            </h2>
            <p className="text-xs md:text-sm text-brand-muted leading-relaxed max-w-xs mx-auto">
              {locale === 'bn'
                ? 'আপনার প্রথম অর্ডারে ১০% ইনস্ট্যান্ট ফ্ল্যাট ছাড় পেতে নিচের ডিসকাউন্ট কোডটি ব্যবহার করুন।'
                : 'Use the coupon code below to claim a flat 10% discount on your first order today.'}
            </p>
          </div>

          {/* Coupon Code Block — ticket style with dashed gold border */}
          <div className="w-full flex items-center justify-between border-2 border-dashed border-[#C6A15B]/50 bg-brand-surface rounded-xl py-3 px-5">
            <span className="font-mono font-extrabold text-base tracking-wider text-brand-secondary">
              WELCOME10
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-xs font-bold text-[#C6A15B] hover:text-brand-secondary transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600">{locale === 'bn' ? 'কপি হয়েছে' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>{locale === 'bn' ? 'কপি করুন' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3.5 rounded-full bg-gradient-to-br from-brand-secondary to-brand-secondary-dark text-white font-bold text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-brand-secondary/20 transition-all-custom"
          >
            {locale === 'bn' ? 'অফারটি ব্যবহার করুন' : 'Claim My 10% Discount'}
          </button>
        </div>
      </div>
    </div>
  );
}
