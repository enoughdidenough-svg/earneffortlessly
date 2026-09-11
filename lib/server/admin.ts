import { createServerSupabase } from '@/lib/supabase-server';

export async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('AUTH_REQUIRED');

  const { data: allowed, error } = await supabase.rpc('is_platform_admin');
  if (error || allowed !== true) throw new Error('ADMIN_REQUIRED');

  return { supabase, user, profile: { is_admin: true, role: 'owner', status: 'active' } };
}

export function adminErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (message === 'AUTH_REQUIRED') return new Response(JSON.stringify({ error: 'Sign in required.' }), { status: 401, headers: {'content-type':'application/json'} });
  if (message === 'ADMIN_REQUIRED') return new Response(JSON.stringify({ error: 'Administrator permission required.' }), { status: 403, headers: {'content-type':'application/json'} });
  return new Response(JSON.stringify({ error: 'Internal server error.' }), { status: 500, headers: {'content-type':'application/json'} });
}
