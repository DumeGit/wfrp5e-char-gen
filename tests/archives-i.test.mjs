import test from 'node:test';
import assert from 'node:assert/strict';
import {library,R,soldier} from './fixture.mjs';
import {assembleBooks,randomTable,loadBookLibrary} from '../dist/books.mjs';
import * as M from '../dist/rules.mjs';
import {creationSpecies} from '../dist/origins.mjs';
import {marketCatalog,buyTrapping,purse} from '../dist/market.mjs';
import {equipment,gearOptions} from '../dist/equipment.mjs';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import {exportSheet} from '../dist/export.mjs';
import {careerAvailable,sheetSpecies,sheetClass,regionalCareerChoices} from '../dist/origins.mjs';
import {regionalCareer} from '../dist/regional-careers.mjs';

const on=assembleBooks(library,['archives-i']);
export function archivesCharacter(species,career,origin=''){
 const s=M.fresh();s.species=species;s.career=career;s.origin=origin;s.name='Archives QA';
 const sp=creationSpecies(on,s);s.randomTalents=['Attractive','Super Numerate','Cardsharp','Read/Write'].slice(0,sp.randomTalents);
 const used=new Set();for(const slot of M.speciesSkillSlots(on,s)){if(!used.has(slot.name)&&!sp.languages.includes(slot.name.slice(10,-1))){s.speciesSkills.push(slot.key);used.add(slot.name);}if(used.size===5)break;}
 let remaining=8;for(const slot of M.careerSkillSlots(on,s,1)){const room=Math.max(0,3-(M.freeSkills(on,s)[slot.name]||0)),n=Math.min(remaining,room);s.careerSkills[slot.key]=n;remaining-=n;if(!remaining)break;}
 s.freeTalent=M.careerTalentOptions(on,s).find(t=>!M.freeTalents(on,s).includes(t)&&!M.invalidTalent(on,s,t));
 s.wealth={amount:1000,currency:'silver shillings'};return s;
}

test('Archives I is opt-in and preserves core definitions and random probabilities',()=>{
 assert.equal(on.careers.length,68);assert.equal(on.weapons.length-R.weapons.length,14);assert.equal(marketCatalog(on).length-marketCatalog(R).length,18);
 for(const kind of ['weapons','armour','gear','market','talents'])for(const old of R[kind])assert.deepEqual(on[kind].find(x=>x.contentId===old.contentId),old);
 for(const kind of ['species','career','talent'])assert.deepEqual(randomTable(on,soldier(),kind),randomTable(R,soldier(),kind));
 const both=assembleBooks(library,['up-in-arms','archives-i']);assert.equal(both.careers.length,83);assert.equal(both.spells.length,234);
 const reversed=assembleBooks(library,['archives-i','up-in-arms']);assert.equal(marketCatalog(reversed).find(x=>x.name==='Precision Shot and Powder').price,'3/-');assert.equal(marketCatalog(on).find(x=>x.name==='Precision Shot and Powder').price,'3d');assert.equal(marketCatalog(both).filter(x=>x.name==='Precision Shot and Powder').length,1);assert.equal(both.contentDecisions.length,1);for(const group of Object.keys(both.config.skillOptions))assert.deepEqual([...reversed.config.skillOptions[group]].sort(),[...both.config.skillOptions[group]].sort());
});

test('all twelve clan profiles use five Talents, Fifth Edition allocations and unchanged physical Species',()=>{
 for(const o of on.origins.filter(x=>x.page===32)){
  const s=archivesCharacter('Halfling','soldier',o.id),sp=creationSpecies(on,s);
  assert.equal(sp.skills.length,11);assert.equal(sp.randomTalents,1);assert.equal(sp.talents.length,4);assert.equal(M.freeTalents(on,s).length,6);
  assert.ok(!M.freeTalents(on,s).includes('Small'));assert.deepEqual(sp.offsets,R.species.Halfling.offsets);assert.deepEqual(sp.languages,['Haffennaff','Reikspiel']);
  assert.deepEqual(M.validation(on,s),[],o.name);
 }
});

test('grouped clan Talents expand real core specialisations and never grant an Any placeholder',()=>{
 const s=archivesCharacter('Halfling','soldier','archives-i:origin:hollyfoot');
 assert.ok(M.speciesTalentOptions(on,s,3).includes('Craftsman (Cook)'));assert.ok(!M.freeTalents(on,s).includes('Craftsman (Any)'));
 s.talentChoices['species-3']='Craftsman (Farmer)';assert.ok(M.freeTalents(on,s).includes('Craftsman (Farmer)'));
 const low=archivesCharacter('Halfling','soldier','archives-i:origin:lowhaven');assert.deepEqual(M.speciesTalentOptions(on,low,3),['Criminal','Etiquette (Criminals)','Etiquette (Guilders)']);
});

