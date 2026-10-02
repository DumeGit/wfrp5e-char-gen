import {career,CLASS_KIT,derive} from './rules.mjs';
import {marketCatalog,purchaseItem} from './market.mjs';
import {rawGearSlots,rolledName,coinValue,itemParts,itemModifiers,CONTAINERS,CARRIERS,modifierNames} from './inventory.mjs';
// Printed equipment tables, pp.301, 303, 307–310. Prices are not inferred for unlisted items.
export const WEAPONS=[];
function weapon(name,group,enc,reach,damage,qualities='',page=301){WEAPONS.push({name,group,enc,reach,damage,qualities,page});}
weapon('Dagger','Basic',0,'Very Short','SB+2');weapon('Knife','Basic',0,'Very Short','SB+1','Undamaging');weapon('Hand Weapon','Basic',1,'Average','SB+4','Unbalanced');weapon('Sword','Basic',1,'Average','SB+4');weapon('Knuckledusters','Brawling',0,'Personal','SB+2');weapon('Garrote (2H)','Brawling',0,'Personal','SB+2','Inflict (Entangled: Strength), Undamaging');weapon('Cavalry Hammer (2H)','Cavalry',3,'Long','SB+5','Pummel');weapon('Lance','Cavalry',3,'Very Long','SB+6','Damaging, Impale; charge only');weapon('Foil','Fencing',1,'Average','SB+3','Fast, Impale, Precise, Undamaging');weapon('Main Gauche','Fencing',0,'Short','SB+2','Defensive, Impale, Parry');weapon('Rapier','Fencing',1,'Long','SB+4','Fast, Impale');weapon('Swordbreaker','Fencing',0,'Short','SB+1','Defensive, Parry, Trap Blade');weapon('Flail','Flail',1,'Average','SB+4','Pummel, Wrap, Unbalanced');weapon('Grain Flail (2H)','Flail',2,'Long','SB+3','Pummel, Imprecise');weapon('Military Flail (2H)','Flail',3,'Long','SB+5','Damaging, Pummel, Wrap, Unbalanced');weapon('Whip','Flail',1,'Very Long','SB+2','Wrap, Unbalanced, Undamaging');weapon('Halberd (2H)','Polearm',3,'Long','SB+5','Defensive, Hack, Impale');weapon('Pike (2H)','Polearm',4,'Massive','SB+4','Impale');weapon('Quarterstaff (2H)','Polearm',2,'Long','SB+3','Defensive, Pummel');weapon('Spear (2H)','Polearm',2,'Very Long','SB+4','Fast, Impale');weapon('Bastard Sword (2H)','Two-handed',2,'Long','SB+5','Damaging, Defensive');weapon('Greataxe (2H)','Two-handed',3,'Long','SB+6','Damaging, Hack, Unbalanced');weapon('Pick (2H)','Two-handed',3,'Long','SB+5','Damaging, Penetrating, Unbalanced');weapon('Warhammer (2H)','Two-handed',3,'Long','SB+6','Damaging, Pummel, Unbalanced');weapon('Zweihänder (2H)','Two-handed',3,'Long','SB+5','Damaging, Hack');
for(const a of [['Blunderbuss (2H)','Blackpowder',2,'20 yards','8','Blast 3, Dangerous, Reload 3'],['Handgun (2H)','Blackpowder',2,'40 yards','10','Reload 3'],['Pistol','Blackpowder',0,'20 yards','9','Pistol, Reload 2'],['Bow (2H)','Bow',2,'50 yards','SB+4',''],['Longbow (2H)','Bow',3,'60 yards','SB+4',''],['Shortbow (2H)','Bow',1,'40 yards','SB+3',''],['Crossbow (2H)','Crossbow',2,'50 yards','9','Reload 1'],['Crossbow Pistol','Crossbow',0,'20 yards','7','Pistol, Reload 1'],['Heavy Crossbow (2H)','Crossbow',3,'60 yards','10','Reload 2'],['Repeater Handgun (2H)','Engineering',3,'40 yards','10','Repeater 4, Dangerous, Reload 5'],['Repeater Pistol','Engineering',1,'20 yards','9','Pistol, Repeater 4, Dangerous, Reload 4'],['Hochland Long Rifle (2H)','Engineering',3,'100 yards','10','Precise, Reload 4'],['Bolas','Entangling',0,'SB × 3 yards','SB','Inflict (Entangled 35), Undamaging'],['Lasso (2H)','Entangling',1,'SB × 2 yards','—','Inflict (Entangled 45)'],['Net','Entangling',1,'SB yards','—','Inflict (Entangled 50)'],['Bomb','Explosives',0,'SB yards','12','Blast 5, Inflict (Deafened), Dangerous'],['Incendiary','Explosives',0,'SB yards','8','Blast 4, Inflict (Ablaze), Dangerous'],['Sling','Sling',0,'40 yards','6',''],['Staff Sling (2H)','Sling',2,'50 yards','7',''],['Javelin','Throwing',1,'SB × 3 yards','SB+3','Impale'],['Rock','Throwing',0,'SB × 3 yards','SB','Undamaging'],['Throwing Axe','Throwing',1,'SB × 2 yards','SB+3','Hack'],['Throwing Knife','Throwing',0,'SB × 2 yards','SB+2','']])weapon(...a,303);
for(const w of WEAPONS)if(['Blackpowder','Engineering','Explosives'].includes(w.group))w.qualities+=', Blackpowder, Damaging';
weapon('Buckler','Fencing',1,'Personal','SB+1','Defensive, Parry, Undamaging');
weapon('Net','Basic',1,'Short','—','Defensive, Inflict (Entangled 50)');
WEAPONS.find(w=>w.name==='Bolas').qualities='Inflict (Entangled 35), Inflict (Prone), Undamaging; Entangled and Prone only on leg hits';
export const ARMOUR=[['Buckler',1,'Shield',1,'Shield'],['Shield',2,'Shield',2,'Shield'],['Large Shield',3,'Shield',3,'Shield'],['Leather Coif',0,'Head',1,'Partial'],['Leather Jack',1,'Arms, Body',1,''],['Leather Jerkin',1,'Body',1,''],['Leather Leggings',1,'Legs',1,''],['Mail Chausses',3,'Legs',2,'Flexible'],['Mail Coat',3,'Arms, Body',2,'Flexible'],['Mail Coif',1,'Head',2,'Flexible, Partial'],['Mail Shirt',2,'Body',2,'Flexible'],['Bracers',2,'Arms',2,'Impenetrable, Weakpoints'],['Breastplate',3,'Body',2,'Impenetrable, Weakpoints'],['Helm',2,'Head',2,'Impenetrable, Weakpoints; −2 SL Perception'],['Open Helm',1,'Head',2,'Partial'],['Plate Leggings',3,'Legs',2,'Impenetrable, Weakpoints']].map(([name,enc,locations,ap,qualities])=>({name,enc,locations,ap,qualities,page:307}));
export const GEAR_ENC={'Clothing':1,'Uniform':1,'Fine Clothing':1,'Cloak':1,'Hat':0,'Robes':1,'Tattered Robes':1,'Hooded Cloak':1,'Hood':0,'Mask':0,'Pouch':0,'Backpack':2,'Sling Bag':1,'Sack':2,'Large Sack':3};
ARMOUR.push(...[['Light Armour',0,1,''],['Medium Armour',4,3,'Flexible'],['Heavy Armour',10,5,'Impenetrable, Weakpoints']].map(([name,enc,ap,qualities])=>({name,enc,ap,qualities,locations:'Head, Arms, Body, Legs',page:307,quick:true})));
export function itemWeight(R,name){
 // The ammunition table gives Enc 0 for these units/packs (p. 303).
 if(['Arrow','Bolt','Shot','Bullet','Lead Bullet','Stone Bullet'].includes(name))return 0;
 const aliases={'Large Sack':'Sack, Large','Canvas Tarpaulin':'Canvas Tarp','Charcoal Stick':'Charcoal stick','Pole':'Pole (3 yards)','Rope':'Rope, 10 yards','Flask of Spirits':'Flask','Bandages':'Bandage','Keys':'Key','Hammer and Nails':'Hammer','Hammer and Spikes':'Hammer','Poor Quality Blanket':'Blanket','Storm Lantern with Oil':'Storm Lantern','Storm Lantern and Oil':'Storm Lantern','Small Tent':'Small Tent'};
 if(name==='Small Tent')return 1;
 if(name==='Coach Horn')return 1;
 if(name==='Lute')return 2;
 const qty=name.match(/^(\d+) (Rags|Bandages|Matches|Candles|Sets of Clothing)$/);
 if(qty)return Number(qty[1])*(qty[2]==='Sets of Clothing'?1:0);
 name=(aliases[name]||name).replace(/^Book \(([^)]+)\)$/,'Book, $1').replace(/^Trade Tools \([^)]+\)$/,'Trade Tools');
 return GEAR_ENC[name]??marketCatalog(R).find(x=>x.name.toLowerCase()===name.toLowerCase())?.enc??null;
}

