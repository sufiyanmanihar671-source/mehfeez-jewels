import { env } from '$env/dynamic/public';

/** Only allow same-site relative redirects (prevents open-redirects). */
export function safeNext(next: string | null | undefined, fallback = '/account'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}

export function siteOrigin(url: URL): string {
  return (env.PUBLIC_SITE_URL || url.origin).replace(/\/$/, '');
}

const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Incorrect email or password.',
  email_not_confirmed: 'Please verify your email address first. Check your inbox for the verification link.',
  user_already_exists: 'An account with this email already exists. Please log in instead.',
  over_email_send_rate_limit: 'Too many emails were requested. Please wait a few minutes and try again.',
  over_request_rate_limit: 'Too many attempts. Please wait a few minutes and try again.',
  weak_password: 'Please choose a stronger password.',
  same_password: 'The new password must be different from the old one.'
};

export function authMessage(err: { code?: string; message: string }): string {
  return (err.code && AUTH_MESSAGES[err.code]) || 'Something went wrong. Please try again.';
}

/**
 * A wholesale profile is complete once the few details needed for approval are
 * filled in: business name, WhatsApp number and country. Accounts created with
 * Google start incomplete, because Google only provides a name and email.
 * Admins never need a business profile.
 */
export function isProfileComplete(
  p: { role?: string | null; company_name?: string | null; whatsapp?: string | null; country?: string | null } | null | undefined
): boolean {
  if (!p) return false;
  if (p.role === 'admin') return true;
  return [p.company_name, p.whatsapp, p.country].every((v) => !!v && v.trim().length > 0);
}
