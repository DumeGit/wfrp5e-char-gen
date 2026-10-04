import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../dist/rules.mjs';
import {library,R,soldier} from './fixture.mjs';
import {assembleBooks,randomTable,tableResult} from '../dist/books.mjs';
import {careerAvailable,creationBackground} from '../dist/origins.mjs';
import {equipment,gearOptions} from '../dist/equipment.mjs';
import {marketCatalog,buyTrapping,purse} from '../dist/market.mjs';
import {chartXP,chartGrants,starEffect,rollStar,rollWitchling,chartRecord} from '../dist/astrology.mjs';
import {folioData} from '../dist/folio.mjs';
import {bookPanel} from '../dist/book-ui.mjs';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import {exportSheet} from '../dist/export.mjs';
import {bookSelection,catalogForCharacter} from '../dist/books.mjs';
import {speciesMagicReferences} from '../dist/species-mechanics.mjs';
import {speciesRulePanel} from '../dist/archives-ui.mjs';
const B=assembleBooks(library,['archives-ii']);
export function ogre(career='archives-ii:career:maneater'){
 const s=M.fresh();Object.assign(s,{name:'Arabba Goldtooth',species:'Ogre',career,freeTalent:career.endsWith('maneater')?'Sturdy':career.endsWith('rhinox-herder')?'Marksman':'Petty Magic',speciesSkills:['s-0','s-1','s-2','s-3','s-4'],careerSkills:Object.fromEntries(Array.from({length:8},(_,i)=>[`c1-${i}`,1])),wealth:{amount:100,currency:'silver shillings'}});
 return s;
}
function sign(s,n){const row=B.astrology.find(x=>n>=x.min&&n<=x.max);s.chart={enabled:true,sign:row.id,rolledSign:row.id,witchling:0,talent:'',ascendant:'',mansions:[]};return row;}

