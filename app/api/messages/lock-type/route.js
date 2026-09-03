import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const { data: utilisateur } = await supabaseAdmin
    .from('udc_users')
    .select('lock_pin_hash, lock_type')
    .eq('id', user.id)
    .maybeSingle();

  return NextResponse.json({
    defini: !!utilisateur?.lock_pin_hash,
    type: utilisateur?.lock_type || null,
  });
}
