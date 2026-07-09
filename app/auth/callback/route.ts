import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/account';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Admin login attempts must match the allowlist, not just any Google account
      // Strip trailing slash — a trailing slash in the env var would otherwise
      // produce a double-slash redirect (e.g. https://host//admin) that fails to route
      const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.redaarabia.com').replace(/\/+$/, '');

      if (next.includes('/admin')) {
        const adminEmails = (process.env.ADMIN_EMAILS || '')
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        const isAdmin = data.user.email && adminEmails.includes(data.user.email.toLowerCase());
        if (!isAdmin) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${baseUrl}/admin/login?error=unauthorized`);
        }
        return NextResponse.redirect(`${baseUrl}${next}`);
      }

      // Ensure a matching row exists in the customers table
      await supabase
        .from('customers')
        .upsert(
          {
            auth_user_id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Customer',
            email: data.user.email,
            phone: data.user.phone || `pending-${data.user.id.slice(0, 8)}`,
          },
          { onConflict: 'auth_user_id', ignoreDuplicates: true }
        );

      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.redaarabia.com').replace(/\/+$/, '');
  return NextResponse.redirect(`${baseUrl}/account?error=auth_failed`);
}
