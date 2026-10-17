import { createFileRoute } from '@tanstack/react-router';
import { TripsPage } from '@/features/penny/trips';
export const Route = createFileRoute('/trips')({
 head:()=>({meta:[{title:'My Trips · Penny2Passport'},{name:'description',content:'Save your travel plans, estimated budgets, itineraries and packing lists.'},{property:'og:title',content:'My Trips · Penny2Passport'},{property:'og:description',content:'Save your travel plans, estimated budgets, itineraries and packing lists.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <TripsPage/>,
});
