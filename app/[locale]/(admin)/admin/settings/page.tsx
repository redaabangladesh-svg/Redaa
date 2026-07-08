'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Settings, Save, ShieldAlert, ShieldCheck, Store, Megaphone, Sparkles } from 'lucide-react';
import { fetchSettings, saveSettings } from '@/lib/settings';

export default function AdminSettingsPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [insideFee, setInsideFee] = useState('80');
  const [outsideFee, setOutsideFee] = useState('150');
  const [threshold, setThreshold] = useState('500');

  const [storeName, setStoreName] = useState('Sicily');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  const [announcementActive, setAnnouncementActive] = useState(false);
  const [announcementTextEn, setAnnouncementTextEn] = useState('');
  const [announcementTextBn, setAnnouncementTextBn] = useState('');

  const [seasonalActive, setSeasonalActive] = useState(false);
  const [seasonalType, setSeasonalType] = useState('eid');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load configured settings on mount
  useEffect(() => {
    fetchSettings([
      'store_name', 'store_phone', 'store_email', 'store_address',
      'delivery_inside', 'delivery_outside', 'delivery_threshold',
      'announcement_active', 'announcement_text_en', 'announcement_text_bn',
      'seasonal_banner_active', 'seasonal_banner_type',
    ]).then((s) => {
      if (s.store_name) setStoreName(s.store_name);
      if (s.store_phone) setStorePhone(s.store_phone);
      if (s.store_email) setStoreEmail(s.store_email);
      if (s.store_address) setStoreAddress(s.store_address);
      if (s.delivery_inside) setInsideFee(s.delivery_inside);
      if (s.delivery_outside) setOutsideFee(s.delivery_outside);
      if (s.delivery_threshold) setThreshold(s.delivery_threshold);
      setAnnouncementActive(s.announcement_active === 'true');
      if (s.announcement_text_en) setAnnouncementTextEn(s.announcement_text_en);
      if (s.announcement_text_bn) setAnnouncementTextBn(s.announcement_text_bn);
      setSeasonalActive(s.seasonal_banner_active === 'true');
      if (s.seasonal_banner_type) setSeasonalType(s.seasonal_banner_type);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const insideVal = parseInt(insideFee, 10);
    const outsideVal = parseInt(outsideFee, 10);
    const thresholdVal = parseInt(threshold, 10);

    if (isNaN(insideVal) || insideVal < 0) {
      setErrorMsg(isBn ? 'ঢাকার ভেতরে শিপিং খরচ সঠিক সংখ্যা হতে হবে।' : 'Inside Dhaka charge must be a valid positive number.');
      return;
    }
    if (isNaN(outsideVal) || outsideVal < 0) {
      setErrorMsg(isBn ? 'ঢাকার বাইরে শিপিং খরচ সঠিক সংখ্যা হতে হবে।' : 'Outside Dhaka charge must be a valid positive number.');
      return;
    }
    if (isNaN(thresholdVal) || thresholdVal < 0) {
      setErrorMsg(isBn ? 'ফ্রি শিপিং লিমিট সঠিক সংখ্যা হতে হবে।' : 'Free shipping threshold must be a valid positive number.');
      return;
    }

    const ok = await saveSettings({
      store_name: storeName,
      store_phone: storePhone,
      store_email: storeEmail,
      store_address: storeAddress,
      delivery_inside: insideFee,
      delivery_outside: outsideFee,
      delivery_threshold: threshold,
      announcement_active: String(announcementActive),
      announcement_text_en: announcementTextEn,
      announcement_text_bn: announcementTextBn,
      seasonal_banner_active: String(seasonalActive),
      seasonal_banner_type: seasonalType,
    });

    if (!ok) {
      setErrorMsg(isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save settings.');
      return;
    }

    setSuccessMsg(isBn ? 'সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে! 🚚' : 'Settings saved successfully! 🚚');
  };

  return (
    <div className="max-w-2xl space-y-6 font-sans">
      {/* Page Header */}
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-2xl font-black text-brand-text flex items-center gap-2">
          <Settings className="h-6 w-6 text-brand-primary" />
          <span>{isBn ? 'স্টোর সেটিংস' : 'Store Settings'}</span>
        </h1>
        <p className="text-xs text-brand-muted mt-1.5 font-medium">
          {isBn ? 'স্টোরের তথ্য, ডেলিভারি চার্জ ও প্রমোশনাল ব্যানার পরিচালনা করুন।' : 'Manage store info, delivery charges, and promotional banners.'}
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Info */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <h3 className="font-bold text-brand-text text-base border-b border-brand-border pb-3 flex items-center gap-2">
            <Store className="h-4.5 w-4.5 text-brand-primary" />
            {isBn ? 'স্টোরের তথ্য' : 'Store Information'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text">{isBn ? 'স্টোরের নাম' : 'Store Name'}</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text">{isBn ? 'ফোন নম্বর' : 'Phone Number'}</label>
              <input
                type="tel"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="01788-825495"
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text">{isBn ? 'ইমেইল' : 'Email'}</label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                placeholder="info.sicilybd@gmail.com"
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text">{isBn ? 'ঠিকানা' : 'Address'}</label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Dhaka, Bangladesh"
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              />
            </div>
          </div>
        </div>

        {/* Delivery Charges */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <h3 className="font-bold text-brand-text text-base border-b border-brand-border pb-3">
            {isBn ? 'শিপিং চার্জ কনফিগার করুন' : 'Configure Shipping Charges'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text">
                {isBn ? 'ঢাকার ভেতরে ডেলিভারি চার্জ (৳)' : 'Inside Dhaka Fee (৳)'}
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text">
                {isBn ? 'ঢাকার বাইরে ডেলিভারি চার্জ (৳)' : 'Outside Dhaka Fee (৳)'}
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

          <div className="space-y-1.5 max-w-sm">
            <label className="text-xs font-bold text-brand-text">
              {isBn ? 'ফ্রি শিপিং থ্রেশহোল্ড (৳)' : 'Free Shipping Threshold Amount (৳)'}
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
              {isBn
                ? '* এই অংকের বেশি বা সমান অর্ডারে কাস্টমারের জন্য অটোমেটিক ফ্রি ডেলিভারি একটিভ হবে।'
                : '* Orders equal to or exceeding this threshold will automatically get free shipping.'}
            </p>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-bold text-brand-text text-base flex items-center gap-2">
              <Megaphone className="h-4.5 w-4.5 text-brand-primary" />
              {isBn ? 'অ্যানাউন্সমেন্ট বার' : 'Announcement Bar'}
            </h3>
            <button
              type="button"
              onClick={() => setAnnouncementActive((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-all-custom flex-shrink-0 ${announcementActive ? 'bg-brand-primary' : 'bg-brand-border'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-all-custom ${announcementActive ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text">Text (English)</label>
              <input
                type="text"
                value={announcementTextEn}
                onChange={(e) => setAnnouncementTextEn(e.target.value)}
                placeholder="Free delivery in Dhaka on orders ৳500+"
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text">টেক্সট (বাংলা)</label>
              <input
                type="text"
                value={announcementTextBn}
                onChange={(e) => setAnnouncementTextBn(e.target.value)}
                placeholder="ঢাকায় ফ্রি ডেলিভারি ৳৫০০+ অর্ডারে"
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
              />
            </div>
          </div>
        </div>

        {/* Seasonal Banner */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-bold text-brand-text text-base flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-brand-primary" />
              {isBn ? 'সিজনাল ব্যানার' : 'Seasonal Banner'}
            </h3>
            <button
              type="button"
              onClick={() => setSeasonalActive((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-all-custom flex-shrink-0 ${seasonalActive ? 'bg-brand-primary' : 'bg-brand-border'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-all-custom ${seasonalActive ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="space-y-1.5 max-w-sm">
            <label className="text-xs font-bold text-brand-text">{isBn ? 'সিজন নির্বাচন করুন' : 'Select Season'}</label>
            <select
              value={seasonalType}
              onChange={(e) => setSeasonalType(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            >
              <option value="eid">{isBn ? 'ঈদ' : 'Eid'}</option>
              <option value="valentine">{isBn ? 'ভালোবাসা দিবস' : "Valentine's Day"}</option>
              <option value="newyear">{isBn ? 'নববর্ষ' : 'New Year'}</option>
            </select>
            <p className="text-[10px] text-brand-muted leading-relaxed font-medium mt-1">
              {isBn
                ? '* চালু থাকলে এটি অ্যানাউন্সমেন্ট বারের বদলে দেখাবে।'
                : '* When active, this replaces the announcement bar text/color.'}
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-brand-primary text-white font-extrabold hover:bg-brand-primary-alt shadow-lg shadow-brand-primary/25 transition-all-custom text-xs"
          >
            <Save className="h-4 w-4" />
            <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Configurations'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
