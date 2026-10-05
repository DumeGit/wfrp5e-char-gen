import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import {library,R,soldier} from './fixture.mjs';
import {assembleBooks,loadBookLibrary,validateManifest,bookSelection,catalogForCharacter,randomTable,tableResult} from '../dist/books.mjs';
import {sourceLabel} from '../dist/sources.mjs';
import {bookPanel,bookSetup} from '../dist/book-ui.mjs';
import * as M from '../dist/rules.mjs';
import {marketCatalog,buyTrapping,purse} from '../dist/market.mjs';
import {equipment,gearOptions} from '../dist/equipment.mjs';
import {exportSheet} from '../dist/export.mjs';

// Synthetic options exercise integration only; none are published game content.
const raw=library.packs[0].data;
function pack(id='fixture',kind='supplement',data={}){
 return {manifest:{schemaVersion:1,id,title:`Test book ${id}`,shortTitle:'Test',edition:4,version:'1.0.0',kind,dependsOn:['core'],source:{file:'test-only.pdf',sha256:'0'.repeat(64)},compatibility:{reviewed:true,notes:['Synthetic fixture; not actual game material.']},files:{}},data};
}
const withPack=p=>({...library,packs:[...library.packs,p]});
function additions(){
 const c=structuredClone(raw.careers.find(c=>c.id==='soldier'));c.id='fixture:soldier';c.name='Fixture Soldier';c.page=12;c.levels[0].talents.push('Fixture Talent');
 const talent={id:'fixture:talent',name:'Fixture Talent',page:14,text:raw.talents.find(x=>x.name==='Warrior Born').text};
 const spell={...structuredClone(raw.spells.find(x=>x.category==='Petty')),id:'fixture:spell',name:'Fixture Spell',page:15};
 return pack('fixture','supplement',{careers:[c],talents:[talent],spells:[spell],market:[{id:'fixture:blade',name:'Fixture Blade',page:16,price:'1d',enc:1,availability:'Common',category:'Weapons'}],weapons:[{...structuredClone(raw.weapons.find(x=>x.name==='Sword')),id:'fixture:weapon',name:'Fixture Blade',page:16}],rules:[{id:'fixture:effect',path:['talentEffects','Fixture Talent'],operation:'add',value:'WS',page:14,reason:'Tests the existing permanent +5 Characteristic handler.'},{id:'fixture:limit',path:['talentLimits','Fixture Talent'],operation:'add',value:2,page:14,reason:'Tests the existing repeat-limit handler.'}]});
}

