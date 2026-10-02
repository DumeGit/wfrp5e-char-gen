import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import * as M from '../dist/rules.mjs';
import {equipment,inventoryEntries,gearOptions,gearSlots,recordAcquisition,itemWeight} from '../dist/equipment.mjs';
import {buyTrapping,purse,marketCatalog,purchaseItem} from '../dist/market.mjs';
import {migrateInventory} from '../dist/inventory.mjs';
import {appearanceSummary,doomingResult,suggestedName} from '../dist/background.mjs';
import {exportSheet} from '../dist/export.mjs';
import {folioGear} from '../dist/folio.mjs';
import {R,soldier} from './fixture.mjs';
const rich=()=>{const s=soldier();s.wealth={amount:1000,currency:'gold crowns'};s.xp=1000000;return s;};
function bought(s,id){buyTrapping(R,s,id);return `purchase-${s.purchases.at(-1).uid}`;}

test('effect wording never makes Sturdy, Combat Reflexes, Strike to Injure or Disarm repeatable',()=>{
 const s=M.fresh();s.species='Dwarf';s.career='stevedore';assert.match(M.quote(R,s,'talent','Sturdy').error,/Already known/);
 for(const talent of ['Combat Reflexes','Strike to Injure','Disarm']){s.freeTalent=talent;assert.match(M.invalidTalent(R,s,talent),/Already known/,talent);}
});
test('explicit repeat limits include Aethyric Attunement, Wealthy, Luck and Magnum Opus',()=>{
 for(const [talent,limit]of [['Aethyric Attunement',2],['Wealthy',2],['Strong Back',2],['Luck',3]]){const s=rich();s.freeTalent=talent;for(let i=1;i<limit;i++){assert.equal(M.invalidTalent(R,s,talent),'');s.ledger.push({type:'talent',name:talent,cost:100});}assert.match(M.invalidTalent(R,s,talent),/Already known/);}
 const s=rich();s.career='artist';s.ledger=[{type:'promotion',cost:100},{type:'promotion',cost:100},{type:'promotion',cost:100},{type:'talent',name:'Magnum Opus',cost:100}];assert.equal(M.quote(R,s,'talent','Magnum Opus').error,'');
});
test('Craftsman and region-specific Seasoned Traveller unlock skills without Career boxes',()=>{
 const s=rich();s.career='wizard';s.ledger.push({type:'talent',name:'Craftsman (Cook)',cost:100});let q=M.quote(R,s,'skill','Trade (Cook)');assert.equal(q.error,'');assert.equal(q.cost,100);assert.equal(q.tick,false);assert.ok(M.talentSkillUnlocks(R,s).includes('Trade (Cook)'));
 s.ledger.push({type:'talent',name:'Seasoned Traveller',cost:100});s.localRegion='Reikland';assert.equal(M.quote(R,s,'skill','Lore (Reikland)').error,'');assert.match(M.quote(R,s,'skill','Lore (Local)').error,/Training/);s.localRegion='';assert.match(M.quote(R,s,'skill','Lore (Reikland)').error,/Training/);
});
test('elf Lore progression requires eight previous-Lore spells and respects WP Bonus',()=>{
 const s=rich();s.species='High Elf';s.career='wizard';s.ledger=[{type:'promotion',cost:100},{type:'talent',name:'Arcane Magic (Fire)',cost:100}];const fire=R.spells.filter(x=>x.category==='Fire');s.spells=[fire[0].name];s.ledger.push(...fire.slice(1,7).map(x=>({type:'spell',name:x.name,talent:'Arcane Magic (Fire)',cost:100})));assert.match(M.quote(R,s,'talent','Arcane Magic (Life)').error,/7\/8/);s.ledger.push({type:'spell',name:fire[7].name,talent:'Arcane Magic (Fire)',cost:100});assert.equal(M.quote(R,s,'talent','Arcane Magic (Life)').error,'');s.species='Human';assert.match(M.quote(R,s,'talent','Arcane Magic (Life)').error,/only one/);s.species='High Elf';s.points[8]=4;s.ledger.push({type:'talent',name:'Arcane Magic (Life)',cost:100},{type:'talent',name:'Arcane Magic (Death)',cost:100});assert.match(M.quote(R,s,'talent','Arcane Magic (Metal)').error,/Willpower Bonus/);
});
test('generic Arcane spells retain separate Lore identities',()=>{
 const s=rich();s.freeTalent='Arcane Magic (Fire)';s.ledger=[{type:'talent',name:'Arcane Magic (Life)',cost:100}];s.spells=['Aethyric Armour','Aethyric Armour'];const known=M.knownSpells(R,s);assert.equal(known.length,2);assert.deepEqual(known.map(x=>x.lore),['Fire','Life']);assert.notEqual(known[0].displayName,known[1].displayName);
});
test('book languages, talent examples and valid Animal Training specialisations are available',()=>{
 for(const lang of ['Albion','Estalian','Gospodarinyi','Grumbarth','Norse','Pilgrim Sign','Queekish','Tilean'])assert.ok(M.options(R,'Language (Any One)').includes(`Language (${lang})`));
 assert.deepEqual(M.options(R,'Animal Training (Any One)'),['Demigryph','Dog','Hawk','Horse','Pigeon'].map(x=>`Animal Training (${x})`));
 for(const [talent,choices]of [['Resistant',['Magic','Corruption']],['Striding Gait',['Desert','Tundra','Woodland']],['Hatred',['Orcs','Witches']],['Fearless',['Giants','Trolls']]])for(const x of choices)assert.ok(M.options(R,`${talent} (Any One)`,'talent').includes(`${talent} (${x})`));
});
test('Career coin rolls and bonus coins enter the purse; valuable goods do not',()=>{
 const s=M.fresh();s.career='merchant';s.wealth={amount:20,currency:'silver shillings'};s.gearRolls['career-3:3d10']=20;s.bonusGear=[1];assert.equal(purse(R,s).grants,20*12+20*240);const before=purse(R,s).remaining;buyTrapping(R,s,'307:Shield');assert.equal(purse(R,s).remaining,before-480);s.career='fence';s.bonusGear=[];assert.equal(purse(R,s).grants,0);
});
test('ranged Career choices, aliases and counted weapons receive actual profiles',()=>{
 assert.ok(gearOptions('Ranged Weapon (Any One)').includes('Bow (2H)'));assert.ok(!gearOptions('Ranged Weapon (Any One)').includes('Dagger'));
 for(const [raw,weapon]of [['Main-gauche','Main Gauche'],['Sword-breaker','Swordbreaker'],['Great Weapon (Military Flail)','Military Flail (2H)'],['Great Weapon (Dwarf Greataxe)','Greataxe (2H)'],['2 Bolas','Bolas'],['5 Throwing Knives','Throwing Knife'],['Hook','Dagger']]){const s=rich();s.ledger.push({type:'trapping',name:raw,level:2,cost:0});const w=equipment(R,s).weapons.find(x=>x.label.startsWith(raw)||x.name===weapon);assert.ok(w,raw);assert.equal(w.name,weapon,raw);if(raw.startsWith('2 '))assert.equal(w.quantity,2);if(raw.startsWith('5 '))assert.equal(w.quantity,5);}
});
test('melee and Career ranged Nets and Bolas retain their automatic printed profiles',()=>{
 const s=rich(),key=bought(s,'301:Net');let w=equipment(R,s).weapons.find(x=>x.key===key);assert.equal(w.group,'Basic');assert.equal(w.reach,'Short');assert.match(w.qualities,/Defensive/);s.ledger.push({type:'trapping',name:'Ranged Weapon (Any One)',cost:0});s.gearChoices['acquired-0']='Net';w=equipment(R,s).weapons.find(x=>x.key==='acquired-0');assert.equal(w.group,'Entangling');assert.equal(w.reach,'SB yards');const b=bought(s,'303:Bolas');w=equipment(R,s).weapons.find(x=>x.key===b);assert.match(w.qualities,/Inflict \(Prone\)/);assert.match(w.qualities,/only on leg hits/);
});

