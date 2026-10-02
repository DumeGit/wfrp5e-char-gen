import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as PDFLib from 'pdf-lib';
import * as M from '../dist/rules.mjs';
import {equipment,inventoryEntries,gearOptions,gearSlots,recordAcquisition,itemWeight} from '../dist/equipment.mjs';
import {buyTrapping,purse,marketCatalog,marketQuote,purchaseItem} from '../dist/market.mjs';
import {migrateInventory} from '../dist/inventory.mjs';
import {appearanceSummary,doomingResult,suggestedName} from '../dist/background.mjs';
import {exportSheet} from '../dist/export.mjs';
import {folioGear} from '../dist/folio.mjs';
import {R,soldier} from './fixture.mjs';
const rich=()=>{const s=soldier();s.wealth={amount:1000,currency:'gold crowns'};s.xp=1000000;return s;};
function bought(s,id){buyTrapping(R,s,id);return `purchase-${s.purchases.at(-1).uid}`;}
function leaveOtherGear(s,...keep){s.coinStorage='stored';for(const e of inventoryEntries(R,s))if(!keep.includes(e.key))s.gearState[e.key]={placement:'stored'};}

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
test('melee Net and Bolas preserve the table and footnote rules',()=>{
 const s=rich();const key=bought(s,'301:Net');let w=equipment(R,s).weapons.find(x=>x.key===key);assert.equal(w.group,'Basic');assert.equal(w.reach,'Short');assert.match(w.qualities,/Defensive/);s.gearState[key]={netMode:'ranged'};w=equipment(R,s).weapons.find(x=>x.key===key);assert.equal(w.group,'Entangling');assert.equal(w.reach,'SB yards');const b=bought(s,'303:Bolas');w=equipment(R,s).weapons.find(x=>x.key===b);assert.match(w.qualities,/Inflict \(Prone\)/);assert.match(w.qualities,/only on leg hits/);
});
test('Sure Shot, Rapid Reload and one-handed weapon options affect character profiles',()=>{
 const s=rich(),bow=bought(s,'303:Bow (2H)'),crossbow=bought(s,'303:Crossbow (2H)'),spear=bought(s,'301:Spear (2H)'),sword=bought(s,'301:Bastard Sword (2H)');const oldBow=equipment(R,s).weapons.find(x=>x.key===bow).damage;s.ledger.push({type:'talent',name:'Sure Shot',cost:100},{type:'talent',name:'Rapid Reload',cost:100});s.gearState[spear]={oneHanded:true};s.gearState[sword]={oneHanded:true};const ws=equipment(R,s).weapons;assert.equal(ws.find(x=>x.key===bow).damage,oldBow+1);assert.match(ws.find(x=>x.key===crossbow).qualities,/Reload 0/);assert.ok(!ws.find(x=>x.key===spear).qualities.includes('Fast'));assert.equal(ws.find(x=>x.key===sword).group,'Basic');assert.ok(!ws.find(x=>x.key===sword).qualities.includes('Damaging'));
});
test('linking an owned purchase grants one Career box without duplicating its inventory',()=>{
 const s=rich(),key=bought(s,'307:Breastplate'),index=M.career(R,s).levels[1].trappings.indexOf('Breastplate'),before=folioGear(R,s).find(x=>x.name==='Breastplate').quantity;recordAcquisition(R,s,2,index,'Bought with starting funds',key);assert.equal(folioGear(R,s).find(x=>x.name==='Breastplate').quantity,before);assert.equal(M.derive(R,s).earnedBoxes,1);assert.throws(()=>recordAcquisition(R,s,2,index,'Again',key),/already earned/);s.ledger.pop();assert.equal(folioGear(R,s).find(x=>x.name==='Breastplate').quantity,before);
});
test('poisons, Quick Armour and instrument/tent size variants use printed prices',()=>{
 const cat=marketCatalog(R);for(const [name,cost,enc]of [['Adder root',5,0],['Black lotus (leaves)',72,0],['Black lotus (sap)',4800,0],['Daemon’s tand',5,0],['Small Instrument',240,0],['Large Instrument',960,2],['Small Tent',360,1],['Large Tent',1440,4],['Heavy Armour',21120,10]]){const item=cat.find(x=>x.name===name);assert.equal(item.pennies,cost,name);assert.equal(item.enc,enc,name);}assert.equal(cat.find(x=>x.name==='Mule').page,312);
});
test('Flaws discount prices; Quality prices require an explicit agreement without invented multipliers',()=>{
 const item=marketCatalog(R).find(x=>x.name==='Breastplate'),q=marketQuote(item,{flaws:['Bulky','Unreliable']});assert.equal(q.pennies,item.pennies/4);assert.equal(q.availability,'Common');assert.match(marketQuote(item,{qualities:['Fine']}).error,/GM-agreed/);assert.equal(marketQuote(item,{qualities:['Fine'],agreedPrice:1000}).pennies,1000);const poison=marketCatalog(R).find(x=>x.name==='Black lotus (leaves)');assert.equal(marketQuote(poison,{flaws:['Ugly']}).availability,'Exotic');
});
test('containers count their own Enc, enforce capacity and reject circular or oversized packing',()=>{
 const s=rich(),pack=bought(s,'308:Backpack'),rope=bought(s,'316:Rope, 10 yards'),tent=bought(s,'316:Tent');leaveOtherGear(s,pack,rope,tent);s.gearState[rope]={placement:pack};s.gearState[tent]={placement:pack};let eq=equipment(R,s);assert.equal(eq.total,1);assert.equal(eq.entries.find(x=>x.key===pack).load,3);assert.equal(eq.unknown.length,0);s.gearState['career-2']={placement:pack};eq=equipment(R,s);assert.match(eq.warnings.join(' '),/long weapons/);s.gearState[pack]={placement:pack};assert.match(equipment(R,s).warnings.join(' '),/loop/);
});
test('overflow, unlisted contents and stored equipment never silently disappear from the load calculation',()=>{
 const s=rich(),pack=bought(s,'308:Sling Bag'),tent=bought(s,'316:Tent'),rope=bought(s,'316:Rope, 10 yards');leaveOtherGear(s,pack,tent,rope);s.gearState[tent]={placement:pack};s.gearState[rope]={placement:pack};let eq=equipment(R,s);assert.match(eq.unknown.join(' '),/exceed capacity/);s.gearState[pack]={placement:'stored'};eq=equipment(R,s);assert.equal(eq.total,0);assert.equal(eq.unknown.length,0);
});
test('Mule and Cart are separate carriers; their loads do not become personal Enc',()=>{
 const s=rich();s.ledger.push({type:'trapping',name:'Mule and Cart',level:2,cost:0});const mule=inventoryEntries(R,s).find(x=>x.name==='Mule'),cart=inventoryEntries(R,s).find(x=>x.name==='Cart');assert.equal(mule.capacity,14);assert.equal(cart.capacity,25);const tent=bought(s,'316:Large Tent');leaveOtherGear(s,cart.key,mule.key,tent);s.gearState[tent]={placement:cart.key};assert.equal(equipment(R,s).total,0);assert.equal(equipment(R,s).entries.find(x=>x.key===cart.key).load,4);
});
test('human-sized passengers consume carrier capacity at ten Enc each',()=>{
 const s=rich(),cart=bought(s,'312:Cart');leaveOtherGear(s,cart);s.gearState[cart]={placement:'stored',passengers:3};const eq=equipment(R,s);assert.equal(eq.entries.find(x=>x.key===cart).load,30);assert.match(eq.warnings.join(' '),/capacity/);assert.equal(eq.total,0);
});
test('craftsmanship ranks survive a purchase and lightweight/bulky change item Enc',()=>{
 const s=rich(),item=marketCatalog(R).find(x=>x.name==='Backpack');const q=buyTrapping(R,s,item.id,{qualities:['Fine','Durable','Lightweight'],ranks:{Fine:3,Durable:2},agreedPrice:100});assert.deepEqual(q.ranks,{Durable:2,Fine:3});const key=`purchase-${s.purchases.at(-1).uid}`;assert.equal(inventoryEntries(R,s).find(x=>x.key===key).enc,1);s.gearState[key]={flaws:['Bulky']};assert.equal(inventoryEntries(R,s).find(x=>x.key===key).enc,2);
});
test('counted starting ammunition retains the published zero Enc',()=>{
 for(const name of ['Arrow','Bolt','Shot','Lead Bullet','Stone Bullet'])assert.equal(itemWeight(R,name),0,name);
});
test('coin weight can be carried or packed without charging the contents twice',()=>{
 const s=rich();s.wealth={amount:400,currency:'gold crowns'};leaveOtherGear(s,'all-2');s.coinStorage='carried';assert.equal(equipment(R,s).coinEnc,2);assert.equal(equipment(R,s).total,2);s.coinStorage='all-2';assert.match(equipment(R,s).unknown.join(' '),/exceed capacity/);s.coinStorage='stored';assert.equal(equipment(R,s).total,0);
});
test('load penalties follow the three published thresholds and do not modify XP prices',()=>{
 const s=rich();leaveOtherGear(s,'class-0');s.gearState['class-0']={placement:'carried',encOverride:9};let eq=equipment(R,s);assert.equal(eq.penalties.band,1);assert.equal(eq.penalties.movement,3);assert.equal(eq.penalties.agility,M.derive(R,s).stats.Ag-10);const price=M.quote(R,s,'char','Ag').cost;s.gearState['class-0'].encOverride=18;eq=equipment(R,s);assert.equal(eq.penalties.band,2);assert.equal(eq.penalties.agility,Math.max(10,M.derive(R,s).stats.Ag-20));s.gearState['class-0'].encOverride=30;assert.equal(equipment(R,s).penalties.immobile,true);assert.equal(M.quote(R,s,'char','Ag').cost,price);
});
test('armour layering, wearing, Practical and Unreliable feed Stealth, Perception and Lore-specific casting',()=>{
 const s=rich(),leather=bought(s,'307:Leather Jack'),mail=bought(s,'307:Mail Coat'),helm=bought(s,'307:Helm');leaveOtherGear(s,leather,mail,helm);s.ledger.push({type:'talent',name:'Arcane Magic (Fire)',cost:100},{type:'talent',name:'Arcane Magic (Metal)',cost:100},{type:'talent',name:'Arcane Magic (Beasts)',cost:100});let eq=equipment(R,s);assert.equal(eq.ap.Body,3);assert.equal(eq.penalties.stealth,-2);assert.equal(eq.penalties.perception,-2);assert.deepEqual(eq.penalties.casting,{Fire:-3,Metal:-1,Beasts:-2});s.gearState[helm]={placement:'carried'};assert.equal(equipment(R,s).ap.Head,0);assert.equal(equipment(R,s).penalties.perception,0);s.gearState[helm]={placement:'worn',qualities:['Practical'],flaws:['Unreliable']};assert.equal(equipment(R,s).penalties.perception,-3);
});
test('Quick Armour replaces detailed armour and its worn-only Enc is labelled when unworn',()=>{
 const s=rich(),quick=bought(s,'307:Heavy Armour');let eq=equipment(R,s);assert.equal(eq.ap.Body,5);assert.equal(eq.penalties.stealth,-2);assert.equal(eq.penalties.perception,-2);assert.match(eq.warnings.join(' '),/replaces detailed/);s.gearState[quick]={placement:'carried'};eq=equipment(R,s);assert.match(eq.unknown.join(' '),/only worn Enc/);
});
test('a confirmed unworn Quick Armour weight resolves carrying and container loads',()=>{
 const s=rich(),quick=bought(s,'307:Medium Armour'),pack=bought(s,'308:Backpack');leaveOtherGear(s,quick,pack);s.gearState[quick]={placement:pack};assert.match(equipment(R,s).unknown.join(' '),/unresolved contents/);s.gearState[quick]={placement:pack,encOverride:3};let eq=equipment(R,s);assert.equal(eq.entries.find(x=>x.key===pack).load,3);assert.equal(eq.unknown.length,0);s.gearState[quick]={placement:'carried',encOverride:7};eq=equipment(R,s);assert.equal(eq.armourEnc,7);s.gearState[quick].placement='worn';assert.equal(equipment(R,s).armourEnc,4);
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
