import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const s = await createServerSupabase();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const productId = String(b.productId || '');
  const rating = Number(b.rating);
  const body = String(b.body || '').trim();
  if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'Product and rating 1-5 required' }, { status: 400 });
  const { data: order } = await s.from('orders').select('id').eq('buyer_id', user.id).eq('product_id', productId).in('status', ['paid', 'completed']).limit(1).maybeSingle();
  if (!order) return NextResponse.json({ error: 'You can review only a purchased product.' }, { status: 403 });
  const { error } = await s.from('marketplace_reviews').upsert({ product_id: productId, buyer_id: user.id, rating, body, status: 'published' }, { onConflict: 'product_id,buyer_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { data: agg } = await s.from('marketplace_reviews').select('rating').eq('product_id', productId).eq('status', 'published');
  const list = agg || [];
  const avg = list.length ? list.reduce((n, r) => n + r.rating, 0) / list.length : 0;
  await s.from('products').update({ rating_avg: Math.round(avg * 100) / 100, rating_count: list.length }).eq('id', productId);
  return NextResponse.json({ ok: true, rating_avg: avg, rating_count: list.length });
}
