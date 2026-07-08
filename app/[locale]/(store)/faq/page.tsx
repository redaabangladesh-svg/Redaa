import type { Metadata } from 'next';
import { HelpCircle } from 'lucide-react';
import InfoPageHeader from '@/components/store/InfoPageHeader';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Sicily';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: `সচরাচর জিজ্ঞাসিত প্রশ্নাবলী | ${STORE_NAME}`,
  description: 'ডেলিভারি চার্জ, পেমেন্ট পদ্ধতি, রিটার্ন পলিসি ও অর্ডার সংক্রান্ত সাধারণ প্রশ্নের উত্তর।',
  alternates: { canonical: `${BASE_URL}/faq` },
};

const FAQS = [
  {
    q_bn: 'ঢাকায় সুন্দর ফুলের সাজসজ্জা কোথায় পাবো?',
    q_en: 'Where can I find beautiful flower décor in Dhaka?',
    a_bn: `${STORE_NAME}-তে আমরা হাতে তৈরি ফুলের টব, বার্ড নেস্ট ও ওয়াল স্ট্যান্ড সরবরাহ করি — সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে অর্ডার করা যায়।`,
    a_en: `At ${STORE_NAME} we supply handcrafted flower tubs, bird nests, and wall stands — delivered anywhere in Bangladesh with cash on delivery.`,
  },
  {
    q_bn: 'হ্যান্ডমেড হোম ডেকোর কোথায় কিনবো?',
    q_en: 'Where can I buy handmade home décor?',
    a_bn: `${STORE_NAME}-এর শপ পেজে আমাদের সম্পূর্ণ কালেকশন দেখুন — প্রতিটি পণ্য দেশীয় কারিগরদের হাতে তৈরি।`,
    a_en: `Browse our full collection on the shop page — every item is handcrafted by local artisans.`,
  },
  {
    q_bn: 'ডেলিভারি চার্জ কত এবং কতদিনের মধ্যে পাব?',
    q_en: 'What are the shipping charges and delivery timeline?',
    a_bn: 'ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৮০ টাকা (১-২ দিন) এবং ঢাকা সিটির বাইরে ১৫০ টাকা (৩-৪ দিন)।',
    a_en: 'Shipping is ৳80 inside Dhaka (1-2 days) and ৳150 outside Dhaka (3-4 days), nationwide.',
  },
  {
    q_bn: 'অর্ডার করতে কি অগ্রিম পেমেন্ট করতে হবে?',
    q_en: 'Do I need to pay in advance to place an order?',
    a_bn: 'না, ক্যাশ অন ডেলিভারি (COD) সুবিধায় প্রোডাক্ট হাতে পেয়ে যাচাই করে তারপর পেমেন্ট করতে পারবেন।',
    a_en: 'No — with Cash on Delivery you can inspect the product and pay only after receiving it.',
  },
  {
    q_bn: 'পণ্য পছন্দ না হলে রিটার্ন করা যাবে?',
    q_en: 'Can I return a product if I don’t like it?',
    a_bn: 'হ্যাঁ, ডেলিভারির ৭ দিনের মধ্যে অব্যবহৃত পণ্য রিটার্ন করা যাবে। বিস্তারিত জানতে আমাদের রিটার্ন ও রিফান্ড পলিসি দেখুন।',
    a_en: 'Yes, unused products can be returned within 7 days of delivery. See our Return & Refund policy for details.',
  },
];

export default function FaqPage({ params }: { params: { locale: string } }) {
  const isBn = params.locale === 'bn';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: isBn ? f.q_bn : f.q_en,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isBn ? f.a_bn : f.a_en,
      },
    })),
  };

  return (
    <div className="font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InfoPageHeader
        icon={HelpCircle}
        title={isBn ? 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী' : 'Frequently Asked Questions'}
        subtitle={isBn
          ? 'অর্ডার করার আগে জেনে নিন সাধারণ কিছু প্রশ্নের উত্তর।'
          : 'Answers to common questions before you order.'}
      />

      <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14 space-y-3">
        {FAQS.map((f, i) => (
          <details key={i} className="group border border-brand-border bg-white rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="cursor-pointer font-bold text-sm text-brand-text">
              {isBn ? f.q_bn : f.q_en}
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-brand-muted border-t border-brand-border pt-3">
              {isBn ? f.a_bn : f.a_en}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
