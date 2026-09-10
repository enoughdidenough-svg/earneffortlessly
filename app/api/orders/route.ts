import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

  const form = await req.formData();
  const productId = String(form.get('product_id') || '').trim();
  if (!productId) return NextResponse.json({ error: 'Product is required.' }, { status: 400 });

  const { data: product, error: productError } = await supabase
    .from('products').select('id,seller_id,title,price,currency,status').eq('id', productId).single();
  if (productError || !product || product.status !== 'active') {
    return NextResponse.json({ error: 'Product is not available.' }, { status: 404 });
  }
  if (product.seller_id === user.id) return NextResponse.json({ error: 'You cannot buy your own listing.' }, { status: 400 });

  const { data: existing } = await supabase.from('orders')
    .select('id,status').eq('buyer_id', user.id).eq('product_id', product.id).eq('status', 'pending').maybeSingle();
  if (existing) return NextResponse.redirect(new URL('/buyer', req.url));

  const { data: order, error } = await supabase.from('orders').insert({
    buyer_id: user.id, product_id: product.id, seller_id: product.seller_id,
    amount: product.price, currency: product.currency, payment_method: 'manual', status: 'pending'
  }).select('id').single();
  if (error || !order) return NextResponse.json({ error: error?.message || 'Could not create order.' }, { status: 400 });

  await supabase.from('payments').insert({
    order_id: order.id, provider: 'manual', status: 'created', amount: product.price, currency: product.currency
  });
  return NextResponse.redirect(new URL('/buyer', req.url));
}
