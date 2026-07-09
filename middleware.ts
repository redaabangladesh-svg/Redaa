import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // /auth/* lives outside the [locale] segment — skip locale routing for it
  const response = request.nextUrl.pathname.startsWith('/auth')
    ? NextResponse.next()
    : intlMiddleware(request);

  // Refresh the Supabase auth session cookie on every request
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const validUrl = !url || url.includes('your-supabase-project') || !url.startsWith('http')
    ? 'https://placeholder-project-id.supabase.co'
    : url;

  const validKey = !anonKey || anonKey.includes('your-supabase-anon-key')
    ? 'placeholder-anon-key'
    : anonKey;

  const supabase = createServerClient(
    validUrl,
    validKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect /admin/* routes — only allowlisted admin emails may pass
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    const isAdmin = user?.email && adminEmails.includes(user.email.toLowerCase());
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return response;
}

export const config = {
  // Match dynamic routes and avoid static files
  matcher: ['/', '/((?!api|_next|_vercel|auth|.*\\..*).*)']
};
