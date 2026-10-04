import test from 'node:test';
import assert from 'node:assert/strict';
import {R,soldier,library} from './fixture.mjs';
import {assembleBooks,validateCatalog} from '../dist/books.mjs';
import {careerAvailable} from '../dist/origins.mjs';
import {equipment} from '../dist/equipment.mjs';
import {folioData} from '../dist/folio.mjs';
import * as M from '../dist/rules.mjs';

// A synthetic, unpublished Species exercises the handlers needed by Archives II.
// Its fixture identity is not a game option and is never installed in the app.
function setup(){
 const sp=structuredClone(library.packs[0].data.species.Human);
 Object.assign(sp,{id:'fixture-species:species',page:20,fate:1,fortune:2,movement:6,offsets:{WS:20,BS:10,S:35,T:35,I:0,Ag:15,Dex:10,Int:10,WP:20,Fel:10},mechanics:{size:'Large',capacityMultiplier:2,careers:['soldier','sailor','coachman'],skillCharacteristics:{'Language (Magick)':'T'},skillReplacements:{'Ride (Horse)':'Ride (Rhinox)'},arcaneLores:['Beasts','Death','Heavens']}});
 const background={...structuredClone(library.packs[0].data.background.Human),id:'fixture-species:background',page:21};
 const pack={manifest:{schemaVersion:1,id:'fixture-species',title:'Synthetic Species test',shortTitle:'Test',edition:4,version:'1.0.0',kind:'supplement',dependsOn:['core'],source:{file:'not-a-book.pdf',sha256:'0'.repeat(64)},compatibility:{reviewed:true,notes:['Unpublished integration fixture.']},files:{}},data:{species:{'Fixture Large':sp},background:{'Fixture Large':background},rules:[{id:'fixture-species:ride',path:['skillOptions','Ride'],operation:'append',value:['Rhinox'],page:34,reason:'Exercise a printed Skill replacement.'}]}};
 const catalog=assembleBooks({...library,packs:[...library.packs,pack]},['fixture-species']);
 const s=soldier();s.species='Fixture Large';s.points=M.KEYS.map(()=>10);s.freeTalent='Sturdy';s.randomTalents=[];
 return {catalog,s};
}

test('large Species calculate Wounds and capacity without changing core Species',()=>{
 const {catalog,s}=setup(),d=M.derive(catalog,s);
 assert.equal(d.size,'Large');assert.equal(d.wounds,30);assert.equal(d.capacity,32);
 assert.equal(d.fate,1);assert.equal(d.fortune,2);assert.equal(d.movement,6);
 s.sturdyRule='talent';assert.equal(M.derive(catalog,s).capacity,24);
 s.ledger.push({type:'talent',name:'Strong Back',cost:100});assert.equal(M.derive(catalog,s).capacity,26);
 s.ledger.push({type:'talent',name:'Strong Back',cost:100});assert.equal(M.derive(catalog,s).capacity,30);
 s.ledger.push({type:'talent',name:'Hardy',cost:100});assert.equal(M.derive(catalog,s).wounds,38);
 assert.equal(M.derive(R,soldier()).size,'Average');
});
test('Species casting uses its characteristic in folio totals and preserves the core catalog',()=>{
 const {catalog,s}=setup();s.ledger.push({type:'skill',name:'Language (Magick)',amount:5,cost:50});
 assert.equal(M.skillInfo(catalog,'Language (Magick)',s).char,'T');
 assert.equal(M.skillInfo(catalog,'Language (Magick)').char,'Int');
 assert.equal(folioData(catalog,s).skills.find(x=>x.name==='Language (Magick)').value,50);
 assert.equal(M.skillInfo(R,'Language (Magick)',soldier()).char,'Int');
});
test('additional Career access is Species-specific and Ride replacements retain eligibility',()=>{
 const {catalog,s}=setup();
 assert.ok(careerAvailable(catalog,s,catalog.careers.find(c=>c.id==='sailor')));
 assert.ok(!careerAvailable(catalog,s,catalog.careers.find(c=>c.id==='noble')));
 assert.ok(!catalog.careers.find(c=>c.id==='soldier').species.includes('Fixture Large'));
 s.career='coachman';
 const slots=M.careerSkillSlots(catalog,s,1);assert.ok(slots.some(x=>x.name==='Ride (Rhinox)'));
 assert.ok(!slots.some(x=>x.name==='Ride (Horse)'));
 assert.ok(M.quote(catalog,s,'skill','Ride (Rhinox)').inCareer);
 assert.match(M.quote(catalog,s,'skill','Ride (Horse)').error,/instead/);
 assert.ok(!M.options(catalog,'Ride (Any)','skill',s).includes('Ride (Horse)'));
});
test('restricted Lore validation accepts both wind and Lore names',()=>{
 const {catalog,s}=setup();
 assert.equal(M.invalidTalent(catalog,s,'Arcane Magic (Heavens)'),'');
 assert.match(M.invalidTalent(catalog,s,'Arcane Magic (Fire)'),/only/);
 s.career='wizard';s.skillChoices['c1-0']='Channelling (Azyr)';assert.equal(M.quote(catalog,s,'skill','Channelling (Azyr)').error,'');
 assert.match(M.quote(catalog,s,'skill','Channelling (Aqshy)').error,/only/);
 assert.equal(M.invalidTalent(R,soldier(),'Arcane Magic (Fire)'), '');
});
test('Large primary melee damage gains SB without increasing ranged damage',()=>{
 const {catalog,s}=setup();const eq=equipment(catalog,s);
 assert.equal(eq.weapons.find(w=>w.name==='Halberd (2H)').damage,13);
 assert.ok(eq.notes.some(n=>n.includes('extra attacks')));
 const ranged=structuredClone(catalog);ranged.weapons.find(w=>w.name==='Halberd (2H)').kind='ranged';
 assert.equal(equipment(ranged,s).weapons.find(w=>w.name==='Halberd (2H)').damage,9);
});
test('Species mechanic schema rejects unknown rules and broken references',()=>{
 const {catalog}=setup();
 for(const [field,value]of [['size','Huge'],['capacityMultiplier',3],['careers',['missing-career']],['arcaneLores',['invented-lore']],['unknownRule',true],['skillCharacteristics',{'Language (Magick)':'Bad'}]]){
  const broken=structuredClone(catalog);broken.species['Fixture Large'].mechanics[field]=value;
  assert.throws(()=>validateCatalog(broken),/Book pack:/);
 }
});