const ALIASES={'Main-gauche':'Main Gauche','Sword-breaker':'Swordbreaker','Great Weapon (Two-handed Pick)':'Pick (2H)','Great Weapon (Military Flail)':'Military Flail (2H)','Great Weapon (Dwarf Greataxe)':'Greataxe (2H)','Large Sack':'Sack, Large','Small Instrument':'Small Instrument','Coach Horn':'Instrument','Mandolin':'Instrument','Lute':'Large Instrument','Harp':'Large Instrument','Flute':'Small Instrument','Recorder':'Small Instrument','Tambourine':'Small Instrument','Small Drum':'Instrument','Large Drum':'Large Instrument','Parchment':'Parchment/sheet','Rations (1 day)':'Rations, 1 day','Rations (one day)':'Rations, 1 day','Lunch':'Meal, inn','Grimoire':'Book, Magic'};
export function gearOptions(raw){
 if(/^(Weapon|Melee Weapon|Ranged Weapon) \(Any/.test(raw))return [...new Set(WEAPONS.filter(w=>!raw.startsWith('Melee')&&!raw.startsWith('Ranged')||w.page===(raw.startsWith('Ranged')?303:301)).map(w=>w.name))];
 if(ALIASES[raw]&&raw.startsWith('Great Weapon'))return [ALIASES[raw]];
 if(raw==='Musical Instrument')return ['Small Instrument','Instrument','Large Instrument'];
 if(raw==='Helmet')return ['Helm','Open Helm'];
 if(raw.includes(' or '))return raw.split(' or ');
 return [raw];
}
export function gearSlots(R,s){return [...rawGearSlots(R,s),...(s.purchases||[]).map((x,i)=>({name:purchaseItem(R,x)?.name||'Unknown purchased item',origin:'Bought with starting wealth',key:x.uid?`purchase-${x.uid}`:`purchase-${i}`,marketId:purchaseItem(R,x)?.id,purchase:x}))];}
export function resolvedGearName(s,slot){const opts=gearOptions(slot.name);return rolledName(s,slot,opts.includes(s.gearChoices[slot.key])?s.gearChoices[slot.key]:opts[0]);}
export function inventoryEntries(R,s){
 const entries=[],slots=gearSlots(R,s),hasOutfit=slots.some(x=>['Uniform','Fine Clothing','Courtly Garb','Robes'].includes(resolvedGearName(s,x)));
 for(const slot of slots){
  const resolved=resolvedGearName(s,slot);if(coinValue(resolved))continue;
  itemParts(resolved).forEach((part,i)=>{
   const key=i?`${slot.key}:part-${i}`:slot.key,name=part.name,alias=name==='Leather Breastplate'?'Leather Jerkin':ALIASES[name]||name,mods=itemModifiers(slot.purchase);
   const weapon=WEAPONS.find(w=>(w.name===alias||w.name.replace(' (2H)','')===alias||(w.name==='Hand Weapon'&&alias.startsWith('Hand Weapon ('))))||(name==='Hook'?WEAPONS.find(w=>w.name==='Dagger'):null);
   const armour=ARMOUR.find(a=>a.name===alias),listed=slot.marketId&&i===0?marketCatalog(R).find(x=>x.id===slot.marketId):marketCatalog(R).find(x=>x.name===alias),capacity=CONTAINERS[alias]??CARRIERS[alias],carrier=Object.hasOwn(CARRIERS,alias),canWear=!!armour&&armour.locations!=='Shield'||/^(Clothing|Uniform|Fine Clothing|Courtly Garb|Boots|Coat|Velvet Cloak|Cloak|Hat|Robes|Tattered Robes|Hooded Cloak|Hood|Mask|Pouch|Backpack|Sling Bag)$/.test(alias)||listed?.category==='Prosthetics'||capacity!==undefined&&!carrier&&!['Barrel','Cask','Jug','Pewter Stein'].includes(alias);
   const placement=listed?.category==='Prosthetics'?'worn':weapon||armour?.locations==='Shield'?'equipped':name==='Clothing'&&slot.key==='all-0'&&hasOutfit?'carried':canWear?'worn':carrier||alias==='Workshop'?'external':'carried';
   let enc=name==='Hook'?1:armour?.enc??weapon?.enc??listed?.enc??itemWeight(R,alias);
   if(enc!==null){enc=Math.max(0,enc+(mods.flaws.includes('Bulky')?1:0)-(mods.qualities.includes('Lightweight')?1:0));}
   entries.push({...slot,key,name,alias,quantity:part.quantity,weapon,armour,canWear,capacity,carrier,placement,enc,...mods,quick:armour?.quick,netMode:slot.name.startsWith('Ranged Weapon')?'ranged':'melee',oneHanded:false,inContainer:part.inContainer?slot.key:null});
  });
 }
 return entries;
}
function adjustedWeapon(entry,d){
 let w={...entry.weapon};if(entry.name==='Net')w={...WEAPONS.find(w=>w.name==='Net'&&w.page===(entry.netMode==='ranged'?303:301))};
 let qualities=w.qualities.split(', ').filter(Boolean),damage=w.damage.replace('SB',d.sb).split('+').map(Number).reduce((a,b)=>a+b,0),bonus=0;
 if(w.page===301&&d.talents.includes('Strike Mighty Blow'))bonus++;
 if(w.page===303){if(d.talents.includes('Accurate Shot'))bonus++;if(d.talents.includes('Sure Shot'))bonus++;}
 if(entry.oneHanded&&w.name==='Spear (2H)'){damage--;qualities=qualities.filter(x=>x!=='Fast');}
 if(entry.oneHanded&&w.name==='Bastard Sword (2H)'){w.group='Basic';qualities=qualities.filter(x=>x!=='Damaging');qualities.push('Unbalanced');}
 if(d.talents.includes('Rapid Reload'))qualities=qualities.map(x=>x.replace(/Reload (\d+)/,(_,n)=>`Reload ${Math.max(0,Number(n)-1)}`));
 if(d.talents.includes('Gunner')&&['Blackpowder','Engineering','Explosives'].includes(w.group))qualities=qualities.filter(x=>x!=='Dangerous');
 return {...w,key:entry.key,label:(entry.oneHanded?entry.name.replace(' (2H)','')+' (1H)':entry.name)+(entry.quantity>1?` ×${entry.quantity}`:''),quantity:entry.quantity,enc:entry.enc===null?null:entry.enc*(entry.quantity||0),damage:Number.isFinite(damage)?damage+bonus:w.damage,qualities:[...qualities,...modifierNames(entry)].join(', '),placement:entry.placement};
}
function slotAliasNote(e){return e.name.startsWith('Great Weapon (')?`${e.name} uses the ${e.alias} profile (p. 301); no separate profile is printed.`:'';}
export function equipment(R,s){
 const d=derive(R,s),entries=inventoryEntries(R,s),notes=[],warnings=[],unknown=[],weapons=[],armour=[],other=[],ap={Head:0,Arms:0,Body:0,Legs:0,Shield:0};
 // Creation defaults are derived, so saved packing preferences cannot hide gear.
 const parents=new Map(entries.map(e=>[e.key,null]));
 const bags=entries.filter(e=>e.capacity!==undefined&&!e.carrier&&e.quantity!==null);
 const loads=new Map(bags.map(e=>[e.key,0]));
 const pack=(e,bag)=>{parents.set(e.key,bag.key);e.placement=bag.key;loads.set(bag.key,loads.get(bag.key)+e.enc*e.quantity);};
 const candidates=entries.filter(e=>e.placement==='carried'&&e.capacity===undefined&&e.enc!==null&&e.quantity!==null);
 // Keep the book's explicitly packed contents together when they fit.
 for(const e of candidates.filter(e=>e.inContainer)){
  const bag=bags.find(b=>b.key===e.inContainer),weight=e.enc*e.quantity;
  if(bag&&loads.get(bag.key)+weight<=bag.capacity*bag.quantity)pack(e,bag);
 }
 // Fit larger belongings first; overflow stays in the carried total.
 for(const e of candidates.filter(e=>!parents.get(e.key)).sort((a,b)=>b.enc*b.quantity-a.enc*a.quantity)){
  const weight=e.enc*e.quantity;
  const bag=bags.filter(b=>loads.get(b.key)+weight<=b.capacity*b.quantity).sort((a,b)=>(a.capacity*a.quantity-loads.get(a.key))-(b.capacity*b.quantity-loads.get(b.key)))[0];
  if(bag)pack(e,bag);
 }
 const personallyCarried=e=>e.placement!=='external';
 const weights=new Map();
 for(const e of entries){let value=e.enc===null||e.quantity===null?null:e.enc*e.quantity;
  const worn=e.placement==='worn'&&e.canWear&&!parents.get(e.key);
  if(!e.quick&&worn&&value!==null)value=e.flaws.includes('Bulky')?Math.max(e.quantity,value-e.quantity):Math.max(0,value-e.quantity);
  weights.set(e.key,value);e.carriedEnc=!parents.get(e.key)&&personallyCarried(e)?value:0;e.worn=worn;
 }
 const coinEnc=0; // User-selected creator convention: ignore coin weight.
 for(const e of entries.filter(x=>x.capacity!==undefined)){
  e.load=loads.get(e.key)||0;e.loadUnknown=false;
 }
 for(const e of entries){
  if(personallyCarried(e)&&!parents.get(e.key)&&weights.get(e.key)===null)unknown.push(e.name);
  if(e.name==='Hook')notes.push('Hook counts as a Dagger (p. 315); its own Encumbrance is retained.');
  if(slotAliasNote(e))notes.push(slotAliasNote(e));
  if(e.name==='Grimoire')notes.push('Grimoire uses the Book, Magic Encumbrance entry (pp. 237, 311).');
  if(e.name==='Lunch')notes.push('Lunch uses the printed Meal Encumbrance entry (pp. 39, 309).');
  if(e.name==='Leather Breastplate')notes.push('Leather Breastplate (p. 96) uses Leather Jerkin statistics (p. 307), as agreed.');
  if(e.weapon)weapons.push({...adjustedWeapon(e,d),carriedEnc:e.carriedEnc});
  if(e.armour)armour.push({...e.armour,key:e.key,label:e.name+(e.quantity>1?` ×${e.quantity}`:''),enc:e.enc,carriedEnc:e.weapon?0:e.carriedEnc,worn:e.worn,active:e.worn||(e.armour.locations==='Shield'&&e.placement==='equipped'),qualities:[e.armour.qualities,...modifierNames(e)].filter(Boolean).join(', '),itemQualities:e.qualities,itemFlaws:e.flaws});
  if(!e.weapon&&!e.armour)other.push({key:e.key,name:e.name+(e.quantity>1?` ×${e.quantity}`:''),origin:e.origin,enc:e.carriedEnc,worn:e.worn,placement:e.placement,qualities:e.qualities,flaws:e.flaws});
 }
 const byLayer={};for(const a of armour.filter(a=>a.active)){const layer=a.quick?'quick':a.name.startsWith('Leather')?'leather':a.name.startsWith('Mail')?'mail':a.locations==='Shield'?'shield':'plate';for(const loc of Object.keys(ap))if(a.locations.includes(loc)){const k=`${layer}-${loc}`;byLayer[k]=Math.max(byLayer[k]||0,a.ap);}}
 const activeQuick=armour.some(a=>a.active&&a.quick);if(activeQuick&&armour.some(a=>a.active&&!a.quick&&a.locations!=='Shield'))warnings.push('Quick Armour replaces detailed armour; its protection and penalties are not stacked (p. 307).');
 for(const [key,val]of Object.entries(byLayer)){const [layer,loc]=key.split('-');if(!activeQuick||['quick','shield'].includes(layer))ap[loc]+=val;}
 function penalty(a,value){return Math.max(0,value*(a.itemFlaws.includes('Unreliable')?2:1)-(a.itemQualities.includes('Practical')?1:0));}
 const wornArmour=armour.filter(a=>a.worn&&(!activeQuick||a.quick)),stealth=-['mail','plate'].reduce((n,layer)=>n+Math.max(0,...wornArmour.filter(a=>layer==='mail'?a.name.startsWith('Mail')||a.quick&&a.ap>=3:!a.name.startsWith('Leather')&&!a.name.startsWith('Mail')&&(!a.quick||a.ap>=5)).map(a=>penalty(a,1))),0),perception=-Math.max(0,...wornArmour.filter(a=>a.name==='Helm'||a.name==='Heavy Armour').map(a=>penalty(a,2)));
 const lores=d.talents.filter(t=>t.startsWith('Arcane Magic (')).map(t=>t.match(/\((.*)\)/)[1]);
 const castingFor=lore=>{const layers={};for(const a of wornArmour){
  const leather=a.name.startsWith('Leather'),metal=a.name.startsWith('Mail')||(!leather&&a.locations!=='Shield');let value=a.ap;
  if(a.quick){value=a.ap-(lore==='Metal'?Math.max(0,a.ap-1):lore==='Beasts'?1:0);}else if(lore==='Metal'&&metal||lore==='Beasts'&&leather)continue;
  const layer=a.quick?'quick':leather?'leather':a.name.startsWith('Mail')?'mail':'plate';for(const loc of ['Head','Arms','Body','Legs'])if(a.locations.includes(loc)){const key=`${layer}:${loc}`;layers[key]=Math.max(layers[key]||0,penalty(a,value));}}
  return -Math.max(0,...['Head','Arms','Body','Legs'].map(loc=>Object.entries(layers).filter(([k])=>k.endsWith(':'+loc)).reduce((n,[,v])=>n+v,0)));};

 const weaponEnc=weapons.reduce((n,x)=>n+(x.carriedEnc||0),0),armourEnc=armour.reduce((n,x)=>n+(x.carriedEnc||0),0),gearEnc=other.reduce((n,x)=>n+(x.enc||0),0),total=Number((weaponEnc+armourEnc+gearEnc).toFixed(3));
 const complete=!unknown.length;let band=total<=d.capacity?0:total<=d.capacity*2?1:total<=d.capacity*3?2:3;
 const movement=band===3?0:band===2?Math.max(2,d.movement-2):band===1?Math.max(3,d.movement-1):d.movement,agility=band===2?Math.max(10,d.stats.Ag-20):band===1?d.stats.Ag-10:d.stats.Ag;
 if(entries.filter(e=>personallyCarried(e)&&!parents.get(e.key)&&e.enc>=4).length>1)warnings.push('Normally only one oversized object can be carried; it likely needs both hands (p. 299).');
 if(d.talents.includes('Sure Shot'))notes.push('Sure Shot: +1 ranged Damage; ignore Partial armour, and Weakpoints when using Impale (p. 127).');
 if(d.talents.includes('Accurate Shot'))notes.push('Accurate Shot: +1 ranged Damage is included; +2 instead when aiming (p. 114).');
 if(d.talents.includes('Strike Mighty Blow'))notes.push('Strike Mighty Blow: +1 melee Damage is included; +2 instead with Advantage (p. 127).');
 notes.push('Creator defaults: armour and wearable containers are worn, weapons are equipped, and other belongings fill available containers. Overflow is carried separately. Coin weight is ignored by user choice.');
 return {entries,weapons,armour,other,unknown:[...new Set(unknown)],ap,weaponEnc,armourEnc,gearEnc,total,notes:[...new Set(notes)],warnings,coinEnc,penalties:{complete,band,movement,agility,travelFatigue:band<3?band:0,immobile:band===3,stealth:stealth||0,perception:perception||0,casting:Object.fromEntries((lores.length?lores:['Other magic']).map(l=>[l,castingFor(l)||0]))}};
}
export function recordAcquisition(R,s,level,index,reason,linkedGear=''){
 const d=derive(R,s);if(level!==d.level+1||level>4)throw Error('Only the next Career level grants Trapping boxes.');const name=career(R,s).levels[level-1].trappings[index];if(!name||name==='None')throw Error('Choose a Career Trapping.');if(!reason.trim())throw Error('Record how the Trapping was obtained.');
 if(s.ledger.some(x=>x.type==='trapping'&&x.name===name)||s.bonusGear.some(i=>career(R,s).levels[1].trappings[i]===name))throw Error('This Trapping already earned a box.');
 if(linkedGear){const existing=gearSlots(R,s).find(x=>x.key===linkedGear);if(!existing)throw Error('Choose an owned item.');const actual=resolvedGearName(s,existing),choices=gearOptions(name);if(!choices.includes(actual)&&name!==actual)throw Error('The owned item must match the required Trapping.');if(s.ledger.some(x=>x.linkedGear===linkedGear))throw Error('This owned item already earned a box.');}
 s.ledger.push({type:'trapping',name,reason,level,cost:0,tick:d.earnedBoxes<36,page:'43–44',...(linkedGear?{linkedGear}:{})});
}
