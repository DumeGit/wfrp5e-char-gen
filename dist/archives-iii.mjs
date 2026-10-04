import {derive,knownSpells} from './rules.mjs';
export const archivesIII=R=>R.books.some(b=>b.id==='archives-iii');
export const oldFaith=R=>archivesIII(R)&&R.config.gods.includes('Old Faith');
export function spellChoices(R){return R.spells.flatMap(x=>x.specialisations?x.specialisations.map(target=>({...x,name:`${x.name} (${target})`,specialisation:target})):x);}
export function spellDefinition(R,name){return spellChoices(R).find(x=>x.name===name);}
export function cantGrants(R,s){
 if(!s.cants?.enabled)return [];
 const known=knownSpells(R,s),talents=derive(R,s).talents;
 return [...new Set((R.cants||[]).map(x=>x.lore))].flatMap(lore=>{
  const talent=`Arcane Magic (${lore})`,count=known.filter(x=>x.talent===talent).length;
  if(!talents.includes(talent)||!count)return [];
  return [{lore,count:count>=6?3:count>=3?2:1,spells:count,choices:R.cants.filter(x=>x.lore===lore)}];
 });
}
export function knownCants(R,s){return cantGrants(R,s).flatMap(g=>(s.cants?.choices?.[g.lore]||[]).slice(0,g.count).map(id=>g.choices.find(x=>x.id===id)).filter(Boolean));}
export function syncCants(R,s){if(!s.cants?.enabled)return;const grants=cantGrants(R,s);s.cants.choices=Object.fromEntries(grants.map(g=>[g.lore,(s.cants.choices?.[g.lore]||[]).slice(0,g.count)]));}
export function cantIssues(R,s){
 if(!s.cants?.enabled)return [];
 if(!archivesIII(R))return ['Enable Archives III to use optional Cants.'];
 return cantGrants(R,s).flatMap(g=>{const chosen=s.cants.choices?.[g.lore]||[];return chosen.length!==g.count||new Set(chosen).size!==g.count||chosen.some(id=>!g.choices.some(x=>x.id===id))?[`Choose ${g.count} distinct ${g.lore} Cants (Archives III p. 86).`]:[];});
}
export function validateIIIState(R,s){
 const mode=s.originTalentMode;
 if(mode!==undefined&&(!['fixed','random'].includes(mode)||!R.origins.some(o=>o.id===s.origin&&o.species===s.species&&o.randomTalentAlternative)))throw Error('Book pack: invalid regional fixed-or-random Talent choice.');
 if(s.cants===undefined)return;
 const c=s.cants;
 if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).some(k=>!['enabled','choices'].includes(k))||typeof c.enabled!=='boolean'||!c.choices||typeof c.choices!=='object'||Array.isArray(c.choices)||c.enabled&&!archivesIII(R))throw Error('Book pack: invalid optional Cant choices.');
 for(const [lore,ids]of Object.entries(c.choices))if(!(R.cants||[]).some(x=>x.lore===lore)||!Array.isArray(ids)||ids.length>3||new Set(ids.filter(Boolean)).size!==ids.filter(Boolean).length||ids.some(id=>typeof id!=='string'||id&&!R.cants.some(x=>x.id===id&&x.lore===lore)))throw Error('Book pack: unavailable or duplicate Cant choice.');
}
export function freeMagicIssues(R,s,grants){
 let start=0;const out=[],faith=[];
 for(const g of grants){const chosen=s.spells.slice(start,start+g.count);if(new Set(chosen.filter(Boolean)).size!==chosen.filter(Boolean).length)out.push(`Choose different free spells for ${g.talent}.`);if(chosen.length!==g.count||chosen.some(n=>!g.choices.some(x=>x.name===n)))out.push(`Choose ${g.count} free ${g.category==='Old Faith'?'Blessings':'spells'} for ${g.talent}.`);if(g.category==='Old Faith')faith.push(...chosen.filter(Boolean));start+=g.count;}
 if(new Set(faith).size!==faith.length)out.push('Choose different Old Faith Blessings for Bless and Invoke (Archives III p. 58).');
 const paid=s.ledger.filter(x=>x.type==='spell'&&x.talent==='Invoke (Old Faith)').map(x=>x.name);
 if(new Set([...faith,...paid]).size!==faith.length+paid.length)out.push('Old Faith Blessings already learned cannot be purchased or granted again (Archives III p. 58).');
 if(s.spells.filter(Boolean).length>start)out.push('Remove spells without a matching Talent grant.');
 return out;
}
export function divineReference(R,s){const talents=derive(R,s).talents;if(!archivesIII(R))return [];return [...(talents.some(t=>['Bless (Handrich)','Invoke (Handrich)'].includes(t))?[{source:{book:'archives-iii',page:47},text:'Handrich Miracles can follow a successful Test to improve its result. Failing to profit from a Miracle adds 1 Sin; the GM decides what counts as profit.'}]:[]),...(talents.some(t=>['Bless (Solkan)','Invoke (Solkan)'].includes(t))?[{source:{book:'archives-iii',page:55},text:'Solkan permits no Blessing or Miracle while his priest has any Sin or Corruption points. Ongoing Sin/Corruption tracking is outside this creator.'}]:[]),...(talents.some(t=>['Bless (Old Faith)','Invoke (Old Faith)'].includes(t))?[{source:{book:'archives-iii',page:58},text:'Choose six Blessings with Bless (Old Faith), then one additional Blessing with Invoke. Extra Blessings use core Miracle XP prices; only Invoke and purchased Blessings count toward that price.'}]:[])];}
