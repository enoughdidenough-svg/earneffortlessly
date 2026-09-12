import { requireAdmin } from '@/lib/server/admin';
import SocialConnectionsPanel from '@/components/admin-social-connections';

export default async function AdminSocialPage() {
  const { supabase } = await requireAdmin();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: connections }, { data: adConnections }] = await Promise.all([
    supabase.from('social_connections').select('id,platform,account_id,page_id,access_scope,status,metadata,created_at,updated_at').eq('owner_id', user?.id ?? '').order('updated_at', { ascending: false }),
    supabase.from('ad_platform_connections').select('id,platform,account_label,page_id,status,metadata,created_at,updated_at').order('updated_at', { ascending: false }),
  ]);

  return (
    <main className='container'>
      <p><a href='/admin'>← Admin</a></p>
      <div className='section-head'>
        <div>
          <div className='eyebrow'>SOCIAL MEDIA</div>
          <h1>Connections & advertising</h1>
          <p className='muted'>Connect official Facebook and YouTube OAuth accounts here. Tokens stay server-side; the AI can only use a property after a real connection exists.</p>
        </div>
      </div>
      <SocialConnectionsPanel connections={connections ?? []} adConnections={adConnections ?? []} />
    </main>
  );
}
