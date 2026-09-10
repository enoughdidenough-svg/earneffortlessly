import type { Config } from '@netlify/functions';

export default async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return new Response('Supabase worker configuration missing', { status: 503 });
  const response = await fetch(`${url}/rest/v1/rpc/expire_rental_sessions`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: '{}'
  });
  if (!response.ok) return new Response(`Rental expiry failed: ${response.status}`, { status: 502 });
  return new Response(await response.text(), { status: 200 });
};

export const config: Config = { schedule: '@hourly' };
