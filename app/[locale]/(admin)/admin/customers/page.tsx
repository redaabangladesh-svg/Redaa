'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Users, ShieldAlert, Ban, CheckCircle2, Star, Search } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  orders: number;
  spent: number;
  tag: 'vip' | 'repeat' | 'regular' | 'flagged';
  isBlocked: boolean;
}

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Karim Ahmed',
    phone: '01711223344',
    orders: 14,
    spent: 12500,
    tag: 'vip',
    isBlocked: false
  },
  {
    id: '2',
    name: 'Rahima Khatun',
    phone: '01988776655',
    orders: 5,
    spent: 4500,
    tag: 'repeat',
    isBlocked: false
  },
  {
    id: '3',
    name: 'Spam Bot User',
    phone: '01511223344',
    orders: 1,
    spent: 990,
    tag: 'flagged',
    isBlocked: true
  },
  {
    id: '4',
    name: 'Sagor Hossein',
    phone: '01655443322',
    orders: 1,
    spent: 1250,
    tag: 'regular',
    isBlocked: false
  }
];

export default function AdminCustomersPage() {
  const locale = useLocale();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('sicily_customers_list');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomers(parsed);
      } catch (e) {
        console.error(e);
        setCustomers(DEFAULT_CUSTOMERS);
      }
    } else {
      localStorage.setItem('sicily_customers_list', JSON.stringify(DEFAULT_CUSTOMERS));
      setCustomers(DEFAULT_CUSTOMERS);
    }
  }, []);

  const handleToggleBlock = (id: string, currentlyBlocked: boolean) => {
    const action = currentlyBlocked ? 'unblock' : 'block';
    const confirmAction = window.confirm(
      locale === 'bn'
        ? `আপনি কি নিশ্চিতভাবে এই কাস্টমারকে ${currentlyBlocked ? 'আনব্লক' : 'ব্লক'} করতে চান?`
        : `Are you sure you want to ${action} this customer?`
    );

    if (!confirmAction) return;

    const updated = customers.map((c) => {
      if (c.id === id) {
        return { ...c, isBlocked: !currentlyBlocked };
      }
      return c;
    });

    setCustomers(updated);
    localStorage.setItem('sicily_customers_list', JSON.stringify(updated));
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-brand-text flex items-center gap-2">
            <Users className="h-6 w-6 text-brand-primary" />
            <span>{locale === 'bn' ? 'কাস্টমার ডিরেক্টরি' : 'Customer Directory'}</span>
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 font-medium">
            {locale === 'bn' ? 'স্টোরের নিবন্ধিত কাস্টমারদের তালিকা, অর্ডার হিস্টোরি এবং ফ্রড প্রোফাইল মনিটর করুন।' : 'Monitor buyer portfolios, purchase values, and toggle spam flags/blocks.'}
          </p>
        </div>
      </div>

      {/* Filter and Search queries */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-brand-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={locale === 'bn' ? 'নাম বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by buyer name or mobile...'}
          className="w-full bg-white border border-brand-border rounded-xl py-2 pl-9 pr-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface/40 text-brand-muted font-bold">
                <th className="py-4 px-5">{locale === 'bn' ? 'গ্রাহক' : 'Customer'}</th>
                <th className="py-4 px-5">{locale === 'bn' ? 'অর্ডার সংখ্যা' : 'Orders'}</th>
                <th className="py-4 px-5">{locale === 'bn' ? 'মোট খরচ' : 'Total Spent'}</th>
                <th className="py-4 px-5">{locale === 'bn' ? 'স্ট্যাটাস ট্যাগ' : 'Tags'}</th>
                <th className="py-4 px-5 text-right">{locale === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-muted font-bold">
                    {locale === 'bn' ? 'কোনো গ্রাহক পাওয়া যায়নি।' : 'No customers matching search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  let tagColor = 'bg-gray-55 border-gray-100 text-brand-text';
                  if (c.tag === 'vip') tagColor = 'bg-amber-50 border-amber-100 text-amber-700 font-extrabold';
                  else if (c.tag === 'repeat') tagColor = 'bg-blue-50 border-blue-100 text-blue-700';
                  else if (c.tag === 'flagged') tagColor = 'bg-rose-50 border-rose-100 text-rose-700';

                  return (
                    <tr key={c.id} className="hover:bg-brand-surface/40">
                      <td className="py-3.5 px-5">
                        <div>
                          <span className="font-extrabold text-brand-text text-xs block">{c.name}</span>
                          <span className="text-[9px] text-brand-muted block mt-0.5">{c.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-brand-text">{c.orders} {locale === 'bn' ? 'টি' : 'orders'}</td>
                      <td className="py-3.5 px-5 font-black text-brand-primary">৳{c.spent}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex gap-1.5 flex-wrap">
                          {c.isBlocked ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500 border border-red-600 text-white flex items-center gap-1 uppercase tracking-wide">
                              <Ban className="h-3 w-3" />
                              <span>{locale === 'bn' ? 'ব্লকড' : 'Blocked'}</span>
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${tagColor}`}>
                              {c.tag === 'vip' && <Star className="h-2.5 w-2.5 inline mr-1 fill-current align-text-bottom" />}
                              {c.tag}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleToggleBlock(c.id, c.isBlocked)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-extrabold transition-all-custom ${
                            c.isBlocked
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {c.isBlocked ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{locale === 'bn' ? 'আনব্লক করুন' : 'Unblock'}</span>
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              <span>{locale === 'bn' ? 'ব্লক করুন' : 'Block Client'}</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
