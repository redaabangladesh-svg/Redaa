'use client';

import { useState, useEffect } from 'react';
import { Star, Trash2, ImagePlus } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface ReviewRow {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  image: string | null;
  is_approved: boolean;
  created_at: string;
}

export default function ProductReviewsManager({
  productId,
  productSlug,
  locale,
}: {
  productId: string;
  productSlug: string | null;
  locale: string;
}) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState('');

  const loadReviews = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('reviews')
      .select('id, customer_name, rating, comment, image, is_approved, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const notifyRevalidate = () => {
    if (!productSlug) return;
    fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: productSlug }),
    }).catch(() => {});
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      customer_name: customerName.trim(),
      rating,
      comment: comment.trim() || null,
      image: image.trim() || null,
      is_approved: true,
    });
    setIsSaving(false);

    if (error) {
      alert(locale === 'bn' ? 'রিভিউ যোগ করা যায়নি।' : 'Could not add review.');
      console.error(error);
      return;
    }

    setCustomerName('');
    setRating(5);
    setComment('');
    setImage('');
    loadReviews();
    notifyRevalidate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'bn' ? 'এই রিভিউটি মুছে ফেলতে চান?' : 'Delete this review?')) return;
    const supabase = createClient();
    await supabase.from('reviews').delete().eq('id', id);
    loadReviews();
    notifyRevalidate();
  };

  const handleToggleApproved = async (row: ReviewRow) => {
    const supabase = createClient();
    await supabase.from('reviews').update({ is_approved: !row.is_approved }).eq('id', row.id);
    loadReviews();
    notifyRevalidate();
  };

  return (
    <div className="max-w-3xl space-y-5 border-t border-brand-border pt-6 mt-2">
      <div>
        <h2 className="text-base font-black text-brand-text">
          {locale === 'bn' ? 'কাস্টমার রিভিউ ব্যবস্থাপনা' : 'Customer Reviews'}
        </h2>
        <p className="text-xs text-brand-muted mt-1 font-medium">
          {locale === 'bn'
            ? 'এখানে ম্যানুয়ালি রিয়েল কাস্টমার রিভিউ যোগ করুন। শুধু "অ্যাপ্রুভড" রিভিউ ল্যান্ডিং পেজে দেখা যাবে।'
            : 'Manually add real customer reviews here. Only "approved" reviews show on the landing page.'}
        </p>
      </div>

      {/* Add review form */}
      <form onSubmit={handleAdd} className="bg-brand-surface border border-brand-border rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              {locale === 'bn' ? 'কাস্টমারের নাম' : 'Customer Name'}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={locale === 'bn' ? 'যেমন: রহিমা বেগম' : 'e.g. Rahima Begum'}
              className="w-full bg-white border border-brand-border rounded-xl py-2 px-3 text-xs font-bold outline-none focus:border-brand-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-muted uppercase">
              {locale === 'bn' ? 'রেটিং' : 'Rating'}
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full bg-white border border-brand-border rounded-xl py-2 px-3 text-xs font-bold outline-none focus:border-brand-primary"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-brand-muted uppercase">
            {locale === 'bn' ? 'মন্তব্য' : 'Comment'}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder={locale === 'bn' ? 'কাস্টমারের মতামত লিখুন...' : 'Write the customer feedback...'}
            className="w-full bg-white border border-brand-border rounded-xl py-2 px-3 text-xs font-semibold outline-none focus:border-brand-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-brand-muted uppercase flex items-center gap-1.5">
            <ImagePlus className="h-3.5 w-3.5" />
            {locale === 'bn' ? 'ছবির URL (ঐচ্ছিক)' : 'Image URL (optional)'}
          </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/reviews/customer-1.jpg"
            className="w-full bg-white border border-brand-border rounded-xl py-2 px-3 text-xs font-medium outline-none focus:border-brand-primary"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving || !customerName.trim()}
          className="py-2.5 px-5 rounded-xl bg-brand-primary text-white font-bold text-xs disabled:opacity-50"
        >
          {isSaving
            ? (locale === 'bn' ? 'যোগ হচ্ছে...' : 'Adding...')
            : (locale === 'bn' ? '+ রিভিউ যোগ করুন' : '+ Add Review')}
        </button>
      </form>

      {/* Existing reviews list */}
      <div className="space-y-2.5">
        {loading ? (
          <p className="text-xs text-brand-muted font-semibold">{locale === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-brand-muted font-semibold">
            {locale === 'bn' ? 'এখনো কোনো রিভিউ যোগ করা হয়নি।' : 'No reviews added yet.'}
          </p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-brand-border bg-white">
              {rev.image ? (
                <img src={rev.image} alt={rev.customer_name} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-brand-secondary/15 flex items-center justify-center font-bold text-xs text-brand-secondary flex-shrink-0">
                  {rev.customer_name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-brand-text">{rev.customer_name}</span>
                  <div className="flex text-[#C6A15B]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleApproved(rev)}
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      rev.is_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {rev.is_approved
                      ? (locale === 'bn' ? 'অ্যাপ্রুভড' : 'Approved')
                      : (locale === 'bn' ? 'পেন্ডিং' : 'Pending')}
                  </button>
                </div>
                {rev.comment && <p className="text-[11px] text-brand-muted font-medium mt-1">{rev.comment}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(rev.id)}
                className="p-1.5 text-brand-muted hover:text-rose-600 transition-colors flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
