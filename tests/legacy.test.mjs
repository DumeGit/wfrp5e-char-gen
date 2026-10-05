import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import {library,R as core,soldier} from './fixture.mjs';
import {assembleBooks,bookSelection,catalogForCharacter} from '../dist/books.mjs';
import * as M from '../dist/rules.mjs';
import {isLegacy,legacyTag,legacySources,legacyMechanic} from '../dist/legacy.mjs';
import {legacyOption,legacyContext,legacyMagic,legacyGear} from '../dist/legacy-character.mjs';
import {sourceLabel} from '../dist/sources.mjs';
import {folioData} from '../dist/folio.mjs';
import {bookPanel} from '../dist/book-ui.mjs';
import {elfOriginPanel,elfCareerPanel} from '../dist/high-elf-ui.mjs';
import {dwarfOriginPanel} from '../dist/dwarf-guide-ui.mjs';
import {exportSheet} from '../dist/export.mjs';
const all=assembleBooks(library,library.packs.map(p=>p.manifest.id));
const record=(kind,book,name)=>all[kind].find(x=>x.source.book===book&&x.name===name);

test('every book distinguishes actual conversions from compatible printed additions',()=>{
 const pairs=[
  ['up-in-arms','spells','In Good Order','spells','Command the Legion'],
  ['archives-i','talents','Youngblood','weapons','Bearded Axe'],
  ['archives-ii','spells','Bullgorger','careers','Maneater'],
  ['archives-iii','spells','Shake On It','cants',all.cants[0].name],
  ['winds-of-magic','skills','Psychometry','skills','Augury'],
  ['rough-nights','talents','Suffuse with Ulgu','cults','Ringil'],
  ['dwarf-guide','talents','Entrenchment','talents','Forgefire'],
  ['high-elf','talents','High Magic','talents','Martial Arts'],
  ['blood-bramble','spells','Fetterfetch','spells','Badwill']
 ];
 for(const [book,changedKind,changedName,compatibleKind,compatibleName]of pairs){
  // Archives I-only weapons are deliberately withdrawn when the Guide is enabled.
  const B=assembleBooks(library,[book]);
  const a=B[changedKind].find(x=>x.name===changedName),b=B[compatibleKind].find(x=>x.name===compatibleName);
  assert.ok(a,changedName);assert.ok(b,compatibleName);assert.ok(isLegacy(B,a),changedName);assert.equal(isLegacy(B,b),false,compatibleName);
 }
 assert.equal(isLegacy(all,{source:{book:'high-elf',page:83},conversion:'Reviewed Fifth Edition adaptation'}),false);
 assert.equal(isLegacy(all,{source:{book:'core',page:364},adaptation:'Core optional rule'}),false);
 assert.ok(all.background&&Object.values(all.background).filter(x=>x.source).every(x=>!isLegacy(all,x)));
 assert.ok(all.cants.every(x=>!isLegacy(all,x)));
 assert.ok(all.armour.every(x=>!isLegacy(all,x)));
});

test('regional allocation tags do not contaminate unchanged core Talents, native languages or Career Skills',()=>{
 const B=assembleBooks(library,['up-in-arms']);const s=soldier();s.origin=B.origins.find(x=>x.species==='Human').id;
 const slot=M.speciesSkillSlots(B,s)[0];s.speciesSkills=[slot.key];
 assert.ok(isLegacy(B,legacyOption(B,s,'skill',slot.name)));assert.equal(isLegacy(B,M.skillInfo(B,slot.name)),false);
 const talent=M.freeTalents(B,s).find(x=>x!==s.freeTalent);
 assert.equal(isLegacy(B,legacyOption(B,s,'talent',talent)),false);
 assert.equal(isLegacy(B,legacyOption(B,s,'skill','Language (Reikspiel)')),false);
 const ordinary=soldier();assert.ok(Object.values(folioData(core,ordinary)).flat().every(x=>!x.legacy));
 const refined={...soldier(),careerRefinement:{base:'soldier',career:'soldier',source:{book:'up-in-arms',page:9}}};
 assert.equal(isLegacy(B,legacyContext(B,refined)),false);
 s.origin='';s.career=B.careers.find(x=>x.name==='Greatsword').id;
 const skill=M.careerSkillSlots(B,s,1)[0].name,q=M.quote(B,s,'skill',skill);
 assert.equal(isLegacy(B,q),false);assert.equal(isLegacy(B,legacyOption(B,s,'skill',skill)),false);
 assert.equal(isLegacy(B,legacyGear(B,s,{key:'career-1'},'Hand Weapon')),false);
});

