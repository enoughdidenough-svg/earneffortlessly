import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { encryptMessage, decryptMessage } from '@/lib/chat-crypto';

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const roomId = new URL(req.url).searchParams.get('roomId');
  if (!roomId) return NextResponse.json({ error: 'roomId is required.' }, { status: 400 });
  const { data: member } = await supabase.from('chat_members').select('room_id').eq('room_id', roomId).eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'Not a room member.' }, { status: 403 });
  const { data, error } = await supabase.from('chat_messages').select('id,sender_id,ciphertext,message_type,created_at').eq('room_id', roomId).order('created_at', { ascending: true }).limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ messages: (data || []).map(m => ({ ...m, message: decryptMessage(m.ciphertext) })) });
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const otherUser = String(body.otherUser || '').trim();
  const message = String(body.message || '').trim();
  const roomId = String(body.roomId || '').trim();
  if (!message || message.length > 10000) return NextResponse.json({ error: 'Message is required and must be under 10,000 characters.' }, { status: 400 });

  let room = roomId;
  if (!room) {
    if (!otherUser) return NextResponse.json({ error: 'Recipient is required.' }, { status: 400 });
    const { data, error } = await supabase.rpc('create_direct_chat', { other_user: otherUser });
    if (error || !data) return NextResponse.json({ error: error?.message || 'Could not create chat.' }, { status: 400 });
    room = data;
  }

  const { data: member } = await supabase.from('chat_members').select('room_id').eq('room_id', room).eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'Not a room member.' }, { status: 403 });
  const { error } = await supabase.from('chat_messages').insert({ room_id: room, sender_id: user.id, ciphertext: encryptMessage(message), message_type: 'text' });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, roomId: room });
}