test('Archives II remains opt-in and every book combination preserves core content',()=>{
 assert.equal(R.careers.length,64);assert.equal(R.astrology.length,0);assert.ok(!R.species.Ogre);
 for(const ids of [['archives-ii'],['up-in-arms','archives-ii'],['archives-i','archives-ii'],['up-in-arms','archives-i','archives-ii']]){
  const catalog=assembleBooks(library,ids);assert.equal(catalog.astrology.length,20);assert.equal(catalog.spells.filter(x=>x.source.book==='archives-ii').length,7);
  assert.equal(marketCatalog(catalog).find(x=>x.name==='Shield').enc,marketCatalog(R).find(x=>x.name==='Shield').enc);
 }
 assert.equal(assembleBooks(library,['up-in-arms','archives-i','archives-ii']).careers.length,86);
});
test('Ogre creation retains five Skills, five Species Talents, native Reikspiel and core limits',()=>{
 for(const c of B.careers.filter(x=>x.source.book==='archives-ii')){const s=ogre(c.id);assert.deepEqual(M.validation(B,s),[]);assert.equal(M.freeTalents(B,s).length,6);assert.ok(!M.freeTalents(B,s).includes('Large'));assert.equal(M.freeSkills(B,s)['Language (Reikspiel)'],6);assert.ok(!M.freeSkills(B,s)['Language (Grumbarth)']);assert.equal(c.levels[0].skills.length,10);}
 const s=ogre();assert.deepEqual(M.validation(B,s),[]);
 s.speciesSkills.push('s-5');assert.match(M.validation(B,s).join('\n'),/five different/);
 assert.equal(M.derive(B,ogre()).fate,1);assert.equal(M.derive(B,ogre()).fortune,2);
 Object.assign(s,{speciesMode:'first',careerMode:'first',charMode:'first'});assert.equal(M.derive(B,s).fate,2);assert.equal(M.derive(B,s).fortune,3);
});
test('Ogre GM rule remains informational without an acknowledgement gate',()=>{
 const s=ogre(),text=B.species.Ogre.mechanics.gmApproval,html=speciesRulePanel(B,s);
 assert.ok(html.includes(text));assert.doesNotMatch(html,/checkbox|data-bind|reviewed these choices/);
 assert.deepEqual(M.validation(B,s),[]);assert.ok(M.derive(B,s).warnings.includes(text));
 M.purchase(B,s,'char','WS');assert.equal(M.derive(B,s).spent,125);
 assert.equal(speciesRulePanel(R,M.fresh()),'');
});
test('all 100 Ogre Career faces are defined and legal, including approved 05–06 correction',()=>{
 const s=ogre();
 const table=B.tables.find(x=>x.id==='archives-ii:table:ogre-careers');
 assert.equal(randomTable(B,s,'career'),table);
 for(let face=1;face<=100;face++)assert.ok(careerAvailable(B,s,B.careers.find(x=>x.id===tableResult(table,face))));
 assert.equal(tableResult(table,5),'rat-catcher');assert.equal(tableResult(table,6),'rat-catcher');assert.equal(tableResult(table,40),'sailor');
 s.rollTables={career:table.id};assert.equal(randomTable(B,s,'career'),table);
 assert.doesNotMatch(bookPanel(library,B,ogre()),/Choose a printed table to enable rolls/);
 assert.equal(randomTable(B,M.fresh(),'species').id,'archives-ii:table:species');
 const scheme=B.careers.find(x=>x.name==='Ogre Butcher').advanceScheme;assert.equal(scheme.Dex,2);assert.equal(scheme.Int,null);
});
test('Archives II Species table defaults only when enabled and preserves explicit choices',()=>{
 const expected=face=>face<=89?'Human':face<=93?'Halfling':face<=97?'Dwarf':face===98?'Ogre':face===99?'High Elf':'Wood Elf';
 for(const ids of [['archives-ii'],['up-in-arms','archives-ii'],['archives-i','archives-ii'],['up-in-arms','archives-i','archives-ii']]){
  const catalog=assembleBooks(library,ids),s=M.fresh(),table=randomTable(catalog,s,'species');
  assert.equal(table.id,'archives-ii:table:species');
  for(let face=1;face<=100;face++)assert.equal(tableResult(table,face),expected(face),`Species ${face}`);
  assert.match(bookPanel(library,catalog,s),/<option value="archives-ii:table:species" selected>/);
  const core=randomTable(R,s,'species');s.rollTables={species:core.id};assert.equal(randomTable(catalog,s,'species').id,core.id);
  assert.equal(randomTable(catalogForCharacter(library,{...s,version:2,books:bookSelection(catalog)}),s,'species').id,core.id);
 }
 for(const ids of [[],['up-in-arms'],['archives-i'],['up-in-arms','archives-i']])assert.equal(randomTable(assembleBooks(library,ids),M.fresh(),'species').id,randomTable(R,M.fresh(),'species').id);
});
test('Imperial and traditional Ogre names retain their distinct sources and appearance dice',()=>{
 const s=ogre();let b=creationBackground(B,s);assert.deepEqual(b.forenames,R.background.Human.forenames);assert.deepEqual(b.surnames,R.background.Human.surnames);assert.equal(b.source.book,'core');
 s.nameStyle='traditional';b=creationBackground(B,s);assert.equal(b.source.book,'archives-ii');assert.equal(b.nameElements.length,2);assert.equal(b.namePages.surnames,23);assert.ok(b.surnames.includes('Goldtooth'));
 assert.deepEqual(b.rollTables.eyes.dice,[2,10]);assert.deepEqual(B.species.Ogre.age,[15,5]);assert.deepEqual(B.species.Ogre.height,[91,1]);assert.equal(B.species.Ogre.appearancePage,21);
});
test('Ogre shop prices, inventory weights and refund agree without double-sizing native profiles',()=>{
 const s=ogre();const normal=marketCatalog(B),sized=marketCatalog(B,s),dagger=sized.find(x=>x.name==='Dagger');
 assert.equal(dagger.pennies,normal.find(x=>x.name==='Dagger').pennies*2);assert.equal(dagger.enc,normal.find(x=>x.name==='Dagger').enc*2);
 const native=sized.find(x=>x.name==='Ogre Pistol');assert.equal(native.pennies,9*240);assert.equal(native.enc,3);
 const backpack=sized.find(x=>x.name==='Backpack');assert.equal(backpack.enc,normal.find(x=>x.name==='Backpack').enc*2);
 const food=sized.find(x=>x.category==='Food and drink');assert.equal(food.pennies,normal.find(x=>x.id===food.id).pennies);
 const unknown=sized.find(x=>x.name==='Book, Magic');assert.ok(unknown.sizeUnresolved);assert.throws(()=>buyTrapping(B,s,unknown.id),/GM review/);
 const before=purse(B,s).remaining;buyTrapping(B,s,dagger.id);assert.equal(purse(B,s).remaining,before-dagger.pennies);assert.equal(equipment(B,s).entries.find(x=>x.origin==='Bought with starting wealth').enc,dagger.enc);s.purchases.pop();assert.equal(purse(B,s).remaining,before);
});
test('Ironfist supplies its printed Shield AP while its weight is counted only once',()=>{
 const s=ogre();buyTrapping(B,s,'archives-ii:item:ironfist');const eq=equipment(B,s),entry=eq.entries.find(x=>x.name==='Ironfist');
 assert.equal(eq.ap.Shield,1);assert.equal(entry.enc,2);assert.equal(eq.armour.find(x=>x.name==='Ironfist').carriedEnc,0);assert.equal(eq.weapons.find(x=>x.name==='Ironfist').enc,2);
 assert.ok(gearOptions('Hand Weapon (Cleaver or Mallet)',B).includes('Hand Weapon (Mallet)'));
 assert.deepEqual(gearOptions('Harpoon or Great Throwing Spear',B),['Harpoon','Great Throwing Spear']);
 assert.ok(gearOptions('Two-handed Weapon or Ogre Pistol',B).includes('Big Ogre Club (2H)'));
 assert.ok(!gearOptions('Two-handed Weapon or Ogre Pistol',B).includes('Two-handed Weapon'));
});
test('Ogre casting uses Toughness and Great Maw grants only compatible spells',()=>{
 const s=ogre('archives-ii:career:ogre-butcher');assert.equal(M.skillInfo(B,'Language (Magick)',s).char,'T');assert.equal(folioData(B,s).skills.find(x=>x.name==='Language (Magick)').value,55);
 assert.equal(equipment(B,s).weapons.find(x=>x.label==='Hand Weapon (Cleaver)').enc,2);
 assert.match(M.invalidTalent(B,s,'Arcane Magic (Fire)'),/only/);assert.match(M.invalidTalent(B,soldier(),'Arcane Magic (The Great Maw)'),/Ogre/);
 assert.equal(M.invalidTalent(B,s,'Arcane Magic (The Great Maw)'),'');
 s.ledger.push({type:'talent',name:'Arcane Magic (The Great Maw)',cost:100});const g=M.spellGrants(B,s).find(x=>x.category==='The Great Maw');assert.equal(g.choices.filter(x=>x.source.book==='archives-ii').length,7);assert.ok(g.choices.some(x=>x.category==='Arcane'));
 assert.match(B.spells.find(x=>x.name==='Bullgorger').text,/Difficult \(−1 SL\)/);assert.match(B.spells.find(x=>x.name==='Feast of the Fallen').text,/Difficult \(−1 SL\)/);assert.match(B.spells.find(x=>x.name==='Trollguts').text,/Regeneration/);
});
test('astrology adjusts initial Characteristics without advances and awards XP exactly once',()=>{
 const s=soldier(),before=M.initial(B,s);const row=rollStar(B,s,()=>1);assert.equal(row.name,'Wymund the Anchorite');
 assert.equal(M.initial(B,s).Fel,before.Fel+2);assert.equal(M.initial(B,s).I,before.I+2);assert.equal(M.initial(B,s).Int,before.Int-3);assert.equal(s.points.reduce((a,b)=>a+b,0),100);
 assert.equal(chartXP(B,s),25);assert.equal(M.derive(B,s).remaining,1025);assert.throws(()=>rollStar(B,s,()=>6),/already recorded/);
 s.chart.sign=B.astrology[1].id;assert.equal(chartXP(B,s),0);s.chart.sign=row.id;assert.equal(chartXP(B,s),25);
 s.chart.ascendant=B.astrology[2].id;s.chart.mansions=B.astrology.slice(4,9).map(x=>x.id);assert.equal(chartXP(B,s),25);
 const points=s.points.slice();M.purchase(B,s,'char','S');assert.deepEqual(s.points,points);assert.equal(M.derive(B,s).spent,125);assert.equal(M.derive(B,s).remaining,900);s.ledger.pop();assert.equal(M.derive(B,s).remaining,1025);
 assert.ok(chartRecord(B,s).some(x=>x.includes('background only')));
});
test('all Witchling outcomes use the approved detailed table and cannot be rerolled',()=>{
 const groups=[['Sixth Sense',0],['Second Sight',-3],['Petty Magic',-3],['Witch!',-5]];
 for(let n=1;n<=10;n++){const s=soldier();sign(s,100);rollWitchling(B,s,()=>n);const [talent,penalty]=groups[n<=3?0:n<=6?1:n<=9?2:3];assert.equal(starEffect(B,s).talent,talent);assert.equal(M.initial(B,s).S,M.initial(R,s).S+penalty);assert.throws(()=>rollWitchling(B,s,()=>1),/cannot be rolled/);}
});
test('star-sign grants respect duplicate limits, repeat limits and incompatible magic',()=>{
 const s=soldier();s.randomTalents=['Sixth Sense','Super Numerate','Cardsharp','Attractive'];sign(s,66);assert.equal(M.freeTalents(B,s).filter(x=>x==='Sixth Sense').length,1);assert.deepEqual(M.validation(B,s),[]);
 s.randomTalents=['Luck','Super Numerate','Cardsharp','Attractive'];sign(s,41);assert.equal(M.freeTalents(B,s).filter(x=>x==='Luck').length,2);assert.deepEqual(M.validation(B,s),[]);assert.deepEqual(chartGrants(B,s,['Luck','Luck','Luck']),[]);
 const d=M.fresh();d.species='Dwarf';d.career='soldier';d.chart={enabled:true,sign:B.astrology[19].id,rolledSign:B.astrology[19].id,witchling:7,talent:'',ascendant:'',mansions:[]};assert.match(M.validation(B,d).join('\n'),/Star sign Talent Petty Magic: Incompatible/);assert.equal(chartXP(B,d),25);
});
test('Craftsman signs require a valid specialisation and create the core Skill unlock',()=>{
 const s=soldier();sign(s,46);assert.match(M.validation(B,s).join('\n'),/Craftsman specialisation/);
 s.chart.talent='Craftsman (Butcher)';assert.deepEqual(M.validation(B,s),[]);assert.ok(M.talentSkillUnlocks(B,s).includes('Trade (Butcher)'));
 s.chart.talent='Craftsman (Made up)';assert.match(M.validation(B,s).join('\n'),/Craftsman specialisation/);
});

