import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Profile } from '$lib/types';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user: User | null;
      profile: Profile | null;
      /** true only for approved customers and admins */
      canSeePrices: boolean;
      isAdmin: boolean;
      configured: boolean;
    }
    interface PageData {
      user?: { id: string; email: string | undefined } | null;
      profile?: Profile | null;
    }
    interface Error {
      message: string;
    }
    interface Platform {
      env?: Record<string, string>;
    }
  }
}

export {};
