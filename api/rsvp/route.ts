import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabaseConfig';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  const { name, email } = await request.json();

  const { data, error } = await supabase
    .from('rsvps')
    .insert([{ name, email }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
