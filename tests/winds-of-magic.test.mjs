import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as M from '../dist/rules.mjs';
import {library,R,soldier} from './fixture.mjs';
import {assembleBooks,bookSelection,catalogForCharacter,randomTable} from '../dist/books.mjs';
import {careerAvailable,careerRefinementTable,regionalCareerChoices} from '../dist/origins.mjs';
import {refineCareer} from '../dist/regional-careers.mjs';
import {psychometrySacrifice,psychicSkillIssue,extraCareerSkills,quoteRitual,womIssues,womReferences} from '../dist/winds-of-magic.mjs';
import {cantGrants,syncCants,freeMagicIssues} from '../dist/archives-iii.mjs';
import {collegePanel,psychometryPanel,ritualShop,womGearPanel,pettyGrantNote} from '../dist/winds-of-magic-ui.mjs';
import {marketCatalog,buyTrapping,purse} from '../dist/market.mjs';
import {equipment,gearSlots} from '../dist/equipment.mjs';
import * as PDFLib from 'pdf-lib';
import {exportSheet} from '../dist/export.mjs';
import {folioData} from '../dist/folio.mjs';
const lib=library;
const B=assembleBooks(lib,['winds-of-magic']);
export function womCharacter(name='Astromancer'){
 const s=soldier(),c=B.careers.find(x=>x.name===name);Object.assign(s,{name:'Winds of Magic verification',career:c.id,freeTalent:c.levels[0].talents.find(t=>!M.freeTalents(B,{...s,freeTalent:''}).includes(t)),skillChoices:{},careerSkills:Object.fromEntries(Array.from({length:8},(_,i)=>[`c1-${i}`,1])),gearChoices:{},wealth:{amount:100,currency:'gold crowns'},xp:10000});if(name==='Magister Vigilant')s.college='Light';return s;
}
function loreMage(lore='Heavens'){const s=womCharacter();s.ledger=[{type:'talent',name:`Arcane Magic (${lore})`,cost:100,tick:false}];s.spells=[M.spellGrants(B,s)[0].choices.find(x=>x.category===lore).name];return s;}
export function promotedAstromancer(){
 const s=womCharacter();
 // Fixed test quantities, not claimed dice rolls, resolve the Academic Class kit.
 for(const slot of gearSlots(B,s))for(const token of slot.name.match(/\{?\d+d10\}?/g)||[])s.gearRolls[`${slot.key}:${token}`]=1;
 for(const slot of M.careerSkillSlots(B,s,1).slice(0,8))M.purchase(B,s,'skill',slot.name);
 for(const char of ['WS','Int'])M.purchase(B,s,'char',char);
 M.purchase(B,s,'promotion','');M.purchase(B,s,'talent','Arcane Magic (Heavens)');s.spells=['Divination'];
 buyTrapping(B,s,marketCatalog(B,s).find(x=>x.name==='Practical Robes').id);
 M.purchaseSpell(B,s,'Create Power Stone','Arcane Magic (Heavens)');s.version=2;s.books=bookSelection(B);return s;
}
export function promotedMundaneAlchemist(){
 const s=womCharacter('Mundane Alchemist');s.xp=50000;s.name='Mundane Alchemist verification';
 for(const slot of gearSlots(B,s))for(const token of slot.name.match(/\{?\d+d10\}?/g)||[])s.gearRolls[`${slot.key}:${token}`]=1;
 while(M.derive(B,s).level<4){
  while(M.quote(B,s,'promotion','').error){
   const d=M.derive(B,s),eligible=M.KEYS.filter(k=>M.career(B,s).advanceScheme[k]&&M.career(B,s).advanceScheme[k]<=d.level);
   const cheapest=eligible.map(k=>M.quote(B,s,'char',k)).filter(q=>!q.error).sort((a,b)=>a.cost-b.cost)[0];
   assert.ok(cheapest,'Promotion fixture must have an affordable Career Advance');M.purchase(B,s,'char',cheapest.name);
  }
  M.purchase(B,s,'promotion','');
  if(M.derive(B,s).level===3){
   while(M.derive(B,s).wpb<5)M.purchase(B,s,'char','WP');
   M.purchase(B,s,'talent','Petty Magic');s.spells=['Bearings','Open Lock','Shock','Warning'];
  }
 }
 s.skillChoices['c3-3']='Lore (Alchemy)';s.version=2;s.books=bookSelection(B);s.step=6;return s;
}

