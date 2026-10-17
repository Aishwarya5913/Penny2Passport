import { createFileRoute } from '@tanstack/react-router';
import { DiscoverPage } from '@/features/penny/discover';
export const Route = createFileRoute('/discover')({
 head:()=>({meta:[{title:'Discover Trips · Penny2Passport'},{name:'description',content:'Find curated trips within your safe savings budget and travel radius.'},{property:'og:title',content:'Discover Trips · Penny2Passport'},{property:'og:description',content:'Find curated trips within your safe savings budget and travel radius.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <DiscoverPage/>,
});
