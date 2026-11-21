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