test('saved astrology rejects malformed or unavailable state before rendering',()=>{
 const s=ogre();sign(s,1);s.books=bookSelection(B);assert.equal(catalogForCharacter(library,s).astrology.length,20);
 for(const change of [{mansions:null},{mansions:'text'},{witchling:11},{enabled:'yes'},{sign:'missing'},{extra:true}])assert.throws(()=>catalogForCharacter(library,{...s,chart:{...s.chart,...change}}),/invalid star chart/);
 assert.throws(()=>catalogForCharacter(library,{...s,books:bookSelection(R)}),/invalid star chart/);
});

test('Ogre-only equipment keeps its printed weight but needs a reviewed usable profile for other Species',()=>{
 const s=soldier();for(const name of ['Ogre Pistol','Ogre Gutplate']){const item=marketCatalog(B,s).find(x=>x.name===name);assert.ok(item.useUnresolved);assert.equal(item.enc,marketCatalog(B).find(x=>x.id===item.id).enc);assert.throws(()=>buyTrapping(B,s,item.id),/GM review/);}
});

test('Ogre magic references distinguish the general casting rule from the Great Maw Lore benefit',()=>{
 const s=ogre('archives-ii:career:ogre-butcher');assert.equal(speciesMagicReferences(B,s,[]).length,0);const general=speciesMagicReferences(B,s,['Petty Magic']);assert.equal(general.length,1);assert.equal(general[0].source.page,31);
 const maw=speciesMagicReferences(B,s,['Arcane Magic (The Great Maw)']);assert.equal(maw.length,2);assert.equal(maw[1].source.page,32);assert.match(maw[1].text,/unmodified CN/);assert.equal(speciesMagicReferences(B,s,['Arcane Magic (Heavens)']).length,1);
});

