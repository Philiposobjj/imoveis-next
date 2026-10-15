import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('URL configurada:', Boolean(url));
  console.log('Chave configurada:', Boolean(key));

  if (!url || !key) {
    throw new Error('Variáveis do Supabase ausentes.');
  }

  return createBrowserClient(url, key);
}