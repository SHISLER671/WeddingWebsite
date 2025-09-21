import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    console.log('Supabase URL:', supabaseUrl || 'Missing');
    console.log('Supabase Key:', supabaseKey ? 'Set (hidden)' : 'Missing');

    if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
      console.error('Invalid Supabase URL:', supabaseUrl);
      return NextResponse.json({ error: 'Invalid Supabase URL' }, { status: 500 });
    }
    if (!supabaseKey) {
      console.error('Missing Supabase Key');
      return NextResponse.json({ error: 'Missing Supabase Key' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('rsvps').select('*');

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Handler error:', err.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    console.log('Supabase URL (POST):', supabaseUrl || 'Missing');
    console.log('Supabase Key (POST):', supabaseKey ? 'Set (hidden)' : 'Missing');

    if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
      console.error('Invalid Supabase URL:', supabaseUrl);
      return NextResponse.json({ error: 'Invalid Supabase URL' }, { status: 500 });
    }
    if (!supabaseKey) {
      console.error('Missing Supabase Key');
      return NextResponse.json({ error: 'Missing Supabase Key' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await request.json();
    const { data, error } = await supabase.from('rsvps').insert(body);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    console.error('Handler error:', err.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
