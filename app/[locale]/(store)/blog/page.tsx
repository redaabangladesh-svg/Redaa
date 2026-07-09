import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import InfoPageHeader from '@/components/store/InfoPageHeader';
import { BLOG_POSTS } from '@/lib/blog';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Redaa';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.redaarabia.com/';

export const metadata: Metadata = {
  title: `ব্লগ | ${STORE_NAME}`,
  description: 'পোশাকের যত্ন, পাঞ্জাবি ও ফ্যাশন টিপস নিয়ে আমাদের ব্লগ পোস্টসমূহ।',
  alternates: { canonical: `${BASE_URL}/blog` },
};

export default function BlogListPage({ params }: { params: { locale: string } }) {
  const isBn = params.locale === 'bn';

  return (
    <div className="font-sans">
      <InfoPageHeader
        icon={BookOpen}
        title={isBn ? 'ব্লগ' : 'Blog'}
        subtitle={isBn ? 'ঘর সাজানোর টিপস, আইডিয়া ও গাইড।' : 'Home décor tips, ideas, and guides.'}
      />

      <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14 space-y-5">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:border-brand-primary/40 transition-all-custom"
          >
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wide">
              {new Date(post.date).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
            </span>
            <h2 className="text-lg font-black text-brand-text mt-1">
              {isBn ? post.title_bn : post.title_en}
            </h2>
            <p className="text-xs text-brand-muted mt-2 leading-relaxed">
              {isBn ? post.excerpt_bn : post.excerpt_en}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary mt-3">
              {isBn ? 'পুরো লেখা পড়ুন' : 'Read more'} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
