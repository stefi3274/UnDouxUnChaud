import { supabasePublic } from '@/lib/supabase';

export default async function sitemap() {
  const base = 'https://un-doux-un-chaud.vercel.app';

  const pagesFixes = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/galerie`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/audio`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/creole`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/classement`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/a-propos`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const { data: textes } = await supabasePublic
    .from('udc_textes')
    .select('id, date_publication')
    .eq('statut', 'accepte')
    .order('date_publication', { ascending: false })
    .limit(1000);

  const pagesTextes = (textes || []).map((t) => ({
    url: `${base}/textes/${t.id}`,
    lastModified: t.date_publication ? new Date(t.date_publication) : undefined,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...pagesFixes, ...pagesTextes];
}
