import { createClient } from '@/lib/supabase';

export async function fetchSettings(keys: string[]): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', keys);

  if (error || !data) return {};
  return data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as Record<string, string>);
}

export async function saveSettings(values: Record<string, string>): Promise<boolean> {
  const supabase = createClient();
  const rows = Object.entries(values).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
  return !error;
}