test('Career schemes match PDF symbols and the unavailable Lip Reading entry grants nothing',()=>{
 for(const c of on.careers.filter(x=>x.source.book==='archives-i'))assert.deepEqual(Object.values(c.advanceScheme).filter(Boolean).sort(),[1,1,1,2,3,4]);
 const ghost=on.careers.find(c=>c.name==='Ghost Strider'),s=archivesCharacter('Wood Elf',ghost.id);
 assert.deepEqual(ghost.advanceScheme,{WS:3,BS:1,S:4,T:null,I:null,Ag:1,Dex:2,Int:1,WP:null,Fel:null});
 assert.ok(!M.careerSkillSlots(on,s).some(x=>x.name==='Lip Reading'));assert.ok(!M.careerTalentOptions(on,s,4).includes('Lip Reading'));assert.match(ghost.levels[2].unavailableSkills[0].reason,/Talent/);
 assert.deepEqual(M.validation(on,s),[]);
});

test('Fearless and Savant use approved core options and still enforce owned Lore',()=>{
 const s=archivesCharacter('Halfling','archives-i:career:fieldwarden','archives-i:origin:mootland');
 assert.ok(M.careerTalentOptions(on,s,4).includes('Fearless (Giants)'));assert.ok(M.careerTalentOptions(on,s,4).includes('Savant (Moot)'));
 assert.match(M.invalidTalent(on,s,'Savant (Dwarf Holds and Routes)'),/requires an Advance/);
 s.species='Dwarf';s.career='archives-i:career:karak-ranger';assert.ok(M.careerTalentOptions(on,s,3).includes('River Guide'));assert.ok(M.careerTalentOptions(on,s,3).includes('Gunner'));
});

test('new equipment spends its printed price and produces sourced equipped profiles',()=>{
 const s=soldier();s.wealth={amount:1000,currency:'silver shillings'};const item=marketCatalog(on).find(x=>x.name==='Eonir War Blade');buyTrapping(on,s,item.id);
 assert.equal(purse(on,s).spent,720);const w=equipment(on,s).weapons.find(x=>x.name==='Eonir War Blade');assert.equal(w.enc,0);assert.equal(w.source.book,'archives-i');assert.equal(w.placement,'equipped');
 const gun=on.weapons.find(x=>x.name==='Dwarf Handgun (2H)');assert.match(gun.qualities,/Blackpowder, Damaging/);assert.equal(gun.reach,'30');
 assert.match(on.weapons.find(x=>x.name==='Blackbriar Javelin').qualities,/\+0 SL/);
 assert.match(marketCatalog(on).find(x=>x.name==='Drakefire Shot (12)').text,/Fumble/);
 assert.match(marketCatalog(on).find(x=>x.name==='Swiftshiver Shafts (12)').text,/additional Swiftshiver arrow per target/);
});

test('Eonir kindreds retain Wood Elf attributes while Cityborn uses High Elf Careers and the printed table',()=>{
 const s=archivesCharacter('Wood Elf','noble','archives-i:origin:eonir-cityborn');
 assert.deepEqual(creationSpecies(on,s).offsets,R.species['Wood Elf'].offsets);assert.deepEqual(creationSpecies(on,s).talents,R.species['Wood Elf'].talents);
 assert.deepEqual(randomTable(on,s,'career'),randomTable(R,{...s,origin:'',species:'High Elf'},'career'));
 for(const row of randomTable(on,s,'career').rows)assert.ok(careerAvailable(on,s,on.careers.find(c=>c.id===row.result)));
 assert.deepEqual(M.validation(on,s),[]);assert.equal(sheetSpecies(on,s),'Wood Elf (Eonir)');assert.match(sheetClass(on,s,M.career(on,s)),/Cityborn/);
 s.career='archives-i:career:ghost-strider';assert.ok(M.validation(on,s).includes('Choose a Career available to your Species.'));
 s.origin='archives-i:origin:eonir-forestborn';assert.ok(careerAvailable(on,s,M.career(on,s)));assert.equal(randomTable(on,s,'career').species,'Wood Elf');
});

test('Younger Eonir receives exactly one additional Youngblood grant without changing normal Career Status',()=>{
 const s=archivesCharacter('Wood Elf','archives-i:career:ghost-strider','archives-i:origin:eonir-younger'),core={...s,origin:''};
 assert.equal(M.freeTalents(on,s).filter(x=>x==='Youngblood').length,1);assert.equal(M.freeTalents(on,s).length,M.freeTalents(on,core).length+1);
 assert.equal(M.derive(on,s).spent,0);assert.equal(M.derive(on,s).status,M.derive(on,core).status);assert.match(M.invalidTalent(on,s,'Youngblood'),/not repeatable/);
 assert.deepEqual(M.validation(on,s),[]);
});

test('Cityborn exports the Eonir Species and kindred on the editable Class field',async()=>{
 globalThis.PDFLib=PDFLib;const s=archivesCharacter('Wood Elf','noble','archives-i:origin:eonir-cityborn');
 const bytes=await exportSheet(on,s,fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url))));
 const doc=await PDFLib.PDFDocument.load(bytes),form=doc.getForm();assert.equal(form.getFields().length,556);assert.equal(form.getTextField('Species').getText(),'Wood Elf (Eonir)');assert.match(form.getTextField('Class_1').getText(),/Cityborn/);assert.ok(doc.getPageCount()>3);
});

