'use client';

import { useLocale } from 'next-intl';
import { Info, Heart, Sparkles, Users, Award } from 'lucide-react';
import InfoPageHeader from '@/components/store/InfoPageHeader';

export default function AboutPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const values = [
    {
      icon: Heart,
      title: isBn ? 'হাতে তৈরি ভালোবাসা' : 'Handcrafted with Love',
      desc: isBn ? 'প্রতিটি পণ্য যত্ন সহকারে দেশীয় কারিগরদের হাতে তৈরি।' : 'Every piece is carefully handcrafted by local artisans.'
    },
    {
      icon: Sparkles,
      title: isBn ? 'প্রিমিয়াম কোয়ালিটি' : 'Premium Quality',
      desc: isBn ? 'উন্নত মানের উপকরণ ব্যবহার করে দীর্ঘস্থায়ী পণ্য তৈরি করি।' : 'We use premium materials to build products that last.'
    },
    {
      icon: Users,
      title: isBn ? 'গ্রাহক প্রথম' : 'Customer First',
      desc: isBn ? 'হাজারো সন্তুষ্ট গ্রাহকের আস্থা অর্জন করেছি সততার সাথে।' : 'We have earned the trust of thousands of happy customers.'
    },
    {
      icon: Award,
      title: isBn ? 'নির্ভরযোগ্য সেবা' : 'Trusted Service',
      desc: isBn ? 'সময়মতো ডেলিভারি ও নিরাপদ পেমেন্টের নিশ্চয়তা।' : 'On-time delivery and secure payments, guaranteed.'
    }
  ];

  return (
    <div className="font-sans">
      <InfoPageHeader
        icon={Info}
        title={isBn ? 'আমাদের সম্পর্কে' : 'About Us'}
        subtitle={isBn
          ? 'আমরা একটি প্রিমিয়াম পোশাক ও লাইফস্টাইল ব্র্যান্ড, যা গুণগত মান এবং আধুনিক ডিজাইনে বিশ্বাসী।'
          : "We're a premium clothing and lifestyle brand dedicated to quality and style."}
      />

      <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14 space-y-10">
        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-brand-text">
            {isBn ? 'আমাদের গল্প' : 'Our Story'}
          </h2>
          <p className="text-sm text-brand-muted leading-relaxed">
            {isBn
              ? 'Redaa শুরু হয়েছিল একটি ছোট্ট স্বপ্ন নিয়ে — আমাদের গ্রাহকদের জন্য প্রিমিয়াম কোয়ালিটির পাঞ্জাবি, টুপি, রুমাল ও ওড়নার একটি অনন্য কালেকশন পৌঁছে দেওয়া। প্রতিটি পণ্যের ক্ষেত্রে আমরা সর্বোচ্চ গুণগত মান এবং আরামদায়ক কাপড়কে সবচেয়ে বেশি গুরুত্ব দিই। আমাদের লক্ষ্য শুধু পণ্য বিক্রি করা নয়, বরং আপনাদের প্রতিটি বিশেষ মুহূর্তকে আরও সুন্দর ও আনন্দময় করে তোলা।'
              : 'Redaa began with a simple dream — to bring premium clothing, Panjabi, Tupi, Rumal, and Orna collections to our customers. We prioritize quality, aesthetics, and premium comfort in every single piece. Our goal is to provide our customers with stylish, elegant, and high-quality lifestyle wear for every occasion.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="bg-white border border-brand-border rounded-2xl p-5 flex gap-4 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-bold text-brand-text text-sm">{v.title}</h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
