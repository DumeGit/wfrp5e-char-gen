import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import {library,R,soldier} from './fixture.mjs';
import {assembleBooks,bookSelection,randomTable,tableResult} from '../dist/books.mjs';
import * as M from '../dist/rules.mjs';
import {creationSpecies,creationBackground,careerRefinementTable} from '../dist/origins.mjs';
import {refineCareer,regionalCareer,storedRefinement} from '../dist/regional-careers.mjs';
import {suggestion} from '../dist/background.mjs';
import {marketCatalog,buyTrapping,purse} from '../dist/market.mjs';
import {equipment} from '../dist/equipment.mjs';
import {exportSheet} from '../dist/export.mjs';

const on=assembleBooks(library,['up-in-arms']);
function madeCareer(c,origin=''){
 const s=M.fresh();s.career=c.id;s.origin=origin;s.name='Luchinus Fabbro';
 s.randomTalents=creationSpecies(on,s).randomTalents===3?['Read/Write','Attractive','Super Numerate']:['Read/Write','Attractive','Super Numerate','Cardsharp'];
 s.freeTalent=M.careerTalentOptions(on,s).find(t=>!M.freeTalents(on,s).includes(t)&&!M.invalidTalent(on,s,t));
 const used=new Set();for(const slot of M.speciesSkillSlots(on,s)){if(!used.has(slot.name)&&!creationSpecies(on,s).languages.includes(slot.name.slice(10,-1))){s.speciesSkills.push(slot.key);used.add(slot.name);}if(used.size===5)break;}
 let remaining=8;for(const slot of M.careerSkillSlots(on,s,1)){const room=Math.max(0,3-(M.freeSkills(on,s)[slot.name]||0)),n=Math.min(remaining,room);s.careerSkills[slot.key]=n;remaining-=n;if(!remaining)break;}
 s.wealth={amount:1000,currency:'silver shillings'};return s;
}

test('Up in Arms is opt-in and preserves every core option, price and probability',()=>{
 assert.equal(R.careers.length,64);assert.equal(on.careers.length,79);assert.equal(on.spells.length,234);
 for(const kind of ['weapons','armour','gear','market','talents'])for(const old of R[kind])assert.deepEqual(on[kind].find(x=>x.contentId===old.contentId),old);
 const s=soldier();for(const kind of ['species','career','talent'])assert.deepEqual(randomTable(on,s,kind),randomTable(R,s,kind));
 assert.equal(on.origins.length,3);assert.equal(on.tables.filter(t=>t.kind==='career-refinement').length,7);
 assert.equal(marketCatalog(on).length-marketCatalog(R).length,70);
});

test('all fifteen PDF-extracted Careers can complete Fifth Edition creation',()=>{
 for(const c of on.careers.filter(c=>c.source.book==='up-in-arms')){
  assert.deepEqual(Object.values(c.advanceScheme).filter(Boolean).sort(),[1,1,1,2,3,4],c.name);
  assert.equal(c.levels[0].skills.length,10,c.name);assert.deepEqual(M.validation(on,madeCareer(c)),[],c.name);
  for(const l of c.levels)for(const t of l.talents)assert.ok(M.talentInfo(on,t),`${c.name}: ${t}`);
 }
 assert.equal(on.careers.find(c=>c.name==='Archer').advanceScheme.BS,1);
 assert.equal(on.careers.find(c=>c.name==='Priest of Myrmidia').advanceScheme.WP,null);
 assert.equal(on.careers.find(c=>c.name==='Priest of Myrmidia').advanceScheme.Fel,1);
});

