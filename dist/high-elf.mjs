// Reviewed creator mechanics from the supplied High Elf Guide. Play remains reference only.
import * as M from './rules.mjs';
import {originProfile,careerAvailable} from './origins.mjs';
import {randomTable,tableResult} from './books.mjs';
export const highElfGuide=R=>R.books.some(b=>b.id==='high-elf');
export const asur=(R,s)=>highElfGuide(R)&&s.species==='High Elf';
export const mage=s=>s.career==='high-elf:career:mage';
export const WINDS={Fire:'Aqshy',Heavens:'Azyr',Metal:'Chamon',Beasts:'Ghur',Life:'Ghyran',Light:'Hysh',Death:'Shyish',Shadows:'Ulgu'};
export const elfState=s=>s.highElf||{};
export const birthEra=(R,s)=>asur(R,s)?R.highElfCreation.eras.find(x=>x.id===elfState(s).era):null;
export function elderEras(R,s){const eras=R.highElfCreation?.eras||[],index=eras.findIndex(x=>x.id===birthEra(R,s)?.id);return index>0?eras.slice(1,index+1).reverse():[];}
export const blood=(R,s)=>asur(R,s)&&(elfState(s).ancestry==='chosen'||elfState(s).ancestry==='rolled'&&elfState(s).bloodRoll?.success===true);
export function bloodPsychology(R,s){const face=elfState(s).psychology;return blood(R,s)?R.highElfCreation.psychologies.find(x=>face>=x.min&&face<=x.max):null;}
export const bloodAdjustments=(R,s)=>bloodPsychology(R,s)?.adjustments||{};
export const bloodGrants=(R,s)=>blood(R,s)?['Blood of Aenarion']:[];
export function startingElfResources(R,s,fate,fortune){
 const era=birthEra(R,s);
 if(era&&era.id!=='ending'){
  if(era.id==='shadows'){fate=0;fortune=0;}
  else if(elfState(s).elderResource==='Fate')fate=Math.max(0,fate-1);
  else if(elfState(s).elderResource==='Fortune')fortune=Math.max(0,fortune-1);
 }
 if(blood(R,s))fate++;
 return {fate,fortune};
}
export function elfDiscount(R,s,type,name,cost){
 if(!blood(R,s))return cost;
 const benefit=elfState(s).prodigy;
 if(benefit==='magic'&&type==='spell')return cost/2;
 if(benefit==='martial'&&type==='talent'&&['Combat Reflexes','Fleet-footed','Lightning Reflexes','Marksman','Sharp','Very Strong','Warrior Born'].includes(name))return cost/2;
 return cost;
}
export function highElfCareer(R,s,original){
 const o=originProfile(R,s);
 if(!asur(R,s)||o?.source.book!=='high-elf'||o.name==='Sea Elf'&&s.career!=='sailor')return original;
 if(!original)return original;
 const c=structuredClone(original),notes=[];
 const replace=(level,kind,from,to,page)=>{
  const l=c.levels[level-1],at=l?.[kind].indexOf(from);
  if(at>=0){if(to===null)l[kind].splice(at,1);else l[kind][at]=to;notes.push({page,text:`${l.name}: ${from} → ${to||'removed'}.`});}
 };
 if(c.id==='soldier')for(const l of c.levels){
  replace(l.level,'skills','Ranged (Blackpowder)',null,60);
  const ranged=M.options(R,'Ranged (Any One)').filter(x=>x!=='Ranged (Blackpowder)').map(x=>x.match(/\((.*)\)/)?.[1]);
  replace(l.level,'skills','Ranged (Any One)',`Ranged (${ranged.join(', ')})`,60);
 }
 if(c.id==='up-in-arms:career:artillerist')for(const l of c.levels)replace(l.level,'skills','Ranged (Blackpowder, Catapult, Crossbow, or Engineering)','Ranged (Catapult, Crossbow, or Engineering)',60);
 if(c.id==='cavalryman'){replace(1,'skills','Ranged (Blackpowder or Bow)','Track or Ranged (Bow)',60);replace(1,'trappings','Bow with 10 Arrows or Pistol with 10 Shots','Elf Bow with 10 Arrows',60);}
 if(c.id==='wizard')replace(2,'trappings','Magic Licence',null,60);
 if(c.id==='artisan'){
  replace(2,'talents','Etiquette (Guilder)','Etiquette (Nobles)',62);
  replace(2,'trappings','Guild Licence','Highborn Patronage',62);
  replace(3,'skills','Secret Signs (Guilder)','Lore (Magic)',62);
  replace(4,'trappings','Guild','Position at Court',62);c.levels[3].name='Exalted Maker';
 }
 if(c.id==='merchant')replace(2,'trappings','Guild Licence','Merchant’s Charter',62);
 if(c.id==='protagonist')replace(1,'trappings','Knuckledusters','Sword',63);
 if(c.id==='pit-fighter'&&elfState(s).careerVariant==='feint')replace(1,'talents','Dirty Fighting','Feint',60);
 if(c.id==='sailor'&&elfState(s).careerVariant==='elven-ship'){
  replace(1,'skills','Consume Alcohol',null,63);replace(1,'skills','Melee (Brawling)','Melee (Basic)',63);
  if(!c.levels[1].skills.includes('Intuition'))c.levels[1].skills.push('Intuition');
  notes.push({page:63,text:'User-approved Elven ship adaptation: keep core Athletics at L1 once, remove Consume Alcohol, replace Brawling with Basic and add Intuition at L2. Normal eight free Career Advances remain.'});
 }
 if(c.id==='up-in-arms:career:light-cavalry')for(const l of c.levels)if(l.name==='Captain'){replace(l.level,'skills','Ranged (Blackpowder)','Secret Signs (Scout)',60);replace(l.level,'trappings','Brace of Pistols with Gunpowder and Ammunition or Bow with Quiver of 10 Arrows','Magic Weapon or Bow with Quiver of 10 Arrows',60);}
 if(c.id==='entertainer'||c.id==='warden'&&['Tiranoc','The Shadowlands','Chrace','Cothique','Yvresse'].includes(o.name)){
  c.levels.forEach(l=>l.standing++);notes.push({page:c.id==='warden'?61:62,text:'Ulthuan regional Standing +1 at every Career level.'});
 }
 if(notes.length){c.adaptationNotes=notes;c.text=[c.text,...notes.map(x=>`${x.text} High Elf Guide p. ${x.page}`)].filter(Boolean).join(' ');}
 return c;
}
export function elderSkillSlots(R,s,history){
 const c=R.careers.find(x=>x.id===history.career);if(!c)return [];
 // Past careers use first-level choices only, with the same regional context.
 const profile=highElfCareer(R,s,c);
 return profile.levels[0].skills.map((raw,i)=>{const opts=M.options(R,raw,'skill',s),key=String(i);return {key,raw,name:opts.includes(history.choices?.[key])?history.choices[key]:opts[0],options:opts};});
}
export function elderSkills(R,s){
 const out={};if(!asur(R,s))return out;
 const allowed=new Set(elderEras(R,s).map(x=>x.id));
 for(const h of elfState(s).history||[])if(allowed.has(h.era))for(const slot of elderSkillSlots(R,s,h)){
  const n=h.points?.[slot.key]||0;if(Number.isInteger(n)&&n>0)out[slot.name]=(out[slot.name]||0)+n;
 }
 return Object.fromEntries(Object.entries(out).map(([name,n])=>[name,n/5]));
}
export function selectElfEra(R,s,id){
 if(s.ledger.length)throw Error('Undo advancement before changing Elder creation.');
 const era=R.highElfCreation.eras.find(x=>x.id===id);if(!era&&id)throw Error('Choose a printed era.');
 const e=s.highElf??={};e.era=id;delete e.elderAge;delete e.ageRolled;
 const old=e.history||[];e.history=elderEras(R,s).map(x=>old.find(h=>h.era===x.id)||{era:x.id,career:'',mode:'chosen',points:{},choices:{}});
 if(!e.elderResource)e.elderResource='Fortune';
}
export function rollElderCareer(R,s,era,roll){
 const h=elfState(s).history?.find(x=>x.era===era);if(!h)throw Error('Choose an Elder era first.');
 if(s.ledger.length)throw Error('Undo advancement before changing a past Career.');
 if(h.roll)throw Error('This era’s Career roll is already recorded; retain it or choose a Career for 10 points.');
 const table=randomTable(R,s,'career');if(!table)throw Error('Choose a printed Career table.');
 const face=roll(table.sides,table.page,`Elder ${era} Career`,table.source,1),id=tableResult(table,face);
 if(!careerAvailable(R,s,R.careers.find(x=>x.id===id)))throw Error('The rolled past Career is unavailable to this origin.');
 Object.assign(h,{career:id,mode:'rolled',points:{},choices:{},roll:{face,table:table.id,career:id}});return h;
}
export function rollBlood(R,s,roll){
 if(!asur(R,s)||s.ledger.length)throw Error('Choose High Elf and finish ancestry before XP spending.');
 const e=s.highElf??={};if(e.bloodRoll)throw Error('Ancestry has already been rolled for this character.');
 const noble=s.career==='noble'||M.freeTalents(R,s).includes('Noble Blood'),chance=noble?5:1;
 const face=roll(100,51,'Blood of Aenarion ancestry',{book:'high-elf',page:51},1);
 e.bloodRoll={face,chance,success:face<=chance};e.ancestry='rolled';return e.bloodRoll;
}
export function mageLoreCount(R,s,lore,talents=M.derive(R,s).talents){
 const all=talents.filter(t=>M.base(t)==='Arcane Magic'),current=`Arcane Magic (${lore})`,prior=new Set(all.slice(0,all.indexOf(current))),known=M.knownSpells(R,s);
 return known.filter(x=>!x.ritual&&x.talent===current&&[lore,'Arcane','Elven Arcane'].includes(x.category)&&!(x.category==='Arcane'&&known.some(y=>y.name===x.name&&prior.has(y.talent)))).length;
}
export function mageNextLoreIssue(R,s,d){
 const last=d.talents.filter(t=>M.base(t)==='Arcane Magic').at(-1),lore=last?.match(/\((.*)\)/)?.[1];if(!last)return '';
 const points=Math.round((d.skills[`Channelling (${WINDS[lore]})`]||0)*5),spells=mageLoreCount(R,s,lore,d.talents);
 return points<10||spells<4?`Mage requires 10 Channelling (${WINDS[lore]}) points and 4 qualifying ${lore} spells before another Lore (${points}/10 points, ${spells}/4 spells; High Elf Guide p. 79).`:'';
}
export function highElfTalentIssue(R,s,name,d){
 if(!highElfGuide(R))return '';
 if(name==='Blessed by Isha'){
  if(!s.species.endsWith('Elf'))return 'Blessed by Isha is only for Elves (High Elf Guide p. 83).';
  if(!mage(s)||d.level<3)return 'Complete Student Mage before Blessed by Isha (High Elf Guide p. 80).';
  if(d.stats.WP<80)return 'Blessed by Isha requires Willpower 80 (High Elf Guide p. 80).';
  if(!d.talents.includes('Petty Magic')||M.knownSpells(R,s).filter(x=>x.category==='Petty'&&R.highElfCreation.pettySpells.includes(x.name)).length<4)return 'Requires Petty Magic and four of the guide’s six Petty spells (High Elf Guide pp. 79–81).';
  for(const [lore,wind]of Object.entries(WINDS))if(!d.talents.includes(`Arcane Magic (${lore})`)||(d.skills[`Channelling (${wind})`]||0)*5<10||mageLoreCount(R,s,lore,d.talents)<4)return `Requires all eight Colour Lores, 10 points in each Channelling Skill and 4 qualifying spells in each Lore; ${lore} is incomplete (High Elf Guide p. 80).`;
 }
 if(name==='High Magic'&&(!d.talents.includes('Blessed by Isha')||!d.skills['Channelling (Qhaysh)']))return 'Requires Blessed by Isha and an Advance in Channelling (Qhaysh) (High Elf Guide p. 83).';
 return '';
}
export function highElfAdvanceIssue(R,s,type,name,amount,d){
 if(!highElfGuide(R))return '';
 if(type==='skill'&&name==='Channelling (Qhaysh)'){
  const least=Math.min(...Object.values(WINDS).map(w=>Math.round((d.skills[`Channelling (${w})`]||0)*5))),next=Math.round((d.skills[name]||0)*5)+amount;
  if(next>least)return `Channelling (Qhaysh) cannot exceed any of the eight Colour Channelling totals (lowest ${least}, proposed ${next}; High Elf Guide p. 83).`;
 }
 if(type==='promotion'&&mage(s)&&d.level===1&&M.knownSpells(R,s).filter(x=>x.category==='Petty'&&R.highElfCreation.pettySpells.includes(x.name)).length<4)return 'Learn four of the guide’s six Petty spells before becoming Student Mage (High Elf Guide p. 79).';
 return '';
}
export function knownTechniques(R,s){
 if(!highElfGuide(R))return [];
 const names=[...(M.derive(R,s).talents.includes('Sword-dancing')?['Ritual of Cleansing']:[]),...s.ledger.filter(x=>x.type==='technique').map(x=>x.name)];
 return R.techniques.filter(x=>names.includes(x.name));
}
export function quoteTechnique(R,s,name){
 const d=M.derive(R,s),known=knownTechniques(R,s),definition=R.techniques.find(x=>x.name===name),cost=100*known.length;
 return {type:'technique',name,cost,tick:false,page:68,source:{book:'high-elf',page:68},definition:definition?.source,error:!definition?'Choose a printed Sword-dancing technique.':!d.talents.includes('Sword-dancing')?'Requires Sword-dancing (High Elf Guide p. 68).':known.some(x=>x.name===name)?'Already known.':cost>d.remaining?'Not enough XP.':''};
}
export function quoteElfSpell(R,s,name,talent){
 if(!highElfGuide(R))return null;
 const spell=R.spells.find(x=>x.name===name);if(!['High Magic','Elven Arcane'].includes(spell?.category))return null;
 const d=M.derive(R,s),known=M.knownSpells(R,s),arcane=d.talents.filter(t=>M.base(t)==='Arcane Magic'),owner=spell.category==='High Magic'?'High Magic':arcane.at(-1);
 const count=known.filter(x=>spell.category==='High Magic'?x.category==='High Magic':x.talent===owner&&!x.ritual).length;
 const normal=spell.category==='High Magic'?200*Math.max(1,Math.ceil(count/Math.max(1,Math.floor(d.stats.Int/10)))):100*(Math.min(4,Math.floor(Math.max(0,count-1)/5))+1),cost=elfDiscount(R,s,'spell',name,normal);
 let error=spell.category==='High Magic'&&!d.talents.includes('High Magic')?'Requires High Magic (High Elf Guide p. 83).':spell.category==='Elven Arcane'&&spell.requiredLores.some(l=>!arcane.includes(`Arcane Magic (${l})`))?`Requires Arcane Magic for ${spell.requiredLores.join(' and ')} (High Elf Guide p. ${spell.page}).`:talent&&talent!==owner?'Elven Arcane spells belong to the latest acquired Colour Lore; High Magic spells use High Magic.':'';
 if(!error&&known.some(x=>x.name===name))error='Already known.';
 if(!error&&cost>d.remaining)error='Not enough XP.';
 return {type:'spell',name,talent:owner||'',cost,tick:false,page:spell.category==='High Magic'?83:115,source:{book:spell.category==='High Magic'?'high-elf':'core',page:spell.category==='High Magic'?83:115},definition:spell.source,eligibility:{book:'high-elf',page:spell.category==='High Magic'?83:79},error,...(cost!==normal?{discount:'Blood of Aenarion · Magical Prodigy; High Elf Guide p. 51'}:{})};
}
export function highElfIssues(R,s){
 const out=[];if(!s.highElf&&!asur(R,s))return out;
 if(!asur(R,s)){out.push('High Elf ancestry and Elder choices require High Elf and the guide.');return out;}
 const e=elfState(s),era=birthEra(R,s),expected=elderEras(R,s),history=e.history||[];
 if(e.era&&!era)out.push('Choose a printed Elder era.');
 if(era){
  if(!Number.isInteger(e.elderAge)||e.elderAge<era.min||era.max!==null&&e.elderAge>era.max){
   // Printed dice sometimes cross a printed band boundary. Preserve the formula, explain it.
   const rolled=e.ageRolled&&Number.isInteger(e.elderAge)&&e.elderAge>=era.offset+era.dice[0]&&e.elderAge<=era.offset+era.dice[0]*era.dice[1];
   if(!rolled)out.push('Choose an age in your selected era or use its printed dice formula.');
  }
  if(era.id!=='ending'&&!['Fate','Fortune'].includes(e.elderResource))out.push('Choose the Elder starting Fate/Fortune reduction.');
 }
 if(expected.length!==history.length||expected.some(x=>history.filter(h=>h.era===x.id).length!==1))out.push('Complete exactly one past Career per Elder era.');
 for(const h of history){
  const c=R.careers.find(x=>x.id===h.career),slots=elderSkillSlots(R,s,h),budget=h.mode==='rolled'&&h.roll?.career===h.career?15:10;
  if(!c||!careerAvailable(R,s,c)){out.push(`Elder ${h.era}: choose an available past Career.`);continue;}
  const amounts=Object.values(h.points||{}),byName={};
  for(const slot of slots)byName[slot.name]=(byName[slot.name]||0)+(h.points?.[slot.key]||0);
  if(amounts.some(n=>!Number.isInteger(n)||n<0)||Object.keys(h.points||{}).some(key=>!slots.some(x=>x.key===key))||Object.values(byName).some(n=>n>5)||amounts.reduce((a,b)=>a+b,0)!==budget)out.push(`Elder ${h.era}: allocate exactly ${budget} individual points, at most 5 per Skill.`);
 }
 if(blood(R,s)){if(!['magic','martial'].includes(e.prodigy))out.push('Choose Magical Prodigy or Martial Prodigy.');if(!bloodPsychology(R,s))out.push('Roll Blood of Aenarion’s psychology.');}
 if(originProfile(R,s)?.name==='Sea Elf'&&(!e.enclave?.trim()||!R.highElfCreation.kingdoms.includes(e.heritage)))out.push('Sea Elf: choose a home enclave and an Ulthuan kingdom of heritage.');
 return out;
}
export function highElfReferences(R,s){
 if(!highElfGuide(R))return [];
 const out=[],e=elfState(s),era=birthEra(R,s),psy=bloodPsychology(R,s);
 if(era){out.push({source:{book:'high-elf',page:53},text:`Age ${e.elderAge??'not chosen'}; ${era.name}. Individual past-Career Skill points add to normal Fifth Edition allocations without tracker boxes, free Talents or gear.${era.id==='ending'?' No Elder benefit or burden.':` Approved adaptation: lose one starting ${e.elderResource||'Fate or Fortune'}; the oldest era sets Fate/Fortune to zero.`} Only the oldest era's weekly Yenlui Test applies; other burdens accumulate.`});for(const x of R.highElfCreation.eras.slice(1,R.highElfCreation.eras.indexOf(era)+1))out.push({source:{book:'high-elf',page:53},text:x.burden});for(const h of e.history||[])out.push({source:{book:'high-elf',page:53},text:`Past era ${h.era}: ${R.careers.find(c=>c.id===h.career)?.name||'unselected'} (${h.mode}); ${elderSkillSlots(R,s,h).filter(x=>h.points?.[x.key]).map(x=>`${x.name} +${h.points[x.key]}`).join('; ')}; free individual points.`});if(e.ageRolled&&(e.elderAge<era.min||era.max!==null&&e.elderAge>era.max))out.push({source:{book:'high-elf',page:53},text:'The printed age dice extend outside the printed era band. The exact rolled formula is retained; the chosen era governs benefits/burdens.'});}
 if(blood(R,s))out.push({source:{book:'high-elf',page:51},text:`Blood of Aenarion: +1 Fate, ${e.prodigy==='magic'?'Magical Prodigy (half spell and ritual memorisation XP; ritual inclusion is the user-approved interpretation)':'Martial Prodigy (half price for seven named Talents, only when otherwise legal)'}. ${psy?`${psy.name}: ${psy.text} Core p. 189 effects apply as Psychology, not a Mutation.`:'Psychology roll pending.'} Blood takes priority over age effects (p. 53). Weekly Cool/Yenlui effects remain references.`});
 if(asur(R,s)&&e.yenlui&&e.yenlui!=='Balanced')out.push({source:{book:'high-elf',page:47},text:yenluiReference(s)});
 if(e.obsession)out.push({source:{book:'high-elf',page:'48–49'},text:`Obsession: ${e.obsession}. With GM agreement, once per session choose the result of a Psychology Test that would oppose your Obsession. The GM can impose −2 SL on a Test compromised by it. Light Yenlui ignores negative effects; Balanced permits one negative effect per benefit; Dark permits negative effects even without taking a benefit. Agree its replacement of a long-term ambition with the GM; campaign resolution is deferred.`});
 if(e.dream)out.push({source:{book:'high-elf',page:49},text:`Dream: ${e.dream}. Optional prophetic background; future events and their conditional +1 SL are GM-managed.`});
 if(e.enclave||e.heritage)out.push({source:{book:'high-elf',page:57},text:`Sea Elf enclave: ${e.enclave||'not chosen'}; kingdom of heritage: ${e.heritage||'not chosen'}. Heritage does not grant a second regional profile.`});
 return out;
}
export function yenluiReference(s){
 if(!elfState(s).yenlui||elfState(s).yenlui==='Balanced')return 'Yenlui (Balanced): no modifiers (High Elf Guide p. 47).';
 const e=elfState(s),age=e.elderAge??Number((s.appearance||'').match(/^(\d+) years/)?.[1]),dark=e.yenlui==='Dark';
 const band=age>870?2:age>350?1:0,penalty=[2,3,4][band],main=band===2?'−3 SL to Toughness, '+(dark?'Willpower':'Initiative')+' and Fellowship Tests':`−${band+1} SL to Toughness and ${dark?'Willpower':'Initiative'} Tests`;
 const extra=band===1?'; −1 SL to Fellowship Tests':band===2?`; −2 SL to ${dark?'Agility, Dexterity and Intelligence':'Weapon Skill, Ballistic Skill and Strength'} Tests`:'';
 if(!Number.isFinite(age)||age===0)return `Yenlui (${e.yenlui}). Choose an age to determine the reference modifiers. Core band: −2 SL ${dark?'High':'Dark'} Magic casting, −1 SL Toughness and ${dark?'Willpower':'Initiative'} Tests. Over 350: −3 SL casting, −2 SL those Tests and −1 SL Fellowship. Over 870: −4 SL casting, −3 SL those Tests and Fellowship, −2 SL ${dark?'Agility/Dexterity/Intelligence':'WS/BS/Strength'}. These are situational modifiers; no permanent scores change.`;
 return `Yenlui (${e.yenlui}), age ${age}: −${penalty} SL to ${dark?'High':'Dark'} Magic Casting Tests; ${main}${extra}. Situational modifiers only; no permanent scores change.`;
}
export const elderCorruption=(R,s)=>elderEras(R,s).some(x=>x.id==='incursion')?5:0;

