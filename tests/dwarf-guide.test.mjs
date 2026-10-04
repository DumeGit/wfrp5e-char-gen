import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import * as M from '../dist/rules.mjs';
import {library,R} from './fixture.mjs';
import {assembleBooks,bookSelection,randomTable,tableResult,catalogForCharacter,validateCatalog,loadBookLibrary} from '../dist/books.mjs';
import {creationSpecies,careerAvailable} from '../dist/origins.mjs';
import {dwarfNameRoll,defaultCareerResult,knownRunes,dwarfIssues,dwarfReferences,dwarfSkillRaw,dwarfGearSlots} from '../dist/dwarf-guide.mjs';
import {gearSlots,gearOptions,inventoryEntries,equipment} from '../dist/equipment.mjs';
import {marketCatalog,buyTrapping} from '../dist/market.mjs';
import {exportSheet} from '../dist/export.mjs';

const B=assembleBooks(library,['dwarf-guide']);
export function dwarf(career='soldier',catalog=B,origin){
 const s=M.fresh();Object.assign(s,{version:2,books:bookSelection(catalog),name:'Dwarf verification',species:'Dwarf',career,xp:30000,wealth:{amount:100,currency:'gold crowns'},...(origin?{origin}:{})});
 s.speciesSkills=M.speciesSkillSlots(catalog,s).filter(x=>!x.name.startsWith('Language (')).slice(0,5).map(x=>x.key);
 for(let i=0;i<creationSpecies(catalog,s).talents.length;i++)s.talentChoices[`species-${i}`]=M.speciesTalentOptions(catalog,s,i).find(x=>x!=='Ancestral Grudge')||M.speciesTalentOptions(catalog,s,i)[0];
 for(const slot of M.careerSkillSlots(catalog,s,1).slice(0,8))s.careerSkills[slot.key]=1;
 s.freeTalent=M.careerTalentOptions(catalog,s).find(t=>!M.freeTalents(catalog,{...s,freeTalent:''}).includes(t)&&!M.invalidTalent(catalog,{...s,freeTalent:''},t));
 s.grudgeTargets=M.derive(catalog,s).talents.filter(x=>x==='Ancestral Grudge').map((_,i)=>['Orcs','Skaven','Goblins'][i]);
 return s;
}
test('Dwarf Guide is opt-in, composes in either order with every existing book combination, and leaves core profiles intact',()=>{
 assert.equal(R.runes.length,0);assert.equal(B.runes.length,71);assert.equal(B.careerUpdates.length,15);
 const ids=['up-in-arms','archives-i','archives-ii','archives-iii','archives-iii-hedge','winds-of-magic','rough-nights'];
 for(let mask=0;mask<128;mask++){
  const selected=ids.filter((_,i)=>mask&(1<<i)),a=assembleBooks(library,[...selected,'dwarf-guide']),b=assembleBooks(library,['dwarf-guide',...selected]);
  for(const key of ['careers','weapons','market','talents','origins'])assert.deepEqual(a[key].map(x=>x.contentId).sort(),b[key].map(x=>x.contentId).sort());
  for(const key of ['species','weapons','armour'])for(const x of key==='species'?Object.values(R[key]):R[key])assert.deepEqual(key==='species'?a[key][x.name]:a[key].find(y=>y.contentId===x.contentId),x);
 }
});
test('All eleven regional tables cover each face, become automatic for their origin, and use Fifth Edition allocations',()=>{
 for(const o of B.origins.filter(x=>x.source.book==='dwarf-guide')){
  const s=dwarf('soldier',B,o.id),sp=creationSpecies(B,s),table=randomTable(B,s,'career');
  assert.equal(sp.skills.length,12,o.name);assert.equal(sp.talents.length,5);assert.deepEqual(sp.languages,['Khazalid','Reikspiel']);assert.equal(sp.randomTalents,0);assert.equal(table.origin,o.id);assert.deepEqual(M.validation(B,s),[],o.name);
  for(let n=1;n<=100;n++)assert.ok(careerAvailable(B,s,B.careers.find(c=>c.id===tableResult(table,n))),`${o.name}: ${n}`);
  s.rollTables={career:B.tables.find(x=>x.species==='Dwarf'&&x.source.book==='core').id};assert.equal(randomTable(B,s,'career').source.book,'core');
 }
});
test('Ten Career profiles retain the printed Characteristic schemes and permit complete creation',()=>{
 const expected={brewer:['T','I','Dex','Fel','Int','WP'],'doom-priest':['WS','T','WP','Dex','S','Fel'],'forge-priest':['T','Dex','WP','S','Int','WS'],'hearth-priest':['Dex','Int','WP','T','Fel','I'],hammerer:['WS','S','WP','I','T','Ag'],ironbreaker:['WS','T','WP','S','BS','I'],'karak-ranger':['T','I','Ag','BS','WS','Int'],runescribe:['T','Dex','Int','WP','I','Fel'],runesmith:['Dex','Int','WP','WS','T','S'],thane:['WS','WP','Fel','T','S','Int']};
 for(const [name,chars] of Object.entries(expected)){const c=B.careers.find(c=>c.id===`dwarf-guide:career:${name}`);chars.forEach((k,i)=>assert.equal(c.advanceScheme[k],i<3?1:i-1,name));assert.deepEqual(M.validation(B,dwarf(c.id)),[],name);}
 const both=assembleBooks(library,['archives-i','dwarf-guide']),profile=both.careers.find(c=>c.id==='dwarf-guide:career:karak-ranger');assert.equal(defaultCareerResult(both,profile.id),profile.alternativeFor);assert.equal(defaultCareerResult(B,profile.id),profile.id);assert.equal(M.career(both,dwarf(profile.id,both)).source.book,'dwarf-guide');
});
test('Weighted d1000 names and corrected birthplace boundaries are preserved, including parent-name surnames',()=>{
 const s=dwarf();for(let n=1;n<=1000;n++)assert.ok(dwarfNameRoll(B,s,'forenames',()=>n));
 assert.equal(dwarfNameRoll(B,s,'forenames',()=>738),'Morgrim');assert.equal(dwarfNameRoll(B,s,'forenames',()=>745),'Morgrim');assert.equal(dwarfNameRoll(B,s,'forenames',()=>746),'Mundri');
 s.dwarfNameStyle='Female';s.dwarfParentStyle='Male';assert.equal(dwarfNameRoll(B,s,'surnames',()=>738),'Morgrimsdottir');s.dwarfParentStyle='Female';assert.equal(dwarfNameRoll(B,s,'surnames',()=>738),'Nandasdottir');
 const rows=B.dwarfCreation.birthplaces.rows,at=n=>rows.find(r=>n>=r.min&&n<=r.max).result;assert.match(at(12),/Nuln/);assert.match(at(13),/Middenheim/);assert.match(at(25),/Karak Kadrin/);assert.match(at(26),/Karaz/);
});
test('Longbeard reduces independent Fate/Fortune, retains random bonuses, requires age 120 and does not grant social Status',()=>{
 const s=dwarf();s.longbeard=true;s.longbeardAge=120;const before=M.derive(B,{...s,longbeard:false}),after=M.derive(B,s);assert.equal(after.fate,before.fate-1);assert.equal(after.fortune,before.fortune-1);assert.equal(after.status,before.status);assert.deepEqual(dwarfIssues(B,s,after),[]);
 s.speciesMode=s.careerMode=s.charMode='first';s.charRolls=Array(10).fill(10);assert.equal(M.derive(B,s).fate,2);assert.equal(M.derive(B,s).fortune,2);
 s.longbeardAge=119;assert.throws(()=>catalogForCharacter(library,s),/at least 120/);assert.ok(dwarfReferences(B,s).some(x=>x.text.includes('0-Fate')));
});
test('Optional Career levels consistently change Skills, Characteristics and gear; Axefighter stays unavailable',()=>{
 const s=dwarf('engineer');s.dwarfCareerUpdates={3:'dwarf-guide:update:sky-pilot'};const c=M.career(B,s);assert.equal(c.levels[2].name,'Sky Pilot');assert.equal(c.advanceScheme.Ag,3);assert.ok(M.careerSkillSlots(B,s).some(x=>x.name==='Sail (Skycraft)'&&x.source.book==='dwarf-guide'));
 s.bonusGear=[0];s.dwarfCareerUpdates={2:'dwarf-guide:update:guild-engineer'};assert.equal(M.career(B,s).levels[1].name,'Guild Engineer');assert.ok(gearSlots(B,s).some(x=>x.name==='Trade Tools (Engineer)'));
 const invalid=dwarf();invalid.dwarfCareerUpdates={2:'dwarf-guide:update:axefighter'};assert.throws(()=>catalogForCharacter(library,invalid),/available Dwarf Career/);assert.equal(M.career(B,invalid).levels[1].name,'Soldier');assert.match(M.invalidTalent(B,s,'Crew Commander'),/unavailable/);
});
test('Optional equipment swaps preserve originals and Class gear, replace bow ammunition, and expose matching weapon Skills',()=>{
 const s=dwarf('hunter');s.dwarfTrappingSwaps=true;
 assert.deepEqual(M.options(B,dwarfSkillRaw(B,s,'Ranged (Bow)')),['Ranged (Bow)','Ranged (Crossbow)','Ranged (Blackpowder)']);
 assert.deepEqual(M.options(B,dwarfSkillRaw(B,s,'Melee (Fencing)')),['Melee (Fencing)','Melee (Basic)','Ranged (Blackpowder)']);
 const slots=[{key:'class-0',name:'Hand Weapon'},{key:'career-0',name:'Bow'},{key:'career-1',name:'10 Arrows'},{key:'career-2',name:'Hand Weapon'},{key:'career-3',name:'Riding Horse'}],out=dwarfGearSlots(B,s,slots);
 assert.equal(out[0].name,'Hand Weapon');assert.ok(gearOptions(out[3].name,B).includes('Dwarf Warhammer'));assert.ok(gearOptions(out[4].name,B).includes('Full Plate Armour and Helm'));
 s.gearChoices['career-0']='Dwarf Crossbow (2H) and Ammunition';assert.equal(dwarfGearSlots(B,s,slots).some(x=>x.name==='10 Arrows'),false);
 s.career='soldier';s.gearChoices={'career-2':'Dwarf Axe'};assert.ok(inventoryEntries(B,s).some(x=>x.weapon?.name==='Dwarf Axe'));assert.equal(dwarfGearSlots(B,{...s,dwarfTrappingSwaps:false},slots),slots);
 const bad={...s,species:'Human'};assert.throws(()=>catalogForCharacter(library,bad),/equipment swaps require Dwarf/);
});
test('Rune forms, duplicates and combined printed purchase limits include free grants; Master knowledge grants exactly three Doom Runes',()=>{
 const s=dwarf('dwarf-guide:career:runesmith');s.freeTalent='Rune Magic (Armour: Rune of Stone)';
 assert.deepEqual(M.options(B,'Rune Magic (Rune of Stone)','talent'),[s.freeTalent]);assert.match(M.invalidTalent(B,s,s.freeTalent),/already learned/);
 const options=M.options(B,'Rune Magic (All Forms)','talent'),cap=Math.floor(M.derive(B,s).stats.Int/10)+Math.floor(M.derive(B,s).stats.WP/10);
 for(const name of options.filter(x=>x!==s.freeTalent).slice(0,cap-1))s.ledger.push({type:'talent',name,cost:100});assert.match(M.invalidTalent(B,s,options.find(x=>!M.derive(B,s).talents.includes(x))),/purchase limit reached/);
 s.ledger.pop();assert.equal(M.invalidTalent(B,s,options.find(x=>!M.derive(B,s).talents.includes(x))),'');
 s.ledger=[{type:'talent',name:M.options(B,'Master Rune Magic (Weapon Runes)','talent')[0],cost:100}];const runes=knownRunes(B,s,M.derive(B,s).talents);assert.equal(runes.filter(x=>x.form==='Doom').length,3);assert.equal(M.derive(B,s).spent,100);assert.ok(!gearSlots(B,s).some(x=>x.name==='Anvil of Doom'));
 assert.equal(M.options(B,'Rune Magic (Protection Runes)','talent').length,11);assert.equal(M.options(B,'Master Rune Magic (Engineering Runes)','talent').length,4);
});
test('Ancestral Grudge choices are distinct, repeat purchases cost 100 XP, and campaign rewards are never credited',()=>{
 const s=dwarf('dwarf-guide:career:doom-priest');s.freeTalent='Ancestral Grudge';s.grudgeTargets=['Orcs'];M.purchase(B,s,'talent','Ancestral Grudge');s.grudgeTargets.push('Skaven');assert.equal(M.derive(B,s).spent,100);assert.deepEqual(dwarfIssues(B,s,M.derive(B,s)),[]);s.grudgeTargets[1]='orcs';assert.match(dwarfIssues(B,s,M.derive(B,s))[0],/different culture/);
});
test('Dwarf-specific Skills keep their separate profiles and Species restrictions',()=>{
 const s=dwarf('dwarf-guide:career:runesmith');assert.equal(M.skillInfo(B,'Runesmithing').char,'Dex');assert.equal(M.skillInfo(B,'Sail (Skycraft)').char,'Ag');assert.notEqual(M.skillInfo(B,'Sail (Skycraft)').id,M.skillInfo(B,'Sail').id);assert.equal(M.quote(B,s,'skill','Runesmithing').inCareer,true);assert.match(M.quote(B,{...s,species:'Human'},'skill','Lore (Runes)').error,/requires a Dwarf/);assert.equal(M.options(B,'Lore (Any)').includes('Lore (Runes)'),true);
});
test('Guide weapon precedence removes only the approved Archives I profiles and shop rows; heirlooms are not retail purchases',()=>{
 const old=['Bearded Axe','Dwarf Hammer',"Slayer's Axe (2H)"],prior=assembleBooks(library,['archives-i']),both=assembleBooks(library,['archives-i','dwarf-guide']);
 for(const name of old){assert.ok(prior.weapons.some(x=>x.name===name));assert.equal(both.weapons.some(x=>x.name===name),false);assert.equal(marketCatalog(both).some(x=>x.name===name),false);}
 assert.equal(both.contentDecisions.filter(x=>x.source.book==='dwarf-guide'&&x.source.page===92).length,16);assert.equal(B.weapons.find(x=>x.name==='Dwarf Handgun (2H)').damage,'10');assert.equal(marketCatalog(B).find(x=>x.name==='Dwarf Axe').pennies,240);
 for(const name of ['Gromril Breastplate','Oathstone','Anvil of Doom'])assert.equal(marketCatalog(B).some(x=>x.name===name),false);
 const s=dwarf('slayer'),shield=marketCatalog(B,s).find(x=>x.name==='Shield');assert.throws(()=>buyTrapping(B,s,shield.id),/Slayers cannot/);
 s.career='dwarf-guide:career:hammerer';s.ledger.push({type:'trapping',name:'Gromril Open Helm',cost:0,level:1});assert.ok(equipment(B,s).notes.some(x=>x.includes('−10% Perception')));
});
test('Book validation rejects malformed names, dynamic limits, alternate Careers and withdrawal references',async()=>{
 let bad=structuredClone(B);bad.dwarfCreation.names.rows[0].max=1001;assert.throws(()=>validateCatalog(bad),/invalid Dwarf names/);
 bad=structuredClone(B);bad.talents.find(t=>t.name==='Rune Magic').limit=['not-a-characteristic'];assert.throws(()=>validateCatalog(bad),/dynamic purchase limit/);
 bad=structuredClone(B);bad.careers.find(c=>c.name==='Karak Ranger').alternativeFor='soldier';assert.throws(()=>validateCatalog(bad),/alternate profile/);
 await assert.rejects(()=>loadBookLibrary(url=>{const x=JSON.parse(fs.readFileSync(url,'utf8'));if(url.pathname.endsWith('/dwarf-guide/withdrawals.json'))x[0].target='missing';return x;}),/withdrawal needs/);
});
test('Editable PDF and creation record include rune knowledge, grudges, Longbeard warning, XP and all sheet fields',async()=>{
 const s=dwarf('dwarf-guide:career:runesmith');s.freeTalent='Rune Magic (Armour: Rune of Stone)';s.longbeard=true;s.longbeardAge=130;
 while(M.derive(B,s).level<4){const d=M.derive(B,s);if(d.ticks>=[10,12,14][d.level-1]){M.purchase(B,s,'promotion','');continue;}const choices=d.currentSkills.map(name=>M.quote(B,s,'skill',name)).filter(q=>!q.error).sort((a,b)=>a.cost-b.cost);assert.ok(choices.length);M.purchase(B,s,'skill',choices[0].name);}
 M.purchase(B,s,'talent','Ancestral Grudge');M.purchase(B,s,'talent','Master Rune Magic (Weapon: Master Rune of Alaric the Mad)');s.grudgeTargets=['Orcs'];assert.deepEqual(M.validation(B,s),[]);
 for(const slot of gearSlots(B,s))for(const m of slot.name.matchAll(/\{?(\d+)d10\}?/g))s.gearRolls[`${slot.key}:${m[0]}`]=5*Number(m[1]);
 globalThis.PDFLib=PDFLib;const bytes=await exportSheet(B,s,fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url)))),doc=await PDFLib.PDFDocument.load(bytes),form=doc.getForm();
 assert.equal(form.getFields().length,556);assert.equal(form.getTextField('Species').getText(),'Dwarf');assert.equal(form.getTextField('XP_Spent').getText(),String(M.derive(B,s).spent));assert.match(form.getTextField('Spell_1_Name').getText(),/Rune/);assert.match(form.getTextField('Notes').getText(),/Longbeard adaptation/);assert.ok(doc.getPageCount()>4);
 if(process.env.WFRP_DWARF_QA==='1'){const dir=new URL('../../tmp/pdfs/dwarf-guide-review/',import.meta.url);fs.writeFileSync(new URL('dwarf-runesmith.pdf',dir),bytes);fs.writeFileSync(new URL('dwarf-runesmith.json',dir),JSON.stringify(s));}
});