test('all four new Careers complete creation only with the required Species and origin',()=>{
 for(const c of on.careers.filter(x=>x.source.book==='archives-i')){
  const s=archivesCharacter(c.species[0],c.id,c.requiredOrigins?.[0]||'');assert.deepEqual(M.validation(on,s),[],c.name);
  if(c.requiredOrigins){s.origin='';assert.equal(careerAvailable(on,s,c),false);assert.ok(M.validation(on,s).includes('Choose a Career available to your Species.'));}
 }
 const badger=on.careers.find(x=>x.name==='Badger Rider');assert.match(badger.text,/GM approval/);assert.match(badger.text,/war cry/);
});

test('Thorncobble Noble requires Noble Blood from free creation or an actual XP purchase',()=>{
 const s=archivesCharacter('Halfling','noble','archives-i:origin:thorncobble');s.freeTalent='Etiquette (Nobles)';
 assert.ok(careerAvailable(on,s,M.career(on,s)));assert.ok(M.validation(on,s).some(x=>x.includes('Noble requires Noble Blood')));
 s.freeTalent='Noble Blood';assert.deepEqual(M.validation(on,s),[]);
 s.freeTalent='Read/Write';M.purchase(on,s,'talent','Noble Blood');assert.deepEqual(M.validation(on,s),[]);assert.equal(M.derive(on,s).spent,100);
 s.ledger.pop();assert.ok(M.validation(on,s).some(x=>x.includes('Noble requires Noble Blood')));
 s.origin='archives-i:origin:ashfield';assert.ok(careerAvailable(on,s,M.career(on,s)));assert.ok(!M.validation(on,s).some(x=>x.includes('Noble requires Noble Blood')));
});

test('printed optional Career swaps preserve rolled bonuses and never change random tables',()=>{
 for(const [species,base,target,origin]of [['Wood Elf','bounty-hunter','ghost-strider',''],['Dwarf','messenger','karak-ranger',''],['Halfling','roadwarden','fieldwarden','archives-i:origin:mootland'],['Halfling','soldier','badger-rider','archives-i:origin:mootland']]){
  const s=archivesCharacter(species,base,origin),id='archives-i:career:'+target;
  assert.ok(!regionalCareerChoices(on,s).includes(id));s.careerMode='first';assert.ok(regionalCareerChoices(on,s).includes(id));assert.deepEqual(regionalCareer(on,s,id),{base,career:id});
  const table=randomTable(on,s,'career');s.career=id;assert.deepEqual(randomTable(on,s,'career'),table);assert.equal(M.bonusTrappingLimit(on,s),Math.min(2,M.bonusTrappingSlots(on,s).length));
 }
 const s=archivesCharacter('Halfling','soldier');s.careerMode='first';assert.ok(!regionalCareerChoices(on,s).includes('archives-i:career:badger-rider'));
});

test('explicit weapon group choices and counted arrows resolve while unspecified Trappings remain unknown',()=>{
 const s=archivesCharacter('Wood Elf','archives-i:career:ghost-strider'),eq=equipment(on,s);
 assert.ok(eq.weapons.some(w=>w.name==='Longbow (2H)'));const arrow=eq.entries.find(x=>x.name==='Arrow');assert.equal(arrow.quantity,10);assert.equal(arrow.enc,0);
 assert.equal(eq.entries.find(x=>x.name==='Trade tools (Bowyer)').enc,1);
 for(const n of gearOptions('Entangling OR Throwing weapon',on)){const w=on.weapons.find(x=>x.name===n);assert.ok(w.kind==='ranged'&&['Entangling','Throwing'].includes(w.group));}
 assert.ok(gearOptions('Melee Weapon (Basic OR Cavalry)',on).includes('Hand Weapon'));
 const badger=archivesCharacter('Halfling','archives-i:career:badger-rider','archives-i:origin:mootland');assert.ok(equipment(on,badger).unknown.some(x=>x.includes('Tamed Badger')));
});

test('new origin and Career mechanics reject missing references or unsupported fields',async()=>{
 for(const mutation of [p=>p.data.origins[0].careerSpecies='Unknown',p=>p.data.origins[0].grantedTalents=['Unknown'],p=>p.data.careers[0].randomAlternativeFor='Unknown',p=>p.data.careers[1].requiredOrigins=['Unknown'],p=>p.data.careers[0].levels[2].unavailableSkills[0].reason='',p=>p.data.careers[0].levels[0].unimplementedBonus=99,p=>p.data.origins.find(o=>o.additionalCareers).additionalCareers[0].requiredTalent='Unknown']){
  const lib=structuredClone(library);mutation(lib.packs.find(p=>p.manifest.id==='archives-i'));assert.throws(()=>assembleBooks(lib,['archives-i']),/Book pack/);
 }
 await assert.rejects(loadBookLibrary(url=>{const value=JSON.parse(fs.readFileSync(url,'utf8'));if(url.href.endsWith('/archives-i/market.json'))value.find(x=>x.supersededBy).supersededBy.contentId='up-in-arms:nonexistent';return value;}),/superseding content/);
});