test('Sure Shot and Rapid Reload affect equipped weapon profiles without configuration',()=>{
 const s=rich(),bow=bought(s,'303:Bow (2H)'),crossbow=bought(s,'303:Crossbow (2H)');const oldBow=equipment(R,s).weapons.find(x=>x.key===bow).damage;s.ledger.push({type:'talent',name:'Sure Shot',cost:100},{type:'talent',name:'Rapid Reload',cost:100});const ws=equipment(R,s).weapons;assert.equal(ws.find(x=>x.key===bow).damage,oldBow+1);assert.match(ws.find(x=>x.key===crossbow).qualities,/Reload 0/);assert.ok(ws.every(x=>x.placement==='equipped'));
});

test('linking an owned purchase grants one Career box without duplicating its inventory',()=>{
 const s=rich(),key=bought(s,'307:Breastplate'),index=M.career(R,s).levels[1].trappings.indexOf('Breastplate'),before=folioGear(R,s).find(x=>x.name==='Breastplate').quantity;recordAcquisition(R,s,2,index,'Bought with starting funds',key);assert.equal(folioGear(R,s).find(x=>x.name==='Breastplate').quantity,before);assert.equal(M.derive(R,s).earnedBoxes,1);assert.throws(()=>recordAcquisition(R,s,2,index,'Again',key),/already earned/);s.ledger.pop();assert.equal(folioGear(R,s).find(x=>x.name==='Breastplate').quantity,before);
});
test('poisons, Quick Armour and instrument/tent size variants use printed prices',()=>{
 const cat=marketCatalog(R);for(const [name,cost,enc]of [['Adder root',5,0],['Black lotus (leaves)',72,0],['Black lotus (sap)',4800,0],['Daemon’s tand',5,0],['Small Instrument',240,0],['Large Instrument',960,2],['Small Tent',360,1],['Large Tent',1440,4],['Heavy Armour',21120,10]]){const item=cat.find(x=>x.name===name);assert.equal(item.pennies,cost,name);assert.equal(item.enc,enc,name);}assert.equal(cat.find(x=>x.name==='Mule').page,312);
});
test('new purchases use the listed price and have no added craftsmanship',()=>{
 const s=rich(),item=marketCatalog(R).find(x=>x.name==='Breastplate');buyTrapping(R,s,item.id);assert.equal(s.purchases.at(-1).pennies,item.pennies);assert.equal(s.purchases.at(-1).qualities,undefined);assert.equal(s.purchases.at(-1).flaws,undefined);
});

