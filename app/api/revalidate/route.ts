import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient as createSessionClient } from '@/lib/supabase-server';

// Admin-only: forces the storefront ISR cache to drop stale product/landing
// content immediately instead of waiting out the 1hr `revalidate` window.
export async function POST(request: Request) {
  const sessionClient = await createSessionClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!user?.email || !adminEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { slug } = await request.json();

  if (slug) revalidatePath(`/p/${slug}`);
  revalidatePath('/');
  revalidatePath('/shop');

  return NextResponse.json({ revalidated: true });
}
