import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const listingId = String(body.listingId || '').trim();
  if (!listingId) return NextResponse.json({ error: 'listingId is required.' }, { status: 400 });

  const { data: listing, error: listingError } = await supabase.from('rental_listings')
    .select('id,seller_id,platform,price,status').eq('id', listingId).single();
  if (listingError || !listing || listing.status !== 'approved') return NextResponse.json({ error: 'Rental listing is not available.' }, { status: 404 });
  if (listing.seller_id === user.id) return NextResponse.json({ error: 'You cannot rent your own account.' }, { status: 400 });

  const { data: active } = await supabase.from('rental_sessions').select('id').eq('listing_id', listing.id).eq('status', 'active').gt('ends_at', new Date().toISOString()).maybeSingle();
  if (active) return NextResponse.json({ error: 'This account is currently rented.' }, { status: 409 });

  const starts = new Date();
  const ends = new Date(starts.getTime() + 24 * 60 * 60 * 1000);
  const { data: session, error } = await supabase.from('rental_sessions').insert({ listing_id: listing.id, buyer_id: user.id, starts_at: starts.toISOString(), ends_at: ends.toISOString(), status: 'active' }).select('id,starts_at,ends_at').single();
  if (error || !session) return NextResponse.json({ error: error?.message || 'Could not create rental session.' }, { status: 400 });
  return NextResponse.json({ ok: true, session });
}
