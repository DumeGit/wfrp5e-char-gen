import {elfDiscount} from './high-elf.mjs';
import {freeTalents,derive,career,base,knownSpells} from './rules.mjs';
import {creationSpecies} from './origins.mjs';
export const windsOfMagic=R=>R.books.some(b=>b.id==='winds-of-magic');
export const collegeLores=['Light','Metal','Life','Heavens','Shadows','Death','Fire','Beasts'];
export const collegeCareers={hierophant:'Light',alchemist:'Metal',druid:'Life',astromancer:'Heavens',shadowmancer:'Shadows',spiriter:'Death',pyromancer:'Fire',shaman:'Beasts'};
export const collegeLore=s=>collegeCareers[s.career?.replace('winds-of-magic:career:','')]||s.college||'';
export const collegeCareer=s=>Object.hasOwn(collegeCareers,s.career?.replace('winds-of-magic:career:',''));
export const affiliatedCareer=s=>collegeCareer(s)||['wizard','winds-of-magic:career:magister-vigilant'].includes(s.career);
export const mundaneAlchemist=s=>s.career==='winds-of-magic:career:mundane-alchemist';
export const pettySpellGrant=(R,s,count)=>windsOfMagic(R)&&mundaneAlchemist(s)?Math.min(count,4):count;
export const startingScryer=s=>s.career==='winds-of-magic:career:scryer';
export function psychometrySacrifice(R,s){return windsOfMagic(R)&&s.species==='Human'&&!startingScryer(s)&&Number.isInteger(s.psychometrySlot)&&s.psychometrySlot>=0&&s.psychometrySlot<s.randomTalents.length&&s.psychometrySlot<creationSpecies(R,s).randomTalents&&s.originTalentSlot!==`random-${s.psychometrySlot}`;}
export function psychicCareer(R,s){return ['mystic','hedge-witch','nun','priest','warrior-priest','witch','wizard','winds-of-magic:career:scryer','winds-of-magic:career:magister-vigilant','archives-iii:career:priest-of-handrich','archives-iii:career:priest-of-solkan','archives-iii:career:priestess-of-rhya','up-in-arms:career:priest-of-myrmidia'].includes(s.career)||collegeCareer(s);}
export function extraCareerSkills(R,s){
 if(!windsOfMagic(R)||!['Human','High Elf','Wood Elf'].includes(s.species))return [];
 const ts=[...freeTalents(R,s),...s.ledger.filter(x=>x.type==='talent').map(x=>x.name)];
 const allowed=s.career==='mystic'||s.career==='nun'&&ts.some(t=>/^(Bless|Invoke) \((Morr|Sigmar)\)$/.test(t))||['priest','warrior-priest'].includes(s.career)&&ts.some(t=>/^(Bless|Invoke) \(Morr\)$/.test(t));
 return allowed?[{key:'c1-wom-augury',raw:'Augury',name:'Augury',level:1,source:{book:'winds-of-magic',page:46}}]:[];
}
export function psychicSkillIssue(R,s,name,skills=derive(R,s).skills){
 if(!windsOfMagic(R)||!['Augury','Psychometry'].includes(name))return '';
 if(name==='Augury'&&!['Human','High Elf','Wood Elf'].includes(s.species))return 'Only Humans and Elves may learn Augury (Winds of Magic p. 46).';
 if(name==='Psychometry'&&s.species!=='Human')return 'Only Humans may learn Psychometry (Winds of Magic p. 48).';
 const other=name==='Augury'?'Psychometry':'Augury';
 if(skills[other]>0)return `Cannot possess both Augury and Psychometry (Winds of Magic p. 46).`;
 if(name==='Psychometry'&&!startingScryer(s)){
  if(!psychometrySacrifice(R,s))return 'Give up a random Species Talent to unlock Psychometry; no free points are granted (Winds of Magic p. 48, approved Fifth Edition adaptation).';
  if(!psychicCareer(R,s))return 'Psychometry advancement requires Mystic, Hedge Witch, Nun, Priest, Scryer, Warrior Priest, Witch or Wizard (Winds of Magic p. 48).';
 }
 return '';
}
export function womTalentIssue(R,s,name,talents){
 if(!windsOfMagic(R))return '';
 if(mundaneAlchemist(s)&&s.species!=='Human'&&(name==='Petty Magic'||base(name)==='Arcane Magic'))return 'Dwarf and Halfling Mundane Alchemists cannot become spellcasters (Winds of Magic p. 39).';
 if(affiliatedCareer(s)&&base(name)==='Arcane Magic'){
  const lore=name.match(/\((.*)\)/)?.[1],owned=talents.filter(t=>base(t)==='Arcane Magic');
  if(!collegeLores.includes(lore))return 'This Wizard Career follows one of the eight College Lores (Winds of Magic p. 35).';
  if(!owned.length&&lore!==collegeLore(s))return `First learn Arcane Magic (${collegeLore(s)||'your chosen College Lore'}) to match your College (Winds of Magic p. 35).`;
 }
 return '';
}
export function womSpellAllowed(R,s,spell){
 if(!windsOfMagic(R)||!mundaneAlchemist(s))return true;
 return ['Bearings','Open Lock','Shock','Warning','Mundane Aura','Ward','Enchant Weapon','Fool’s Gold','Forge of Chamon','Mutable Metal'].includes(spell.name);
}
export function quoteRitual(R,s,name,talent){
 const ritual=R.spells.find(x=>x.name===name&&x.ritual);if(!ritual)return null;
 const d=derive(R,s),lores=[...new Set(d.talents.filter(t=>base(t)==='Arcane Magic'))];
 const eligible=lores.filter(t=>ritual.ritual.lores.includes('*')||ritual.ritual.lores.includes(t.match(/\((.*)\)/)?.[1]));
 const chosen=talent||eligible.find(t=>ritual.ritual.discountLores?.includes(t.match(/\((.*)\)/)?.[1]))||eligible[0],lore=chosen?.match(/\((.*)\)/)?.[1];
 const normal=ritual.ritual.discountLores?.includes(lore)?ritual.ritual.discountXP:ritual.ritual.learningXP,cost=elfDiscount(R,s,'spell',name,normal);
 const error=mundaneAlchemist(s)?'Mundane Alchemists are limited to their ten printed spells (Winds of Magic p. 39).':!eligible.includes(chosen)?`Requires Arcane Magic for ${ritual.ritual.lores.includes('*')?'a Lore':ritual.ritual.lores.join(', ')} (Winds of Magic p. ${ritual.page}).`:knownSpells(R,s).some(x=>x.name===name&&x.ritual)?'Already known.':cost>d.remaining?'Not enough XP.':'';
 return {type:'spell',name,talent:chosen||'',cost,tick:false,page:ritual.page,source:ritual.source,definition:ritual.source,error,...(normal!==cost?{discount:'Blood of Aenarion: ritual memorisation included by user-approved interpretation; High Elf Guide p. 51'}:{})};
}
export function womIssues(R,s){
 if(!windsOfMagic(R))return [];
 const d=derive(R,s),out=[];
 if(affiliatedCareer(s)&&!collegeLore(s))out.push('Choose your College affiliation (Winds of Magic p. 35).');
 if(affiliatedCareer(s)&&d.talents.some(t=>base(t)==='Arcane Magic')&&!d.talents.includes(`Arcane Magic (${collegeLore(s)})`))out.push('Your first Arcane Lore must match your College affiliation (Winds of Magic p. 35).');
 if(s.psychometrySlot!==undefined&&!psychometrySacrifice(R,s))out.push('Choose an available random Species Talent to give up for Psychometry (Winds of Magic p. 48).');
 if(psychometrySacrifice(R,s)&&d.skills.Augury>0)out.push('Cannot unlock Psychometry while possessing Augury (Winds of Magic p. 46).');
 for(const name of ['Augury','Psychometry'])if(d.skills[name]>0){const error=psychicSkillIssue(R,s,name,d.skills);if(error)out.push(error);}
 const slots=extraCareerSkills(R,s);if(s.careerSkills['c1-wom-augury']&&!slots.length)out.push('Augury requires a matching Career and patron before allocating Career Skill Advances (Winds of Magic p. 46).');
 for(const t of d.talents){const error=womTalentIssue(R,s,t,d.talents.filter(x=>x!==t));if(error)out.push(error);}
 for(const [i,x]of s.ledger.entries())if(x.type==='spell'){
  const spell=R.spells.find(sp=>sp.name===x.name);
  if(spell&&!womSpellAllowed(R,s,spell))out.push(`Mundane Alchemist cannot learn ${x.name} (Winds of Magic p. 39).`);
  if(spell?.ritual){const q=quoteRitual(R,{...s,ledger:s.ledger.slice(0,i)},x.name,x.talent);if(q.error||q.cost!==x.cost)out.push(`Saved ritual ${x.name}: ${q.error||'XP cost does not match its printed learning price.'}`);}
 }
 return [...new Set(out)];
}
export function validateWoMState(R,s){
 if(s.college!==undefined&&(!windsOfMagic(R)||typeof s.college!=='string'||s.college&&!collegeLores.includes(s.college)))throw Error('Book pack: invalid College affiliation.');
 if(s.psychometrySlot!==undefined&&(!windsOfMagic(R)||!Number.isInteger(s.psychometrySlot)||!psychometrySacrifice(R,s)))throw Error('Book pack: invalid Psychometry Talent sacrifice.');
}
export function womReferences(R,s){
 if(!windsOfMagic(R))return [];
 const out=[];
 if(affiliatedCareer(s))out.push({source:{book:'winds-of-magic',page:35},text:`College affiliation: ${collegeLore(s)||'not chosen'}. The generic Wizard remains valid; every College-affiliated Wizard follows that order and its associated Lore and arcane marks.`});
 if(mundaneAlchemist(s))out.push({source:{book:'winds-of-magic',page:39},text:career(R,s).text+' Approved Fifth Edition adaptation: Petty Magic grants the smaller of the Willpower Bonus at acquisition or four distinct permitted spells. No extra spell is banked or exchanged for XP.'});
 if(psychometrySacrifice(R,s))out.push({source:{book:'winds-of-magic',page:48},text:`Gave up random Species Talent ${s.psychometrySlot+1}: ${s.randomTalents[s.psychometrySlot]}. Psychometry is unlocked for paid advancement in the listed Careers, with 0 free Skill points. Non-career prices apply unless it is actually a Career Skill.`});
 return out;
}
