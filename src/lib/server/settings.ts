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
  address: 'Room No. 4, Malad West, Chincholi Bunder Road, Opposite Vivanta Hospital, Mumbai – 400064, Maharashtra, India.',
  business_hours: null,
  instagram_url: null,
  facebook_url: null,
  logo_url: null,
  hero_title: 'Artificial Jewellery, Crafted for Wholesale',
  hero_subtitle:
    'Manufacturer and wholesale supplier of American Diamond, Victorian, Heritage, South Indian and Bridal jewellery for retailers and distributors worldwide.',
  hero_image_url: null
};

export async function getSettings(supabase: SupabaseClient, configured: boolean): Promise<SiteSettings> {
  if (!configured) return DEFAULT_SETTINGS;
  const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) };
}
