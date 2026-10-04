import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import * as M from '../dist/rules.mjs';
import {library,R,soldier} from './fixture.mjs';
import {assembleBooks,bookSelection,catalogForCharacter,randomTable} from '../dist/books.mjs';
import {creationSpecies,careerAvailable} from '../dist/origins.mjs';
import {spellChoices,cantGrants,knownCants,cantIssues,syncCants,freeMagicIssues,divineReference} from '../dist/archives-iii.mjs';
import {cantPanel,originTalentChoice} from '../dist/archives-iii-ui.mjs';
import {folioData} from '../dist/folio.mjs';
import {exportSheet} from '../dist/export.mjs';
const B=assembleBooks(library,['archives-iii']);
export function iiiPriest(career='priest',talent='Bless (Old Faith)'){
 const s=M.fresh();Object.assign(s,{name:'Archives III test priest',career,freeTalent:talent,randomTalents:['Read/Write','Cardsharp','Attractive','Strong Back'],speciesSkills:['s-0','s-1','s-2','s-3','s-4'],careerSkills:Object.fromEntries(Array.from({length:8},(_,i)=>[`c1-${i}`,1])),wealth:{amount:100,currency:'silver shillings'},xp:30000});return s;
}
export function oldFaithPriest(){
 const s=iiiPriest();s.spells=B.spells.filter(x=>x.category==='Blessing').slice(0,6).map(x=>x.name);
 for(const slot of M.careerSkillSlots(B,s,1).slice(0,8))M.purchase(B,s,'skill',slot.name);
 for(const k of Object.keys(M.career(B,s).advanceScheme).filter(k=>M.career(B,s).advanceScheme[k]===1).slice(0,2))M.purchase(B,s,'char',k);M.purchase(B,s,'promotion','');M.purchase(B,s,'talent','Invoke (Old Faith)');
 s.spells.push(B.spells.filter(x=>x.category==='Blessing')[6].name);s.books=bookSelection(B);return s;
}
function colourMage(lore='Fire'){
 const s=soldier();s.xp=30000;s.ledger=[{type:'talent',name:`Arcane Magic (${lore})`,cost:100,tick:false}];s.spells=[M.spellGrants(B,s)[0].choices.find(x=>x.category===lore).name];s.cants={enabled:true,choices:{}};return s;
}

