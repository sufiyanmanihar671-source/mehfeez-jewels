import { fail, type RequestEvent } from '@sveltejs/kit';
import { enquirySchema, fieldErrors, formToObject, isBot } from './validation';
import { clientKey } from './catalog';

const MESSAGES: Record<string, string> = {
  rate_limited: 'Too many enquiries were sent recently. Please wait a while, or contact us directly on WhatsApp.',
  invalid_email: 'Please enter a valid email address.',
  invalid_whatsapp: 'Please enter a valid WhatsApp number with country code.'
};

/** Shared form action: validates and stores an enquiry via the rate-limited RPC. */
export async function submitEnquiry(event: RequestEvent) {
  const { locals, request, getClientAddress } = event;
  const form = await request.formData();
  const raw = formToObject(form, ['categories']);
  if (isBot(form)) return { success: true }; // silently drop spam
  if (!locals.configured) return fail(503, { values: raw, message: 'Enquiries are not available until the database is connected.' });

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) return fail(400, { values: raw, errors: fieldErrors(parsed.error) });

  let ip = 'unknown';
  try {
    ip = request.headers.get('cf-connecting-ip') ?? getClientAddress();
  } catch {
    /* ignore */
  }

  const { error } = await locals.supabase.rpc('submit_enquiry', {
    payload: parsed.data,
    client_key: await clientKey(ip)
  });
  if (error) {
    const key = Object.keys(MESSAGES).find((k) => error.message.includes(k));
    console.error('submit_enquiry', error.message);
    return fail(key === 'rate_limited' ? 429 : 400, {
      values: raw,
      message: key ? MESSAGES[key] : 'We could not send your enquiry. Please try again or contact us on WhatsApp.'
    });
  }
  return { success: true };
}
