import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import * as M from '../dist/rules.mjs';
import {library,R,soldier} from './fixture.mjs';
import {assembleBooks,bookSelection,catalogForCharacter,randomTable,tableResult,validateCatalog} from '../dist/books.mjs';
import {careerAvailable} from '../dist/origins.mjs';
import {speciesReferences,speciesLoreIssue} from '../dist/species-mechanics.mjs';
import {miracleChoices,cultIssues} from '../dist/cults.mjs';
import {divineReference,freeMagicIssues} from '../dist/archives-iii.mjs';
import {speciesRulePanel} from '../dist/archives-ui.mjs';
import {collegePanel} from '../dist/winds-of-magic-ui.mjs';
import {suggestion} from '../dist/background.mjs';
import {exportSheet} from '../dist/export.mjs';
import {folioData} from '../dist/folio.mjs';
import {gearSlots} from '../dist/equipment.mjs';

const B=assembleBooks(library,['rough-nights']);
export function gnome(career='soldier',catalog=B){
 const s=M.fresh();Object.assign(s,{version:2,books:bookSelection(catalog),rollTables:{},name:'Elowen Thorne',species:'Gnome',career,xp:30000,wealth:{amount:100,currency:'silver shillings'},speciesSkills:['s-1','s-2','s-3','s-5','s-6'],talentChoices:{'species-0':'Beneath Notice','species-1':'Mimic','species-3':'Fisherman','species-4':'Sixth Sense'}});
 if(career==='wizard')s.college='Shadows';
 for(const slot of M.careerSkillSlots(catalog,s,1).slice(0,8))s.careerSkills[slot.key]=1;
 s.freeTalent=M.careerTalentOptions(catalog,s).find(t=>!M.freeTalents(catalog,{...s,freeTalent:''}).includes(t)&&!M.invalidTalent(catalog,{...s,freeTalent:''},t));
 s.spells=M.spellGrants(catalog,s).flatMap(g=>g.choices.slice(0,g.count).map(x=>x.name));
 return s;
}
export function gnomePriest(god){
 const s=gnome('priest');s.freeTalent=`Bless (${god})`;s.spells=[];
 for(const slot of M.careerSkillSlots(B,s,1).slice(0,8))M.purchase(B,s,'skill',slot.name);
 for(const k of M.KEYS.filter(k=>M.career(B,s).advanceScheme[k]===1).slice(0,2))M.purchase(B,s,'char',k);
 M.purchase(B,s,'promotion','');M.purchase(B,s,'talent',`Invoke (${god})`);
 s.spells=[miracleChoices(B,god)[0].name];return s;
}