test('specific High Elf and Dwarf adaptations remain visible while compatible background and Talents are clear',()=>{
 const B=assembleBooks(library,['high-elf','dwarf-guide']);const s=soldier();Object.assign(s,{species:'High Elf',origin:'high-elf:origin:eataine',career:'sailor',highElf:{careerVariant:'elven-ship'}});
 const c=M.career(B,s);assert.equal(c.source.book,'core');assert.ok(isLegacy(B,c));
 assert.ok(legacySources(B,c).some(x=>x.page===63));assert.match(elfCareerPanel(B,s),/Elven ship · Legacy/);
 assert.match(elfOriginPanel(B,s),/Elder creation[^<]*.*legacy-tag/s);
 const spirituality=elfOriginPanel(B,s).split('data-group="elf-spirituality"')[1];assert.ok(!spirituality.includes('legacy-tag'));
 assert.ok(isLegacy(B,M.talentInfo(B,'High Magic')));assert.equal(isLegacy(B,M.talentInfo(B,'Sword-dancing')),false);
 const dwarf={...soldier(),species:'Dwarf',longbeard:true,longbeardAge:130};
 assert.match(dwarfOriginPanel(B,dwarf),/Longbeard.*legacy-tag/s);assert.ok(isLegacy(B,legacyContext(B,dwarf)));
 assert.equal(M.career(B,s).levels[0].skills.includes('Consume Alcohol'),false);
 s.career='high-elf:career:sea-guard';s.highElf={};assert.ok(isLegacy(B,legacyOption(B,s,'skill','Animal Care')));assert.equal(isLegacy(B,legacyOption(B,s,'skill','Dodge')),false);assert.equal(isLegacy(B,legacyOption(B,s,'talent','Drilled')),false);assert.equal(isLegacy(B,legacyGear(B,s,{key:'career-0'},'Elf Bow')),false);
});

test('XP records and patron grants tag the actual changed effect, not an entire Career or cult',()=>{
 const B=assembleBooks(library,['blood-bramble','rough-nights']);const s=soldier();s.career='hedge-witch';s.xp=30000;s.ledger.push({type:'talent',name:'Arcane Magic (Hedgecraft)',cost:100,tick:true});
 const before=JSON.stringify(s);M.purchaseSpell(B,s,'Fetterfetch','Arcane Magic (Hedgecraft)');assert.ok(isLegacy(B,s.ledger.at(-1)));s.ledger.pop();assert.equal(JSON.stringify(s),before);
 const evawn=B.cults.find(x=>x.name==='Evawn');
 assert.ok(isLegacy(B,{...B.spells.find(x=>x.name==='Trickster’s Glamour'),grantSource:evawn.source}));
 assert.equal(isLegacy(B,{...B.spells.find(x=>x.name==='An Invitation'),grantSource:evawn.source}),false);
 assert.equal(isLegacy(B,legacyMagic(B,s,{...B.spells.find(x=>x.name==='An Invitation'),lore:'Evawn'})),false);
 assert.ok(isLegacy(all,{source:{book:'core',page:191},discount:'Blood of Aenarion · Martial Prodigy; High Elf Guide p. 51'}));
 assert.equal(isLegacy(all,{type:'skill',name:'Cool',source:{book:'core',page:191},eligibility:{book:'high-elf',page:70}}),false);
});

