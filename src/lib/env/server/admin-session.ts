import 'server-only';
import { readRequiredEnv } from '../utils';

export const ADMIN_SESSION_SECRET = readRequiredEnv('ADMIN_SESSION_SECRET');
