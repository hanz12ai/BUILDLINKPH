import { cookies } from 'next/headers';
import { createServerClient as createSsrServerClient } from '@supabase/ssr';
import { Database } from './supabase';

/**
 * SERVER COMPONENTS Supabase Client Wrapper
 * 
 * USE THIS FILE IN:
 * - Server components (default Next.js behavior, e.g., standard page.tsx missing "use client")
 * - Layout files resolving server-side authenticated sessions
 */
export const createServerClient = async () => {
  const cookieStore = await cookies();
  return createSsrServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
           return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
           try {
             cookiesToSet.forEach(({ name, value, options }) =>
               cookieStore.set(name, value, options)
             )
           } catch {
             // The `setAll` method was called from a Server Component.
           }
        },
      },
    }
  );
};

/**
 * API ROUTE Supabase Client Wrapper
 * 
 * USE THIS FILE IN:
 * - Node/Edge API Routes (e.g., /app/api/.../route.ts)
 */
export const createRouteClient = async () => {
  const cookieStore = await cookies();
  return createSsrServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
           return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
           try {
             cookiesToSet.forEach(({ name, value, options }) =>
               cookieStore.set(name, value, options)
             )
           } catch {}
        },
      },
    }
  );
};
