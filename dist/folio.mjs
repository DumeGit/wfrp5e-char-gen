import {knownCants} from './archives-iii.mjs';
import {derive,skillInfo,knownSpells} from './rules.mjs';
import {gearSlots,gearOptions,equipment} from './equipment.mjs';

const units={Candles:'Candle',Matches:'Match',Bandages:'Bandage',Arrows:'Arrow',Bolts:'Bolt',Shots:'Shot',Bullets:'Bullet','Lead Bullets':'Lead Bullet','Stone Bullets':'Stone Bullet',Bolas:'Bola','Throwing Knives':'Throwing Knife',Barges:'Barge',Wagons:'Wagon','Sets of Clothing':'Clothing','different sets of Clothing':'Clothing','sheets of Parchment':'Parchment'};
function itemParts(text){
 const container=text.match(/^(.+?) containing (.+)$/);
 if(container)return [...itemParts(container[1]),...container[2].split(/,\s*| and /).flatMap(itemParts)];
 const ammo=text.match(/^(.+?) with (\d+ .+)$/);
 if(ammo)return [...itemParts(ammo[1]),...itemParts(ammo[2])];
 if(/^\d+ .+ and \d+ /.test(text))return text.split(' and ').flatMap(itemParts);
 const pack=text.match(/^(.+?) \((dozen|\d+)\)$/i);
 if(pack)return [{name:units[pack[1]]||pack[1],quantity:pack[2].toLowerCase()==='dozen'?12:Number(pack[2])}];
 const amount=text.match(/^(\d+|\{?\d+d10\}?) (.+)$/);
 if(amount)return [{name:units[amount[2]]||amount[2],quantity:/d10/.test(amount[1])?null:Number(amount[1])}];
 return [{name:units[text]||text,quantity:1}];
}
export function folioGear(R,s){
 const grouped=new Map();
 for(const slot of gearSlots(R,s)){
  const choices=gearOptions(slot.name,R);
  const chosen=choices.includes(s.gearChoices[slot.key])?s.gearChoices[slot.key]:choices[0];
  const text=chosen.replace(/\{?(\d+)d10\}?/g,m=>s.gearRolls[`${slot.key}:${m}`]??m);
  for(const item of itemParts(text)){
   const key=item.name.toLocaleLowerCase(),existing=grouped.get(key);
   if(existing)existing.quantity=existing.quantity===null||item.quantity===null?null:existing.quantity+item.quantity;
   else grouped.set(key,{...item});
  }
 }
 return [...grouped.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
export function folioData(R,s){
 const d=derive(R,s),load=equipment(R,s).penalties,counts=new Map();
 for(const name of d.talents)counts.set(name,(counts.get(name)||0)+1);
 return {
  skills:Object.entries(d.skills).filter(([,points])=>points>0).map(([name,points])=>({name,value:((skillInfo(R,name,s)?.char==='Ag'&&load.complete)?load.agility:d.stats[skillInfo(R,name,s)?.char])+Math.round(points*5)})).sort((a,b)=>a.name.localeCompare(b.name)),
  talents:[...counts].map(([name,value])=>({name,value})).sort((a,b)=>a.name.localeCompare(b.name)),
  magic:[...knownSpells(R,s).map(x=>({name:x.displayName||x.name})),...knownCants(R,s).map(x=>({name:`${x.name} · ${x.lore} Cant`}))].sort((a,b)=>a.name.localeCompare(b.name)),
  gear:folioGear(R,s).map(({name,quantity})=>({name,value:quantity}))
 };
}
