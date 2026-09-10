import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const otherUser = String(body.otherUser || '').trim();
  const message = String(body.message || '').trim();
  if (!otherUser) return NextResponse.json({ error: 'Recipient is required.' }, { status: 400 });

  const { data: room, error: roomError } = await supabase.rpc('create_direct_chat', { other_user: otherUser });
  if (roomError || !room) return NextResponse.json({ error: roomError?.message || 'Could not create chat.' }, { status: 400 });

  if (message) {
    const { error } = await supabase.from('chat_messages').insert({
      room_id: room, sender_id: user.id, ciphertext: message
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, roomId: room });
}
