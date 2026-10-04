import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import {library,R as core} from './fixture.mjs';
import {assembleBooks,bookSelection,randomTable,tableResult,catalogForCharacter} from '../dist/books.mjs';
import * as M from '../dist/rules.mjs';
import * as E from '../dist/high-elf.mjs';
import {creationSpecies,careerAvailable} from '../dist/origins.mjs';
import {marketCatalog,buyTrapping,purse} from '../dist/market.mjs';
import {gearSlots,equipment} from '../dist/equipment.mjs';
import {folioData} from '../dist/folio.mjs';
import {exportSheet} from '../dist/export.mjs';
import {quoteRitual} from '../dist/winds-of-magic.mjs';
import {elfOriginPanel,elfSkillsPanel,elfMagicShop,elfCareerPanel} from '../dist/high-elf-ui.mjs';
const R=assembleBooks(library,['high-elf']);
function character(career='high-elf:career:sea-guard',origin='high-elf:origin:eataine',catalog=R){
 const s=M.fresh();Object.assign(s,{version:2,books:bookSelection(catalog),rollTables:{},name:'High Elf verification',species:'High Elf',origin,career,xp:100000,wealth:{amount:1000,currency:'gold crowns'}});
 s.speciesSkills=M.speciesSkillSlots(catalog,s).slice(0,5).map(x=>x.key);
 for(const slot of M.careerSkillSlots(catalog,s,1).slice(0,8))s.careerSkills[slot.key]=1;
 s.freeTalent=M.careerTalentOptions(catalog,s).find(n=>!M.freeTalents(catalog,s).includes(n)&&!M.invalidTalent(catalog,s,n));
 s.spells=M.spellGrants(catalog,s).flatMap(g=>g.choices.slice(0,g.count).map(x=>x.name));
 for(const slot of gearSlots(catalog,s))for(const token of slot.name.match(/\{?\d+d10\}?/g)||[])s.gearRolls[`${slot.key}:${token}`]=1;
 return s;
}
const grant=(s,name)=>s.ledger.push({type:'talent',name,cost:0,tick:false});
const spell=(s,name,talent)=>s.ledger.push({type:'spell',name,talent,cost:0,tick:false});
function past(s,era,mode='chosen',career='soldier'){
 const h=s.highElf.history.find(x=>x.era===era);h.career=career;h.mode=mode;
 const slots=E.elderSkillSlots(R,s,h);h.points=Object.fromEntries(slots.slice(0,mode==='rolled'?3:2).map(x=>[x.key,5]));return h;
}
test('High Elf pack is opt-in and composes with supplements without changing core profiles',()=>{
 assert.equal(core.origins.some(x=>x.source.book==='high-elf'),false);
 const all=assembleBooks(library,library.packs.map(p=>p.manifest.id));
 for(const key of ['species','weapons','armour'])for(const x of key==='species'?Object.values(core[key]):core[key]){const y=key==='species'?all[key][x.name]:all[key].find(y=>y.contentId===x.contentId);assert.deepEqual(y,x);}
 assert.equal(R.careers.filter(x=>x.source.book==='high-elf').length,6);assert.equal(R.spells.filter(x=>x.source.book==='high-elf').length,59);assert.equal(R.techniques.length,10);
 assert.ok(!R.careers.some(x=>x.source.book==='high-elf'&&x.levels.length!==4));
});
test('eleven origins retain all printed Talent slots, five Skills and unchanged physical benefits',()=>{
 for(const o of R.origins.filter(x=>x.source.book==='high-elf')){
  const s=character('soldier',o.id),p=creationSpecies(R,s);assert.equal(p.offsets, R.species['High Elf'].offsets);assert.equal(p.fate,core.species['High Elf'].fate);assert.equal(p.fortune,core.species['High Elf'].fortune);assert.equal(p.randomTalents,0);assert.ok([5,6].includes(p.talents.length));
  assert.equal(M.speciesSkillSlots(R,s).filter(x=>s.speciesSkills.includes(x.key)).length,5);assert.equal(M.freeTalents(R,{...s,freeTalent:''}).length,p.talents.length);
 }
 for(const c of R.careers.filter(x=>x.source.book==='high-elf'))assert.deepEqual(M.validation(R,character(c.id)),[],c.name);
});
test('regional Career tables cover all faces, default per origin, and preserve explicit core choices',()=>{
 for(const o of R.origins.filter(x=>x.source.book==='high-elf')){
  const s=character('soldier',o.id),t=randomTable(R,s,'career');assert.equal(t.id,o.careerTable);
  for(let face=1;face<=100;face++)assert.ok(careerAvailable(R,s,R.careers.find(c=>c.id===tableResult(t,face))),`${o.name} ${face}`);
  const ct=core.tables.find(t=>t.kind==='career'&&t.species==='High Elf');s.rollTables.career=ct.id;assert.equal(randomTable(R,s,'career').id,ct.id);
 }
 const outer=R.tables.find(x=>x.id==='high-elf:table:outer'),avelorn=R.tables.find(x=>x.id==='high-elf:table:avelorn');assert.equal(tableResult(outer,90),'guard');assert.equal(tableResult(outer,91),'knight');assert.equal(tableResult(avelorn,17),'scholar');assert.equal(tableResult(avelorn,18),'artisan');
});
test('Ulthuan contextual Career adaptations preserve core, record Sailor decision, and permit printed Up in Arms Careers',()=>{
 const s=character('cavalryman');assert.deepEqual(M.options(R,M.career(R,s).levels[0].skills[8]),['Track','Ranged (Bow)']);assert.deepEqual(core.careers.find(c=>c.id==='cavalryman').levels[0].skills[8],'Ranged (Blackpowder or Bow)');
 s.career='soldier';assert.ok(!M.careerSkillSlots(R,s).flatMap(x=>x.options).includes('Ranged (Blackpowder)'));s.career='artisan';assert.ok(M.career(R,s).levels[1].talents.includes('Etiquette (Nobles)'));assert.ok(M.career(R,s).levels[2].skills.includes('Lore (Magic)'));
 s.career='sailor';s.highElf={careerVariant:'elven-ship'};const c=M.career(R,s);assert.ok(c.levels[0].skills.includes('Athletics'));assert.ok(!c.levels[0].skills.includes('Consume Alcohol'));assert.ok(!c.levels[0].skills.includes('Melee (Brawling)'));assert.ok(c.levels[1].skills.includes('Intuition'));assert.match(elfCareerPanel(R,s),/Intuition at L2/);
 const both=assembleBooks(library,['up-in-arms','high-elf']);for(const name of ['Archer','Artillerist','Light Cavalry','Camp Follower'])assert.ok(careerAvailable(both,s,both.careers.find(c=>c.name===name)));
 s.career='up-in-arms:career:artillerist';assert.ok(!M.careerSkillSlots(both,s).flatMap(x=>x.options).includes('Ranged (Blackpowder)'));
});
test('Sea Elf heritage is background, not a second regional allocation',()=>{
 const s=character('sailor','high-elf:origin:sea-elf');assert.match(E.highElfIssues(R,s).join(' '),/Sea Elf/);s.highElf={enclave:'Marienburg',heritage:'Caledor'};const before=JSON.stringify(M.freeSkills(R,s));s.highElf.heritage='Avelorn';assert.equal(JSON.stringify(M.freeSkills(R,s)),before);assert.deepEqual(E.highElfIssues(R,s),[]);
 s.highElf.careerVariant='elven-ship';assert.ok(M.career(R,s).levels[1].skills.includes('Intuition'));assert.ok(!M.career(R,s).levels[0].skills.includes('Consume Alcohol'));
});
test('Elder points aggregate individually, obey per-era caps and do not earn tracker boxes or free equipment',()=>{
 const s=character('soldier');E.selectElfEra(R,s,'incursion');s.highElf.elderAge=250;const before=gearSlots(R,s).length;
 for(const era of ['steel','incursion'])past(s,era);
 assert.deepEqual(E.highElfIssues(R,s),[]);const d=M.derive(R,s);assert.equal(d.earnedBoxes,0);assert.equal(gearSlots(R,s).length,before);assert.equal(E.elderCorruption(R,s),5);assert.equal(d.fortune,core.species['High Elf'].fortune-1);
 assert.ok(Object.values(E.elderSkills(R,s)).some(n=>n===2));assert.ok(!M.validation(R,s).some(x=>/creation limit/.test(x)));
 const h=s.highElf.history[0];h.points['0']=6;assert.match(E.highElfIssues(R,s).join(' '),/at most 5/);h.points={'0':1,'1':4,'2':5};assert.deepEqual(E.highElfIssues(R,s),[]);assert.equal(Math.round((E.elderSkills(R,s)[E.elderSkillSlots(R,s,h)[0].name]%1)*5),1);
 assert.match(elfSkillsPanel(R,s),/Individual points/);
});
test('Elder random Careers use their exact recorded table face once and grant 15 instead of 10 points',()=>{
 const s=character();E.selectElfEra(R,s,'steel');s.highElf.elderAge=160;let calls=0;
 const h=E.rollElderCareer(R,s,'steel',()=>{calls++;return 60;});assert.equal(calls,1);assert.equal(h.career,tableResult(randomTable(R,s,'career'),60));assert.equal(h.mode,'rolled');
 assert.throws(()=>E.rollElderCareer(R,s,'steel',()=>10),/already recorded/);past(s,'steel','rolled',h.career);assert.deepEqual(E.highElfIssues(R,s),[]);E.validateElfState(R,s);
 h.roll.face=101;assert.throws(()=>E.validateElfState(R,s),/Invalid High Elf/);
});
test('Elder age dice retain out-of-band printed outcomes; oldest resources obey Blood priority',()=>{
 const s=character();E.selectElfEra(R,s,'steel');s.highElf.elderAge=129;s.highElf.ageRolled=true;assert.ok(!E.highElfIssues(R,s).some(x=>/age in your/.test(x)));s.highElf.ageRolled=false;assert.match(E.highElfIssues(R,s).join(' '),/age in your/);
 E.selectElfEra(R,s,'shadows');s.highElf.elderAge=900;s.highElf.ancestry='chosen';s.highElf.prodigy='magic';s.highElf.psychology=1;s.speciesMode='first';s.careerMode='first';s.charMode='first';assert.deepEqual(E.startingElfResources(R,s,8,9),{fate:1,fortune:0});
 assert.ok(E.highElfReferences(R,s).some(x=>/Only the oldest era/.test(x.text)));
});
test('Blood roll records noble 5% or other 1% and six psychologies use core permanent adjustments',()=>{
 const s=character();const r=E.rollBlood(R,s,()=>2);assert.deepEqual(r,{face:2,chance:1,success:false});assert.throws(()=>E.rollBlood(R,s,()=>1),/already/);
 const noble=character('noble');assert.equal(E.rollBlood(R,noble,()=>5).success,true);assert.equal(noble.highElf.bloodRoll.chance,5);
 for(const row of R.highElfCreation.psychologies){const p=character();p.highElf={ancestry:'chosen',prodigy:'magic',psychology:row.min};for(const [k,n]of Object.entries(row.adjustments))assert.equal(M.initial(R,p)[k],M.initial(R,{...p,highElf:undefined})[k]+n);assert.equal(M.derive(R,p).fate,core.species['High Elf'].fate+1);assert.ok(M.derive(R,p).talents.includes('Blood of Aenarion'));}
});
test('ancestry discounts spells, qualified rituals and only otherwise legal named Talents; undo restores totals',()=>{
 const both=assembleBooks(library,['high-elf','winds-of-magic']),s=character('high-elf:career:mage',undefined,both);s.highElf={ancestry:'chosen',prodigy:'magic',psychology:1};grant(s,'Arcane Magic (Fire)');
 const ritual=both.spells.find(x=>x.ritual?.lores.includes('*')),q=quoteRitual(both,s,ritual.name);assert.equal(q.cost,ritual.ritual.learningXP/2);assert.match(q.discount,/interpretation/);M.purchaseSpell(both,s,ritual.name,q.talent);assert.equal(M.derive(both,s).spent,q.cost);s.ledger.pop();assert.equal(M.derive(both,s).spent,0);
 s.highElf.prodigy='martial';s.career='soldier';const allowed=M.quote(both,s,'talent','Warrior Born');assert.equal(allowed.cost,50);assert.equal(allowed.error,'');const denied=M.quote(both,s,'talent','Sharp');assert.equal(denied.cost,50);assert.match(denied.error,/Not available/);
});
test('Mage training counts 10 individual Channelling points and four different qualifying spells, other Elves keep eight',()=>{
 const s=character('high-elf:career:mage');grant(s,'Arcane Magic (Fire)');s.ledger.push({type:'promotion',cost:0,tick:false});
 s.spells=M.spellGrants(R,s).flatMap(g=>g.choices.filter(x=>x.category===g.category).slice(0,g.count).map(x=>x.name));
 for(const x of R.spells.filter(x=>x.category==='Fire').slice(1,4))spell(s,x.name,'Arcane Magic (Fire)');s.ledger.push({type:'skill',name:'Channelling (Aqshy)',amount:1,cost:0,tick:false});
 assert.match(E.mageNextLoreIssue(R,s,M.derive(R,s)),/10 Channelling/);
 while(Math.round((M.derive(R,s).skills['Channelling (Aqshy)']||0)*5)<10)s.ledger.push({type:'skill',name:'Channelling (Aqshy)',amount:1,cost:0,tick:false});
 assert.equal(E.mageNextLoreIssue(R,s,M.derive(R,s)),'');assert.equal(M.invalidTalent(R,s,'Arcane Magic (Heavens)'),'');
 const other={...s,career:'wizard'};assert.match(M.invalidTalent(R,other,'Arcane Magic (Heavens)'),/8 spells/);
 assert.equal(M.derive(R,s).currentSkills.filter(n=>n.startsWith('Channelling')).length,8);
 grant(s,'Arcane Magic (Heavens)');spell(s,'Bolt','Arcane Magic (Fire)');spell(s,'Bolt','Arcane Magic (Heavens)');assert.equal(E.mageLoreCount(R,s,'Heavens'),0);
});
test('Mage promotion requires four guide Petty spells and High Magic checks training and Qhaysh cap',()=>{
 const s=character('high-elf:career:mage');assert.match(M.quote(R,s,'promotion','').error,/four.*Petty/);grant(s,'Petty Magic');s.ledger.at(-1).freeSpells=4;s.spells=R.highElfCreation.pettySpells.slice(0,4);assert.ok(!M.quote(R,s,'promotion','').error.includes('Petty'));
 assert.match(M.invalidTalent(R,s,'Blessed by Isha'),/Student Mage/);assert.match(M.invalidTalent(R,s,'High Magic'),/Blessed by Isha/);
 assert.match(M.quote(R,s,'skill','Channelling (Qhaysh)',1).error,/cannot exceed/);
});
test('completed Mage training unlocks Blessed by Isha, capped Qhaysh and one High Magic purchase',()=>{
 const s=character('high-elf:career:mage');s.freeTalent='Petty Magic';
 // High-level test setup, not a rolled character or a claimed purchase history.
 s.ledger.push({type:'promotion',cost:0,tick:false},{type:'promotion',cost:0,tick:false},{type:'char',name:'WP',amount:5,cost:0,tick:false});
 while(M.derive(R,s).stats.WP<80)s.ledger.push({type:'char',name:'WP',amount:5,cost:0,tick:false});
 for(const [lore,wind]of Object.entries(E.WINDS)){grant(s,`Arcane Magic (${lore})`);s.ledger.push({type:'skill',name:`Channelling (${wind})`,amount:5,cost:0,tick:false},{type:'skill',name:`Channelling (${wind})`,amount:5,cost:0,tick:false});}
 s.spells=M.spellGrants(R,s).flatMap(g=>(g.category==='Petty'?R.highElfCreation.pettySpells.slice(0,g.count):g.choices.filter(x=>x.category===g.category).slice(0,g.count)).map(x=>typeof x==='string'?x:x.name));
 for(const lore of Object.keys(E.WINDS))for(const x of R.spells.filter(x=>x.category===lore).slice(1,4))spell(s,x.name,`Arcane Magic (${lore})`);
 assert.equal(M.invalidTalent(R,s,'Blessed by Isha'),'');grant(s,'Blessed by Isha');assert.equal(M.quote(R,s,'skill','Channelling (Qhaysh)').error,'');M.purchase(R,s,'skill','Channelling (Qhaysh)');assert.equal(M.invalidTalent(R,s,'High Magic'),'');M.purchase(R,s,'talent','High Magic');assert.match(M.invalidTalent(R,s,'High Magic'),/limit reached/);
 M.purchase(R,s,'skill','Channelling (Qhaysh)');assert.match(M.quote(R,s,'skill','Channelling (Qhaysh)',1).error,/cannot exceed/);
});
test('background suggestions retain all printed d10 outcomes and Yenlui age bands are references',()=>{
 for(const k of ['dreams','obsessions'])assert.deepEqual(R.highElfCreation[k].rows.map(x=>x.face),[1,2,3,4,5,6,7,8,9,10]);
 const s=character();s.highElf={yenlui:'Balanced',elderAge:900};assert.match(E.yenluiReference(s),/no modifiers/);s.highElf.yenlui='Dark';assert.match(E.yenluiReference(s),/−4 SL.*High Magic/);assert.match(E.yenluiReference(s),/−2 SL to Agility/);s.highElf.elderAge=350;assert.match(E.yenluiReference(s),/−2 SL to High Magic/);
});
test('saved technique and multi-Wind spell ledgers must agree with original eligibility and prices',()=>{
 const s=character('high-elf:career:swordmaster');grant(s,'Sword-dancing');M.purchase(R,s,'technique','Flight of the Phoenix');assert.deepEqual(E.elfLedgerIssues(R,s),[]);s.ledger.at(-1).cost=50;assert.match(E.elfLedgerIssues(R,s).join(' '),/price/);s.ledger.at(-1).cost=100;s.ledger[0].name='Disarm';assert.match(E.elfLedgerIssues(R,s).join(' '),/Requires Sword-dancing/);
});
test('Elven Arcane spells require both printed Lores, belong to latest Lore, and cannot be learned twice',()=>{
 const s=character('high-elf:career:mage'),x=R.spells.find(x=>x.category==='Elven Arcane');assert.match(M.quoteSpell(R,s,x.name).error,/Requires Arcane Magic/);for(const l of x.requiredLores)grant(s,`Arcane Magic (${l})`);
 const q=M.quoteSpell(R,s,x.name);assert.equal(q.error,'');assert.equal(q.talent,`Arcane Magic (${x.requiredLores.at(-1)})`);M.purchaseSpell(R,s,x.name);assert.match(M.quoteSpell(R,s,x.name).error,/Already known/);assert.equal(M.derive(R,s).ticks,0);
});
test('High Magic has no free grant and costs 200 XP per inclusive Intelligence Bonus band',()=>{
 const s=character('high-elf:career:mage');grant(s,'High Magic');assert.ok(!M.spellGrants(R,s).some(x=>x.category==='High Magic'));const list=R.spells.filter(x=>x.category==='High Magic'),ib=Math.floor(M.derive(R,s).stats.Int/10);
 for(let n=0;n<ib+2;n++){const q=M.quoteSpell(R,s,list[n].name);assert.equal(q.cost,n<=ib?200:400);assert.equal(q.tick,false);M.purchaseSpell(R,s,list[n].name);}
 assert.match(M.invalidTalent(R,s,'High Magic'),/Requires/);assert.equal(folioData(R,s).magic.length,ib+2);
});
test('Sword-dancing grants one technique and escalation without tracker boxes; Talent caps use printed Bonuses',()=>{
 const s=character('high-elf:career:swordmaster');s.freeTalent='Sword-dancing';assert.equal(E.knownTechniques(R,s).length,1);const names=R.techniques.filter(x=>x.name!=='Ritual of Cleansing').map(x=>x.name);
 M.purchase(R,s,'technique',names[0]);M.purchase(R,s,'technique',names[1]);assert.deepEqual(s.ledger.map(x=>x.cost),[100,200]);assert.equal(M.derive(R,s).ticks,0);assert.equal(folioData(R,s).magic.length,3);s.ledger.pop();assert.equal(M.derive(R,s).spent,100);assert.equal(E.knownTechniques(R,s).length,2);
 const m=character();const cap=Math.floor(M.derive(R,m).stats.WS/10);for(let n=0;n<cap;n++)grant(m,'Martial Arts');assert.match(M.invalidTalent(R,m,'Martial Arts'),/limit reached/);assert.match(elfMagicShop(R,s),/Sword-dancing techniques/);
});
test('new equipment preserves qualified prices, Unique exclusions, inherent qualities and unresolved protection',()=>{
 const s=character(),catalog=marketCatalog(R,s);assert.ok(catalog.find(x=>x.name==='Narinocha Wine, bottle'));assert.equal(catalog.find(x=>x.name==='Narinocha Wine, bottle').pennies,72);assert.ok(!catalog.some(x=>x.name==='Greatsword of Hoeth'||x.name==='Ithiltaen Helm'));
 const cloak=catalog.find(x=>x.name==='White Lion Cloak');assert.equal(cloak.pennies,4800);buyTrapping(R,s,cloak.id);const eq=equipment(R,s);assert.equal(eq.ap.Body,2);assert.equal(eq.penalties.stealth,0);assert.equal(purse(R,s).spent,4800);assert.match(eq.armour.find(x=>x.name==='White Lion Cloak').qualities,/Partial/);
 assert.ok(!R.armour.some(x=>x.name==='Ithiltaen Helm'));assert.match(R.gear.find(x=>x.name==='Ithiltaen Helm').text,/unresolved/);
});
test('saved High Elf rules reject unknown data and impossible roll history but preserve incomplete editable choices',()=>{
 const s=character();s.highElf={ancestry:'chosen',prodigy:'magic'};assert.doesNotThrow(()=>catalogForCharacter(library,s));s.highElf.foo=1;assert.throws(()=>catalogForCharacter(library,s),/Invalid High Elf/);delete s.highElf.foo;s.highElf.bloodRoll={face:50,chance:1,success:true};assert.throws(()=>catalogForCharacter(library,s),/Invalid High Elf/);
 assert.match(elfOriginPanel(R,{...character(),highElf:{ancestry:'chosen'}}),/Ritual memorisation/);
});
test('editable export records Elder Corruption, individual Skills, ancestry Fate and learned techniques',async()=>{
 globalThis.PDFLib=PDFLib;const s=character('high-elf:career:swordmaster');E.selectElfEra(R,s,'incursion');s.highElf.elderAge=250;for(const era of ['steel','incursion'])past(s,era);s.highElf.ancestry='chosen';s.highElf.prodigy='martial';s.highElf.psychology=1;for(const slot of M.careerSkillSlots(R,s,1).slice(0,8))M.purchase(R,s,'skill',slot.name);for(const k of M.KEYS.filter(k=>M.career(R,s).advanceScheme[k]===1).slice(0,2))M.purchase(R,s,'char',k);M.purchase(R,s,'promotion','');M.purchase(R,s,'talent','Sword-dancing');M.purchase(R,s,'technique','Flight of the Phoenix');assert.deepEqual(M.validation(R,s),[]);
 const bytes=await exportSheet(R,s,fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url),'utf8'))),doc=await PDFLib.PDFDocument.load(bytes),f=doc.getForm();
 assert.equal(f.getFields().length,556);assert.equal(f.getTextField('Fate').getText(),String(M.derive(R,s).fate));for(let n=1;n<=5;n++)assert.equal(f.getCheckBox(`Corruption_Point_${String(n).padStart(2,'0')}`).isChecked(),true);assert.equal(f.getCheckBox('Corruption_Point_06').isChecked(),false);assert.ok(doc.getPageCount()>2);
 fs.mkdirSync(new URL('../../tmp/pdfs/high-elf-review/output/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('../../tmp/pdfs/high-elf-review/output/elf-sheet.pdf',import.meta.url),bytes);fs.writeFileSync(new URL('../../tmp/pdfs/high-elf-review/output/elf-character.json',import.meta.url),JSON.stringify(s,null,2));
});
