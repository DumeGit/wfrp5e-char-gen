import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../dist/rules.mjs';
import {folioData,folioGear} from '../dist/folio.mjs';
import {buyTrapping,marketCatalog} from '../dist/market.mjs';
import {R,soldier,advancedSoldier} from './fixture.mjs';

test('folio shows total trained Skill scores and counts free and purchased Talents without mutating state',()=>{
 const s=advancedSoldier();s.xp=2000;const original=JSON.stringify(s);const f=folioData(R,s),d=M.derive(R,s);
 assert.equal(f.skills.find(x=>x.name==='Cool').value,d.stats.WP+d.skills.Cool*5);
 assert.equal(f.talents.find(x=>x.name==='Warrior Born').value,1);
 assert.equal(f.talents.find(x=>x.name==='Strong Back').value,1);
 assert.equal(JSON.stringify(s),original);
 M.purchase(R,s,'talent','Strong Back');
 assert.equal(folioData(R,s).talents.find(x=>x.name==='Strong Back').value,2);
 s.ledger.pop();assert.equal(folioData(R,s).talents.find(x=>x.name==='Strong Back').value,1);
});

test('gear combines starting and bought items and explicitly counted packs',()=>{
 const s=soldier();s.wealth={amount:100,currency:'gold crowns'};s.gearChoices['career-2']='Dagger';
 for(let i=0;i<2;i++)buyTrapping(R,s,marketCatalog(R).find(x=>x.name==='Dagger').id);
 buyTrapping(R,s,marketCatalog(R).find(x=>x.name==='Candle (dozen)').id);
 let gear=folioGear(R,s);
 assert.equal(gear.find(x=>x.name==='Dagger').quantity,4);
 assert.equal(gear.find(x=>x.name==='Candle').quantity,12);
 s.purchases.splice(0,1);assert.equal(folioGear(R,s).find(x=>x.name==='Dagger').quantity,3);
});

test('container contents use rolled quantities and unresolved quantities remain unknown',()=>{
 const s=soldier();s.career='priest';
 let gear=folioGear(R,s);
 assert.equal(gear.find(x=>x.name==='Parchment').quantity,null);
 s.gearRolls['class-0:{1d10}']=7;
 gear=folioGear(R,s);
 assert.equal(gear.find(x=>x.name==='Parchment').quantity,7);
 assert.equal(gear.find(x=>x.name==='Sling Bag').quantity,1);
 assert.equal(gear.find(x=>x.name==='Writing Kit').quantity,1);
});

test('folio includes automatic Blessings and selected Magic by name',()=>{
 const s=soldier();s.career='priest';s.freeTalent='Bless (Shallya)';
 const f=folioData(R,s);assert.equal(f.magic.length,6);
 assert.ok(f.magic.some(x=>x.name==='Blessing of Healing'));
 assert.ok(f.magic.every(x=>Object.keys(x).length===1));
});

test('gear separates explicit ammunition and does not duplicate a weapon that is also a shield',()=>{
 const s=soldier();s.gearChoices['career-2']='Buckler';
 s.ledger.push({type:'trapping',name:'Crossbow with 10 Bolts',cost:0,tick:false});
 const gear=folioGear(R,s);
 assert.equal(gear.find(x=>x.name==='Buckler').quantity,1);
 assert.equal(gear.find(x=>x.name==='Crossbow').quantity,1);
 assert.equal(gear.find(x=>x.name==='Bolt').quantity,10);
});
