import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import * as M from '../dist/rules.mjs';
import {library,R,soldier} from './fixture.mjs';
import {assembleBooks,bookSelection,catalogForCharacter,randomTable} from '../dist/books.mjs';
import {marketCatalog,buyTrapping,purse} from '../dist/market.mjs';
import {equipment} from '../dist/equipment.mjs';
import {exportSheet,exportRecord} from '../dist/export.mjs';
const B=assembleBooks(library,['blood-bramble']);

export function brambleCaster(career='hedge-witch',talent='Arcane Magic (Hedgecraft)'){
 const s=soldier();Object.assign(s,{version:2,name:'Bramble verification',career,freeTalent:'Read/Write',randomTalents:['Super Numerate','Cardsharp','Attractive','Strong Back'],skillChoices:{},gearChoices:{},careerSkills:{},xp:30000,wealth:{amount:100,currency:'gold crowns'}});
 for(const slot of M.careerSkillSlots(B,s,1).slice(0,8))s.careerSkills[slot.key]=1;
 while(M.derive(B,s).ticks<10){
  const choices=M.careerSkillSlots(B,s,1).map(x=>M.quote(B,s,'skill',x.name)).filter(x=>!x.error&&x.tick).sort((a,b)=>a.cost-b.cost);
  assert.ok(choices.length);M.purchase(B,s,'skill',choices[0].name);
 }
 M.purchase(B,s,'promotion','');M.purchase(B,s,'talent',talent);
 s.spells=[talent==='Witch!'?'Congeal':talent.includes('Hedgecraft')?'Badwill':'Congeal'];
 s.books=bookSelection(B);assert.deepEqual(M.validation(B,s),[]);return s;
}

test('Blood and Bramble is opt-in, adds 24 distinct spells and composes with all installed books',()=>{
 assert.ok(!R.spells.some(x=>x.name==='Godspakt'));
 const ids=library.packs.map(x=>x.manifest.id).filter(x=>!['core','blood-bramble','archives-iii-hedge'].includes(x));
 const contexts=[[],ids,['archives-iii','archives-iii-hedge'],['winds-of-magic'],['high-elf'],['archives-ii','rough-nights']];
 for(const enabled of contexts)for(const order of [[...enabled,'blood-bramble'],['blood-bramble',...enabled]]){
  const before=assembleBooks(library,enabled),after=assembleBooks(library,order);
  assert.equal(after.spells.length,before.spells.length+24);
  for(const kind of ['careers','species','talents','skills','weapons','armour','tables'])assert.deepEqual(after[kind],before[kind]);
  assert.equal(randomTable(after,M.fresh(),'species').id,randomTable(before,M.fresh(),'species').id);
 }
 const spells=B.spells.filter(x=>x.source.book==='blood-bramble');
 assert.equal(spells.filter(x=>x.category==='Hedgecraft').length,12);
 assert.ok(spells.filter(x=>x.category==='Hedgecraft').every(x=>x.cn==='0'));
 assert.equal(spells.filter(x=>x.category==='Witchcraft').length,12);
 assert.deepEqual(spells.filter(x=>x.category==='Witchcraft').map(x=>Number(x.cn)),[8,6,4,6,9,6,16,6,5,7,13,10]);
});

test('Spell access uses existing Lore grants, excludes Petty/divine/other Lores and retains Fifth Edition prices and undo',()=>{
 const hedge=brambleCaster(),g=M.spellGrants(B,hedge)[0];assert.equal(g.count,1);
 assert.equal(g.choices.filter(x=>x.source.book==='blood-bramble').length,12);
 assert.equal(M.quoteSpell(B,hedge,'Fatethief',g.talent),null);
 const before=M.derive(B,hedge),gear=equipment(B,hedge);
 M.purchaseSpell(B,hedge,'Bonesetter',g.talent);assert.equal(hedge.ledger.at(-1).cost,100);assert.equal(hedge.ledger.at(-1).tick,false);assert.deepEqual(hedge.ledger.at(-1).definition,{book:'blood-bramble',page:6});
 assert.equal(M.derive(B,hedge).ticks,before.ticks);assert.deepEqual(equipment(B,hedge),gear);
 assert.throws(()=>M.purchaseSpell(B,hedge,'Bonesetter',g.talent),/Already known/);
 hedge.ledger.pop();assert.equal(M.derive(B,hedge).remaining,before.remaining);assert.ok(!M.knownSpells(B,hedge).some(x=>x.name==='Bonesetter'));
 hedge.spells=['Nepenthe'];for(const name of ['Badwill','Bonesetter','Cleanslate','Fertilise','Fetterfetch'])M.purchaseSpell(B,hedge,name,g.talent);
 assert.equal(M.quoteSpell(B,hedge,'Geistbane',g.talent).cost,200);
 const witch=brambleCaster('witch','Arcane Magic (Witchcraft)');assert.equal(M.quoteSpell(B,witch,'Fatethief','Arcane Magic (Witchcraft)').cost,100);
 const eclectic=brambleCaster('witch','Witch!');assert.equal(M.spellGrants(B,eclectic)[0].choices.filter(x=>x.source.book==='blood-bramble').length,12);
 assert.equal(M.quoteSpell(B,eclectic,'Badwill','Witch!'),null);
 M.purchaseSpell(B,eclectic,'Fatethief','Witch!');assert.equal(eclectic.ledger.at(-1).cost,150);assert.equal(M.quoteSpell(B,eclectic,'Painjar','Witch!').cost,200);
 const petty={...soldier(),freeTalent:'Petty Magic'};assert.ok(M.spellGrants(B,petty).every(x=>x.choices.every(y=>y.source.book!=='blood-bramble')));
});

