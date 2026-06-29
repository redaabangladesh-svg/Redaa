'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { X, Sparkles, Copy, Check } from 'lucide-react';

export default function ExitIntentPopup() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if already shown in this session
    const shown = sessionStorage.getItem('sicily_exit_intent_shown');
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
      sessionStorage.setItem('sicily_exit_intent_shown', 'true');
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Card container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-brand-border shadow-2xl p-6 md:p-8 flex flex-col items-center text-center gap-5 z-10 animate-scale-up">
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-brand-muted hover:bg-brand-surface hover:text-brand-text transition-all-custom"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon */}
        <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl animate-pulse">
          <Sparkles className="h-8 w-8" />
        </div>

        {/* Text Copy */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-3 py-1 rounded-full border border-brand-primary/10">
            {locale === 'bn' ? 'বিশেষ অফার 🌸' : 'Special Offer 🌸'}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-brand-text leading-tight mt-2">
            {locale === 'bn' ? 'যাওয়ার আগে উপহার নিন!' : 'Wait! Don\'t Leave Empty Handed'}
          </h2>
          <p className="text-xs md:text-sm text-brand-muted leading-relaxed max-w-xs mx-auto">
            {locale === 'bn' 
              ? 'আপনার প্রথম অর্ডারে ১০% ইনস্ট্যান্ট ফ্ল্যাট ছাড় পেতে নিচের ডিসকাউন্ট কোডটি ব্যবহার করুন।' 
              : 'Use the coupon code below to claim a flat 10% discount on your first order today.'}
          </p>
        </div>

        {/* Coupon Code Block */}
        <div className="w-full flex items-center justify-between border border-brand-border bg-brand-surface rounded-2xl py-3 px-5 mt-2">
          <span className="font-mono font-extrabold text-base tracking-wider text-brand-text">
            WELCOME10
          </span>
          <button 
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-primary-alt transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-600">{locale === 'bn' ? 'কপি হয়েছে' : 'Copied!'}</span>
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
          className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-extrabold text-xs hover:bg-brand-primary-alt shadow-lg shadow-brand-primary/20 transition-all-custom mt-2"
        >
          {locale === 'bn' ? 'অফারটি ব্যবহার করুন' : 'Claim My 10% Discount'}
        </button>
      </div>
    </div>
  );
}
