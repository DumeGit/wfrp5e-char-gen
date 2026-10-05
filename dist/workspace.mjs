// Presentation models. All eligibility, prices and totals come from the existing rules.
import * as M from './rules.mjs';
import {creationSpecies,careerAvailable} from './origins.mjs';
import {equipment} from './equipment.mjs';
import {purse} from './market.mjs';
import {dwarfGearIssue} from './dwarf-guide.mjs';
import {starEffect} from './astrology.mjs';
import {bloodAdjustments} from './high-elf.mjs';

export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function bookSummary(pack){
 const d=pack.data,parts=[];
 for(const [key,label] of [['species','Species'],['origins','origins'],['careers','Career profiles'],['talents','Talents'],['spells','magic profiles'],['runes','runes'],['techniques','techniques'],['cants','Cants']]){
  const count=Array.isArray(d[key])?d[key].length:Object.keys(d[key]||{}).length;
  if(count)parts.push(`${count} ${label}`);
 }
 const gear=['weapons','armour','gear','market'].reduce((n,k)=>n+(d[k]?.length||0),0);
 if(gear)parts.push(`${gear} equipment profiles / shop entries`);
 return parts.join(' · ')||'Optional rules and source references';
}

export function careerResults(R,s,{query='',className='All classes',book='all'}={}){
 const q=query.trim().toLowerCase();
 return R.careers.filter(c=>careerAvailable(R,s,c)).filter(c=>(className==='All classes'||c.class===className)&&(book==='all'||c.source.book===book)&&(!q||`${c.name} ${c.class} ${c.levels[0].name} ${c.levels[0].skills.join(' ')}`.toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name));
}

export function careerDifferences(before,after){
 const rows=[];
 for(const key of M.KEYS)if(before.advanceScheme[key]!==after.advanceScheme[key])rows.push({label:`${key} available`,before:before.advanceScheme[key]?`Level ${before.advanceScheme[key]}`:'Non-career',after:after.advanceScheme[key]?`Level ${after.advanceScheme[key]}`:'Non-career'});
 for(let i=0;i<Math.max(before.levels.length,after.levels.length);i++){
  const a=before.levels[i],b=after.levels[i];if(!a||!b)continue;
  for(const key of ['name','status','standing','skills','talents','trappings']){
   const old=Array.isArray(a[key])?a[key].join(', '):a[key],next=Array.isArray(b[key])?b[key].join(', '):b[key];
   if(old!==next)rows.push({label:`Level ${i+1} ${key}`,before:old,after:next});
  }
 }
 return rows;
}

export function shopCategory(R,item){
 const printed=item.category||'',weapon=R.weapons.find(x=>x.name===item.name);
 if(/ammunition/i.test(printed))return 'Ammunition';
 if(/siege/i.test(printed))return 'Siege equipment';
 if(/armour|shield/i.test(printed)||R.armour.some(x=>x.name===item.name))return 'Armour & shields';
 if(weapon||/weapon/i.test(printed))return weapon?.kind==='ranged'||/ranged/i.test(printed)?'Ranged weapons':'Melee weapons';
 if(/robe|clothing|pack/i.test(printed))return 'Clothing & carrying';
 if(/ingredient|enchant|artefact/i.test(printed))return 'Magic supplies';
 if(/food|drink/i.test(printed))return 'Food & drink';
 if(/herb|remed|poison/i.test(printed))return 'Herbs, remedies & poisons';
 if(/animal|vehicle/i.test(printed))return 'Animals & vehicles';
 if(/book|document/i.test(printed))return 'Books & documents';
 if(/tool|kit|trade|prosthetic/i.test(printed))return 'Tools & specialist equipment';
 return 'Other belongings';
}

export function purchaseReason(R,s,item){
 const restriction=dwarfGearIssue(R,s,item);
 if(restriction)return restriction;
 if(item.sizeUnresolved||item.useUnresolved)return item.sizeNote||'This profile requires GM review.';
 if(!s.wealth)return 'Roll starting wealth first.';
 const money=purse(R,s).remaining;
 return item.pennies>money?`Need ${item.pennies-money} more brass pennies; your purse cannot cover this price.`:'';
}

export function talentCalculation(R,name){
 const key=R.config.talentEffects[name];
 if(key)return `Included in your totals when learned: +5 ${key} per purchase.`;
 const base=M.base(name);
 if(['Petty Magic','Arcane Magic','Chaos Magic','Witch!','Bless','Invoke'].includes(base))return 'Included in your choices: magical/divine access and free grants follow this Talent’s rules. Casting and prayer effects remain references for play.';
 if(['Rune Magic','Master Rune Magic','High Magic','Blessed by Isha','Sword-dancing'].includes(base))return 'Included in your choices: enables the corresponding knowledge under its own prerequisites and learning rules. This grants no enchanted equipment or live casting effects.';
 if(['Craftsman','Seasoned Traveller'].includes(base))return 'Included in your choices: eligible Skills become available for paid advancement. Situational effects remain references for play.';
 if(base==='Linguistics')return 'Included in your XP prices: non-Magick Language Advances use the printed 50 XP price. Other effects remain references for play.';
 const effects={Hardy:'Included in your totals when learned: Toughness Bonus added to Wounds, with Size applied.',Luck:'Included in your totals when learned: +1 maximum Fortune per purchase.','Fleet-footed':'Included in your totals when learned: +1 Movement.',Sturdy:'Included in your totals when learned: carrying capacity uses your selected printed formula.','Strong Back':'Included in your totals when learned: carrying capacity follows the printed rank benefits.'};
 return effects[name]||'Reference for play: situational effects are described here; they are not added to displayed scores.';
}

