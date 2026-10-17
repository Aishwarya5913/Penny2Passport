import { createFileRoute } from '@tanstack/react-router';
import { MoneyPage } from '@/features/penny/money';
export const Route = createFileRoute('/money')({
 head:()=>({meta:[{title:'My Money · Penny2Passport'},{name:'description',content:'Track income, student expenses and unspent money without double counting.'},{property:'og:title',content:'My Money · Penny2Passport'},{property:'og:description',content:'Track income, student expenses and unspent money without double counting.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <MoneyPage/>,
});
