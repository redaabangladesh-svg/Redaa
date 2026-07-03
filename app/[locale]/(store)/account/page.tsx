'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import {
  User, ShieldCheck, ShoppingBag, ArrowRight, LogOut, MapPin,
  Plus, Pencil, Trash2, Heart, Save, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { BD_DISTRICTS } from '@/lib/districts';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Customer {
  id: string;
  auth_user_id: string;
  name: string;
  email: string | null;
  phone: string;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  order_status: string;
  created_at: string;
}

interface Address {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  district: string;
  area: string | null;
  is_default: boolean;
}

const DISTRICTS = BD_DISTRICTS.map((d) => d.bn);

export default function AccountPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const router = useRouter();
  const supabase = createClient();

  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [tab, setTab] = useState<'orders' | 'addresses'>('orders');
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine, setAddrLine] = useState('');
  const [addrDistrict, setAddrDistrict] = useState(DISTRICTS[0]);
  const [addrArea, setAddrArea] = useState('');

  const loadCustomerData = async (userId: string) => {
    const { data: cust } = await supabase
      .from('customers')
      .select('id, auth_user_id, name, email, phone')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (!cust) {
      setLoading(false);
      return;
    }

    setCustomer(cust);
    setProfileName(cust.name);
    setProfilePhone(cust.phone.startsWith('pending-') ? '' : cust.phone);

    const [{ data: orderRows }, { data: addressRows }] = await Promise.all([
      supabase
        .from('orders')
        .select('id, order_number, total, order_status, created_at')
        .eq('customer_id', cust.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', cust.id)
        .order('is_default', { ascending: false }),
    ]);

    setOrders(orderRows || []);
    setAddresses(addressRows || []);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user);
      if (data.user) {
        loadCustomerData(data.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        loadCustomerData(session.user.id);
      } else {
        setCustomer(null);
        setOrders([]);
        setAddresses([]);
      }
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setCustomer(null);
  };

  const handleSaveProfile = async () => {
    if (!customer) return;
    const { error } = await supabase
      .from('customers')
      .update({ name: profileName, phone: profilePhone })
      .eq('id', customer.id);
    if (!error) {
      setCustomer({ ...customer, name: profileName, phone: profilePhone });
      setEditingProfile(false);
    }
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddrLabel('Home');
    setAddrName('');
    setAddrPhone('');
    setAddrLine('');
    setAddrDistrict(DISTRICTS[0]);
    setAddrArea('');
    setShowAddressForm(false);
  };

  const handleEditAddress = (a: Address) => {
    setEditingAddressId(a.id);
    setAddrLabel(a.label);
    setAddrName(a.recipient_name);
    setAddrPhone(a.phone);
    setAddrLine(a.address);
    setAddrDistrict(a.district);
    setAddrArea(a.area || '');
    setShowAddressForm(true);
  };

  const handleSaveAddress = async () => {
    if (!customer || !addrName || !addrPhone || !addrLine) return;

    if (editingAddressId) {
      const { error } = await supabase
        .from('customer_addresses')
        .update({
          label: addrLabel,
          recipient_name: addrName,
          phone: addrPhone,
          address: addrLine,
          district: addrDistrict,
          area: addrArea || null,
        })
        .eq('id', editingAddressId);
      if (!error) {
        setAddresses((prev) =>
          prev.map((a) =>
            a.id === editingAddressId
              ? { ...a, label: addrLabel, recipient_name: addrName, phone: addrPhone, address: addrLine, district: addrDistrict, area: addrArea || null }
              : a
          )
        );
      }
    } else {
      const { data, error } = await supabase
        .from('customer_addresses')
        .insert({
          customer_id: customer.id,
          label: addrLabel,
          recipient_name: addrName,
          phone: addrPhone,
          address: addrLine,
          district: addrDistrict,
          area: addrArea || null,
          is_default: addresses.length === 0,
        })
        .select()
        .single();
      if (!error && data) {
        setAddresses((prev) => [...prev, data]);
      }
    }
    resetAddressForm();
  };

  const handleDeleteAddress = async (id: string) => {
    const confirmDelete = window.confirm(isBn ? 'ঠিকানাটি মুছে ফেলতে চান?' : 'Delete this address?');
    if (!confirmDelete) return;
    const { error } = await supabase.from('customer_addresses').delete().eq('id', id);
    if (!error) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, { en: string; bn: string }> = {
      new: { en: 'New', bn: 'নতুন' },
      confirmed: { en: 'Confirmed', bn: 'কনফার্ম' },
      processing: { en: 'Processing', bn: 'প্রসেসিং' },
      shipped: { en: 'Shipped', bn: 'পাঠানো হয়েছে' },
      delivered: { en: 'Delivered', bn: 'ডেলিভার হয়েছে' },
      cancelled: { en: 'Cancelled', bn: 'বাতিল' },
      returned: { en: 'Returned', bn: 'ফেরত' },
    };
    return isBn ? (map[status]?.bn || status) : (map[status]?.en || status);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 min-h-[60vh]">
      {authUser && customer ? (
        <div className="space-y-6 animate-fade-up">
          {/* Profile Card */}
          <div className="bg-white border border-brand-border rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 border-b border-brand-border pb-5">
                <img
                  src={authUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}`}
                  alt={customer.name}
                  className="h-14 w-14 rounded-full object-cover border-2 border-brand-primary/30"
                />
                <div className="flex-1 min-w-0">
                  {editingProfile ? (
                    <div className="space-y-2">
                      <input
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder={isBn ? 'নাম' : 'Name'}
                        className="w-full text-sm font-semibold border border-brand-border rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-primary"
                      />
                      <input
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full text-xs border border-brand-border rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-primary"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="font-serif text-lg font-semibold text-brand-text truncate">{customer.name}</h2>
                      <p className="text-xs text-brand-muted font-semibold truncate">{customer.email}</p>
                      {profilePhone && <p className="text-xs text-brand-muted font-semibold">{profilePhone}</p>}
                    </>
                  )}
                </div>
                {editingProfile ? (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={handleSaveProfile} className="p-2 rounded-lg bg-brand-primary text-white"><Save className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setEditingProfile(false)} className="p-2 rounded-lg border border-brand-border text-brand-muted"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <button onClick={() => setEditingProfile(true)} className="p-2 rounded-lg border border-brand-border text-brand-muted hover:text-brand-primary hover:border-brand-primary flex-shrink-0">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Wishlist shortcut */}
              <button
                onClick={() => router.push(`/${locale}/wishlist`)}
                className="w-full flex items-center justify-between p-3 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-secondary/40 transition-all-custom"
              >
                <span className="flex items-center gap-2 text-xs font-bold text-brand-text">
                  <Heart className="h-4 w-4 text-brand-secondary" strokeWidth={1.75} />
                  {isBn ? 'আমার পছন্দের তালিকা' : 'My Wishlist'}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-brand-muted" />
              </button>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-brand-border">
                <button
                  onClick={() => setTab('orders')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition-all-custom ${tab === 'orders' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted'}`}
                >
                  {isBn ? 'অর্ডার হিস্টোরি' : 'Order History'}
                </button>
                <button
                  onClick={() => setTab('addresses')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition-all-custom ${tab === 'addresses' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted'}`}
                >
                  {isBn ? 'ঠিকানা' : 'Addresses'}
                </button>
              </div>

              {tab === 'orders' && (
                <div className="space-y-2">
                  {orders.length > 0 ? (
                    orders.map((ord) => (
                      <div key={ord.id} className="p-3 bg-brand-surface border border-brand-border rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-brand-text block">{ord.order_number}</span>
                          <span className="text-[10px] text-brand-muted block mt-0.5">
                            {new Date(ord.created_at).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-brand-secondary block">৳{ord.total}</span>
                          <span className="px-2 py-0.5 bg-[#C6A15B]/10 text-[#8A6A2E] text-[9px] font-bold rounded-full uppercase tracking-wider mt-0.5 inline-block">
                            {statusLabel(ord.order_status)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-brand-muted italic py-4 text-center">
                      {isBn ? 'কোনো অর্ডার পাওয়া যায়নি।' : 'No orders found yet.'}
                    </p>
                  )}
                </div>
              )}

              {tab === 'addresses' && (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <div key={a.id} className="p-3 bg-brand-surface border border-brand-border rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-text flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                          {a.label}
                          {a.is_default && (
                            <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[9px] rounded-full font-bold">
                              {isBn ? 'ডিফল্ট' : 'Default'}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-1.5">
                          <button onClick={() => handleEditAddress(a)} className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-primary hover:border-brand-primary">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleDeleteAddress(a.id)} className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-red-600 hover:border-red-300">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-brand-muted">{a.recipient_name} · {a.phone}</p>
                      <p className="text-brand-muted">{a.address}, {a.area ? `${a.area}, ` : ''}{a.district}</p>
                    </div>
                  ))}

                  {showAddressForm ? (
                    <div className="p-3 border border-brand-border rounded-xl space-y-2.5 bg-white">
                      <div className="grid grid-cols-2 gap-2">
                        <input value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} placeholder={isBn ? 'লেবেল (বাড়ি/অফিস)' : 'Label (Home/Office)'} className="text-xs border border-brand-border rounded-lg px-2.5 py-2 outline-none focus:border-brand-primary" />
                        <select value={addrDistrict} onChange={(e) => setAddrDistrict(e.target.value)} className="text-xs border border-brand-border rounded-lg px-2.5 py-2 outline-none focus:border-brand-primary">
                          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <input value={addrName} onChange={(e) => setAddrName(e.target.value)} placeholder={isBn ? 'প্রাপকের নাম' : 'Recipient Name'} className="w-full text-xs border border-brand-border rounded-lg px-2.5 py-2 outline-none focus:border-brand-primary" />
                      <input value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} placeholder="017XXXXXXXX" className="w-full text-xs border border-brand-border rounded-lg px-2.5 py-2 outline-none focus:border-brand-primary" />
                      <input value={addrLine} onChange={(e) => setAddrLine(e.target.value)} placeholder={isBn ? 'সম্পূর্ণ ঠিকানা' : 'Full Address'} className="w-full text-xs border border-brand-border rounded-lg px-2.5 py-2 outline-none focus:border-brand-primary" />
                      <input value={addrArea} onChange={(e) => setAddrArea(e.target.value)} placeholder={isBn ? 'এলাকা (ঐচ্ছিক)' : 'Area (Optional)'} className="w-full text-xs border border-brand-border rounded-lg px-2.5 py-2 outline-none focus:border-brand-primary" />
                      <div className="flex gap-2 pt-1">
                        <button onClick={handleSaveAddress} className="flex-1 py-2 rounded-lg bg-brand-primary text-white text-xs font-bold">
                          {isBn ? 'সংরক্ষণ করুন' : 'Save'}
                        </button>
                        <button onClick={resetAddressForm} className="flex-1 py-2 rounded-lg border border-brand-border text-brand-muted text-xs font-bold">
                          {isBn ? 'বাতিল' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="w-full py-2.5 rounded-xl border border-dashed border-brand-border text-brand-muted hover:border-brand-primary hover:text-brand-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all-custom"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {isBn ? 'নতুন ঠিকানা যোগ করুন' : 'Add New Address'}
                    </button>
                  )}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => router.push(`/${locale}/shop`)}
                  className="w-full py-3 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-alt text-white font-bold text-xs shadow-sm hover:shadow-lg hover:shadow-brand-primary/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>{isBn ? 'কেনাকাটা শুরু করুন' : 'Continue Shopping'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-full border border-brand-border text-brand-muted hover:text-brand-secondary hover:border-brand-secondary/30 hover:bg-brand-surface text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  <span>{isBn ? 'লগআউট করুন' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto flex flex-col justify-center min-h-[50vh]">
          <div className="bg-white border border-brand-border rounded-2xl shadow-xl overflow-hidden text-center animate-fade-up">
            <div className="p-6 space-y-6">
              <div className="space-y-2.5">
                <div className="h-14 w-14 rounded-full bg-brand-primary/8 flex items-center justify-center text-brand-primary mx-auto">
                  <User className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-xl font-semibold text-brand-text">
                  {isBn ? 'অ্যাকাউন্টে সাইন ইন করুন' : 'Sign in to Account'}
                </h2>
                <p className="text-xs text-brand-muted font-semibold max-w-[280px] mx-auto leading-relaxed">
                  {isBn
                    ? 'আপনার অর্ডার ট্র্যাকিং এবং প্রোফাইল ভিউ অ্যাক্সেস করতে জিমেইল দিয়ে সাইন ইন করুন।'
                    : 'Sign in with your Google account to track orders and manage your profile.'}
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={signingIn}
                className="w-full py-3 px-6 rounded-lg border border-brand-border bg-white hover:bg-brand-surface hover:shadow-md text-brand-text font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-60"
              >
                {signingIn ? (
                  <div className="h-5 w-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                ) : (
                  <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11C3.25 21.3 7.31 24 12 24Z"/>
                    <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.76 1.27 5.39l4-3.11Z"/>
                    <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"/>
                  </svg>
                )}
                <span>
                  {signingIn
                    ? (isBn ? 'সাইন ইন হচ্ছে...' : 'Signing in...')
                    : (isBn ? 'গুগল দিয়ে সাইন ইন করুন' : 'Sign in with Google')}
                </span>
              </button>

              <div className="border-t border-brand-border pt-4 flex items-center justify-around text-[10px] text-brand-muted font-semibold">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand-primary" strokeWidth={1.75} /> {isBn ? 'নিরাপদ লগইন' : 'Secure Login'}</span>
                <span className="flex items-center gap-1.5"><ShoppingBag className="h-3.5 w-3.5 text-brand-secondary" strokeWidth={1.75} /> {isBn ? 'অর্ডার ট্র্যাকিং' : 'Order Tracking'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
