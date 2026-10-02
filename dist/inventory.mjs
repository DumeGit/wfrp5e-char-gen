// Shared inventory identity and book-only parsing. No derived character rules here.
export const CLASS_KIT={Academic:['Sling Bag containing Writing Kit and {1d10} sheets of Parchment'],Burgher:['Cloak','Hat','Sling Bag containing Lunch'],Courtier:['Fine Clothing','Tweezers','Ear Pick','Comb'],Peasant:['Cloak','Sling Bag containing Rations (1 day)'],Ranger:['Cloak','Backpack containing Tinderbox, Blanket and Rations (1 day)'],Riverfolk:['Cloak','Sling Bag containing a Flask of Spirits'],Rogue:['Sling Bag containing 2 Candles and {1d10} Matches','Hood or Mask'],Warrior:['Hand Weapon']};
export function rawGearSlots(R,s){const c=R.careers.find(c=>c.id===s.career);return [{name:'Clothing',origin:'All characters',key:'all-0'},{name:'Dagger',origin:'All characters',key:'all-1'},{name:'Pouch',origin:'All characters',key:'all-2'},...(CLASS_KIT[c.class]||[]).map((name,i)=>({name,origin:`${c.class} class`,key:`class-${i}`})),...c.levels[0].trappings.filter(x=>x!=='None').map((name,i)=>({name,origin:`${c.levels[0].name} (level 1)`,key:`career-${i}`})),...s.bonusGear.map(i=>({name:c.levels[1].trappings[i],origin:'Random Career bonus',key:`bonus-${i}`,level:2})),...s.ledger.filter(x=>x.type==='trapping').map((x,i)=>({...x,origin:x.reason||'Acquired during advancement',key:`acquired-${i}`})).filter(x=>!x.linkedGear)];}
export function rolledName(s,slot,name=slot.name){return name.replace(/\{?(\d+)d10\}?/g,m=>s.gearRolls[`${slot.key}:${m}`]??m);}
export function coinValue(name){const m=name.match(/^(\d+)\s+(GC|Gold Crowns?|Shillings?|Silver Shillings?|Pennies|Brass Pennies)$/i);return m?Number(m[1])*(/GC|Gold/i.test(m[2])?240:/Shilling/i.test(m[2])?12:1):0;}
export const ITEM_QUALITIES=['Durable','Fine','Lightweight','Practical'];
export const ITEM_FLAWS=['Bulky','Shoddy','Ugly','Unreliable'];
export const CONTAINERS={Backpack:4,Barrel:12,Cask:4,Flask:0,Jug:1,'Pewter Stein':0,Pouch:1,Sack:4,'Sack, Large':6,Saddlebags:8,'Sling Bag':2,'Scroll Case':0,Waterskin:1};
export const CARRIERS={Cart:25,Coach:80,Coracle:10,Destrier:20,'Draught Horse':20,'Hunting Dog':0,'Light Warhorse':18,Monkey:1,Mule:14,Pony:14,'Riding Horse':16,'River Barge':300,'Row Boat':60,Wagon:30};
const UNITS={Candles:'Candle',Matches:'Match',Bandages:'Bandage',Arrows:'Arrow',Bolts:'Bolt',Shots:'Shot',Bullets:'Bullet','Lead Bullets':'Lead Bullet','Stone Bullets':'Stone Bullet',Bolas:'Bolas','Throwing Knives':'Throwing Knife','Sets of Clothing':'Clothing','different sets of Clothing':'Clothing','sheets of Parchment':'Parchment',Barges:'River Barge',Wagons:'Wagon'};
export function itemParts(text){
 const container=text.match(/^(.+?) containing (.+)$/);if(container){const root=itemParts(container[1])[0];return [root,...container[2].split(/,\s*| and /).flatMap(itemParts).map(x=>({...x,inContainer:true}))];}
 if(text.includes(' and ')&&!['Pipe and Tobacco','Saddle and Harness'].includes(text))return text.split(' and ').flatMap(itemParts);
 const ammo=text.match(/^(.+?) with (\d+ .+)$/);if(ammo)return [...itemParts(ammo[1]),...itemParts(ammo[2])];
 const amount=text.match(/^(\d+|\{?\d+d10\}?) (.+)$/);if(amount&&!coinValue(text))return [{name:UNITS[amount[2]]||amount[2],quantity:/d10/.test(amount[1])?null:Number(amount[1])}];
 return [{name:text,quantity:1}];
}
export function itemModifiers(value={}){const qualities=[...new Set((value.qualities||[]).filter(x=>ITEM_QUALITIES.includes(x)))],flaws=[...new Set((value.flaws||[]).filter(x=>ITEM_FLAWS.includes(x)))];const ranks=Object.fromEntries(['Durable','Fine'].filter(x=>qualities.includes(x)).map(x=>[x,Number.isInteger(value.ranks?.[x])&&value.ranks[x]>0?value.ranks[x]:1]));return {qualities,flaws,ranks};}
export function modifierNames(value){return [...value.qualities.map(x=>x+(value.ranks?.[x]>1?` ${value.ranks[x]}`:'')),...value.flaws];}

export function migrateInventory(s){
 const aliases=new Map();for(const [i,p] of (s.purchases||[]).entries()){if(!p.uid){p.uid=`legacy-${i}`;aliases.set(`purchase-${i}`,`purchase-${p.uid}`);}}
 for(const field of ['gearState','gearChoices','gearRolls']){s[field]??={};for(const [oldKey,newKey]of aliases)for(const key of Object.keys(s[field]))if(key===oldKey||key.startsWith(oldKey+':')){s[field][newKey+key.slice(oldKey.length)]=s[field][key];delete s[field][key];}}
 for(const prefs of Object.values(s.gearState||{}))if(aliases.has(prefs.placement))prefs.placement=aliases.get(prefs.placement);
 if(aliases.has(s.coinStorage))s.coinStorage=aliases.get(s.coinStorage);
 for(const x of s.ledger||[])if(aliases.has(x.linkedGear))x.linkedGear=aliases.get(x.linkedGear);
 return s;
}