test('Tilean origins change regional choices, language and names without changing physical Species or allocation rules',()=>{
 const c=on.careers.find(c=>c.name==='Pikeman'),s=madeCareer(c,'up-in-arms:origin:tilea'),sp=creationSpecies(on,s);
 assert.deepEqual(M.validation(on,s),[]);assert.deepEqual(sp.languages,['Tilean']);assert.equal(M.freeSkills(on,s)['Language (Tilean)'],6);assert.equal(sp.randomTalents,3);assert.equal(sp.talents.length,2);
 assert.deepEqual(sp.offsets,R.species.Human.offsets);assert.equal(sp.fate,4);assert.equal(sp.fortune,3);assert.equal(sp.movement,4);
 assert.equal(creationBackground(on,s).surnames[0],'Acciaioli');const source=[];
 assert.equal(suggestion(on,s,'surnames',(n,p,k,src)=>{source.push(src);return 1;}),'Acciaioli');assert.deepEqual(source,[{book:'up-in-arms',page:56}]);
 s.speciesSkills.pop();assert.ok(M.validation(on,s).includes('Select five different Species Skills.'));
 s.species='Dwarf';assert.ok(M.validation(on,s).some(e=>e.includes('origin available')));
 const imperial=madeCareer(c,'up-in-arms:origin:imperial-tilean');assert.ok(creationSpecies(on,imperial).skills.includes('Language (Tilean)'));assert.ok(!creationSpecies(on,imperial).skills.includes('Language (Wastelander)'));assert.deepEqual(creationSpecies(on,imperial).languages,['Reikspiel']);assert.equal(creationSpecies(on,imperial).randomTalents,4);
});

test('Luccinan Dooming replaces one starting Talent and does not add a free rank',()=>{
 const s=madeCareer(on.careers.find(c=>c.name==='Pikeman'),'up-in-arms:origin:luccini'),before=M.freeTalents(on,s);
 s.originTalentSlot='random-0';const after=M.freeTalents(on,s);assert.equal(after.length,before.length);assert.ok(after.includes('Doomed'));assert.ok(!after.includes('Read/Write'));assert.equal(s.randomTalents[0],'Read/Write');assert.deepEqual(M.validation(on,s),[]);
 s.originTalentSlot='career';assert.ok(M.validation(on,s).some(e=>e.includes('regional starting Talent')));
});

test('optional Career refinement retains the core bonus and logs unavailable Species results without a reroll',()=>{
 const s=soldier();s.careerMode='first';s.careerAttempts=1;const before=randomTable(on,s,'career');
 const roll=(n,p,label,source)=>{s.rolls.push({dice:'1d100',values:[90],total:90,label,page:p,source});return 90;};
 const human=refineCareer(on,s,roll);assert.equal(human.career,'up-in-arms:career:greatsword');assert.equal(s.careerMode,'first');assert.deepEqual(randomTable(on,s,'career'),before);
 s.species='Dwarf';const dwarf=refineCareer(on,s,roll);assert.equal(dwarf.career,'soldier');assert.match(dwarf.message,/unavailable to Dwarf.*Retained Soldier/);assert.match(s.rolls.at(-1).label,/retained Soldier/);assert.equal(s.rolls.length,2);
 s.careerRefinement=dwarf;assert.throws(()=>refineCareer(on,s,roll),/already received/);s.careerMode='choose';assert.throws(()=>refineCareer(on,s,roll),/First roll/);
 s.careerMode='three';delete s.careerRefinement;s.careerRefinements={soldier:dwarf};assert.equal(storedRefinement(s),dwarf);assert.throws(()=>refineCareer(on,s,roll),/already received/);s.career='scholar';assert.equal(storedRefinement(s),null);s.career='soldier';assert.equal(storedRefinement(s),dwarf);
 for(const table of on.tables.filter(t=>t.kind==='career-refinement'))for(let n=1;n<=100;n++)assert.ok(on.careers.some(c=>c.id===tableResult(table,n)));
 assert.equal(careerRefinementTable(R,s),null);
});

