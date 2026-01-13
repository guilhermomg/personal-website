import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRClient } from '@supabase/ssr';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export function createServerClient(cookies: any) {
  return createSSRClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookies.set(name, value, {
            ...options,
            path: '/',
            sameSite: 'lax',
          });
        },
        remove(name: string, options: any) {
          cookies.delete(name, {
            ...options,
            path: '/',
          });
        },
      },
    }
  );
}