test('mixed folio lists, source labels, save/load and book choices retain selective provenance',()=>{
 const B=assembleBooks(library,['blood-bramble']);const s=soldier();s.career='hedge-witch';s.ledger.push({type:'talent',name:'Arcane Magic (Hedgecraft)',cost:100,tick:true});s.spells=['Badwill'];M.purchaseSpell(B,s,'Fetterfetch','Arcane Magic (Hedgecraft)');s.books=bookSelection(B);s.version=2;
 const snapshot=JSON.stringify(s),f=folioData(B,s);
 assert.deepEqual(f.magic.find(x=>x.name==='Badwill'),{name:'Badwill'});assert.equal(f.magic.find(x=>x.name==='Fetterfetch').legacy,true);assert.match(f.magic.find(x=>x.name==='Fetterfetch').legacyTitle,/Difficulty/);
 assert.equal(JSON.stringify(s),snapshot);assert.deepEqual(catalogForCharacter(library,JSON.parse(snapshot)).selection,B.selection);
 const html=bookPanel(library,B,s);assert.ok(!html.match(/<strong>[^<]*legacy-tag/));assert.ok(!html.match(/High Elf Player’s Guide <span class="legacy-tag"/));
 assert.equal(sourceLabel(B,B.spells.find(x=>x.name==='Badwill')).includes('Legacy'),false);
 const tagged=legacyTag(B,{source:{book:'blood-bramble',page:10},adaptation:'<unsafe> "quoted"'});assert.ok(!tagged.includes('<unsafe>'));assert.match(tagged,/&lt;unsafe&gt;/);
 assert.match(legacyTag(all,legacyMechanic('longbeard')),/zero-Fate/);
});

test('invalid explicit adaptation metadata is rejected rather than silently classifying a source',()=>{
 const copy=structuredClone(library),p=copy.packs.find(x=>x.manifest.id==='blood-bramble');p.data.spells[0].adaptation='';
 assert.throws(()=>assembleBooks(copy,['blood-bramble']),/adaptation must explain/);
});

test('editable PDF preserves mixed changed/unchanged spells, core values and all 556 fields',async()=>{
 globalThis.PDFLib=PDFLib;globalThis.fetch=async url=>({json:async()=>JSON.parse(fs.readFileSync(new URL(url,new URL('../dist/',import.meta.url)),'utf8')),arrayBuffer:async()=>fs.readFileSync(new URL(url,new URL('../dist/',import.meta.url)))});
 const B=assembleBooks(library,['blood-bramble']);const s=soldier();s.career='hedge-witch';s.ledger.push({type:'talent',name:'Arcane Magic (Hedgecraft)',cost:100,tick:true});s.spells=['Badwill'];M.purchaseSpell(B,s,'Fetterfetch','Arcane Magic (Hedgecraft)');s.books=bookSelection(B);s.version=2;
 const before=JSON.stringify(s),output=await exportSheet(B,s),pdf=await PDFLib.PDFDocument.load(output),form=pdf.getForm();
 assert.equal(form.getFields().length,556);assert.equal(form.getTextField('Spell_1_Name').getText(),'Badwill');assert.equal(form.getTextField('Spell_2_Name').getText(),'[Legacy] Fetterfetch');
 assert.equal(form.getTextField('XP_Spent').getText(),'200');assert.equal(form.getTextField('Species').getText(),'Human');assert.equal(JSON.stringify(s),before);
 if(process.env.WFRP_LEGACY_QA){fs.mkdirSync('../tmp/pdfs/legacy-review',{recursive:true});fs.writeFileSync('../tmp/pdfs/legacy-review/selective-sheet.pdf',output);fs.writeFileSync('../tmp/pdfs/legacy-review/selective-character.json',JSON.stringify(s));}
});
