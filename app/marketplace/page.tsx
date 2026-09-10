import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase';
import { parseBool } from '@/lib/marketplace-filters';

export default async function Marketplace({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const get = (k: string) => Array.isArray(raw[k]) ? raw[k]![0] : raw[k];
  const q = get('query') || get('q') || '';
  const s = await createServerSupabase();
  let query = s.from('products').select('id,title,description,category,subcategory,price,currency,quality_label,rating_avg,language,license_type,commercial_use,source_included,instant_delivery,featured,contents_count,seller_id').eq('status','active').order('featured',{ascending:false}).order('created_at',{ascending:false}).limit(100);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,subcategory.ilike.%${q}%`);
  const category=get('category'); if(category) query=query.eq('category',category);
  const subcategory=get('subcategory'); if(subcategory) query=query.eq('subcategory',subcategory);
  const quality=get('quality'); if(quality) query=query.eq('quality_label',quality);
  const language=get('language'); if(language) query=query.eq('language',language);
  const licenseType=get('licenseType'); if(licenseType) query=query.eq('license_type',licenseType);
  const minPrice=Number(get('minPrice')); if(Number.isFinite(minPrice)) query=query.gte('price',minPrice);
  const maxPrice=Number(get('maxPrice')); if(Number.isFinite(maxPrice)) query=query.lte('price',maxPrice);
  const minRating=Number(get('minRating')); if(Number.isFinite(minRating)) query=query.gte('rating_avg',minRating);
  const commercialUse=parseBool(get('commercialUse')||null); if(commercialUse!==undefined) query=query.eq('commercial_use',commercialUse);
  const sourceIncluded=parseBool(get('sourceIncluded')||null); if(sourceIncluded!==undefined) query=query.eq('source_included',sourceIncluded);
  const instantDelivery=parseBool(get('instantDelivery')||null); if(instantDelivery!==undefined) query=query.eq('instant_delivery',instantDelivery);
  const featured=parseBool(get('featured')||null); if(featured!==undefined) query=query.eq('featured',featured);
  const {data,error}=await query;
  return <main className="container"><h1>Marketplace</h1><form className="row" method="get"><input className="input" name="query" placeholder="Search listings" defaultValue={q}/><select className="input" name="quality" defaultValue={get('quality')||''}><option value="">Any quality</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select><input className="input" name="minPrice" type="number" min="0" step="0.01" placeholder="Min price" defaultValue={get('minPrice')||''}/><input className="input" name="maxPrice" type="number" min="0" step="0.01" placeholder="Max price" defaultValue={get('maxPrice')||''}/><button className="btn">Search</button></form>{error&&<p className="error">Could not load listings.</p>}<div className="grid grid3" style={{marginTop:22}}>{(data||[]).map(p=><Link className="card" href={`/product/${p.id}`} key={p.id}><span className="badge">{p.category}{p.subcategory?` · ${p.subcategory}`:''}</span><h3>{p.title}</h3><p className="muted">{(p.description||'').slice(0,140)}</p><p className="muted">{p.language||'en'} · {p.license_type||'license not specified'} · {p.contents_count} content item{p.contents_count===1?'':'s'}</p><div className="price">{p.currency} {p.price}</div></Link>)}</div>{!data?.length&&<div className="notice">No matching listings yet.</div>}</main>;
}
