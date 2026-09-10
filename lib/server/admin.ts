import { createServerSupabase } from '@/lib/supabase';

export async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('AUTH_REQUIRED');
  const { data: profile } = await supabase.from('profiles').select('is_admin,role,status').eq('id', user.id).single();
  if (!profile?.is_admin || profile.status !== 'active') throw new Error('ADMIN_REQUIRED');
  return { supabase, user, profile };
}

export function adminErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (message === 'AUTH_REQUIRED') return new Response(JSON.stringify({ error: 'Sign in required.' }), { status: 401, headers: {'content-type':'application/json'} });
  if (message === 'ADMIN_REQUIRED') return new Response(JSON.stringify({ error: 'Administrator permission required.' }), { status: 403, headers: {'content-type':'application/json'} });
  return new Response(JSON.stringify({ error: 'Internal server error.' }), { status: 500, headers: {'content-type':'application/json'} });
}
