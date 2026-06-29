'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Settings, Save, ShieldAlert, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const locale = useLocale();

  const [insideFee, setInsideFee] = useState('80');
  const [outsideFee, setOutsideFee] = useState('150');
  const [threshold, setThreshold] = useState('500');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load configured settings on mount
  useEffect(() => {
    const storedInside = localStorage.getItem('sicily_delivery_inside');
    const storedOutside = localStorage.getItem('sicily_delivery_outside');
    const storedThreshold = localStorage.getItem('sicily_delivery_threshold');

    if (storedInside) setInsideFee(storedInside);
    if (storedOutside) setOutsideFee(storedOutside);
    if (storedThreshold) setThreshold(storedThreshold);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Validations
    const insideVal = parseInt(insideFee, 10);
    const outsideVal = parseInt(outsideFee, 10);
    const thresholdVal = parseInt(threshold, 10);

    if (isNaN(insideVal) || insideVal < 0) {
      setErrorMsg(locale === 'bn' ? 'ঢাকার ভেতরে শিপিং খরচ সঠিক সংখ্যা হতে হবে।' : 'Inside Dhaka charge must be a valid positive number.');
      return;
    }
    if (isNaN(outsideVal) || outsideVal < 0) {
      setErrorMsg(locale === 'bn' ? 'ঢাকার বাইরে শিপিং খরচ সঠিক সংখ্যা হতে হবে।' : 'Outside Dhaka charge must be a valid positive number.');
      return;
    }
    if (isNaN(thresholdVal) || thresholdVal < 0) {
      setErrorMsg(locale === 'bn' ? 'ফ্রি শিপিং লিমিট সঠিক সংখ্যা হতে হবে।' : 'Free shipping threshold must be a valid positive number.');
      return;
    }

    // Persist to local storage
    localStorage.setItem('sicily_delivery_inside', insideFee);
    localStorage.setItem('sicily_delivery_outside', outsideFee);
    localStorage.setItem('sicily_delivery_threshold', threshold);

    setSuccessMsg(
      locale === 'bn' 
        ? 'ডেলিভারি ফি কনফিগারেশন সফলভাবে সংরক্ষণ করা হয়েছে! 🚚' 
        : 'Delivery fee configuration saved successfully! 🚚'
    );
  };

  return (
    <div className="max-w-2xl space-y-6 font-sans">
      {/* Page Header */}
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-2xl font-black text-brand-text flex items-center gap-2">
          <Settings className="h-6 w-6 text-brand-primary" />
          <span>{locale === 'bn' ? 'ডেলিভারি সেটিংস কনফিগারেশন' : 'Delivery Settings Configuration'}</span>
        </h1>
        <p className="text-xs text-brand-muted mt-1.5 font-medium">
          {locale === 'bn' 
            ? 'ঢাকার ভেতরে ও বাইরে ডেলিভারি খরচ এবং ফ্রি শিপিং লিমিট পরিবর্তন করুন।' 
            : 'Configure inside/outside Dhaka shipping fees and free delivery limits.'}
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Configuration Card */}
      <form onSubmit={handleSave} className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <h3 className="font-bold text-brand-text text-base border-b border-brand-border pb-3">
          {locale === 'bn' ? 'শিপিং চার্জ কনফিগার করুন' : 'Configure Shipping Charges'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Inside Dhaka */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text">
              {locale === 'bn' ? 'ঢাকার ভেতরে ডেলিভারি চার্জ (৳)' : 'Inside Dhaka Fee (৳)'}
            </label>
            <input
              type="number"
              value={insideFee}
              onChange={(e) => setInsideFee(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              min={0}
              required
            />
          </div>

          {/* Outside Dhaka */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text">
              {locale === 'bn' ? 'ঢাকার বাইরে ডেলিভারি চার্জ (৳)' : 'Outside Dhaka Fee (৳)'}
            </label>
            <input
              type="number"
              value={outsideFee}
              onChange={(e) => setOutsideFee(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              min={0}
              required
            />
          </div>
        </div>

        {/* Free Shipping Limit */}
        <div className="space-y-1.5 max-w-sm">
          <label className="text-xs font-bold text-brand-text">
            {locale === 'bn' ? 'ফ্রি শিপিং থ্রেশহোল্ড (৳)' : 'Free Shipping Threshold Amount (৳)'}
          </label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            min={0}
            required
          />
          <p className="text-[10px] text-brand-muted leading-relaxed font-medium mt-1">
            {locale === 'bn' 
              ? '* এই অংকের বেশি বা সমান অর্ডারে কাস্টমারের জন্য অটোমেটিক ফ্রি ডেলিভারি একটিভ হবে।' 
              : '* Orders equal to or exceeding this threshold will automatically get free shipping.'}
          </p>
        </div>

        {/* Submit */}
        <div className="border-t border-brand-border pt-6 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-brand-primary text-white font-extrabold hover:bg-brand-primary-alt shadow-lg shadow-brand-primary/25 transition-all-custom text-xs"
          >
            <Save className="h-4 w-4" />
            <span>{locale === 'bn' ? 'সংরক্ষণ করুন' : 'Save Configurations'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
