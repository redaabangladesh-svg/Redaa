'use client';

import { useLocale } from 'next-intl';
import { Clock, ShieldCheck, MessageCircle, ArrowRight, PhoneCall, Sparkles } from 'lucide-react';

const WHATSAPP_NUMBER = '8801788825495'; // Target client phone number

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export default function LiveChatPage() {
  const locale = useLocale();

  const message = locale === 'bn'
    ? 'আসসালামুয়ালাইকুম, আমার একটি প্রশ্ন আছে।'
    : 'Hi, I have a question.';
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <div className="relative min-h-[65vh] flex flex-col items-center justify-center py-10 px-4 overflow-hidden font-sans">
      
      {/* Background Decorative Chat Bubble Vector Circles */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-48 h-48 rounded-full bg-[#057476]/5 blur-3xl -z-10 hidden md:block" />
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-[#D80064]/5 blur-3xl -z-10 hidden md:block" />

      {/* Main Luxury Support Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-100/60 max-w-md w-full relative space-y-6">
        
        {/* Support Online Banner Badge */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-2 shadow-sm animate-pulse">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-black tracking-wider uppercase text-emerald-700">
            {locale === 'bn' ? 'অনলাইন সাপোর্ট' : 'Online Support'}
          </span>
        </div>

        {/* Support Agent Avatars Stack */}
        <div className="pt-2 flex items-center justify-center">
          <div className="flex -space-x-3.5">
            {[
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', // Nusrat
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', // Robiul
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100', // Tania
            ].map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="সাপোর্ট এজেন্ট"
                className="h-12 w-12 rounded-full object-cover border-2 border-white ring-2 ring-gray-50 flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Text descriptions */}
        <div className="space-y-2.5 text-center">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] text-[#057476] uppercase">
            <Sparkles className="h-3 w-3" />
            {locale === 'bn' ? 'কাস্টমার কেয়ার' : 'Customer Care'}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#111] leading-tight">
            {locale === 'bn' ? 'লাইভ চ্যাট সাপোর্ট' : 'Live Chat Support'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
            {locale === 'bn'
              ? 'আমাদের কাস্টমার সাপোর্ট টিম সরাসরি হোয়াটসঅ্যাপে আপনার সকল প্রশ্ন, ডেলিভারি আপডেট বা অর্ডারের সহায়তায় প্রস্তুত। চ্যাট শুরু করতে নিচের বাটনে ক্লিক করুন।'
              : 'Our dedicated customer care team is online to answer your questions, handle deliveries or assist with orders on WhatsApp.'}
          </p>
        </div>

        {/* Interactive CTA buttons */}
        <div className="space-y-3 pt-2">
          
          {/* Main WhatsApp Button (Glowing WhatsApp Green) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-[#25D366] text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#25D366]/20 active:translate-y-0 transition-all duration-300 shadow-md"
          >
            <WhatsAppIcon className="h-5 w-5 fill-current" />
            <span>{locale === 'bn' ? 'হোয়াটসঅ্যাপে চ্যাট করুন' : 'Chat on WhatsApp'}</span>
          </a>

          {/* Secondary Direct Call Button (Soft Teal Tint) */}
          <a
            href="tel:+8801788825495"
            className="flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-[#057476]/8 hover:bg-[#057476]/12 text-[#057476] font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#057476]/5 active:translate-y-0 transition-all duration-300 shadow-sm"
          >
            <PhoneCall className="h-4.5 w-4.5 text-[#057476]" />
            <span>{locale === 'bn' ? 'সরাসরি কল করুন' : 'Call Directly'}</span>
          </a>
        </div>

        {/* Benefits bullets list */}
        <ul className="border-t border-gray-50 pt-5 space-y-2.5 text-xs text-gray-500 text-left px-1">
          <li className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-bold text-gray-800 block">
                {locale === 'bn' ? '৫ মিনিটে রেসপন্স' : '5-Minute Response'}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                {locale === 'bn' ? 'সরাসরি এজেন্টদের কাছ থেকে তাৎক্ষণিক উত্তর' : 'Get immediate answers from live staff'}
              </span>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-lg bg-[#057476]/5 text-[#057476] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-bold text-gray-800 block">
                {locale === 'bn' ? 'নিরাপদ ও এনক্রিপ্টেড' : 'Secure & Encrypted'}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                {locale === 'bn' ? 'আপনার ব্যক্তিগত তথ্য ও চ্যাট সম্পূর্ণ গোপন থাকবে' : 'Your personal chats & detail remain private'}
              </span>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-bold text-gray-800 block">
                {locale === 'bn' ? 'চ্যাটে অর্ডার সুবিধা' : 'Easy Ordering via Chat'}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                {locale === 'bn' ? 'হোয়াটসঅ্যাপ মেসেজে প্রোডাক্টের নাম দিয়ে সহজে অর্ডার করুন' : 'Simply send product names to place an order'}
              </span>
            </div>
          </li>
        </ul>

      </div>
    </div>
  );
}
