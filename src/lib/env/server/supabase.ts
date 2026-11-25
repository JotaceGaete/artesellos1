import 'server-only';
import { readRequiredEnv } from '../utils';

export const SUPABASE_SERVICE_ROLE_KEY = readRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