test('printed Tilean Career alternatives and permitted Flagellant patrons are enforced',()=>{
 const s=madeCareer(on.careers.find(c=>c.id==='soldier'),'up-in-arms:origin:tilea');s.careerMode='first';
 assert.equal(regionalCareer(on,s,'up-in-arms:career:pikeman').base,'soldier');assert.throws(()=>regionalCareer(on,s,'up-in-arms:career:archer'),/printed alternative/);
 s.career='priest';s.regionalCareerBase='flagellant';s.freeTalent='';assert.match(M.invalidTalent(on,s,'Bless (Sigmar)'),/Tilean Flagellant/);assert.equal(M.invalidTalent(on,s,'Bless (Myrmidia)'),'');
});

test('Crew Commander remains described but cannot be purchased or granted',()=>{
 const c=on.careers.find(c=>c.name==='Artillerist'),s=madeCareer(c);s.ledger=[{type:'promotion',cost:100,name:'Artillerist'}];
 const q=M.quote(on,s,'talent','Crew Commander');assert.equal(q.cost,100);assert.match(q.error,/no Fifth Edition core equivalent/);assert.throws(()=>M.purchase(on,s,'talent','Crew Commander'),/agreed conversion/);
 assert.match(M.talentInfo(on,'Crew Commander').text,/Max: Initiative Bonus/);
});

test('regional and equipment additions reject invalid references and unsupported mechanics',()=>{
 for(const [change,match]of [
  [p=>p.data.origins[0].species='Unknown',/regional creation profile/],
  [p=>p.data.origins[0].optionalTalent='Unknown',/unknown Talent/],
  [p=>p.data.origins[0].careerChoices.soldier=['Unknown'],/regional Career choice/],
  [p=>p.data.origins[0].wounds=99,/unsupported fields/],
  [p=>p.data.market.find(x=>x.ammunition).ammunition.damage='',/ammunition reference/],
  [p=>p.data.weapons[0].text={},/weapon profile/],
  [p=>{p.data.rules.find(x=>x.path[0]==='skillOptions').value.push('Duplicate','Duplicate');},/additional Skill/]
 ]){const copy=structuredClone(library),pack=copy.packs.find(p=>p.manifest.id==='up-in-arms');change(pack);assert.throws(()=>assembleBooks(copy,['up-in-arms']),match);}
 const c=on.careers.find(c=>c.name==='Handgunner');assert.ok(c.levels.some(l=>l.skills.includes('Ranged (Engineering)')));assert.ok(c.levels.every(l=>!l.skills.includes('Ranged (Engineer)')));assert.match(c.conversion,/naming|Printed Ranged/);
});

test('new specialisations feed Any choices and dynamic Talent choices with book sources',()=>{
 assert.ok(M.options(on,'Trade (Any)').includes('Trade (Fletcher)'));assert.ok(M.options(on,'Artistic (Any)','talent').includes('Artistic (Cartography)'));assert.ok(M.options(on,'Savant (Any)','talent').includes('Savant (Tilea)'));
 assert.ok(M.options(on,'Etiquette (Any)','talent').includes('Etiquette (Mercenaries)'));assert.ok(M.options(on,'Ranged (Any)').includes('Ranged (Catapult)'));
});

test('independent future supplements can append distinct Skill specialisations alongside Up in Arms',()=>{
 const copy=structuredClone(library),template=copy.packs.find(p=>p.manifest.id==='up-in-arms').manifest;
 copy.packs.push({manifest:{...template,id:'qa-other',title:'Synthetic QA book',shortTitle:'QA',edition:5,compatibility:undefined},data:{rules:[{id:'qa-other:skill:lore',path:['skillOptions','Lore'],operation:'append',value:['Synthetic QA Lore'],page:1,reason:'Synthetic test fixture only; never shipped.'}]}});
 const both=assembleBooks(copy,['up-in-arms','qa-other']);assert.ok(M.options(both,'Lore (Any)').includes('Lore (Tilea)'));assert.ok(M.options(both,'Lore (Any)').includes('Lore (Synthetic QA Lore)'));assert.ok(!M.options(on,'Lore (Any)').includes('Lore (Synthetic QA Lore)'));
});

