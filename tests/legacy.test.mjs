import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import {library,R as core,soldier} from './fixture.mjs';
import {assembleBooks,bookSelection,catalogForCharacter} from '../dist/books.mjs';
import * as M from '../dist/rules.mjs';
import {isLegacy,legacyName,legacyTag,legacySources} from '../dist/legacy.mjs';
import {legacyOption,legacyContext,legacyMagic} from '../dist/legacy-character.mjs';
import {sourceLabel} from '../dist/sources.mjs';
import {folioData} from '../dist/folio.mjs';
import {bookPanel} from '../dist/book-ui.mjs';
import {elfOriginPanel,elfCareerPanel} from '../dist/high-elf-ui.mjs';
import {dwarfOriginPanel} from '../dist/dwarf-guide-ui.mjs';
import {exportSheet} from '../dist/export.mjs';
const all=assembleBooks(library,library.packs.map(p=>p.manifest.id));

test('all imported Fourth Edition records are Legacy, including High Elf content; enabled books do not relabel core definitions',()=>{
 const snapshot=JSON.stringify(all);
 for(const kind of ['species','background','careers','origins','talents','skills','spells','weapons','armour','gear','market','tables','astrology','cants','cults','careerUpdates','runes','techniques','rules']){
  for(const entry of Array.isArray(all[kind])?all[kind]:Object.values(all[kind]).filter(x=>x.source)){
   const legacy=entry.source.book!=='core';assert.equal(isLegacy(all,entry),legacy,`${kind}: ${entry.name||entry.id}`);
   assert.equal(sourceLabel(all,entry).includes('Legacy'),legacy);
  }
 }
 assert.ok(all.techniques.every(x=>isLegacy(all,x)));
 assert.ok(all.spells.filter(x=>x.source.book==='high-elf').every(x=>legacyName(all,x).endsWith(' · Legacy')));
 assert.equal(sourceLabel(all,M.talentInfo(all,'Hardy')),'Core · p. 120');
 assert.equal(isLegacy(all,{conversion:'An unrelated core correction',source:{book:'core',page:364}}),false);
 assert.equal(JSON.stringify(all),snapshot);
});

test('Legacy acquisition context follows core Skills and Talents while ordinary core creation remains untagged',()=>{
 const B=assembleBooks(library,['up-in-arms']);const s=soldier();s.origin='up-in-arms:origin:tilean';
 // Use the actual available regional ID rather than assuming a displayed name.
 s.origin=B.origins.find(x=>x.species==='Human').id;
 const slot=M.speciesSkillSlots(B,s)[0];s.speciesSkills=[slot.key];
 assert.equal(isLegacy(B,legacyOption(B,s,'skill',slot.name)),true);
 assert.equal(isLegacy(B,M.skillInfo(B,slot.name)),false);
 const sp=M.freeTalents(B,s).find(x=>x!==s.freeTalent);
 assert.equal(isLegacy(B,legacyOption(B,s,'talent',sp)),true);
 const ordinary=soldier();assert.equal(isLegacy(all,legacyOption(all,ordinary,'talent','Warrior Born')),false);
 assert.ok(Object.values(folioData(core,ordinary)).flat().every(x=>!x.legacy));
 const refined={...soldier(),careerRefinement:{base:'soldier',career:'soldier',source:{book:'up-in-arms',page:9}}};
 assert.equal(isLegacy(B,legacyContext(B,refined)),true);
});

test('core Career changes, Elder resources, High Magic and Longbeard show Legacy without changing effective rules',()=>{
 const B=assembleBooks(library,['high-elf','dwarf-guide']);const s=soldier();Object.assign(s,{species:'High Elf',origin:'high-elf:origin:eataine',career:'sailor',highElf:{careerVariant:'elven-ship'}});
 const c=M.career(B,s);assert.equal(c.source.book,'core');assert.ok(isLegacy(B,c));
 assert.ok(legacySources(B,c).some(x=>x.book==='high-elf'&&x.page===63));
 assert.match(elfCareerPanel(B,s),/Elven ship · Legacy/);
 assert.match(elfOriginPanel(B,s),/Elder creation[^<]*.*legacy-tag/s);
 assert.ok(isLegacy(B,M.talentInfo(B,'High Magic')));
 const dwarf={...soldier(),species:'Dwarf',longbeard:true,longbeardAge:130};
 assert.match(dwarfOriginPanel(B,dwarf),/Longbeard.*legacy-tag/s);
 assert.ok(isLegacy(B,legacyContext(B,dwarf)));
 assert.equal(M.career(B,s).levels[0].skills.includes('Consume Alcohol'),false);
});