test('Rough Nights is opt-in and composes with every existing supplement selection without changing core content',()=>{
 assert.equal(R.species.Gnome,undefined);assert.equal(B.careers.length,R.careers.length);assert.equal(B.spells.length,R.spells.length);
 for(let mask=0;mask<64;mask++){
  const ids=['up-in-arms','archives-i','archives-ii','archives-iii','archives-iii-hedge','winds-of-magic'].filter((_,i)=>mask&(1<<i)),before=assembleBooks(library,ids),after=assembleBooks(library,[...ids,'rough-nights']);
  for(const kind of ['careers','spells','weapons','armour','gear','market','cants'])assert.deepEqual(after[kind],before[kind]);
  for(const name of Object.keys(before.species))assert.deepEqual(after.species[name],before.species[name]);
  assert.equal(after.cults.length,3);
 }
});
test('Gnome profile uses approved starting values, five Skills/Talents, native Reikspiel and a visible adaptation warning',()=>{
 const s=gnome(),sp=B.species.Gnome,d=M.derive(B,s);
 assert.deepEqual(sp.offsets,{WS:20,BS:10,S:10,T:15,I:30,Ag:30,Dex:30,Int:30,WP:40,Fel:15});
 assert.equal(d.fate,2);assert.equal(d.fortune,2);assert.equal(d.movement,3);assert.equal(d.size,'Small');assert.equal(d.wounds,4);
 assert.equal(sp.talents.length,5);assert.equal(sp.randomTalents,0);assert.ok(!M.freeTalents(B,s).includes('Small'));assert.equal(s.speciesSkills.length,5);
 assert.equal(M.freeSkills(B,s)['Language (Reikspiel)'],6);assert.equal(M.freeSkills(B,s)['Language (Ghassally)'],undefined);
 assert.ok(M.options(B,'Language (Any)','skill',s).includes('Language (Ghassally)'));
 assert.match(speciesRulePanel(B,s),/Proposed Fifth Edition adaptation/);assert.ok(speciesReferences(B,s).some(x=>x.source.page===88&&x.text.includes('no extra points')));
 s.talentChoices['species-1']='Luck';assert.equal(M.derive(B,s).fortune,3);
 s.speciesMode=s.careerMode=s.charMode='first';s.charRolls=Array(10).fill(10);assert.equal(M.derive(B,s).fate,3);assert.equal(M.derive(B,s).fortune,4);
 s.ledger=[{type:'talent',name:'Hardy',cost:100}];assert.equal(M.derive(B,s).wounds,6);
 assert.equal(M.derive(R,soldier()).wounds,12);
});
test('All 100 Gnome Career results are covered by the printed table, use documented names, and permit complete creation',()=>{
 const s=gnome(),table=randomTable(B,s,'career');assert.equal(table.id,'rough-nights:table:gnome-careers');assert.equal(table.page,87);
 assert.equal(tableResult(table,30),'adviser');assert.equal(tableResult(table,84),'knave');assert.equal(tableResult(table,85),'knave');assert.equal(tableResult(table,100),'soldier');
 assert.match(table.conversion,/Advisor → Adviser/);assert.match(table.conversion,/Bawd → Knave/);
 for(let n=1;n<=100;n++)assert.ok(careerAvailable(B,s,B.careers.find(x=>x.id===tableResult(table,n))));
 const legal=B.careers.filter(c=>careerAvailable(B,s,c));assert.equal(legal.length,42);assert.equal(careerAvailable(B,s,B.careers.find(c=>c.id==='knight')),false);
 for(const c of legal){const made=gnome(c.id);assert.deepEqual(M.validation(B,made),[],c.name);assert.deepEqual(freeMagicIssues(B,made,M.spellGrants(B,made)),[],c.name);}
 assert.equal(randomTable(B,{species:'Human'},'career').source.book,'core');
});
test('Species tables preserve both printed result 98 alternatives without invented combined probabilities',()=>{
 const C=assembleBooks(library,['rough-nights','archives-ii']),s=gnome('soldier',C);
 assert.equal(randomTable(B,s,'species').source.book,'core');assert.equal(randomTable(C,s,'species').id,'archives-ii:table:species');
 s.rollTables.species='rough-nights:table:species';assert.equal(tableResult(randomTable(C,s,'species'),98),'Gnome');
 s.rollTables.species='archives-ii:table:species';assert.equal(tableResult(randomTable(C,s,'species'),98),'Ogre');
 assert.equal(randomTable(C,s,'career').id,'rough-nights:table:gnome-careers');
});
test('Gnome names and physical details retain printed sources and real 2d10 probabilities',()=>{
 const s=gnome(),b=B.background.Gnome;assert.equal(b.forenames.length,16);assert.equal(b.surnames.length,12);assert.deepEqual(B.species.Gnome.age,[20,10]);assert.deepEqual(B.species.Gnome.height,[40,1]);
 let source,count,sides;
 const roll=(n,p,k,ref,c)=>{source=ref;count=c;sides=n;return k==='forenames'?1:k==='surnames'?12:11;};
 assert.equal(suggestion(B,s,'forenames',roll),'Elowen');assert.equal(source.page,88);
 assert.equal(suggestion(B,s,'surnames',roll),'Patchcloak');assert.equal(source.page,89);
 assert.equal(suggestion(B,s,'eyes',roll),'Pale Green');assert.equal(count,2);assert.equal(sides,10);
 let green=0;for(let a=1;a<=10;a++)for(let b=1;b<=10;b++)if(suggestion(B,s,'eyes',()=>a+b)==='Pale Green')green++;assert.equal(green,34);
 assert.ok(b.hair.includes('White'));assert.match(speciesRulePanel(B,s),/deep silver/);
});
test('Gnome magic keeps only Shadows in supported Arcane choices and explains innate dispelling without forcing spellcasting',()=>{
 const s=gnome();assert.equal(speciesLoreIssue(B,s,'Ulgu'),'');assert.match(speciesLoreIssue(B,s,'Aqshy'),/Shadows.*p\. 88/);
 assert.match(M.invalidTalent(B,s,'Arcane Magic (Fire)'),/only Shadows/);assert.equal(M.invalidTalent(B,s,'Arcane Magic (Shadows)'),'');
 assert.match(speciesRulePanel(B,s),/Dispelling even without a spellcasting Talent/);
 const C=assembleBooks(library,['rough-nights','winds-of-magic']),wizard=gnome('wizard',C),panel=collegePanel(C,wizard);
 assert.match(panel,/value="Shadows"/);assert.doesNotMatch(panel,/value="Fire"/);assert.deepEqual(M.validation(C,wizard),[]);
 s.speciesSkills=['s-0','s-1','s-2','s-3','s-5'];assert.match(M.invalidTalent(B,s,'Bless (Evawn)'),/Incompatible/);
});
test('Suffuse with Ulgu preserves its printed non-stacking effects, maximum one and unchanged Skill totals',()=>{
 const t=M.talentInfo(B,'Suffuse with Ulgu'),s=gnome();assert.equal(t.page,88);assert.match(t.text,/8 yards/);assert.match(t.text,/once/);
 assert.match(t.text,/Adaptation warning/);
 const before=folioData(B,s);s.talentChoices['species-0']=t.name;
 assert.deepEqual(folioData(B,s).skills,before.skills);assert.match(M.invalidTalent(B,s,t.name),/not repeatable/);
 assert.equal(M.derive(B,s).spent,0);assert.equal(M.freeTalents(B,s).filter(x=>x===t.name).length,1);
});
test('All three Gnome patrons use exactly their printed six Blessings and three reimagined core Miracles',()=>{
 for(const god of ['Evawn','Mabyn','Ringil']){
  const s=gnomePriest(god),grants=M.spellGrants(B,s),known=M.knownSpells(B,s);assert.equal(grants.length,1);assert.equal(grants[0].choices.length,3);assert.equal(grants[0].count,1);
  assert.ok(grants[0].choices.every(x=>x.category===god&&x.source.book==='core'&&x.grantSource.book==='rough-nights'));
  assert.equal(known.filter(x=>x.talent===`Bless (${god})`).length,6);assert.equal(known.filter(x=>x.talent===`Invoke (${god})`).length,1);
  assert.ok(known.every(x=>x.lore===god&&x.source.book==='core'&&x.grantSource.book==='rough-nights'));
  assert.deepEqual(M.validation(B,s),[]);assert.deepEqual(freeMagicIssues(B,s,grants),[]);assert.match(divineReference(B,s)[0].text,/Strictures/);
  const choice=grants[0].choices[1];assert.equal(M.quoteSpell(B,s,choice.name,grants[0].talent).cost,100);
  const before=M.derive(B,s).remaining;M.purchaseSpell(B,s,choice.name,grants[0].talent);assert.equal(M.derive(B,s).remaining,before-100);assert.equal(s.ledger.at(-1).tick,false);
  assert.deepEqual(s.ledger.at(-1).eligibility,{book:'rough-nights',page:90});
  assert.throws(()=>M.purchaseSpell(B,s,choice.name,grants[0].talent),/Already known/);s.ledger.pop();assert.equal(M.derive(B,s).remaining,before);
  assert.equal(M.quoteSpell(B,s,'Soulfire',grants[0].talent),null);assert.match(M.invalidTalent(B,s,'Invoke (Sigmar)'),/only one|match/);
  assert.ok(miracleChoices(R,'Ranald').every(x=>x.category==='Ranald'));
 }
 assert.deepEqual(miracleChoices(B,'Evawn').map(x=>x.name),['An Invitation','Trickster’s Glamour','Rhya’s Shelter']);
 assert.deepEqual(miracleChoices(B,'Mabyn').map(x=>x.name),['Death Mask','You Saw Nothing','Sword of Justice']);
});
test('Cult data and saved purchases reject unknown, duplicate, non-divine and unsupported entries',()=>{
 for(const mutate of [c=>c.miracles.push(c.miracles[0]),c=>c.miracles=['Unknown Miracle'],c=>c.miracles=['Open Lock'],c=>c.miracles=[],c=>c.name='Unregistered God',c=>c.unknownRule=true]){
  const altered=structuredClone(library);mutate(altered.packs.find(p=>p.manifest.id==='rough-nights').data.cults[0]);assert.throws(()=>assembleBooks(altered,['rough-nights']),/Book pack:/);
 }
 const broken=structuredClone(B);broken.species.Gnome.mechanics.references[0].page=0;assert.throws(()=>validateCatalog(broken),/Species reference/);
 const s=gnomePriest('Evawn');assert.equal(catalogForCharacter(library,JSON.parse(JSON.stringify(s))).cults.length,3);
 s.ledger.push({type:'spell',name:'Soulfire',talent:'Invoke (Evawn)',cost:100});assert.match(cultIssues(B,s)[0],/not a listed Miracle/);assert.throws(()=>catalogForCharacter(library,s),/not a listed Miracle/);
});
test('Gnome PDF retains all editable fields and exports Small Wounds, adapted values, patron and reused Miracle effects',async()=>{
 const s=gnomePriest('Evawn');s.talentChoices['species-0']='Suffuse with Ulgu';M.purchaseSpell(B,s,'Trickster’s Glamour','Invoke (Evawn)');globalThis.PDFLib=PDFLib;
 // Synthetic fixed quantities complete the test draft; these are not claimed as random rolls.
 for(const slot of gearSlots(B,s))for(const match of slot.name.matchAll(/\{?(\d+)d10\}?/g))s.gearRolls[`${slot.key}:${match[0]}`]=5*Number(match[1]);
 const bytes=await exportSheet(B,s,fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url)))),form=(await PDFLib.PDFDocument.load(bytes)).getForm();
 assert.equal(form.getFields().length,556);assert.equal(form.getTextField('Species').getText(),'[Legacy] Gnome');assert.equal(form.getTextField('Wounds_Total').getText(),String(M.derive(B,s).wounds));assert.equal(form.getTextField('XP_Spent').getText(),String(M.derive(B,s).spent));
 assert.equal(form.getTextField('Wounds_SB').getText(),'0');assert.equal(form.getTextField('Wounds_WPB').getText(),'0');
 assert.match(form.getTextField('Notes').getText(),/Proposed adaptation/);
 assert.match(form.getTextField('Spell_2_Name').getText(),/Trickster/);assert.match(form.getTextField('Spell_2_Effect').getText(),/Evawn/);
 if(process.env.WFRP_ROUGH_QA==='1'){
  fs.writeFileSync(new URL('../../tmp/pdfs/rough-nights-review/gnome-priest.pdf',import.meta.url),bytes);
  fs.writeFileSync(new URL('../../tmp/pdfs/rough-nights-review/gnome-priest.json',import.meta.url),JSON.stringify(s));
 }
});
