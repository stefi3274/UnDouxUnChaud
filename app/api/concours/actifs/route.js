import { NextResponse } from 'next/server';
import { supabasePublic } from '@/lib/supabase';

export async function GET() {
  const maintenant = new Date().toISOString();
  const { data } = await supabasePublic
    .from('udc_concours')
    .select('id, titre')
    .lte('date_debut', maintenant)
    .gte('date_fin', maintenant)
    .order('date_debut', { ascending: false });

  return NextResponse.json({ concours: data || [] });
}