test('Winds of Magic is opt-in, combines with every supplement selection, and preserves core definitions',()=>{
 assert.ok(!R.skills.some(x=>x.name==='Augury'));
 for(let mask=0;mask<32;mask++){
  const ids=['up-in-arms','archives-i','archives-ii','archives-iii','archives-iii-hedge'].filter((_,i)=>mask&(1<<i)),before=assembleBooks(lib,ids),after=assembleBooks(lib,[...ids,'winds-of-magic']);
  assert.equal(after.careers.length,before.careers.length+12);assert.equal(after.spells.length,before.spells.length+153);assert.equal(after.skills.length,before.skills.length+2);
  assert.deepEqual(after.armour,before.armour);assert.equal(randomTable(after,M.fresh(),'species').id,randomTable(before,M.fresh(),'species').id);
  for(const name of ['Silence','Banishment','Regenerate','Fare of the Land'])assert.equal(after.spells.find(x=>x.name===name).source.book,'core');
  assert.ok(!after.spells.some(x=>x.name==='Fat of the Land'));assert.equal(after.spells.filter(x=>x.ritual).length,17);
 }
 assert.ok(B.spells.find(x=>x.name==='Sapphire Arch').text.endsWith('Stunned and Prone Condition.'));
 assert.ok(B.spells.find(x=>x.name==='T’Essla’s Arc'));assert.equal(B.spells.find(x=>x.name==='Coruscating Arc').source.book,'core');
});
test('all twelve Careers retain PDF schemes, ten starting choices and normal Fifth Edition creation',()=>{
 const schemes={Beadle:['WS','Int','WP','Ag','I','Fel'],'Mundane Alchemist':['T','Dex','Int','I','WP','Ag'],'Magister Vigilant':['WS','Int','WP','Ag','I','S'],Scryer:['Int','WP','Fel','I','Ag','Dex'],Hierophant:['I','Int','WP','Ag','WS','Fel'],Alchemist:['T','Int','WP','Dex','I','Fel'],Druid:['Ag','Int','WP','I','Fel','WS'],Astromancer:['WS','Int','WP','Ag','I','Fel'],Shadowmancer:['Int','WP','Fel','I','WS','Ag'],Spiriter:['Dex','Int','WP','Ag','I','T'],Pyromancer:['WS','Int','WP','Ag','I','Fel'],Shaman:['WS','Int','WP','Ag','I','T']};
 for(const [name,keys]of Object.entries(schemes)){
  const s=womCharacter(name),c=M.career(B,s);assert.equal(c.levels[0].skills.length,10);
  for(const k of M.KEYS)assert.equal(c.advanceScheme[k],keys.indexOf(k)<0?null:[1,1,1,2,3,4][keys.indexOf(k)],name+' '+k);
  assert.deepEqual(M.validation(B,s),[],name);assert.deepEqual(freeMagicIssues(B,s,M.spellGrants(B,s)),[],name);
  if(!['Beadle','Mundane Alchemist'].includes(name))assert.ok(!careerAvailable(B,{species:'Dwarf'},c));
 }
});
test('printed optional Career tables preserve all faces and declined or Species-ineligible outcomes',()=>{
 for(const [id,n,name]of [['apothecary',76,'Mundane Alchemist'],['wizard',96,'Magister Vigilant'],['mystic',91,'Scryer'],['guard',76,'Beadle']]){
  const s=soldier();s.career=id;s.careerMode='first';const table=careerRefinementTable(B,s);assert.equal(table.source.page,35);
  assert.equal(refineCareer(B,s,()=>n).career,B.careers.find(x=>x.name===name).id);
  assert.equal(refineCareer(B,s,()=>n-1).career,id);
  assert.throws(()=>refineCareer(B,{...s,careerMode:'choose'},()=>n),/First roll/);
 }
 const s=soldier();s.career='wizard';s.careerMode='first';assert.equal(regionalCareerChoices(B,s).length,8);
 s.species='High Elf';const result=refineCareer(B,s,()=>100);assert.equal(result.career,'wizard');assert.match(result.message,/unavailable/);assert.equal(regionalCareerChoices(B,s).length,0);
});
test('College affiliation controls the first Arcane Lore without replacing Fifth Edition Elf requirements',()=>{
 const s=soldier();s.career='wizard';assert.ok(M.validation(B,s).some(x=>/College affiliation/.test(x)));s.college='Life';
 assert.match(M.invalidTalent(B,s,'Arcane Magic (Fire)'),/First learn/);assert.equal(M.invalidTalent(B,s,'Arcane Magic (Life)'),'');
 assert.match(M.invalidTalent(B,s,'Arcane Magic (Hedgecraft)'),/eight College/);assert.ok(collegePanel(B,s).includes('College Lore'));
 assert.ok(M.careerTalentOptions(B,s,2).every(x=>!x.startsWith('Arcane Magic')||!x.includes('Hedgecraft')));
 const fixed=womCharacter('Pyromancer');assert.match(M.invalidTalent(B,fixed,'Arcane Magic (Death)'),/Fire/);assert.ok(collegePanel(B,fixed).includes('fixed by this Career'));
});
test('Augury access follows Species, first-level Career and patron and never grants free points',()=>{
 const s=soldier();s.career='mystic';assert.ok(M.careerSkillSlots(B,s,1).some(x=>x.name==='Augury'));assert.equal(M.freeSkills(B,s).Augury,0);
 s.career='nun';s.freeTalent='Bless (Shallya)';assert.equal(extraCareerSkills(B,s).length,0);s.freeTalent='Bless (Sigmar)';assert.equal(extraCareerSkills(B,s).length,1);
 s.career='priest';assert.equal(extraCareerSkills(B,s).length,0);s.freeTalent='Bless (Morr)';assert.equal(extraCareerSkills(B,s).length,1);assert.equal(M.quote(B,s,'skill','Augury').cost,50);
 assert.deepEqual(M.quote(B,s,'skill','Augury').eligibility,{book:'winds-of-magic',page:46});
 s.species='Halfling';assert.match(M.quote(B,s,'skill','Augury').error,/Only Humans and Elves/);
});
test('Psychometry removes only the selected random grant, preserves its roll, and unlocks paid non-career advancement',()=>{
 const s=soldier();s.career='mystic';const before=M.freeTalents(B,s),rolls=structuredClone(s.rolls);s.psychometrySlot=0;
 assert.ok(psychometrySacrifice(B,s));assert.equal(M.freeTalents(B,s).length,before.length-1);assert.ok(!M.freeTalents(B,s).includes('Read/Write'));assert.deepEqual(s.randomTalents,soldier().randomTalents);assert.deepEqual(s.rolls,rolls);assert.equal(M.freeSkills(B,s).Psychometry,undefined);
 const q=M.quote(B,s,'skill','Psychometry');assert.equal(q.error,'');assert.equal(q.cost,100);assert.equal(q.tick,false);M.purchase(B,s,'skill','Psychometry',1);assert.equal(M.derive(B,s).skills.Psychometry,.2);assert.equal(M.derive(B,s).earnedBoxes,0);
 assert.match(M.quote(B,s,'skill','Augury').error,/both Augury and Psychometry/);s.ledger.pop();assert.equal(M.derive(B,s).skills.Psychometry,undefined);
 s.career='soldier';assert.match(M.quote(B,s,'skill','Psychometry').error,/requires Mystic/);delete s.psychometrySlot;assert.match(M.quote(B,s,'skill','Psychometry').error,/Give up/);
 s.species='Halfling';assert.match(psychicSkillIssue(B,s,'Psychometry'),/Only Humans/);
 const scryer=womCharacter('Scryer');assert.equal(M.quote(B,scryer,'skill','Psychometry').cost,75);assert.equal(M.quote(B,scryer,'skill','Psychometry').error,'');assert.ok(psychometryPanel(B,scryer).includes('no Species Talent sacrifice'));
});
test('saved College and Psychometry selections reject unavailable values and preserve source decisions',()=>{
 const s=soldier();Object.assign(s,{version:2,books:bookSelection(B),career:'mystic',psychometrySlot:1});assert.ok(catalogForCharacter(lib,s));
 assert.throws(()=>catalogForCharacter(lib,{...s,psychometrySlot:4}),/Psychometry/);assert.throws(()=>catalogForCharacter(lib,{...s,originTalentSlot:'random-1'}),/Psychometry/);assert.throws(()=>catalogForCharacter(lib,{...s,college:'Great Maw'}),/College/);
 assert.ok(womReferences(B,s).some(x=>/Super Numerate/.test(x.text)));assert.ok(psychometryPanel(B,s).includes('no free points'));
});
test('Mundane Alchemist spell choices follow its printed list and Dwarfs/Halflings cannot learn magic',()=>{
 const s=womCharacter('Mundane Alchemist');s.ledger=[{type:'talent',name:'Petty Magic',freeSpells:3,cost:100},{type:'talent',name:'Arcane Magic (Metal)',cost:100}];
 assert.deepEqual(M.spellGrants(B,s)[0].choices.map(x=>x.name).sort(),['Bearings','Open Lock','Shock','Warning']);assert.equal(M.spellGrants(B,s)[1].choices.length,6);
 assert.equal(M.quoteSpell(B,s,'Curse of Rust','Arcane Magic (Metal)'),null);assert.match(quoteRitual(B,s,'Create Construct').error,/ten printed spells/);
 for(const species of ['Dwarf','Halfling'])for(const t of ['Petty Magic','Arcane Magic (Metal)'])assert.match(M.invalidTalent(B,{...s,species},t),/cannot become spellcasters/);
});
test('approved Lore (Alchemy) is a normal Career choice and Savant requires a paid Advance',()=>{
 const s=promotedMundaneAlchemist();assert.deepEqual(M.validation(B,s),[]);assert.deepEqual(freeMagicIssues(B,s,M.spellGrants(B,s)),[]);
 assert.ok(M.options(B,'Lore (Any)').includes('Lore (Alchemy)'));assert.ok(!M.options(R,'Lore (Any)').includes('Lore (Alchemy)'));
 assert.match(M.quote(B,s,'talent','Savant (Alchemy)').error,/requires an Advance/);assert.equal(M.freeSkills(B,s)['Lore (Alchemy)'],undefined);
 const skill=M.quote(B,s,'skill','Lore (Alchemy)');assert.equal(skill.cost,50);assert.equal(skill.inCareer,true);
 M.purchase(B,s,'skill','Lore (Alchemy)',1);assert.equal(M.derive(B,s).skills['Lore (Alchemy)'],.2);assert.equal(M.quote(B,s,'talent','Savant (Alchemy)').error,'');
 M.purchase(B,s,'talent','Savant (Alchemy)');assert.ok(M.derive(B,s).talents.includes('Savant (Alchemy)'));s.ledger.pop();s.ledger.pop();assert.match(M.quote(B,s,'talent','Savant (Alchemy)').error,/requires an Advance/);
});
test('Mundane Alchemist Petty Magic caps free grants without altering acquisition WP, costs or other Careers',()=>{
 const s=promotedMundaneAlchemist(),acquisition=s.ledger.find(x=>x.type==='talent'&&x.name==='Petty Magic');assert.ok(acquisition.freeSpells>=5);assert.equal(M.spellGrants(B,s)[0].count,4);assert.equal(M.knownSpells(B,s).filter(x=>x.category==='Petty').length,4);assert.equal(M.quoteSpell(B,s,'Light','Petty Magic'),null);
 assert.match(womReferences(B,s).find(x=>x.source.page===39).text,/smaller of the Willpower Bonus at acquisition or four/);
 assert.match(pettyGrantNote(B,s,M.spellGrants(B,s)[0]),/approved Fifth Edition adaptation/);assert.equal(pettyGrantNote(R,s,{talent:'Petty Magic'}),'');assert.equal(pettyGrantNote(B,{...s,career:'wizard'},{talent:'Petty Magic'}),'');
 for(const [bonus,count]of [[3,3],[4,4],[5,4],[8,4]]){
  const a=womCharacter('Mundane Alchemist');a.ledger=[{type:'talent',name:'Petty Magic',cost:100,freeSpells:bonus}];assert.equal(M.spellGrants(B,a)[0].count,count);assert.equal(a.ledger[0].freeSpells,bonus);
  a.career='wizard';a.college='Metal';assert.equal(M.spellGrants(B,a)[0].count,bonus);
 }
 const a=womCharacter('Mundane Alchemist');a.ledger=[{type:'talent',name:'Petty Magic',cost:100,freeSpells:3}];a.spells=['Bearings','Open Lock','Shock'];const before=M.derive(B,a).spent;
 assert.equal(M.quoteSpell(B,a,'Warning','Petty Magic').cost,50);M.purchaseSpell(B,a,'Warning','Petty Magic');assert.equal(M.derive(B,a).spent,before+50);assert.equal(M.knownSpells(B,a).filter(x=>x.category==='Petty').length,4);a.ledger.pop();assert.equal(M.knownSpells(B,a).filter(x=>x.category==='Petty').length,3);a.ledger.pop();assert.equal(M.spellGrants(B,a).length,0);
});
test('capped Petty grants preserve a subsequent Arcane grant and editable PDF magic rows',async()=>{
 const s=promotedMundaneAlchemist();M.purchase(B,s,'skill','Lore (Alchemy)');M.purchase(B,s,'talent','Savant (Alchemy)');M.purchase(B,s,'talent','Arcane Magic (Metal)');s.spells.push('Enchant Weapon');
 assert.deepEqual(M.spellGrants(B,s).map(g=>[g.talent,g.count]),[['Petty Magic',4],['Arcane Magic (Metal)',1]]);assert.deepEqual(freeMagicIssues(B,s,M.spellGrants(B,s)),[]);assert.deepEqual(M.validation(B,s),[]);
 const known=M.knownSpells(B,s);assert.equal(known.length,5);assert.equal(known[4].name,'Enchant Weapon');assert.equal(known[4].talent,'Arcane Magic (Metal)');
 globalThis.PDFLib=PDFLib;const bytes=await exportSheet(B,s,fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url))));
 const form=(await PDFLib.PDFDocument.load(bytes)).getForm();assert.equal(form.getFields().length,556);assert.equal(form.getTextField('Spell_4_Name').getText(),'[Legacy] Warning');assert.equal(form.getTextField('Spell_5_Name').getText(),'Enchant Weapon');assert.equal(form.getTextField('XP_Spent').getText(),String(M.derive(B,s).spent));
 assert.ok(form.getFields().some(x=>x.getName().endsWith('_Name')&&x.getText?.()==='Lore (Alchemy)'));
 if(process.env.WFRP_WOM_QA==='1')fs.writeFileSync(new URL('../../tmp/pdfs/winds-of-magic-review/alchemist-sheet.pdf',import.meta.url),bytes);
});
test('ritual learning uses fixed XP and required Lores, blocks duplicates, and earns no tracker or spell-count benefit',()=>{
 const s=loreMage();assert.equal(quoteRitual(B,s,'Create Construct').cost,400);assert.match(quoteRitual(B,s,'Bind Monstrous Beast').error,/Beasts/);assert.match(quoteRitual(B,s,'Invocate Daemon').error,/Daemonology/);
 const before=M.quoteSpell(B,s,'Divination','Arcane Magic (Heavens)').cost;M.purchaseSpell(B,s,'Create Construct','Arcane Magic (Heavens)');
 assert.equal(M.derive(B,s).spent,500);assert.equal(M.derive(B,s).earnedBoxes,0);assert.equal(M.knownSpells(B,s).filter(x=>x.ritual).length,1);assert.equal(M.quoteSpell(B,s,'Divination','Arcane Magic (Heavens)').cost,before);
 assert.throws(()=>M.purchaseSpell(B,s,'Create Construct','Arcane Magic (Heavens)'),/Already known/);assert.equal(M.spellGrants(B,s)[0].choices.some(x=>x.ritual),false);
 assert.ok(ritualShop(B,s).includes('Requires Arcane Magic for Beasts'));assert.deepEqual(womIssues(B,s),[]);
 const C=assembleBooks(lib,['winds-of-magic','archives-iii']);s.cants={enabled:true,choices:{}};assert.equal(cantGrants(C,s)[0].spells,1);syncCants(C,s);s.ledger.pop();assert.equal(M.knownSpells(B,s).filter(x=>x.ritual).length,0);
 const witch=soldier();witch.ledger=[{type:'talent',name:'Arcane Magic (Witchcraft)',cost:100}];assert.equal(quoteRitual(B,witch,'Cursecraft').cost,100);assert.equal(quoteRitual(B,loreMage('Life'),'Cursecraft').cost,200);
});
test('approved robe prices are qualified, spend actual wealth and use printed worn weights; laboratory weight stays unknown',()=>{
 const s=soldier();s.wealth={amount:100,currency:'gold crowns'};
 for(const [name,cost,weight]of [['Practical Robes',240,0],['Standard Robes',1920,1],['Elaborate Robes',7200,3]]){
  const item=marketCatalog(B,s).find(x=>x.name===name);assert.match(item.text,/second-hand illicit-market/);const before=purse(B,s).remaining;buyTrapping(B,s,item.id);assert.equal(purse(B,s).remaining,before-cost);const entry=equipment(B,s).entries.find(x=>x.name===name);assert.equal(entry.placement,'worn');assert.equal(entry.carriedEnc,weight);
 }
 const lab=marketCatalog(B,s).find(x=>x.name==='Portable Alchemical Laboratory');assert.equal(lab.pennies,2880);assert.equal(lab.enc,null);buyTrapping(B,s,lab.id);assert.ok(equipment(B,s).unknown.some(x=>x.includes('Portable Alchemical Laboratory')));
 assert.ok(!marketCatalog(B,s).some(x=>x.name==='Enchanted Staff'));assert.match(womGearPanel(B),/Commission Endeavour costing 15 GC/);assert.match(womGearPanel(B),/learning Imbue Staff does not create an item/);assert.equal(womGearPanel(R),'');
});
test('ritual schema rejects invalid categories, duplicate Lores and unsupported discounts',()=>{
 const ritual=B.spells.find(x=>x.name==='Create Construct');
 for(const change of [
  {category:'Petty'}, {ritual:{lores:['Petty'],learningXP:400}},
  {ritual:{lores:['Life','Life'],learningXP:400}}, {ritual:{lores:['*','Life'],learningXP:400}},
  {ritual:{lores:['Life'],learningXP:400,discountXP:200}},
  {ritual:{lores:['Life'],learningXP:400,discountLores:['Death'],discountXP:200}},
  {ritual:{lores:['*'],learningXP:400,discountLores:['Life','Life'],discountXP:200}},
  {ritual:{lores:['*'],learningXP:400,discountLores:['Life'],discountXP:400}}
 ]){
  const altered=structuredClone(lib),data=altered.packs.find(x=>x.manifest.id==='winds-of-magic').data;
  Object.assign(data.spells.find(x=>x.id===ritual.contentId),change);
  assert.throws(()=>assembleBooks(altered,['winds-of-magic']),/invalid ritual learning rules/);
 }
});
test('new magic and Augury export with all 556 editable fields, sourced ritual XP and folio totals',async()=>{
 const s=promotedAstromancer();assert.deepEqual(M.validation(B,s),[]);assert.deepEqual(freeMagicIssues(B,s,M.spellGrants(B,s)),[]);
 const d=M.derive(B,s);assert.equal(d.level,2);assert.equal(d.spent,1475);assert.equal(d.earnedBoxes,11);assert.equal(d.skills.Augury,2);assert.equal(d.status,'Silver 4');
 assert.ok(folioData(B,s).magic.some(x=>x.name==='Create Power Stone'));
 globalThis.PDFLib=PDFLib;const bytes=await exportSheet(B,s,fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url))));
 const doc=await PDFLib.PDFDocument.load(bytes),form=doc.getForm();assert.equal(form.getFields().length,556);assert.equal(form.getTextField('XP_Spent').getText(),String(d.spent));assert.ok(doc.getPageCount()>4);
 assert.ok(form.getFields().some(x=>x.getName().endsWith('_Name')&&x.getText?.()==='Augury'));assert.equal(form.getTextField('Spell_2_Name').getText(),'Create Power Stone');
 if(process.env.WFRP_WOM_QA==='1'){
  fs.writeFileSync(new URL('../../tmp/pdfs/winds-of-magic-review/astromancer-sheet.pdf',import.meta.url),bytes);
  fs.writeFileSync(new URL('../../tmp/pdfs/winds-of-magic-review/astromancer.json',import.meta.url),JSON.stringify({...s,step:7},null,2));
  fs.writeFileSync(new URL('../../tmp/pdfs/winds-of-magic-review/alchemist.json',import.meta.url),JSON.stringify(promotedMundaneAlchemist(),null,2));
 }
});
