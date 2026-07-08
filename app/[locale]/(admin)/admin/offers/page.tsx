'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Tag, Plus, Trash2, ShieldCheck, ShieldAlert, Percent, BadgeDollarSign, Truck } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminOffersPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed' | 'free_delivery'>('percentage');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('0');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const loadCoupons = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setErrorMsg(isBn ? 'কুপন কোড আবশ্যক।' : 'Coupon code is required.');
      return;
    }
    if (coupons.some(c => c.code === trimmedCode)) {
      setErrorMsg(isBn ? 'এই কোড ইতিমধ্যে ব্যবহৃত হয়েছে।' : 'This coupon code already exists.');
      return;
    }

    const numValue = type === 'free_delivery' ? 0 : parseFloat(value);
    if (type !== 'free_delivery' && (isNaN(numValue) || numValue <= 0)) {
      setErrorMsg(isBn ? 'মূল্য সঠিক সংখ্যা হতে হবে।' : 'Value must be a valid positive number.');
      return;
    }

    const numMinOrder = parseFloat(minOrder) || 0;
    const numMaxUses = maxUses.trim() === '' ? null : parseInt(maxUses, 10);

    const supabase = createClient();
    const { error } = await supabase.from('coupons').insert({
      code: trimmedCode,
      type,
      value: numValue,
      min_order: numMinOrder,
      max_uses: numMaxUses,
      expires_at: expiresAt || null,
    });

    if (error) {
      setErrorMsg(isBn ? 'কুপন তৈরি ব্যর্থ হয়েছে।' : 'Failed to create coupon.');
      console.error(error);
      return;
    }

    await loadCoupons();
    setSuccessMsg(isBn ? 'কুপন সফলভাবে তৈরি হয়েছে! 🎉' : 'Coupon created successfully! 🎉');
    setCode('');
    setValue('');
    setMinOrder('0');
    setMaxUses('');
    setExpiresAt('');
  };

  const toggleActive = async (id: string, current: boolean) => {
    const supabase = createClient();
    const { error } = await supabase.from('coupons').update({ is_active: !current }).eq('id', id);
    if (!error) {
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c)));
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      isBn ? 'আপনি কি নিশ্চিতভাবে এই কুপনটি ডিলিট করতে চান?' : 'Are you sure you want to delete this coupon?'
    );
    if (!confirmDelete) return;

    const supabase = createClient();
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const typeLabel = (t: Coupon['type']) => {
    if (t === 'percentage') return isBn ? 'শতাংশ ছাড়' : 'Percentage';
    if (t === 'fixed') return isBn ? 'নির্দিষ্ট টাকা' : 'Fixed Amount';
    return isBn ? 'ফ্রি ডেলিভারি' : 'Free Delivery';
  };

  const typeIcon = (t: Coupon['type']) => {
    if (t === 'percentage') return <Percent className="h-3.5 w-3.5" />;
    if (t === 'fixed') return <BadgeDollarSign className="h-3.5 w-3.5" />;
    return <Truck className="h-3.5 w-3.5" />;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-xl md:text-2xl font-black text-brand-text flex items-center gap-2">
          <Tag className="h-6 w-6 text-brand-primary" />
          <span>{isBn ? 'কুপন ও অফার' : 'Coupons & Offers'}</span>
        </h1>
        <p className="text-xs text-brand-muted mt-1.5 font-medium">
          {isBn ? 'নতুন ডিসকাউন্ট কুপন তৈরি করুন এবং চলমান অফারগুলো পরিচালনা করুন।' : 'Create discount coupons and manage active promotional offers.'}
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

      {/* Coupon Creator */}
      <form onSubmit={handleCreate} className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <h3 className="font-bold text-brand-text text-base border-b border-brand-border pb-3">
          {isBn ? 'নতুন কুপন তৈরি করুন' : 'Create New Coupon'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text">{isBn ? 'কুপন কোড' : 'Coupon Code'}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="EID2026"
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold uppercase"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text">{isBn ? 'ধরন' : 'Type'}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Coupon['type'])}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            >
              <option value="percentage">{isBn ? 'শতাংশ ছাড়' : 'Percentage'}</option>
              <option value="fixed">{isBn ? 'নির্দিষ্ট টাকা' : 'Fixed Amount'}</option>
              <option value="free_delivery">{isBn ? 'ফ্রি ডেলিভারি' : 'Free Delivery'}</option>
            </select>
          </div>

          {type !== 'free_delivery' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text">
                {type === 'percentage' ? (isBn ? 'ছাড়ের হার (%)' : 'Discount Value (%)') : (isBn ? 'ছাড়ের পরিমাণ (৳)' : 'Discount Value (৳)')}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min={1}
                className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text">{isBn ? 'সর্বনিম্ন অর্ডার (৳)' : 'Minimum Order (৳)'}</label>
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              min={0}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text">{isBn ? 'সর্বোচ্চ ব্যবহার (ঐচ্ছিক)' : 'Max Uses (Optional)'}</label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              min={1}
              placeholder={isBn ? 'সীমাহীন' : 'Unlimited'}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text">{isBn ? 'মেয়াদ শেষ (ঐচ্ছিক)' : 'Expiry Date (Optional)'}</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
            />
          </div>
        </div>

        <div className="border-t border-brand-border pt-6 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-brand-primary text-white font-extrabold hover:bg-brand-primary-alt shadow-lg shadow-brand-primary/25 transition-all-custom text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{isBn ? 'কুপন তৈরি করুন' : 'Create Coupon'}</span>
          </button>
        </div>
      </form>

      {/* Active Offers List */}
      <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-brand-border">
          <h3 className="font-bold text-brand-text text-base">{isBn ? 'চলমান অফারসমূহ' : 'Active Offers'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface/40 text-brand-muted font-bold">
                <th className="py-4 px-5">{isBn ? 'কোড' : 'Code'}</th>
                <th className="py-4 px-5">{isBn ? 'ধরন' : 'Type'}</th>
                <th className="py-4 px-5">{isBn ? 'মূল্য' : 'Value'}</th>
                <th className="py-4 px-5">{isBn ? 'ব্যবহার' : 'Usage'}</th>
                <th className="py-4 px-5">{isBn ? 'মেয়াদ' : 'Expires'}</th>
                <th className="py-4 px-5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-4 px-5 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted font-bold">
                    {isBn ? 'কোনো কুপন পাওয়া যায়নি।' : 'No coupons found.'}
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-surface/40">
                    <td className="py-3.5 px-5 font-extrabold text-brand-text">{c.code}</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 text-brand-muted font-semibold">
                        {typeIcon(c.type)}
                        {typeLabel(c.type)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-brand-secondary">
                      {c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? `৳${c.value}` : '—'}
                    </td>
                    <td className="py-3.5 px-5 text-brand-muted font-semibold">
                      {c.used_count} / {c.max_uses ?? (isBn ? 'সীমাহীন' : '∞')}
                    </td>
                    <td className="py-3.5 px-5 text-brand-muted font-semibold">
                      {c.expires_at || (isBn ? 'নেই' : 'None')}
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => toggleActive(c.id, c.is_active)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all-custom ${
                          c.is_active
                            ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                            : 'bg-brand-surface border border-brand-border text-brand-muted'
                        }`}
                      >
                        {c.is_active ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="inline-flex p-1.5 rounded-lg border border-brand-border text-brand-muted hover:border-red-300 hover:text-red-600 transition-all-custom"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