test('bags are worn and belongings pack automatically while weapons stay equipped',()=>{
 const s=rich(),pack=bought(s,'308:Backpack'),rope=bought(s,'316:Rope, 10 yards'),tent=bought(s,'316:Tent'),eq=equipment(R,s);assert.equal(eq.entries.find(x=>x.key===pack).worn,true);assert.equal(eq.entries.find(x=>x.key===pack).carriedEnc,1);assert.equal(eq.entries.find(x=>x.key===pack).load,3);for(const key of [rope,tent]){assert.equal(eq.entries.find(x=>x.key===key).placement,pack);assert.equal(eq.entries.find(x=>x.key===key).carriedEnc,0);}assert.equal(eq.entries.find(x=>x.key==='career-2').placement,'equipped');assert.equal(eq.entries.find(x=>x.key==='career-2').carriedEnc,3);assert.equal(eq.unknown.length,0);
});

test('overflow counts as carried rather than disappearing or requiring packing choices',()=>{
 const s=rich(),tent=bought(s,'316:Tent'),rope=bought(s,'316:Rope, 10 yards'),eq=equipment(R,s);assert.equal(eq.entries.find(x=>x.key===tent).placement,'carried');assert.equal(eq.entries.find(x=>x.key===rope).placement,'carried');assert.equal(eq.gearEnc,3);assert.equal(eq.unknown.length,0);for(const e of eq.entries.filter(x=>x.capacity!==undefined))assert.ok(e.load<=e.capacity*e.quantity);
});