test('core pack reproduces all original catalogs and sources without mutating extracted data',()=>{
 const snapshot=JSON.stringify(library),core=assembleBooks(library);
 assert.equal(core.careers.length,64);assert.equal(core.spells.length,225);assert.equal(marketCatalog(core).length,253);
 assert.deepEqual(core.careers.map(x=>x.id),raw.careers.map(x=>x.id));
 assert.equal(sourceLabel(core,core.careers.find(x=>x.id==='soldier')),'Core · p. 96');
 assert.ok(core.talents.every(x=>x.contentId.startsWith('core:')&&x.source.book==='core'));
 assert.equal(JSON.stringify(library),snapshot);
});
test('disabled supplement contributes no options; selection resolves additions, effects, gear, XP and undo',()=>{
 const p=additions(),lib=withPack(p),off=assembleBooks(lib),on=assembleBooks(lib,['fixture']);
 assert.equal(off.careers.length,64);assert.equal(on.careers.length,65);assert.ok(!off.talents.some(x=>x.name==='Fixture Talent'));
 const s=soldier();s.career='fixture:soldier';s.freeTalent='Fixture Talent';
 assert.deepEqual(M.validation(on,s),[]);assert.equal(M.derive(on,s).stats.WS,41);
 assert.equal(M.quote(on,s,'talent','Fixture Talent').cost,100);
 M.purchase(on,s,'talent','Fixture Talent');assert.equal(M.derive(on,s).stats.WS,46);assert.equal(M.derive(on,s).spent,100);assert.equal(s.ledger[0].definition.book,'fixture');assert.equal(s.ledger[0].source.book,'core');
 assert.match(M.quote(on,s,'talent','Fixture Talent').error,/repeatable/);s.ledger.pop();assert.equal(M.derive(on,s).spent,0);
 assert.ok(gearOptions('Melee Weapon (Any One)',on).includes('Fixture Blade'));buyTrapping(on,s,'fixture:blade');assert.equal(purse(on,s).spent,1);
 const weapon=equipment(on,s).weapons.find(x=>x.name==='Fixture Blade');assert.ok(weapon);assert.equal(weapon.source.book,'fixture');assert.equal(weapon.damage,7);
 s.freeTalent='Petty Magic';assert.ok(M.spellGrants(on,s)[0].choices.some(x=>x.name==='Fixture Spell'));
});
test('new Species and its background can be selected without inventing a Career roll table',()=>{
 const p=additions();p.data.species={'Fixture Species':{...structuredClone(raw.species.Human),id:'fixture:species',page:8}};p.data.background={'Fixture Species':{...structuredClone(raw.background.Human),id:'fixture:background',page:9}};p.data.careers[0].species.push('Fixture Species');
 const on=assembleBooks(withPack(p),['fixture']),s=soldier();s.species='Fixture Species';s.career='fixture:soldier';
 assert.deepEqual(M.validation(on,s),[]);assert.equal(randomTable(on,s,'career'),null);assert.equal(on.background[s.species].source.book,'fixture');
});
test('additional printed roll table never changes core probabilities until explicitly chosen',()=>{
 const p=additions();p.data.tables=[{id:'fixture:career',name:'Fixture Career table',kind:'career',species:'Human',page:12,sides:100,rows:[{min:1,max:100,result:'fixture:soldier'}]}];
 const on=assembleBooks(withPack(p),['fixture']),s=soldier(),before=randomTable(R,s,'career');
 const after=randomTable(on,s,'career');assert.deepEqual(after,before);for(let n=1;n<=100;n++)assert.equal(tableResult(after,n),tableResult(before,n));
 s.rollTables={career:'fixture:career'};assert.equal(tableResult(randomTable(on,s,'career'),100),'fixture:soldier');
 assert.throws(()=>randomTable(R,s,'career'),/unavailable/);
});
test('a sole Career table defaults for a new Species, while multiple tables require a choice',()=>{
 const p=additions();p.data.species={'Fixture Species':{...structuredClone(raw.species.Human),id:'fixture:species',page:8}};p.data.background={'Fixture Species':{...structuredClone(raw.background.Human),id:'fixture:background',page:9}};p.data.careers[0].species.push('Fixture Species');
 const table={id:'fixture:career',name:'Fixture Career table',kind:'career',species:'Fixture Species',page:12,sides:100,rows:[{min:1,max:100,result:'fixture:soldier'}]};p.data.tables=[table];
 const s={...soldier(),species:'Fixture Species'},single=assembleBooks(withPack(p),['fixture']);
 assert.equal(randomTable(single,s,'career').id,table.id);assert.equal(tableResult(randomTable(single,s,'career'),100),'fixture:soldier');
 p.data.tables.push({...table,id:'fixture:alternate-career',name:'Alternate Fixture Career table'});
 const multiple=assembleBooks(withPack(p),['fixture']);assert.equal(randomTable(multiple,s,'career'),null);
 s.rollTables={career:'fixture:alternate-career'};assert.equal(randomTable(multiple,s,'career').id,'fixture:alternate-career');
 s.rollTables={career:'missing'};assert.throws(()=>randomTable(multiple,s,'career'),/unavailable/);
});
test('same-name content and IDs are rejected, including Talent aliases and shop collisions',()=>{
 const p=additions();p.data.talents[0].name='Strong Back';assert.throws(()=>assembleBooks(withPack(p),['fixture']),/duplicate option/);
 p.data.talents[0].name='Strong Back (Other)';assert.throws(()=>assembleBooks(withPack(p),['fixture']),/duplicate option/);
 const q=additions();q.data.market[0].name='Candle (dozen)';assert.throws(()=>assembleBooks(withPack(q),['fixture']),/duplicate shop option/);
 q.data.market[0].name='Fixture Blade';q.data.weapons[0].id=q.data.market[0].id;assert.throws(()=>assembleBooks(withPack(q),['fixture']),/duplicate content ID/);
});
test('variants replace only explicit targets with reasons; core remains unchanged when disabled',()=>{
 const target=R.talents.find(x=>x.name==='Strong Back'),p=pack('variant','variant',{talents:[{id:'variant:strong-back',name:'Strong Back',page:18,text:target.text,replaces:target.contentId,reason:'Synthetic replacement test.'}],rules:[{id:'variant:limit',path:['talentLimits','Strong Back'],operation:'replace',value:3,page:18,reason:'Synthetic repeat-limit override test.'}]});
 const lib=withPack(p),on=assembleBooks(lib,['variant']);assert.equal(on.talents.length,R.talents.length);assert.equal(M.talentInfo(on,'Strong Back').source.book,'variant');assert.equal(on.config.talentLimits['Strong Back'],3);assert.equal(assembleBooks(lib).config.talentLimits['Strong Back'],2);
 const snapshot=structuredClone(p);p.manifest.kind='supplement';assert.throws(()=>assembleBooks(lib,['variant']),/replacement/);
 p.manifest=snapshot.manifest;delete p.data.talents[0].reason;assert.throws(()=>assembleBooks(lib,['variant']),/replacement/);
});
test('Career variants retain explicit identity for printed random-table references',()=>{
 const c=structuredClone(raw.careers.find(c=>c.id==='soldier')),p=pack('variant','variant');
 p.data.careers=[{...c,id:'variant:soldier',runtimeId:'soldier',page:20,replaces:'core:careers:soldier',reason:'Synthetic Career variant.'}];
 const on=assembleBooks(withPack(p),['variant']);assert.equal(on.careers.find(x=>x.id==='soldier').source.book,'variant');assert.equal(on.careers.length,64);
 delete p.data.careers[0].runtimeId;assert.throws(()=>assembleBooks(withPack(p),['variant']),/Career ID/);
});
test('dependencies are included in order and missing or cyclic dependencies fail clearly',()=>{
 const a=additions(),b=pack('dependent');b.manifest.dependsOn=['fixture'];const lib={...library,packs:[...library.packs,a,b]};
 assert.deepEqual(assembleBooks(lib,['dependent']).selection.map(x=>x.id),['core','fixture','dependent']);
 b.manifest.dependsOn=['missing'];assert.throws(()=>assembleBooks(lib,['dependent']),/unknown book/);
 b.manifest.dependsOn=['fixture'];a.manifest.dependsOn=['dependent'];assert.throws(()=>assembleBooks(lib,['dependent']),/cycle/);
});
test('saved current characters restore exact book versions and fail for missing or changed books',()=>{
 const lib=withPack(additions()),on=assembleBooks(lib,['fixture']),s={...soldier(),version:2,books:bookSelection(on)};
 assert.deepEqual(catalogForCharacter(lib,JSON.parse(JSON.stringify(s))).selection,on.selection);
 assert.throws(()=>catalogForCharacter(library,s),/missing or different/);
 s.books.packs[1].version='9.0.0';assert.throws(()=>catalogForCharacter(lib,s),/different book version/);
 assert.throws(()=>catalogForCharacter(lib,soldier()),/current book selection/);
});
test('Fourth Edition manifests need an explicit conversion review and source hash',()=>{
 const p=pack();validateManifest(p.manifest);p.manifest.compatibility.reviewed=false;assert.throws(()=>validateManifest(p.manifest),/conversion review/);
 p.manifest.compatibility.reviewed=true;p.manifest.source.sha256='';assert.throws(()=>validateManifest(p.manifest),/SHA-256/);
 p.manifest.source.sha256='0'.repeat(64);p.manifest.files.config='config.json';assert.throws(()=>validateManifest(p.manifest),/configuration/);
});
test('malformed or unsupported mechanics, missing references and ambiguous random rows fail validation',()=>{
 for(const mutate of [p=>delete p.data.talents[0].page,p=>p.data.talents[0].customMechanic='unsupported',p=>p.data.careers[0].levels[0].skills.push('Unknown Skill'),p=>p.data.careers[0].levels[0].talents.push('Unknown Talent'),p=>p.data.weapons[0].kind='unknown',p=>p.data.rules[0].path=['talentOptions','Bless'],p=>p.data.rules[0].path=['unknownRule'],p=>p.data.rules[0].path=['talentEffects','__proto__'],p=>p.data.rules[0].value='Unknown Characteristic']){
  const p=additions();mutate(p);assert.throws(()=>assembleBooks(withPack(p),['fixture']),/Book pack:/);
 }
 const p=additions();p.data.tables=[{id:'fixture:bad-table',name:'Bad table',kind:'species',page:4,sides:100,rows:[{min:1,max:100,result:'Human'},{min:90,max:100,result:'Dwarf'}]}];assert.throws(()=>assembleBooks(withPack(p),['fixture']),/overlapping/);
 p.data.tables[0].rows=[{min:1,max:99,result:'Human'}];assert.throws(()=>assembleBooks(withPack(p),['fixture']),/missing/);
});
test('appended gods and lores feed Talent choices through configuration',()=>{
 const p=pack('fixture','supplement',{rules:[{id:'fixture:god',path:['gods'],operation:'append',value:['Fixture Patron'],page:10,reason:'Synthetic option test.'},{id:'fixture:blessings',path:['blessings','Fixture Patron'],operation:'add',value:['Battle'],page:10,reason:'Synthetic option test.'},{id:'fixture:lore',path:['colours'],operation:'append',value:['Fixture Lore'],page:11,reason:'Synthetic option test.'}]});
 p.data.spells=[{...structuredClone(raw.spells.find(x=>x.category==='Sigmar')),id:'fixture:miracle',name:'Fixture Miracle',category:'Fixture Patron',page:10},{...structuredClone(raw.spells.find(x=>x.category==='Fire')),id:'fixture:lore-spell',name:'Fixture Lore Spell',category:'Fixture Lore',page:11}];
 const on=assembleBooks(withPack(p),['fixture']);assert.ok(M.options(on,'Bless (Any One)','talent').includes('Bless (Fixture Patron)'));assert.ok(M.options(on,'Arcane Magic (Any One)','talent').includes('Arcane Magic (Fixture Lore)'));
 const s=soldier();s.freeTalent='Bless (Fixture Patron)';assert.equal(M.knownSpells(on,s)[0].name,'Blessing of Battle');
});
test('loader rejects duplicate registry entries and paths outside published book data',async()=>{
 const url=new URL('https://example.test/data/books/index.json'),index={schemaVersion:1,core:'core',packs:[{id:'core',path:'core/manifest.json'},{id:'core',path:'core/manifest.json'}]};
 const original=library.packs[0],read=async u=>u.href===url.href?index:u.pathname.endsWith('manifest.json')?{...original.manifest,files:{}}:{};
 await assert.rejects(loadBookLibrary(read,url),/duplicate/);
 index.packs=[{id:'core',path:'https://other.test/manifest.json'}];await assert.rejects(loadBookLibrary(read,url),/inside the books/);
 index.packs=[{id:'core',path:'core/manifest.json'}];const bad={...original.manifest,files:{species:'../../../../secret.json'}};await assert.rejects(loadBookLibrary(async u=>u.href===url.href?index:bad,url),/inside the data/);
});
test('book selector lists real registered books, mandatory core and opt-in variants',()=>{
 const p=additions(),lib=withPack(p),s=soldier(),html=bookSetup(lib,R,s);
 assert.match(html,/data-book="core" checked disabled/);assert.match(html,/data-book="fixture"\s*>/);assert.match(html,/Changing books starts a new character/);
 assert.ok(bookSetup(library,R,s).includes('data-action="apply-books"'));assert.doesNotMatch(bookPanel(library,R,s),/data-book=/);
 assert.match(bookSetup({...library,packs:library.packs.filter(p=>p.manifest.kind==='core')},R,s),/Required core rules/);
});
test('a supplement character fills the editable PDF with book-specific references',async()=>{
 globalThis.PDFLib=PDFLib;const on=assembleBooks(withPack(additions()),['fixture']),s=soldier();s.career='fixture:soldier';s.freeTalent='Fixture Talent';s.books=bookSelection(on);buyTrapping(on,s,'fixture:blade');
 const bytes=await exportSheet(on,s,fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url))));
 const doc=await PDFLib.PDFDocument.load(bytes),form=doc.getForm();assert.equal(form.getFields().length,556);assert.equal(form.getTextField('Career_1_pg').getText(),'12');assert.equal(form.getTextField('Talent_06_pg').getText(),'14');assert.match(form.getTextField('Notes').getText(),/Books: Core; Test/);assert.match(form.getTextField('Notes').getText(),/Career: Test/);
});
