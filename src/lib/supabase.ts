import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { CookieOptions } from '@supabase/ssr';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export function createServerClient(cookies: AstroCookies) {
  return createSSRClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookies.set(name, value, {
              ...options,
              path: '/',
              sameSite: 'lax',
            });
          } catch (e) {
            // Cookie setting failed, likely because response was already sent
            // This is safe to ignore for non-critical cookies
            console.debug('Could not set cookie:', name);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookies.delete(name, {
              ...options,
              path: '/',
            });
          } catch (e) {
            // Cookie removal failed, likely because response was already sent
            // This is safe to ignore for non-critical cookies
            console.debug('Could not remove cookie:', name);
          }
        },
      },
    }
  );
}