const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const shape=(x,keys)=>plain(x)&&Object.keys(x).every(k=>keys.includes(k));
const str=x=>typeof x==='string'&&x.trim().length>0;
export function validateElfCreation(R){
 const v=R.highElfCreation;
 if(!shape(v,['page','discountRituals','eras','psychologies','enclaves','kingdoms','pettySpells','obsessions','dreams'])||v.page!==53||typeof v.discountRituals!=='boolean'||!Array.isArray(v.eras)||v.eras.length!==6||!Array.isArray(v.psychologies))throw Error('Book pack: invalid High Elf creation data.');
 const ids=['ending','steel','incursion','voyages','sage','shadows'];
 for(const [i,x]of v.eras.entries())if(!shape(x,['id','name','min','max','offset','dice','burden'])||x.id!==ids[i]||!str(x.name)||!str(x.burden)||!Number.isInteger(x.min)||!Number.isInteger(x.offset)||x.max!==null&&(!Number.isInteger(x.max)||x.max<x.min)||!Array.isArray(x.dice)||x.dice.length!==2||!Number.isInteger(x.dice[0])||x.dice[0]<1||x.dice[1]!==10)throw Error('Book pack: invalid High Elf era.');
 for(const x of v.psychologies)if(!shape(x,['min','max','name','adjustments','text'])||!Number.isInteger(x.min)||!Number.isInteger(x.max)||x.min<1||x.max>100||x.min>x.max||!str(x.name)||!str(x.text)||!plain(x.adjustments)||Object.entries(x.adjustments).some(([k,n])=>!M.KEYS.includes(k)||!Number.isInteger(n)))throw Error('Book pack: invalid Aenarion psychology.');
 for(let n=1;n<=100;n++)if(v.psychologies.filter(x=>n>=x.min&&n<=x.max).length!==1)throw Error('Book pack: incomplete Aenarion psychology table.');
 for(const key of ['obsessions','dreams']){const t=v[key];if(!shape(t,['page','rows'])||!Number.isInteger(t.page)||!Array.isArray(t.rows)||t.rows.length!==10||t.rows.some((x,i)=>!shape(x,['face','text'])||x.face!==i+1||!str(x.text)))throw Error('Book pack: invalid High Elf background table.');}
 for(const key of ['enclaves','kingdoms','pettySpells'])if(!Array.isArray(v[key])||!v[key].length||v[key].some(x=>!str(x))||new Set(v[key]).size!==v[key].length)throw Error('Book pack: invalid High Elf creation choices.');
 if(v.pettySpells.length!==6||v.pettySpells.some(n=>!R.spells.some(x=>x.name===n&&x.category==='Petty'&&x.source.book==='high-elf')))throw Error('Book pack: missing Mage Petty spells.');
}
export function validateElfState(R,s){
 if(s.highElf===undefined)return;
 const e=s.highElf,fail=()=>{throw Error('Invalid High Elf creation choices in saved character.');};
 if(!asur(R,s)||!shape(e,['era','elderAge','ageRolled','elderResource','history','ancestry','bloodRoll','prodigy','psychology','yenlui','obsession','dream','enclave','heritage','careerVariant']))fail();
 if(e.era!==undefined&&e.era!==''&&!R.highElfCreation.eras.some(x=>x.id===e.era)||e.elderAge!==undefined&&(!Number.isInteger(e.elderAge)||e.elderAge<1)||e.ageRolled!==undefined&&typeof e.ageRolled!=='boolean'||e.elderResource!==undefined&&!['Fate','Fortune'].includes(e.elderResource)||e.ancestry!==undefined&&!['','none','chosen','rolled'].includes(e.ancestry)||e.prodigy!==undefined&&!['','magic','martial'].includes(e.prodigy)||e.psychology!==undefined&&(!Number.isInteger(e.psychology)||e.psychology<1||e.psychology>100)||e.yenlui!==undefined&&!['','Balanced','Light','Dark'].includes(e.yenlui)||e.careerVariant!==undefined&&!['standard',...(s.career==='pit-fighter'?['feint']:s.career==='sailor'?['elven-ship']:[])].includes(e.careerVariant))fail();
 for(const k of ['obsession','dream','enclave','heritage'])if(e[k]!==undefined&&(typeof e[k]!=='string'||e[k].length>1000))fail();
 if(e.bloodRoll){const r=e.bloodRoll;if(!shape(r,['face','chance','success'])||!Number.isInteger(r.face)||r.face<1||r.face>100||![1,5].includes(r.chance)||r.success!==(r.face<=r.chance))fail();}
 if(e.ancestry==='rolled'&&!e.bloodRoll)fail();
 if(e.history!==undefined){if(!Array.isArray(e.history)||e.history.length>5)fail();for(const h of e.history){
  if(!shape(h,['era','career','mode','points','choices','roll'])||!elderEras(R,s).some(x=>x.id===h.era)||typeof h.career!=='string'||!['chosen','rolled'].includes(h.mode)||!plain(h.points)||!plain(h.choices))fail();
  const slots=elderSkillSlots(R,s,h);
  if(h.career&&!careerAvailable(R,s,R.careers.find(c=>c.id===h.career))||Object.entries(h.points).some(([k,n])=>!slots.some(x=>x.key===k)||!Number.isInteger(n)||n<0||n>5)||Object.entries(h.choices).some(([k,n])=>!slots.some(x=>x.key===k&&x.options.includes(n))))fail();
  if(h.roll){const r=h.roll,t=R.tables.find(x=>x.id===r.table);if(!shape(r,['face','table','career'])||!t||t.kind!=='career'||t.species!=='High Elf'||t.origins&&!t.origins.includes(s.origin)||!Number.isInteger(r.face)||r.face<1||r.face>100||tableResult(t,r.face)!==r.career)fail();}
  if(h.mode==='rolled'&&(!h.roll||h.career!==h.roll.career))fail();
 }}
}
export function elfLedgerIssues(R,s){
 if(!highElfGuide(R))return [];
 const out=[];
 for(const [i,x]of s.ledger.entries()){
  if(x.type!=='technique'&&!(x.type==='spell'&&['High Magic','Elven Arcane'].includes(R.spells.find(y=>y.name===x.name)?.category)))continue;
  const prefix={...s,ledger:s.ledger.slice(0,i)},q=x.type==='technique'?quoteTechnique(R,prefix,x.name):quoteElfSpell(R,prefix,x.name,x.talent);
  if(q.error||x.cost!==q.cost||x.tick!==false||x.type==='spell'&&x.talent!==q.talent)out.push(`Saved High Elf purchase ${i+1}: ${q.error||'price, Lore or tracker differs from the printed learning rules.'} Undo or clear advancement to correct it.`);
 }
 return out;
}