test('new gear spends the actual purse, wears printed garments, preserves core profiles, and retains ammunition modifiers as references',()=>{
 const s=soldier();s.wealth.amount=10000;
 for(const name of ['Bandoleer','Sealskin','Matchlock Handgun (2H)','Paper Cartridge (12)'])buyTrapping(on,s,marketCatalog(on).find(x=>x.name===name).id);
 assert.equal(purse(on,s).spent,6*12+30*12+2*240+5*12);
 const e=equipment(on,s);assert.equal(e.entries.find(x=>x.name==='Bandoleer').placement,'worn');assert.equal(e.entries.find(x=>x.name==='Sealskin').carriedEnc,0);assert.equal(e.weapons.find(x=>x.name==='Matchlock Handgun (2H)').damage,8);
 assert.equal(on.weapons.find(x=>x.name==='Handgun (2H)').damage,'10');assert.equal(on.armour.find(x=>x.name==='Shield').enc,2);
 const ammo=marketCatalog(on).find(x=>x.name==='Paper Cartridge (12)');assert.equal(ammo.ammunition.damage,'+1');assert.match(ammo.text,/no ammunition is assumed loaded/);
 buyTrapping(on,s,marketCatalog(on).find(x=>x.name==='Warhammer').id);buyTrapping(on,s,marketCatalog(on).find(x=>x.name==='Warhammer (2H)').id);
 const hammers=equipment(on,s).weapons;assert.equal(hammers.find(x=>x.label==='Warhammer').name,'Warhammer');assert.equal(hammers.find(x=>x.label==='Warhammer').enc,1);assert.equal(hammers.find(x=>x.label==='Warhammer (2H)').name,'Warhammer (2H)');
});

test('nine new Myrmidian Miracles are selectable and keep printed modifiers without permanent bonuses',()=>{
 const c=on.careers.find(c=>c.name==='Priest of Myrmidia'),s=madeCareer(c);s.freeTalent='Bless (Myrmidia)';s.ledger=[{type:'promotion',cost:100,name:'Warrior Priest'}];M.purchase(on,s,'talent','Invoke (Myrmidia)');
 const grant=M.spellGrants(on,s).find(g=>g.category==='Myrmidia');assert.equal(grant.choices.filter(x=>x.source.book==='up-in-arms').length,9);
 s.spells=['Command the Legion'];assert.match(M.knownSpells(on,s).find(x=>x.name==='Command the Legion').text,/\+10 bonus/);
 assert.match(on.spells.find(x=>x.name==='In Good Order').text,/gain Momentum/);assert.equal(M.derive(on,s).stats.WS,M.initial(on,s).WS);
 assert.match(M.invalidTalent(on,s,'Invoke (Shallya)'),/Myrmidia/);
});

test('regional supplement character exports all editable fields with the added miracle and equipment',async()=>{
 globalThis.PDFLib=PDFLib;const c=on.careers.find(c=>c.name==='Priest of Myrmidia'),s=madeCareer(c,'up-in-arms:origin:tilea');s.freeTalent='Bless (Myrmidia)';s.books=bookSelection(on);s.ledger=[{type:'promotion',cost:100,name:'Warrior Priest'}];M.purchase(on,s,'talent','Invoke (Myrmidia)');s.spells=['Command the Legion'];
 buyTrapping(on,s,marketCatalog(on).find(x=>x.name==='Theodolite').id);
 const bytes=await exportSheet(on,s,fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url))));
 const doc=await PDFLib.PDFDocument.load(bytes),form=doc.getForm();assert.equal(form.getFields().length,556);assert.equal(form.getTextField('Name').getText(),'Luchinus Fabbro');assert.ok(form.getTextField('Notes').getText().includes('Up in Arms'));assert.ok(form.getFields().filter(f=>f.getName().includes('Fortune')).some(f=>f.getText?.()===String(M.derive(on,s).fortune)));assert.ok(doc.getPageCount()>3);
});
