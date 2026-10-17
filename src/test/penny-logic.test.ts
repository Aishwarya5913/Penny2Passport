import { describe,it,expect } from 'vitest';
import { demoAccount,finance,safeBudget,estimate,destinations,packing,categories } from '@/features/penny/logic';
describe('Student savings rules',()=>{
 it('calculates the specified 8000 income, 5000 expenses, 3000 unspent and 7000 savings',()=>{const a=demoAccount();expect(finance(a.entries,4000,'2026-10')).toEqual({income:8000,expenses:5000,unspent:3000,savings:7000});});
 it('protects 2000 emergencies and 1000 bills to leave 4000',()=>{expect(safeBudget(7000,2000,1000,7000)).toBe(4000);});
 it('allows willingness to reduce the safe maximum',()=>{expect(safeBudget(7000,2000,1000,1500)).toBe(1500);});
 it('never counts a deficit as new savings',()=>{const a=demoAccount();expect(finance(a.entries.filter(e=>e.kind==='expense'),4000,'2026-10').savings).toBe(4000);});
 it('does not double count historical balances',()=>{const a=demoAccount();expect(finance([...a.entries,{id:'old',kind:'income',amount:9000,date:'2026-09-01',category:'Allowance',description:'',recurring:false}],4000,'2026-10').savings).toBe(7000);});
 it('excludes own-account transfers',()=>{const a=demoAccount();expect(finance([...a.entries,{id:'transfer',kind:'transfer',amount:3000,date:'2026-10-01',category:'Savings',description:'',recurring:false}],4000,'2026-10').savings).toBe(7000);});
 it('has distinct rent, hostel and college categories',()=>{expect(categories).toContain('Rent');expect(categories).toContain('Hostel fees');expect(categories).toContain('College fees');});
 it('clamps insufficient funds to zero',()=>{expect(safeBudget(1000,2000,1000,5000)).toBe(0);});
});
describe('Trip estimation and preparation',()=>{
 it('accounts for three travellers and room sharing over two days',()=>{const d=destinations[0];if(!d)throw new Error('Dataset missing');const c=estimate(d,50,2,3);expect(c.rows.Accommodation).toBe(2000);expect(c.rows.Food).toBe(1800);expect(c.total).toBe(5533);expect(c.perPerson).toBe(1845);});
 it('includes rain protection when rain is expected',()=>{expect(packing(2,'Nature & waterfalls',70,24).map(x=>x.name)).toContain('Raincoat or umbrella');});
 it('includes warm layers in cold conditions',()=>{expect(packing(2,'Mountains',0,10).map(x=>x.name)).toContain('Warm jacket & layers');});
 it('includes sun protection in hot conditions',()=>{expect(packing(2,'Beaches',0,30).map(x=>x.name)).toContain('Sunscreen');});
 it('includes trekking shoes for trekking activities',()=>{expect(packing(2,'Trekking',0,24).map(x=>x.name)).toContain('Trekking shoes');});
});