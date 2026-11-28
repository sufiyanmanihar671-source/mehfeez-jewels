import type { SupabaseClient } from '@supabase/supabase-js';
import type { SiteSettings } from '$lib/types';

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_number: '919321245814',
  whatsapp_message: 'Hello Mehfeez Jewels, I am interested in your wholesale jewellery collections. Please share details.',
  video_call_number: '919321245814',
  video_call_message:
    'Hello Mehfeez Jewels, I would like to schedule a video call to discuss your jewellery collections, wholesale pricing and bulk order requirements.',
  video_call_enabled: true,
  contact_phone: '+91 93212 45814',
  contact_email: null,
  address: 'Room No. 4, Moriya Niwas, Malad West, Chincholi Bunder Road, Opposite Vivanta Hospital, Mumbai – 400064, Maharashtra, India.',
  business_hours: null,
  instagram_url: null,
  facebook_url: null,
  logo_url: null,
  hero_title: 'Premium Artificial Jewellery, Direct from Manufacturers',
  hero_subtitle: 'Discover exclusive jewellery collections crafted for retailers, boutiques and wholesale buyers.',
  hero_image_url: null
};

// The first homepage text stored in the database (before the redesign). If it was never edited,
// show the current homepage text instead, so Admin > Settings matches what the website shows.
const LEGACY_HERO_TITLE = 'Artificial Jewellery, Crafted for Wholesale';
const LEGACY_HERO_SUBTITLE =
  'Manufacturer and wholesale supplier of American Diamond, Victorian, Heritage, South Indian and Bridal jewellery for retailers and distributors worldwide.';

export async function getSettings(supabase: SupabaseClient, configured: boolean): Promise<SiteSettings> {
  if (!configured) return DEFAULT_SETTINGS;
  const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
  const s: SiteSettings = { ...DEFAULT_SETTINGS, ...(data ?? {}) };
  if (s.hero_title === LEGACY_HERO_TITLE) s.hero_title = DEFAULT_SETTINGS.hero_title;
  if (s.hero_subtitle === LEGACY_HERO_SUBTITLE) s.hero_subtitle = DEFAULT_SETTINGS.hero_subtitle;
  return s;
}
