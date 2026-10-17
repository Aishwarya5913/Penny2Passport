import { createFileRoute } from '@tanstack/react-router';
import { WeatherPage } from '@/features/penny/weather-page';
export const Route = createFileRoute('/weather')({
 head:()=>({meta:[{title:'Weather & Best Time · Penny2Passport'},{name:'description',content:'Check genuine current weather and seven-day forecasts before travelling.'},{property:'og:title',content:'Weather & Best Time · Penny2Passport'},{property:'og:description',content:'Check genuine current weather and seven-day forecasts before travelling.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <WeatherPage/>,
});
