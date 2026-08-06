import { readRequiredEnv } from './utils';

export const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: readRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: readRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
} as const;
