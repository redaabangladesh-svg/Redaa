import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const validUrl = !url || url.includes('your-supabase-project') || !url.startsWith('http')
    ? 'https://placeholder-project-id.supabase.co'
    : url;

  const validKey = !anonKey || anonKey.includes('your-supabase-anon-key')
    ? 'placeholder-anon-key'
    : anonKey;

  return createServerClient(
    validUrl,
    validKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component; middleware refreshes sessions instead
          }
        },
      },
    }
  );
}