test('Column continuations, named Difficulty conversions and printed situational effects remain complete references',()=>{
 const spell=name=>B.spells.find(x=>x.name===name);
 assert.match(spell('Bonesetter').text,/1d10 days for each \+SL/);
 assert.match(spell('Fetterfetch').text,/Difficult \(−1 SL\) Navigate/);
 assert.match(spell('Geistbane').text,/Hard \(−2 SL\) Willpower/);
 assert.match(spell('Geistbane').text,/touch of fresh blood renders the oil inert/);
 assert.match(spell('Kindle').text,/bonus of \+20/);
 assert.match(spell('Woecharm').text,/–10 to all Gamble/);
 assert.match(spell('Pactbind').text,/cannot be dispelled/);
 assert.match(spell('Nameless Summons').text,/minimum 1/);
 assert.match(spell('Nameless Summons').text,/−0 and \+0 overlap/);
 assert.doesNotMatch(spell('Mirrored Abyss').text,/firmest friend|been doing|Been doin/i);
 assert.doesNotMatch(spell('Onerion').text,/army marched/);
 assert.equal(spell('Godspakt').range,'You');assert.equal(spell('Godspakt').target,'You');assert.match(spell('Godspakt').text,/card on PDF p\. 28/);
 const s=brambleCaster('witch','Arcane Magic (Witchcraft)'),before=M.derive(B,s);s.spells=['Fatethief'];
 assert.equal(M.derive(B,s).fate,before.fate);assert.equal(M.derive(B,s).fortune,before.fortune);assert.equal(M.derive(B,s).wounds,before.wounds);
});

test('Ingredient purchases charge exactly 5 pennies without inventing weight, spell uses or free supplies',()=>{
 const item=marketCatalog(B).find(x=>x.name==='Hedgecraft Ingredients');assert.equal(item.pennies,5);assert.equal(item.enc,null);assert.equal(item.availability,'Not specified');assert.match(item.text,/does not specify the amount/);
 const s=brambleCaster(),before=purse(B,s).remaining;assert.ok(!equipment(B,s).other.some(x=>x.name==='Hedgecraft Ingredients'));
 buyTrapping(B,s,item.id);assert.equal(purse(B,s).remaining,before-5);assert.ok(equipment(B,s).unknown.some(x=>x.includes('Hedgecraft Ingredients')));
 s.wealth={amount:0,currency:'brass pennies'};assert.throws(()=>buyTrapping(B,s,item.id),/Not enough money/);
});

test('Current saves preserve book and sourced spell selections; spell quotes reject other Lores',()=>{
 const s=brambleCaster();M.purchaseSpell(B,s,'Geistbane','Arcane Magic (Hedgecraft)');assert.equal(catalogForCharacter(library,JSON.parse(JSON.stringify(s))).spells.length,B.spells.length);
 const restored=JSON.parse(JSON.stringify(s)),catalog=catalogForCharacter(library,restored);assert.ok(M.knownSpells(catalog,restored).some(x=>x.name==='Geistbane'&&x.source.book==='blood-bramble'));
 assert.equal(M.quoteSpell(catalog,restored,'Fatethief','Arcane Magic (Hedgecraft)'),null);
});

test('Editable sheet and full creation record preserve known spell details and sources',async()=>{
 const s=brambleCaster();M.purchaseSpell(B,s,'Bonesetter','Arcane Magic (Hedgecraft)');
 globalThis.PDFLib=PDFLib;
 const source=fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url));
 const bytes=await exportSheet(B,s,source,JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url))));
 const pdf=await PDFLib.PDFDocument.load(bytes),form=pdf.getForm();assert.equal(form.getFields().length,556);
 assert.equal(form.getTextField('XP_Spent').getText(),String(M.derive(B,s).spent));assert.equal(form.getTextField('Spell_1_Name').getText(),'[Legacy] Badwill');assert.equal(form.getTextField('Spell_2_Name').getText(),'[Legacy] Bonesetter');
 assert.ok(pdf.getPageCount()>2);const record=await PDFLib.PDFDocument.load(await exportRecord(B,s));assert.ok(record.getPageCount()>0);
 if(process.env.WFRP_BRAMBLE_QA==='1'){const dir=new URL('../../tmp/pdfs/blood-bramble-review/',import.meta.url);fs.writeFileSync(new URL('hedge-verification.pdf',dir),bytes);fs.writeFileSync(new URL('hedge-verification.json',dir),JSON.stringify(s));const witch=brambleCaster('witch','Arcane Magic (Witchcraft)');M.purchaseSpell(B,witch,'Nameless Summons','Arcane Magic (Witchcraft)');fs.writeFileSync(new URL('witch-verification.json',dir),JSON.stringify(witch));}
});
