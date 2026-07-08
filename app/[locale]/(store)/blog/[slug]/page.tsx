import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBlogPost, BLOG_POSTS } from '@/lib/blog';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Sicily';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string; locale: string } }): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  const isBn = params.locale === 'bn';
  const title = isBn ? post.title_bn : post.title_en;
  const description = isBn ? post.excerpt_bn : post.excerpt_en;

  return {
    title: `${title} | ${STORE_NAME}`,
    description,
    alternates: { canonical: `${BASE_URL}/blog/${post.slug}` },
    openGraph: { title, description, type: 'article', url: `${BASE_URL}/blog/${post.slug}` },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string; locale: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const isBn = params.locale === 'bn';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: isBn ? post.title_bn : post.title_en,
    datePublished: post.date,
    author: { '@type': 'Organization', name: STORE_NAME },
  };

  return (
    <div className="font-sans max-w-2xl mx-auto px-6 py-10 sm:py-14 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-primary transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> {isBn ? 'ব্লগে ফিরে যান' : 'Back to Blog'}
      </Link>

      <div>
        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wide">
          {new Date(post.date).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
        </span>
        <h1 className="text-2xl font-black text-brand-text mt-1">
          {isBn ? post.title_bn : post.title_en}
        </h1>
      </div>

      <p className="text-sm text-brand-muted leading-relaxed whitespace-pre-line">
        {isBn ? post.content_bn : post.content_en}
      </p>
    </div>
  );
}
