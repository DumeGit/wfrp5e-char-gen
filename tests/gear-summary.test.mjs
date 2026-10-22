import test from 'node:test';
import assert from 'node:assert/strict';
import {gearSummary} from '../src/engine/gear-summary.mjs';
import {buyTrapping,marketCatalog} from '../src/engine/market.mjs';
import {R,soldier} from './fixture.mjs';


test('gear combines starting and bought items and explicitly counted packs',()=>{
 const s=soldier();s.wealth={amount:100,currency:'gold crowns'};s.gearChoices['career-2']='Dagger';
 for(let i=0;i<2;i++)buyTrapping(R,s,marketCatalog(R).find(x=>x.name==='Dagger').id);
 buyTrapping(R,s,marketCatalog(R).find(x=>x.name==='Candle (dozen)').id);
 let gear=gearSummary(R,s);
 assert.equal(gear.find(x=>x.name==='Dagger').quantity,4);
 assert.equal(gear.find(x=>x.name==='Candle').quantity,12);
 s.purchases.splice(0,1);assert.equal(gearSummary(R,s).find(x=>x.name==='Dagger').quantity,3);
});

test('container contents use rolled quantities and unresolved quantities remain unknown',()=>{
 const s=soldier();s.career='priest';
 let gear=gearSummary(R,s);
 assert.equal(gear.find(x=>x.name==='Parchment').quantity,null);
 s.gearRolls['class-0:{1d10}']=7;
 gear=gearSummary(R,s);
 assert.equal(gear.find(x=>x.name==='Parchment').quantity,7);
 assert.equal(gear.find(x=>x.name==='Sling Bag').quantity,1);
 assert.equal(gear.find(x=>x.name==='Writing Kit').quantity,1);
});


test('gear separates explicit ammunition and does not duplicate a weapon that is also a shield',()=>{
 const s=soldier();s.gearChoices['career-2']='Buckler';
 s.ledger.push({type:'trapping',name:'Crossbow with 10 Bolts',cost:0,tick:false});
 const gear=gearSummary(R,s);
 assert.equal(gear.find(x=>x.name==='Buckler').quantity,1);
 assert.equal(gear.find(x=>x.name==='Crossbow').quantity,1);
 assert.equal(gear.find(x=>x.name==='Bolt').quantity,10);
});