test('animals and vehicles remain external Trappings without passenger management',()=>{
 const s=rich(),before=equipment(R,s).total;s.ledger.push({type:'trapping',name:'Mule and Cart',level:2,cost:0});const eq=equipment(R,s);for(const name of ['Mule','Cart']){const e=eq.entries.find(x=>x.name===name);assert.equal(e.placement,'external');assert.equal(e.carriedEnc,0);assert.equal(e.load,0);}assert.equal(eq.total,before);
});

test('legacy manual packing and weight overrides cannot secretly change creation totals',()=>{
 const s=rich(),before=equipment(R,s);for(const e of before.entries)s.gearState[e.key]={placement:'stored',encOverride:100,passengers:12,qualities:['Lightweight'],flaws:['Bulky']};s.coinStorage='missing';assert.deepEqual(equipment(R,s),before);
});

test('old purchased craftsmanship and prices are retained without rewriting the save',()=>{
 const s=rich(),item=marketCatalog(R).find(x=>x.name==='Backpack');s.purchases.push({id:item.id,uid:'old-pack',pennies:100,qualities:['Fine','Durable','Lightweight'],ranks:{Fine:3,Durable:2}});const before=JSON.stringify(s),eq=equipment(R,s);assert.deepEqual(eq.entries.find(x=>x.key==='purchase-old-pack').ranks,{Durable:2,Fine:3});assert.equal(eq.entries.find(x=>x.key==='purchase-old-pack').enc,1);assert.equal(purse(R,s).spent,100);assert.equal(JSON.stringify(s),before);
});

test('counted starting ammunition retains the published zero Enc',()=>{
 for(const name of ['Arrow','Bolt','Shot','Lead Bullet','Stone Bullet'])assert.equal(itemWeight(R,name),0,name);
});
test('coin weight is ignored without changing the remaining purse or bag capacity',()=>{
 const s=rich(),before=equipment(R,s).total;s.wealth={amount:40000,currency:'gold crowns'};const eq=equipment(R,s);assert.equal(eq.coinEnc,0);assert.equal(eq.total,before);assert.equal(eq.entries.find(x=>x.key==='all-2').load,1);assert.equal(purse(R,s).remaining,40000*240);assert.match(eq.notes.join(' '),/Coin weight is ignored by user choice/);
});

test('automatically equipped purchases apply load thresholds without changing XP prices',()=>{
 const s=rich(),price=M.quote(R,s,'char','Ag').cost;for(let i=0;i<5;i++)bought(s,'303:Javelin');let eq=equipment(R,s);assert.equal(eq.penalties.band,1);assert.equal(eq.penalties.movement,3);assert.equal(eq.penalties.agility,M.derive(R,s).stats.Ag-10);for(let i=0;i<9;i++)bought(s,'303:Javelin');eq=equipment(R,s);assert.equal(eq.penalties.band,2);assert.equal(eq.penalties.agility,Math.max(10,M.derive(R,s).stats.Ag-20));for(let i=0;i<12;i++)bought(s,'303:Javelin');assert.equal(equipment(R,s).penalties.immobile,true);assert.equal(M.quote(R,s,'char','Ag').cost,price);
});

test('automatically worn layered armour applies protection and Lore-specific penalties',()=>{
 const s=rich(),leather=bought(s,'307:Leather Jack'),mail=bought(s,'307:Mail Coat'),helm=bought(s,'307:Helm');s.ledger.push({type:'talent',name:'Arcane Magic (Fire)',cost:100},{type:'talent',name:'Arcane Magic (Metal)',cost:100},{type:'talent',name:'Arcane Magic (Beasts)',cost:100});const eq=equipment(R,s);assert.equal(eq.ap.Body,3);assert.equal(eq.penalties.stealth,-2);assert.equal(eq.penalties.perception,-2);assert.deepEqual(eq.penalties.casting,{Fire:-3,Metal:-1,Beasts:-2});for(const key of [leather,mail,helm])assert.equal(eq.entries.find(x=>x.key===key).worn,true);assert.equal(eq.entries.find(x=>x.key===mail).carriedEnc,2);assert.equal(eq.entries.find(x=>x.key===helm).carriedEnc,1);
});