test('definition, patron, Career eligibility and discount provenance retain a Legacy tag on core-priced XP entries and after undo',()=>{
 const B=assembleBooks(library,['up-in-arms','blood-bramble','rough-nights']);const s=soldier();s.xp=30000;s.career=B.careers.find(x=>x.source.book==='up-in-arms'&&x.species.includes('Human')).id;
 const skill=M.careerSkillSlots(B,s,1)[0].name,q=M.quote(B,s,'skill',skill);
 assert.equal(q.source.book,'core');assert.equal(isLegacy(B,q),true);
 assert.ok(sourceLabel(B,q).includes('Core'));
 assert.ok(sourceLabel(B,q).includes('Legacy'));
 const original=JSON.stringify(s);M.purchase(B,s,'skill',skill);assert.ok(isLegacy(B,s.ledger.at(-1)));s.ledger.pop();assert.equal(JSON.stringify(s),original);
 const prayer=B.spells.find(x=>x.name==='Trickster’s Glamour');
 assert.ok(isLegacy(B,{...prayer,grantSource:B.cults.find(x=>x.name==='Evawn').source}));
 assert.ok(isLegacy(all,{source:{book:'core',page:191},discount:'Blood of Aenarion · Martial Prodigy; High Elf Guide p. 51'}));
});

test('folio labels imported spells, runes, techniques and gear without changing names, totals or saves',()=>{
 const B=assembleBooks(library,['blood-bramble']);const s=soldier();s.career='hedge-witch';s.ledger.push({type:'talent',name:'Arcane Magic (Hedgecraft)',cost:100,tick:true});s.spells=['Badwill'];s.books=bookSelection(B);s.version=2;
 const snapshot=JSON.stringify(s),d=M.derive(B,s),f=folioData(B,s);
 assert.deepEqual(f.magic.find(x=>x.name==='Badwill'),{name:'Badwill',legacy:true});
 assert.equal(M.derive(B,s).spent,d.spent);assert.equal(JSON.stringify(s),snapshot);
 assert.deepEqual(catalogForCharacter(library,JSON.parse(snapshot)).selection,B.selection);
 const html=bookPanel(library,B,s);assert.match(html,/High Elf Player’s Guide.*legacy-tag/s);assert.match(html,/Fourth Edition material adapted/);
 const tagged=legacyTag(B,{source:{book:'blood-bramble',page:10},conversion:'<unsafe> "quoted"'});assert.ok(!tagged.includes('<unsafe>'));assert.match(tagged,/&lt;unsafe&gt;/);
});

test('editable PDF and companion record identify Legacy choices and preserve canonical values and source references',async()=>{
 globalThis.PDFLib=PDFLib;globalThis.fetch=async url=>({json:async()=>JSON.parse(fs.readFileSync(new URL(url,new URL('../dist/',import.meta.url)),'utf8')),arrayBuffer:async()=>fs.readFileSync(new URL(url,new URL('../dist/',import.meta.url)))});
 const B=assembleBooks(library,['blood-bramble']);const s=soldier();s.career='hedge-witch';s.ledger.push({type:'talent',name:'Arcane Magic (Hedgecraft)',cost:100,tick:true});s.spells=['Badwill'];s.books=bookSelection(B);s.version=2;
 const before=JSON.stringify(s),output=await exportSheet(B,s),pdf=await PDFLib.PDFDocument.load(output),form=pdf.getForm();
 assert.equal(form.getFields().length,556);assert.equal(form.getTextField('Spell_1_Name').getText(),'[Legacy] Badwill');
 assert.equal(form.getTextField('XP_Spent').getText(),'100');assert.equal(form.getTextField('Species').getText(),'Human');assert.equal(JSON.stringify(s),before);
 if(process.env.WFRP_LEGACY_QA){fs.mkdirSync('../tmp/pdfs/legacy-review',{recursive:true});fs.writeFileSync('../tmp/pdfs/legacy-review/legacy-sheet.pdf',output);fs.writeFileSync('../tmp/pdfs/legacy-review/legacy-character.json',JSON.stringify(s));}
});