export function calculation(R,s,kind,name){
 const d=M.derive(R,s),eq=equipment(R,s),sp=R.species[s.species];
 if(kind==='char'){
  const i=M.KEYS.indexOf(name),rolled=s.charMode==='points'?s.points[i]:(s.charRolls[s.assignment[i]]??10),talents=d.talents.filter(t=>R.config.talentEffects[t]===name).length*5;
  const rows=[['Species',sp.offsets[name]],[s.charMode==='points'?'Point allocation':'Assigned roll',rolled],['Career starting increase',Number(s.boost[name])||0],['Star sign',starEffect(R,s).adjustments[name]||0],['Ancestry',bloodAdjustments(R,s)[name]||0],['Permanent Talent bonuses',talents],['Purchased Advances',d.charAdv[name]],['Intrinsic total',d.stats[name]]];
  if(name==='Ag')rows.push(['With equipment / load',eq.penalties.complete?eq.penalties.agility:'Unresolved: equipment weight is missing']);
  return {title:`${name}: calculation`,rows,note:'Starting increases and Talent bonuses are not purchased Advances. Core pp. 38–40, 191; selected supplement effects retain their source.'};
 }
 if(kind==='skill'){
  const info=M.skillInfo(R,name,s),key=info?.char,base=key==='Ag'&&eq.penalties.complete?eq.penalties.agility:d.stats[key],native=creationSpecies(R,s).languages.some(l=>name===`Language (${l})`)?30:0;
  const species=M.speciesSkillSlots(R,s).filter(x=>x.name===name&&s.speciesSkills.includes(x.key)).length*5,career=M.careerSkillSlots(R,s,1).filter(x=>x.name===name).reduce((n,x)=>n+(s.careerSkills[x.key]||0)*5,0),free=Math.round((M.freeSkills(R,s)[name]||0)*5),paid=Math.round((d.paidSkills[name]||0)*5);
  return {title:`${name}: calculation`,rows:[[`Governing Characteristic (${key})`,base],['Native language',native],['Species allocation',species],['Career allocation',career],['Additional Elder allocation',free-native-species-career],['Purchased Advances',paid],['Skill total',base+free+paid]],note:'Situational Test modifiers remain in reference text. Agility uses known load effects; if load is unresolved, this is the intrinsic score.'};
 }
 if(name==='Wounds')return {title:'Wounds: calculation',rows:[['Size',d.size],['Strength Bonus',d.sb],['Toughness Bonus',d.tb],['Willpower Bonus',d.wpb],['Hardy',d.talents.includes('Hardy')?d.tb:0],['Total Wounds',d.wounds]],note:d.size==='Small'?'Small: 2 × TB + Hardy TB (core p. 361).':`${d.size==='Large'?'Large: double ':''}(SB + 2 × TB + WPB + Hardy TB), core pp. 40, 120, 361.`};
 if(name==='Capacity')return {title:'Carrying capacity: calculation',rows:[['Strength Bonus',d.sb],['Toughness Bonus',d.tb],['Sturdy formula',s.sturdyRule==='creation'?'2 × (SB + TB), p. 40':'2 × SB + TB, p. 127'],['Sturdy applies',s.sturdyRule==='creation'?(s.species==='Dwarf'||d.talents.includes('Sturdy')?'Yes':'No'):(d.talents.includes('Sturdy')?'Yes':'No')],['Strong Back ranks',d.talents.filter(x=>x==='Strong Back').length],['Species multiplier',sp.mechanics?.capacityMultiplier||1],['Final capacity',d.capacity],['Known carried Enc',eq.total]],note:'Strong Back adds 1 at one rank or 3 at two or more. Ogre capacity doubles after carrying Talents. Automatic packing ignores coin weight; unknown weights remain unknown.'};
 if(name==='Movement')return {title:'Movement: calculation',rows:[['Species Movement',sp.movement],['Fleet-footed',d.talents.includes('Fleet-footed')?1:0],['Intrinsic Movement',d.movement],['With load',eq.penalties.complete?eq.penalties.movement:'Unresolved']],note:'Walk is twice Movement; run is four times Movement. Equipment/load follows core p. 299.'};
 if(name==='Fate'||name==='Fortune'){
  const fate=name==='Fate',initial=fate?sp.fate:sp.fortune,longbeard=R.books.some(x=>x.id==='dwarf-guide')&&s.species==='Dwarf'&&s.longbeard?-1:0,random=fate?(s.speciesMode==='first'&&s.careerMode==='first'&&s.charMode==='first'?1:0):(s.speciesMode==='first'?1:0),luck=fate?0:d.talents.filter(x=>x==='Luck').length;
  const before=initial+longbeard+random+luck,final=d[name.toLowerCase()];
  return {title:`${name}: calculation`,rows:[['Species starting value',initial],['Longbeard',longbeard],[fate?'All three first rolls accepted':'First Species roll accepted',random],...(!fate?[['Luck ranks',luck]]:[]),['High Elf ancestry / Elder adjustment',final-before],['Starting maximum',final]],note:'Fate and Fortune are separate. High Elf ancestry takes precedence over Elder reductions; no resources are spent in this creator.'};
 }
 throw Error('Unknown calculation.');
}