test('Archives III stays opt-in and works with every existing supplement combination',()=>{
 assert.equal(R.cants.length,0);assert.ok(!R.config.gods.includes('Old Faith'));
 for(let mask=0;mask<8;mask++){
  const ids=['up-in-arms','archives-i','archives-ii'].filter((_,i)=>mask&(1<<i)),before=assembleBooks(library,ids),after=assembleBooks(library,[...ids,'archives-iii']);
  assert.equal(after.careers.length,before.careers.length+3);assert.equal(after.origins.length,before.origins.length+5);assert.equal(after.spells.length,before.spells.length+27);assert.equal(after.cants.length,24);
  assert.deepEqual(after.armour,before.armour);assert.deepEqual(after.weapons,before.weapons);
  assert.equal(randomTable(after,M.fresh(),'species').id,randomTable(before,M.fresh(),'species').id);
  for(const n of ['Goodwill','Mirkride','Nepenthe','Nostrum','Part the Branches','Protective Charm'])assert.equal(after.spells.find(x=>x.name===n).source.book,'core');
 }
});
test('three specialised Priest Careers use sourced schemes and normal creation',()=>{
 const schemes=[['Priest of Handrich',{T:1,Int:1,Fel:1,Ag:2,I:3,WP:4}],['Priest of Solkan',{T:1,I:1,WP:1,WS:2,Fel:3,Int:4}],['Priestess of Rhya',{T:1,WP:1,Fel:1,Int:2,Dex:3,I:4}]];
 for(const [name,scheme]of schemes){const c=B.careers.find(x=>x.name===name),god=name.split(' ').at(-1),s=iiiPriest(c.id,`Bless (${god})`);assert.equal(c.class,'Academic');for(const k of M.KEYS)assert.equal(c.advanceScheme[k],scheme[k]||null,k);assert.deepEqual(M.validation(B,s),[]);assert.equal(M.knownSpells(B,s).filter(x=>x.category==='Blessing').length,6);assert.ok(!careerAvailable(B,{species:'Dwarf'},c));}
 assert.match(M.invalidTalent(B,{...iiiPriest('warrior-priest',''),randomTalents:[]},'Bless (Rhya)'),/no Warrior Priests/);
 assert.match(M.invalidTalent(B,{...iiiPriest('witch-hunter',''),randomTalents:[]},'Invoke (Rhya)'),/no Warrior Priests/);
 assert.ok(divineReference(B,iiiPriest('priest','Bless (Solkan)')).some(x=>/any Sin or Corruption/.test(x.text)));
});
test('five Altdorf origins retain 5E physical profiles and exclusive Eastender Talent slot',()=>{
 for(const o of B.origins.filter(x=>x.source.book==='archives-iii')){
  const s=M.fresh();s.species=o.species;s.origin=o.id;const sp=creationSpecies(B,s);
  assert.equal(sp.talents.length+sp.randomTalents,5);assert.deepEqual(sp.offsets,R.species[o.species].offsets);assert.deepEqual(sp.languages,R.species[o.species].languages);assert.equal(M.speciesSkillSlots(B,s).length,12);
 }
 const s=iiiPriest();s.origin=B.origins.find(x=>x.name.endsWith('Eastender')).id;s.randomTalents=[];
 assert.ok(M.freeTalents(B,s).includes('Criminal'));assert.equal(creationSpecies(B,s).randomTalents,0);
 s.originTalentMode='random';s.randomTalents=['Luck'];assert.equal(creationSpecies(B,s).talents.length,4);assert.equal(creationSpecies(B,s).randomTalents,1);assert.ok(!M.freeTalents(B,s).includes('Criminal'));assert.ok(M.freeTalents(B,s).includes('Luck'));assert.match(originTalentChoice(B,s),/one starting slot/i);
 assert.ok(M.options(B,'Language (Battle or Thieves Tongue)').includes('Language (Thieves Tongue)'));
});
test('Old Faith grants exactly six chosen Blessings and one distinct Invoke Blessing',()=>{
 const s=iiiPriest();assert.equal(M.knownSpells(B,s).length,0);const g=M.spellGrants(B,s)[0];assert.equal(g.count,6);assert.equal(g.choices.length,19);assert.equal(g.purchasable,false);
 s.spells=g.choices.slice(0,6).map(x=>x.name);assert.deepEqual(freeMagicIssues(B,s,M.spellGrants(B,s)),[]);assert.equal(M.knownSpells(B,s).length,6);assert.equal(M.quoteSpell(B,s,g.choices[6].name,g.talent),null);
 const advanced=oldFaithPriest();assert.deepEqual(M.validation(B,advanced),[]);assert.equal(M.knownSpells(B,advanced).length,7);assert.deepEqual(freeMagicIssues(B,advanced,M.spellGrants(B,advanced)),[]);
 advanced.spells[6]=advanced.spells[0];assert.match(freeMagicIssues(B,advanced,M.spellGrants(B,advanced)).join('\n'),/different Old Faith/);
});
test('Old Faith purchase prices exclude Bless six, scale after six counted prayers, and undo refunds',()=>{
 const s=oldFaithPriest(),names=B.spells.filter(x=>x.category==='Blessing').map(x=>x.name),before=M.derive(B,s);
 assert.match(M.quoteSpell(B,s,names[0],'Invoke (Old Faith)').error,/Already known/);
 assert.throws(()=>M.purchaseSpell(B,s,names[0],'Invoke (Old Faith)'),/Already known/);
 for(let i=7;i<12;i++){assert.equal(M.quoteSpell(B,s,names[i],'Invoke (Old Faith)').cost,100);M.purchaseSpell(B,s,names[i],'Invoke (Old Faith)');}
 assert.equal(M.quoteSpell(B,s,names[12],'Invoke (Old Faith)').cost,200);M.purchaseSpell(B,s,names[12],'Invoke (Old Faith)');
 assert.equal(M.derive(B,s).spent,before.spent+700);assert.equal(M.derive(B,s).earnedBoxes,before.earnedBoxes);assert.equal(s.ledger.at(-1).eligibility.page,58);
 s.ledger.pop();assert.equal(M.derive(B,s).spent,before.spent+500);assert.equal(M.knownSpells(B,s).length,12);
 s.spells[0]=names[7];assert.match(freeMagicIssues(B,s,M.spellGrants(B,s)).join('\n'),/cannot be purchased or granted again/);
});
test('spell XP bands retain core boundaries and actual budget enforcement',()=>{
 const s=colourMage(),talent='Arcane Magic (Fire)',g=M.spellGrants(B,s)[0];
 const extended={...B,spells:[...B.spells,...Array.from({length:25},(_,i)=>({name:`Test spell ${i}`,category:'Fire',text:'Synthetic test only',source:{book:'core',page:115}}))]};
 for(let count=1;count<=22;count++){s.ledger=s.ledger.filter(x=>x.type!=='spell');s.ledger.push(...Array.from({length:count-1},(_,i)=>({type:'spell',name:`Test spell ${i}`,talent,cost:100,tick:false})));assert.equal(M.quoteSpell(extended,s,'Test spell 24',talent).cost,count<=5?100:count<=10?200:count<=15?300:count<=20?400:500);}
 s.xp=0;assert.throws(()=>M.purchaseSpell(B,s,g.choices[1].name,talent),/Not enough XP/);
});
test('Fellstave has seven separately learnable printed targets',()=>{
 const s=colourMage();s.ledger[0].name='Arcane Magic (Hedgecraft)';s.spells=['Fellstave (Beastmen)'];
 const names=spellChoices(B).filter(x=>x.name.startsWith('Fellstave ('));assert.equal(names.length,7);assert.ok(!names.some(x=>/Skaven/.test(x.name)));
 M.purchaseSpell(B,s,'Fellstave (Undead)','Arcane Magic (Hedgecraft)');assert.equal(M.knownSpells(B,s).filter(x=>x.name.startsWith('Fellstave')).length,2);assert.equal(s.ledger.at(-1).definition.page,62);assert.throws(()=>M.purchaseSpell(B,s,'Fellstave','Arcane Magic (Hedgecraft)'),/No matching/);
});
test('Cants unlock at 1, 3 and 6 Colour Lore spells, cost nothing and prune after undo',()=>{
 const s=colourMage(),talent='Arcane Magic (Fire)',choices=M.spellGrants(B,s)[0].choices.filter(x=>x.name!==s.spells[0]);
 assert.equal(cantGrants(B,s)[0].count,1);assert.match(cantIssues(B,s).join('\n'),/Choose 1 distinct Fire/);
 s.cants.choices.Fire=[B.cants.find(x=>x.lore==='Fire').id];assert.deepEqual(cantIssues(B,s),[]);
 for(let n=2;n<=6;n++){M.purchaseSpell(B,s,choices[n-2].name,talent);assert.equal(cantGrants(B,s)[0].count,n>=6?3:n>=3?2:1);}
 s.cants.choices.Fire=B.cants.filter(x=>x.lore==='Fire').map(x=>x.id);assert.equal(knownCants(B,s).length,3);assert.equal(folioData(B,s).magic.filter(x=>x.name.includes('Cant')).length,3);
 const before=M.derive(B,s);s.ledger.pop();syncCants(B,s);assert.equal(knownCants(B,s).length,2);assert.equal(s.cants.choices.Fire.length,2);assert.equal(M.derive(B,s).earnedBoxes,before.earnedBoxes);
 s.cants.enabled=false;assert.equal(knownCants(B,s).length,0);assert.ok(cantPanel(B,s).includes('checkbox'));assert.equal(cantPanel(R,s),'');
});
test('Cants are Lore-specific and never granted by Petty, Witch or Hedgecraft alone',()=>{
 for(const lore of B.config.colours){const s=colourMage(lore);if(!B.cants.some(x=>x.lore===lore)){assert.equal(cantGrants(B,s).length,0);continue;}const g=cantGrants(B,s)[0];assert.equal(g.lore,lore);assert.equal(g.choices.length,3);assert.ok(g.choices.every(x=>x.lore===lore));}
 const s=colourMage();s.ledger[0].name='Witch!';s.spells=[B.spells.find(x=>x.category==='Fire').name];assert.equal(cantGrants(B,s).length,0);
 s.ledger[0].name='Arcane Magic (Hedgecraft)';s.spells=['Fellstave (Undead)'];assert.equal(cantGrants(B,s).length,0);
});
test('saved Cant state and regional alternatives reject wrong books, Lores and duplicate choices',()=>{
 const s=colourMage();s.books=bookSelection(B);const id=B.cants.find(x=>x.lore==='Fire').id;s.cants.choices.Fire=[id];assert.equal(catalogForCharacter(library,s).cants.length,24);
 for(const choices of [{Fire:[id,id]},{Fire:['missing']},{MadeUp:[]},{Fire:null},{Life:[id]}])assert.throws(()=>catalogForCharacter(library,{...s,cants:{enabled:true,choices}}),/Cant/);
 assert.throws(()=>catalogForCharacter(library,{...s,books:bookSelection(R)}),/Cant/);assert.throws(()=>catalogForCharacter(library,{...s,originTalentMode:'random'}),/regional/);
});
test('animal-doctor Hedge Witch is an explicit opt-in replacement with no extra free Advances',()=>{
 const V=assembleBooks(library,['archives-iii-hedge']),s=iiiPriest('hedge-witch','Petty Magic'),c=M.career(V,s),core=R.careers.find(x=>x.id==='hedge-witch');assert.equal(M.career(B,s).contentId,core.contentId);
 assert.equal(c.source.book,'archives-iii-hedge');assert.equal(c.levels[0].skills.length,core.levels[0].skills.length+2);assert.ok(c.levels[0].skills.includes('Animal Care'));assert.ok(c.levels[0].skills.includes('Language (Belthani)'));assert.ok(c.levels[0].talents.includes('Hardy'));assert.ok(c.levels[0].unavailableSkills.some(x=>x.name.startsWith('Trade (Charms)')));assert.deepEqual(M.validation(V,s),[]);
 s.careerSkills['c1-10']=1;assert.match(M.validation(V,s).join('\n'),/eight free Career/);
});
test('Archives III editable PDF exports chosen Old Faith prayers and Cant reference records',async()=>{
 globalThis.PDFLib=PDFLib;const s=oldFaithPriest();M.purchaseSpell(B,s,'Blessing of Wit','Invoke (Old Faith)');
 const sheet=fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),fields=JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url))),bytes=await exportSheet(B,s,sheet,fields),doc=await PDFLib.PDFDocument.load(bytes),form=doc.getForm();assert.equal(form.getFields().length,556);assert.equal(form.getTextField('XP_Spent').getText(),String(M.derive(B,s).spent));assert.ok(M.knownSpells(B,s).some(x=>x.name==='Blessing of Wit'));
 const mage=colourMage();mage.cants.choices.Fire=[B.cants.find(x=>x.lore==='Fire').id];const mageBytes=await exportSheet(B,mage,sheet,fields);assert.equal((await PDFLib.PDFDocument.load(mageBytes)).getForm().getFields().length,556);
 if(process.env.WFRP_QA_OUTPUT){fs.writeFileSync(new URL('../../tmp/pdfs/archives-iii-old-faith.pdf',import.meta.url),bytes);fs.writeFileSync(new URL('../../tmp/pdfs/archives-iii-cants.pdf',import.meta.url),mageBytes);}
});
