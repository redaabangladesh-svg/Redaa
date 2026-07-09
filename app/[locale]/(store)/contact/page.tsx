'use client';

import { useLocale } from 'next-intl';
import { Phone, Mail, MapPin } from 'lucide-react';
import InfoPageHeader from '@/components/store/InfoPageHeader';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function ContactPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const cards = [
    {
      icon: Phone,
      title: isBn ? 'ফোন করুন' : 'Call Us',
      value: '01970452723',
      href: 'tel:+8801970452723',
      color: 'text-brand-primary bg-brand-primary/10'
    },
    {
      icon: WhatsAppIcon,
      title: isBn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp',
      value: '01970452723',
      href: 'https://wa.me/8801970452723',
      color: 'text-[#25D366] bg-[#25D366]/10'
    },
    {
      icon: Mail,
      title: isBn ? 'ইমেইল করুন' : 'Email Us',
      value: 'redaabangladesh@gmail.com',
      href: 'mailto:redaabangladesh@gmail.com',
      color: 'text-brand-secondary bg-brand-secondary/10'
    },
    {
      icon: MapPin,
      title: isBn ? 'ঠিকানা' : 'Address',
      value: isBn ? 'যাত্রাবাড়ী, ঢাকা' : 'Jatrabari, Dhaka',
      href: undefined,
      color: 'text-[#C6A15B] bg-[#C6A15B]/10'
    }
  ];

  const social = [
    { icon: FacebookIcon, href: 'https://www.facebook.com/redaabangladesh', label: 'Facebook' },
    { icon: InstagramIcon, href: 'https://www.instagram.com/redaabangladesh', label: 'Instagram' },
    { icon: WhatsAppIcon, href: 'https://wa.me/8801970452723', label: 'WhatsApp' }
  ];

  return (
    <div className="font-sans">
      <InfoPageHeader
        icon={Phone}
        title={isBn ? 'যোগাযোগ করুন' : 'Contact Us'}
        subtitle={isBn
          ? 'যেকোনো প্রশ্ন বা সহায়তার জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।'
          : 'Have a question or need help? Reach out to us directly.'}
      />

      <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((c, i) => {
            const Icon = c.icon;
            const Wrapper = c.href ? 'a' : 'div';
            return (
              <Wrapper
                key={i}
                {...(c.href ? { href: c.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="bg-white border border-brand-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-bold text-brand-text text-sm">{c.title}</h3>
                  <p className="text-xs text-brand-muted mt-0.5">{c.value}</p>
                </div>
              </Wrapper>
            );
          })}
        </div>

        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-4">
          <h3 className="font-black text-brand-text text-base">
            {isBn ? 'আমাদের সোশ্যাল মিডিয়ায় ফলো করুন' : 'Follow Us on Social Media'}
          </h3>
          <div className="flex justify-center gap-3">
            {social.map((s, i) => {
              const Icon = s.icon;
              return (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="h-11 w-11 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
