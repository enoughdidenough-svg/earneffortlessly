export type SearchFilters={query?:string;category?:string;subcategory?:string;minPrice?:number;maxPrice?:number;minRating?:number;quality?:string;seller?:string;dateFrom?:string;dateTo?:string;available?:boolean};
export type SearchItem={title:string;description:string;category:string;subcategory?:string;price:number;rating:number;quality?:string;sellerUsername:string;createdAt:string;available:boolean};

export function rankSearchResults(items:SearchItem[],filters:SearchFilters):SearchItem[]{
 const q=(filters.query||'').toLowerCase().trim();
 return items.filter(x=>!filters.category||x.category===filters.category).filter(x=>!filters.subcategory||x.subcategory===filters.subcategory).filter(x=>filters.minPrice==null||x.price>=filters.minPrice).filter(x=>filters.maxPrice==null||x.price<=filters.maxPrice).filter(x=>filters.minRating==null||x.rating>=filters.minRating).filter(x=>!filters.quality||x.quality===filters.quality).filter(x=>!filters.seller||x.sellerUsername.toLowerCase().includes(filters.seller.toLowerCase())).filter(x=>filters.available==null||x.available===filters.available).sort((a,b)=>{
   const score=(x:SearchItem)=>{if(!q)return x.rating*10+(x.quality==='high'?3:x.quality==='medium'?2:1);const hay=`${x.title} ${x.description} ${x.category} ${x.subcategory||''} ${x.sellerUsername}`.toLowerCase();return (hay.includes(q)?100:0)+x.rating*10+(x.quality==='high'?3:x.quality==='medium'?2:1)};
   return score(b)-score(a);
 });
}
