import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { actif } = await request.json();

  const { data, error } = await supabaseAdmin
    .from('udc_ads')
    .update({ actif: !!actif })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Erreur de mise à jour.' }, { status: 500 });
  }
  return NextResponse.json({ ad: data });
}

export async function DELETE(request, { params }) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { data: pub } = await supabaseAdmin
    .from('udc_ads')
    .select('image_path')
    .eq('id', params.id)
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from('udc_ads')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'Erreur de suppression.' }, { status: 500 });
  }

  if (pub?.image_path) {
    await supabaseAdmin.storage.from('pubs-images').remove([pub.image_path]);
  }

  return NextResponse.json({ ok: true });
}
