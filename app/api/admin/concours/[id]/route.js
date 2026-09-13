import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function DELETE(request, { params }) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from('udc_concours').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