export function advancedButcher(){
 const s=ogre('archives-ii:career:ogre-butcher');s.xp=1200;s.wealth.amount=1000;s.gearRolls={'class-0:{1d10}':1};sign(s,1); // Synthetic test funds and quantity, not random creation history.
 for(const slot of M.careerSkillSlots(B,s,1).slice(0,8))M.purchase(B,s,'skill',slot.name);
 M.purchase(B,s,'char','WS');M.purchase(B,s,'char','T');M.purchase(B,s,'promotion','');M.purchase(B,s,'talent','Arcane Magic (The Great Maw)');
 s.spells=M.spellGrants(B,s).flatMap(g=>g.choices.filter(x=>x.category===g.category).slice(0,g.count).map(x=>x.name));s.books=bookSelection(B);
 buyTrapping(B,s,'archives-ii:item:ironfist');buyTrapping(B,s,'archives-ii:item:ogre-gutplate');return s;
}
test('Archives II PDF keeps editable fields and agrees on Large Wounds, casting, armour and rewarded XP',async()=>{
 globalThis.PDFLib=PDFLib;const s=advancedButcher(),d=M.derive(B,s);assert.deepEqual(M.validation(B,s),[]);
 assert.ok(equipment(B,s).entries.every(x=>x.quantity!==null));
 const bytes=await exportSheet(B,s,fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url))));
 const doc=await PDFLib.PDFDocument.load(bytes),form=doc.getForm();assert.equal(form.getFields().length,556);
 for(const [key,value]of Object.entries({Species:'[Legacy] Ogre',Wounds_Total:d.wounds,Enc_Max:d.capacity,Fate:1,Fortune_Max:2,XP_Total:1225,XP_Spent:d.spent,XP_Current:d.remaining,AP_Body:3,AP_Shield:1}))assert.equal(form.getTextField(key).getText(),String(value),key);
 assert.match(form.getTextField('Notes').getText(),/Large/);assert.ok(M.knownSpells(B,s).some(x=>x.category==='The Great Maw'));
 assert.equal(form.getTextField('Language_1_Char').getText(),String(d.stats.T));assert.equal(form.getTextField('Language_1').getText(),'Magick');
});
