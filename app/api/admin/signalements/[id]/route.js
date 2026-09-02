import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { traite } = await request.json();

  const { error } = await supabaseAdmin
    .from('udc_signalements')
    .update({ traite: !!traite })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'Erreur de mise à jour.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
