'use client';

import { useLocale } from 'next-intl';
import { ShieldAlert, Lock, Eye, Database, Mail } from 'lucide-react';
import InfoPageHeader from '@/components/store/InfoPageHeader';

export default function PrivacyPolicyPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const sections = [
    {
      icon: Database,
      title: isBn ? 'কী তথ্য সংগ্রহ করি' : 'What We Collect',
      desc: isBn
        ? 'অর্ডার প্রক্রিয়াকরণের জন্য আপনার নাম, ফোন নম্বর, ঠিকানা এবং পেমেন্ট সংক্রান্ত প্রয়োজনীয় তথ্য সংগ্রহ করা হয়।'
        : 'We collect your name, phone number, address, and necessary payment details to process your orders.'
    },
    {
      icon: Eye,
      title: isBn ? 'তথ্য কীভাবে ব্যবহার করি' : 'How We Use It',
      desc: isBn
        ? 'শুধুমাত্র অর্ডার ডেলিভারি, গ্রাহক সেবা এবং প্রয়োজনীয় যোগাযোগের জন্য আপনার তথ্য ব্যবহার করা হয়। কোনো তৃতীয় পক্ষের কাছে বিক্রি করা হয় না।'
        : 'Your data is used solely for order delivery, customer service, and necessary communication. It is never sold to third parties.'
    },
    {
      icon: Lock,
      title: isBn ? 'তথ্যের নিরাপত্তা' : 'Data Security',
      desc: isBn
        ? 'আপনার ব্যক্তিগত ও পেমেন্ট তথ্য এনক্রিপ্টেড ও নিরাপদ সার্ভারে সংরক্ষিত থাকে।'
        : 'Your personal and payment information is stored securely with encryption.'
    },
    {
      icon: Mail,
      title: isBn ? 'যোগাযোগের অনুমতি' : 'Communication Consent',
      desc: isBn
        ? 'অর্ডার আপডেট, অফার বা প্রয়োজনীয় নোটিফিকেশনের জন্য আমরা এসএমএস বা হোয়াটসঅ্যাপে যোগাযোগ করতে পারি।'
        : 'We may contact you via SMS or WhatsApp for order updates, offers, or important notifications.'
    }
  ];

  return (
    <div className="font-sans">
      <InfoPageHeader
        icon={ShieldAlert}
        title={isBn ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'}
        subtitle={isBn
          ? 'আপনার ব্যক্তিগত তথ্যের নিরাপত্তা আমাদের কাছে সর্বোচ্চ অগ্রাধিকার।'
          : 'Protecting your personal information is our top priority.'}
      />

      <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14 space-y-4">
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white border border-brand-border rounded-2xl p-5 flex gap-4 shadow-sm items-start">
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-bold text-brand-text text-sm">{s.title}</h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 text-xs text-brand-muted leading-relaxed">
          {isBn
            ? '* কোনো প্রশ্ন থাকলে redaabangladesh@gmail.com ঠিকানায় ইমেইল করুন অথবা ০১৯৭০-৪৫২৭২৩ নম্বরে যোগাযোগ করুন।'
            : '* For any questions, email redaabangladesh@gmail.com or reach us at 01970-452723.'}
        </div>
      </div>
    </div>
  );
}
