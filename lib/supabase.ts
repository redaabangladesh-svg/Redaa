import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const validUrl = !url || url.includes('your-supabase-project') || !url.startsWith('http')
    ? 'https://placeholder-project-id.supabase.co'
    : url;

  const validKey = !anonKey || anonKey.includes('your-supabase-anon-key')
    ? 'placeholder-anon-key'
    : anonKey;

  return createBrowserClient(validUrl, validKey);
}
