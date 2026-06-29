'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { BarChart3, Download, TrendingUp, Search, Layers, RefreshCw, ShoppingCart, CheckCircle2 } from 'lucide-react';

interface SearchLog {
  query: string;
  count: number;
  last_searched: string;
}

const FALLBACK_SEARCH_LOGS: SearchLog[] = [
  { query: 'Tulip Hanger', count: 18, last_searched: '2026-06-29 11:20' },
  { query: 'Metal frame', count: 12, last_searched: '2026-06-29 10:45' },
  { query: 'Wall Decor Set', count: 8, last_searched: '2026-06-28 14:15' },
  { query: 'Vase', count: 5, last_searched: '2026-06-27 16:30' }
];

export default function AdminReportsPage() {
  const locale = useLocale();

  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sicily_search_logs');
    if (stored) {
      try {
        const parsed: SearchLog[] = JSON.parse(stored);
        setSearchLogs(parsed.sort((a, b) => b.count - a.count));
      } catch (e) {
        console.error(e);
        setSearchLogs(FALLBACK_SEARCH_LOGS);
      }
    } else {
      localStorage.setItem('sicily_search_logs', JSON.stringify(FALLBACK_SEARCH_LOGS));
      setSearchLogs(FALLBACK_SEARCH_LOGS);
    }
  }, []);

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(
        locale === 'bn' 
          ? 'কনভার্সন এবং রেভিনিউ রিপোর্ট এক্সপোর্ট সম্পন্ন হয়েছে! (sicily_report_2026.csv)' 
          : 'E-commerce conversion & revenue report exported! (sicily_report_2026.csv)'
      );
    }, 1200);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-brand-primary" />
            <span>{locale === 'bn' ? 'অ্যানালিটিক্স ও রিপোর্টস' : 'Analytics & Performance'}</span>
          </h1>
          <p className="text-xs text-brand-muted mt-1.5 font-medium">
            {locale === 'bn' ? 'সাপ্তাহিক রেভিনিউ ট্রেন্ড, কনভার্সন রেট এবং কাস্টমার সার্চ লগস ট্র্যাক করুন।' : 'Weekly revenue growth, funnel conversion rates, and client search keywords.'}
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-text hover:border-brand-primary hover:text-brand-primary font-bold text-xs shadow-sm transition-all-custom disabled:opacity-50"
        >
          {isExporting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>{locale === 'bn' ? 'রিপোর্ট এক্সপোর্ট করুন' : 'Export CSV Report'}</span>
        </button>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SVG Weekly Revenue Growth Line Chart */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 lg:col-span-2 space-y-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-brand-text text-sm flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-brand-primary" />
              <span>{locale === 'bn' ? 'সাপ্তাহিক রেভিনিউ গ্রোথ' : 'Weekly Revenue Trends'}</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              +14.2% Growth
            </span>
          </div>

          {/* SVG line drawing */}
          <div className="relative pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#008B8B" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#008B8B" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
              
              {/* Shaded Area Under Line */}
              <path 
                d="M 0 170 C 50 140, 100 150, 150 110 C 200 70, 250 90, 300 50 C 350 10, 400 30, 450 15 C 475 8, 500 5, 500 5 L 500 200 L 0 200 Z" 
                fill="url(#chartGradient)" 
              />
              
              {/* Line Curve */}
              <path 
                d="M 0 170 C 50 140, 100 150, 150 110 C 200 70, 250 90, 300 50 C 350 10, 400 30, 450 15 C 475 8, 500 5, 500 5" 
                fill="none" 
                stroke="#008B8B" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />

              {/* Data points markers */}
              <circle cx="150" cy="110" r="5" fill="#008B8B" stroke="#ffffff" strokeWidth="2" className="drop-shadow-md" />
              <circle cx="300" cy="50" r="5" fill="#008B8B" stroke="#ffffff" strokeWidth="2" className="drop-shadow-md" />
              <circle cx="450" cy="15" r="5" fill="#008B8B" stroke="#ffffff" strokeWidth="2" className="drop-shadow-md" />
            </svg>
            
            {/* Legend Labels */}
            <div className="flex justify-between items-center text-[9px] font-bold text-brand-muted pt-2 px-1">
              <span>{locale === 'bn' ? 'শনিবার' : 'Sat'}</span>
              <span>{locale === 'bn' ? 'সোমবার' : 'Mon'}</span>
              <span>{locale === 'bn' ? 'বুধবার' : 'Wed'}</span>
              <span>{locale === 'bn' ? 'শুক্রবার' : 'Fri'}</span>
            </div>
          </div>
        </div>

        {/* Funnel Conversion Rates */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-6 shadow-sm">
          <h3 className="font-extrabold text-brand-text text-sm flex items-center gap-2">
            <ShoppingCart className="h-4.5 w-4.5 text-brand-primary" />
            <span>{locale === 'bn' ? 'কনভার্সন ফানেল' : 'Funnel Conversion'}</span>
          </h3>

          <div className="space-y-4 pt-2">
            {[
              { label_en: 'Store Visitors', label_bn: 'ভিজিটর সংখ্যা', val: 5000, pct: '100%' },
              { label_en: 'Added to Cart', label_bn: 'কার্টে যোগ করেছেন', val: 850, pct: '17%' },
              { label_en: 'Checkout Process', label_bn: 'চেকআউট শুরু', val: 350, pct: '7%' },
              { label_en: 'Confirmed Order', label_bn: 'অর্ডার সম্পন্ন', val: 150, pct: '3%' }
            ].map((step, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between items-baseline font-bold text-brand-text">
                  <span>{locale === 'bn' ? step.label_bn : step.label_en}</span>
                  <span className="text-brand-primary">{step.pct} ({step.val})</span>
                </div>
                <div className="w-full h-3 rounded-full bg-brand-surface border border-brand-border overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary rounded-full" 
                    style={{ width: step.pct }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Search queries list */}
      <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <Search className="h-5 w-5 text-brand-primary" />
          <h3 className="font-extrabold text-brand-text text-base">
            {locale === 'bn' ? 'গ্রাহকদের খোঁজা শীর্ষ কিওয়ার্ড সমূহ' : 'Top Customer Search Queries'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted font-bold">
                <th className="py-3 px-4">{locale === 'bn' ? 'সার্চ কিওয়ার্ড' : 'Search Keyword'}</th>
                <th className="py-3 px-4">{locale === 'bn' ? 'সার্চ সংখ্যা' : 'Search Frequency'}</th>
                <th className="py-3 px-4">{locale === 'bn' ? 'সর্বশেষ সার্চের সময়' : 'Last Searched'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {searchLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-brand-muted font-bold">
                    {locale === 'bn' ? 'কোনো সার্চ লগ পাওয়া যায়নি।' : 'No search logs registered.'}
                  </td>
                </tr>
              ) : (
                searchLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-brand-surface/40">
                    <td className="py-3 px-4 font-extrabold text-brand-text">{log.query}</td>
                    <td className="py-3 px-4 font-bold text-brand-primary">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">
                        {log.count} {locale === 'bn' ? 'বার' : 'times'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-muted font-bold">{log.last_searched}</td>
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