test('Quick Armour is worn automatically and uses the printed worn Enc and protection',()=>{
 const s=rich(),quick=bought(s,'307:Heavy Armour'),eq=equipment(R,s);assert.equal(eq.ap.Body,5);assert.equal(eq.penalties.stealth,-2);assert.equal(eq.penalties.perception,-2);assert.equal(eq.entries.find(x=>x.key===quick).carriedEnc,10);assert.match(eq.warnings.join(' '),/replaces detailed/);
});

test('unlisted weights remain explicit rather than silently assumed zero',()=>{
 const s=rich();s.ledger.push({type:'trapping',name:'Unlisted Keepsake',cost:0});const eq=equipment(R,s);assert.ok(eq.unknown.includes('Unlisted Keepsake'));assert.equal(eq.penalties.complete,false);
});

test('reference corrections retain complete Mimic and spell duration, excluding Dooming-table fragments',()=>{
 assert.match(M.talentInfo(R,'Mimic').text,/fake it or hide it/);assert.ok(!M.talentInfo(R,'Disarm').text.includes('Morr sends'));assert.ok(!M.talentInfo(R,'Doomed').text.includes('51–52'));assert.equal(R.spells.find(x=>x.name==='As Verena Is My Witness').duration,'Fellowship Bonus Rounds');
});
test('background suggestions use only printed lists and every Dooming roll has one result',()=>{
 for(const species of Object.keys(R.species)){const s=M.fresh();s.species=species;const name=suggestedName(R,s,()=>1);assert.ok(name.length>0);s.background={eyes:R.background[species].eyes[0],hair:R.background[species].hair[0]};assert.match(appearanceSummary(s),/Eyes:.*Hair:/);}
 for(let n=1;n<=100;n++){assert.equal(R.background.doomings.filter(x=>n>=x.min&&n<=x.max).length,1);assert.ok(doomingResult(R,n).text);}assert.equal(doomingResult(R,100).text,'Morr sends a maiden.');
});
test('legacy purchase IDs and storage references survive migration without changing coin totals',()=>{
 const s=rich();s.purchases=[{id:'313:Mule'},{id:'308:Backpack'}];s.gearState={'purchase-1':{placement:'purchase-0'}};s.coinStorage='purchase-1';const before=purse(R,s).remaining;migrateInventory(s);assert.equal(purchaseItem(R,s.purchases[0]).name,'Mule');assert.equal(s.gearState['purchase-legacy-1'].placement,'purchase-legacy-0');assert.equal(s.coinStorage,'purchase-legacy-1');assert.equal(purse(R,s).remaining,before);
});
test('fillable PDF has both left/right armour fields, effective load scores and native widget appearances',async()=>{
 globalThis.PDFLib=PDFLib;const s=rich();s.wealth={amount:100,currency:'gold crowns'};bought(s,'307:Leather Jack');bought(s,'307:Leather Leggings');const eq=equipment(R,s),bytes=await exportSheet(R,s,fs.readFileSync(new URL('../dist/assets/character-sheet.pdf',import.meta.url)),JSON.parse(fs.readFileSync(new URL('../dist/data/sheet-fields.json',import.meta.url))));const doc=await PDFLib.PDFDocument.load(bytes),form=doc.getForm();for(const field of ['AP_Right_Arm','AP_Left_Arm','AP_Right_Leg','AP_Left_Leg']){const f=form.getTextField(field);assert.equal(f.getText(),'1',field);for(const w of f.acroField.getWidgets())assert.ok(w.getNormalAppearance(),field);}assert.equal(form.getTextField('Movement').getText(),String(eq.penalties.movement));assert.equal(form.getTextField('Ag_Current').getText(),String(eq.penalties.agility));assert.equal(form.getFields().length,556);
});
