import * as M from './rules.mjs';
import {creationSpecies,originProfile} from './origins.mjs';
import {elderSkills,highElfReferences,knownTechniques} from './high-elf.mjs';
import {dwarfReferences,knownRunes} from './dwarf-guide.mjs';
import {starSign,starEffect} from './astrology.mjs';
import {divineReference,knownCants} from './archives-iii.mjs';
import {womReferences} from './winds-of-magic.mjs';
import {legacySources,isLegacy} from './legacy.mjs';
import {randomTable} from './books.mjs';

// Acquisition context is separate from the definition: e.g. core Hardy via a Legacy origin.
export function legacyOption(R,s,kind,name){
 const sources=[],add=entry=>sources.push(...legacySources(R,entry));
 const definition=kind==='skill'?M.skillInfo(R,name,s):kind==='talent'?M.talentInfo(R,name):kind==='char'?null:(R[kind]||[]).find(x=>x.name===name||x.displayName===name);
 add(definition);
 for(const rule of R.rules||[]){
  const [group,key]=rule.path;
  if(kind==='skill'&&group==='skillOptions'&&key===M.base(name)&&rule.value?.some?.(v=>name===`${key} (${v})`))add(rule);
  if(kind==='talent'&&['talentOptions','talentLimits','talentEffects'].includes(group)&&key===M.base(name))add(rule);
 }
 const c=M.career(R,s),sp=creationSpecies(R,s),d=M.derive(R,s);
 if(kind==='skill'){
  if(M.speciesSkillSlots(R,s).some(x=>x.name===name&&s.speciesSkills.includes(x.key))||sp.languages.some(x=>name===`Language (${x})`))add(sp);
  for(const slot of M.careerSkillSlots(R,s,d.level))if((slot.name===name||M.options(R,slot.raw,'skill',s).includes(name))&&(d.currentSkills.includes(name)||(s.careerSkills[slot.key]||0)>0))add(slot);
  if(c.adaptationNotes?.length&&d.currentSkills.includes(name))add(c);
  if(elderSkills(R,s)[name])add({source:{book:'high-elf',page:53}});
 }
 if(kind==='talent'){
  const selected=M.freeTalents(R,s);
  if(selected.includes(name)&&name!==s.freeTalent)add(sp);
  if(name===s.freeTalent||M.careerTalentOptions(R,s,d.level).includes(name))add(c);
  if(starEffect(R,s).talent===name)add(starSign(R,s));
  for(const ref of divineReference(R,s))if(/^Bless |^Invoke /.test(name))add(ref);
  const patron=name.match(/^(?:Bless|Invoke) \((.*)\)$/)?.[1];
  if(patron)add(R.cults.find(x=>x.name===patron));
  for(const rule of R.rules||[])if(patron&&rule.path[0]==='gods'&&rule.value?.includes?.(patron))add(rule);
 }
 if(kind==='char'&&c.advanceScheme[name])add(c);
 for(const x of s.ledger||[])if(x.name===name&&x.type===({skill:'skill',talent:'talent',char:'char'}[kind]||kind))add(x);
 return {...definition,legacySources:sources};
}
export function legacyGear(R,s,slot,name=slot.name){
 const c=M.career(R,s),sources=legacySources(R,slot);
 if(/^(career|bonus|acquired)-/.test(slot.key))sources.push(...legacySources(R,c));
 for(const group of ['weapons','armour','gear','market'])for(const item of R[group]||[])if(item.name===name)sources.push(...legacySources(R,item));
 for(const group of ['gear','market'])for(const item of R[group]||[])if(item.id===slot.marketId)sources.push(...legacySources(R,item));
 if(s.species==='Ogre')sources.push({book:'archives-ii',page:31});
 return {legacySources:sources};
}
export function legacyMagic(R,s,entry){
 const sources=legacySources(R,entry);
 if(entry.lore==='Old Faith')sources.push({book:'archives-iii',page:58});
 if(s.career==='winds-of-magic:career:mundane-alchemist'&&entry.category==='Petty')sources.push({book:'winds-of-magic',page:39});
 for(const purchase of s.ledger||[])if(purchase.type==='spell'&&purchase.name===entry.name)sources.push(...legacySources(R,purchase));
 return {...entry,legacySources:sources};
}
export function legacyContext(R,s){
 const d=M.derive(R,s),entries=[creationSpecies(R,s),originProfile(R,s),M.career(R,s),s.careerRefinement,starSign(R,s),...highElfReferences(R,s),...dwarfReferences(R,s),...womReferences(R,s),...divineReference(R,s),...M.knownSpells(R,s).map(x=>legacyMagic(R,s,x)),...knownRunes(R,s,d.talents),...knownTechniques(R,s),...knownCants(R,s),...s.ledger];
 for(const name of d.talents)entries.push(legacyOption(R,s,'talent',name));
 for(const name of Object.keys(d.skills))if(d.skills[name]>0)entries.push(legacyOption(R,s,'skill',name));
 for(const kind of ['species','career','talent']){const table=randomTable(R,s,kind);if(table&&(s.rolls||[]).some(x=>x.source?.book===table.source.book&&x.source?.page===table.source.page))entries.push(table);}
 for(const p of s.purchases||[])entries.push((R.gear||[]).find(x=>x.id===p.id)||(R.market||[]).find(x=>x.id===p.id));
 return {legacySources:entries.flatMap(x=>legacySources(R,x))};
}
export function legacySummary(R,s){
 const context=legacyContext(R,s);
 return isLegacy(R,context)?`Legacy creation rules: ${[...new Set(context.legacySources.map(x=>R.books.find(b=>b.id===x.book)?.shortTitle||x.book))].join('; ')}. See the source and conversion notes in the complete record.`:'';
}
