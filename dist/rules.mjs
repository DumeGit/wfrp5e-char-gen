// All game data and references come from the supplied Fifth Edition rulebook.
import {marketCatalog} from './market.mjs';
export const KEYS=['WS','BS','S','T','I','Ag','Dex','Int','WP','Fel'];
export const CHAR_COST=[125,175,250,350,500,700,950,1300,1800,2550,3600,5025,6950,9000,11250];
export const SKILL_COST=[50,75,100,150,250,400,600,850,850,1700,2500,3500,4750,6500,8500];
// Appendix II, p. 364: prices for one point, grouped in bands of five Advances.
export const IND_CHAR_COST=[25,35,50,70,100,140,190,260,360,510,720,1005,1390,1800,2250];
export const IND_SKILL_COST=[10,15,20,30,50,80,120,170,170,340,500,700,950,1300,1700];
export const COLOURS=['Beasts','Death','Fire','Heavens','Life','Light','Metal','Shadows'];
export const GODS=['Manann','Morr','Myrmidia','Ranald','Rhya','Shallya','Sigmar','Taal','Ulric','Verena'];
export const BLESSINGS={Manann:'Battle|Breath|Courage|Hardiness|Savagery|Tenacity',Morr:'Breath|Courage|Fortune|Righteousness|Tenacity|Wisdom',Myrmidia:'Battle|Conscience|Courage|Fortune|Protection|Righteousness',Ranald:'Charisma|Conscience|Finesse|Fortune|Protection|Wit',Rhya:'Breath|Conscience|Grace|Healing|Protection|Recuperation',Shallya:'Breath|Conscience|Healing|Protection|Recuperation|Tenacity',Sigmar:'Battle|Courage|Hardiness|Might|Protection|Righteousness',Taal:'Battle|Breath|Conscience|Hardiness|The Hunt|Savagery',Ulric:'Battle|Courage|Hardiness|Might|Savagery|Tenacity',Verena:'Conscience|Courage|Fortune|Righteousness|Wisdom|Wit'};
export const RANDOM_TALENTS=['Acute Sense (Sight)','Ambidextrous','Artistic','Attractive','Briber','Cardsharp','Catfall','Coolheaded','Contortionist','Flee!','Gregarious','Iron Jaw','Lightning Reflexes','Linguistics','Marksman','Mimic','Night Vision','Nimble-fingered','Noble Blood','Nose for Trouble','Orientation','Perfect Pitch','Pure Soul','Read/Write','Resistant (Poison)','Rover','Savvy','Sea Legs','Sharp','Stone Soup','Strong Back','Sturdy','Suave','Super Numerate','Supportive','Tinker','Tunnel Fighter','Very Resilient','Very Strong','Warrior Born'];
export const randomTalent=n=>RANDOM_TALENTS[Math.floor((n-1)/5)*2+((n-1)%5>=2?1:0)];
export const speciesResult=n=>n<=90?'Human':n<=94?'Halfling':n<=98?'Dwarf':n===99?'High Elf':'Wood Elf';
export const CLASS_KIT={Academic:['Sling Bag containing Writing Kit and {1d10} sheets of Parchment'],Burgher:['Cloak','Hat','Sling Bag containing Lunch'],Courtier:['Fine Clothing','Tweezers','Ear Pick','Comb'],Peasant:['Cloak','Sling Bag containing Rations (1 day)'],Ranger:['Cloak','Backpack containing Tinderbox, Blanket and Rations (1 day)'],Riverfolk:['Cloak','Sling Bag containing a Flask of Spirits'],Rogue:['Sling Bag containing 2 Candles and {1d10} Matches','Hood or Mask'],Warrior:['Hand Weapon']};
const EFFECTS={'Warrior Born':'WS',Marksman:'BS','Very Strong':'S','Very Resilient':'T',Sharp:'I','Lightning Reflexes':'Ag','Nimble-fingered':'Dex',Savvy:'Int',Coolheaded:'WP',Suave:'Fel'};
export const base=n=>n.replace(/ \(.*/, '');
export const canon=n=>n.replace('Nimble Fingered','Nimble-fingered').replace('Nimble-fingered','Nimble-fingered').replace('Coolhead','Coolhead').replace(/^Coolhead$/,'Coolheaded').replace(/^Acute Sight$/,'Acute Sense (Sight)').replace(/^Resistance \(/,'Resistant (').replace('(Sing)','(Singing)').replace('Etiquette (Guilder)','Etiquette (Guilders)');
export function die(sides=100,source=globalThis.crypto){
 if(!Number.isInteger(sides)||sides<2||sides>1000)throw Error('Invalid die');
 const arr=new Uint32Array(1),ceiling=Math.floor(4294967296/sides)*sides;let n;
 do{source.getRandomValues(arr);n=arr[0]}while(n>=ceiling);
 return n%sides+1;
}
export function roll(s,label,count,sides,page){const values=Array.from({length:count},()=>die(sides));s.rolls.push({at:new Date().toISOString(),label,dice:`${count}d${sides}`,values,total:values.reduce((a,b)=>a+b,0),page});return values;}
export function fresh(){return {version:1,name:'',appearance:'',ambition:'',partyAmbition:'',notes:'',species:'Human',speciesMode:'choose',speciesAttempts:0,career:'soldier',careerMode:'choose',careerAttempts:0,careerOffers:[],bonusGear:[],charMode:'points',charRolls:[],charAttempts:0,assignment:KEYS.map((_,i)=>i),points:KEYS.map(()=>10),boost:{},speciesSkills:[],skillChoices:{},careerSkills:{},talentChoices:{},randomTalents:[],freeTalent:'',gearChoices:{},gearRolls:{},wealth:null,purchases:[],spells:[],xp:1000,advanceSize:5,ledger:[],rolls:[],sturdyRule:'creation',step:0};}
export function skillInfo(R,name){return R.skills.find(x=>x.name===base(name));}
export function talentInfo(R,name){return R.talents.find(x=>base(x.name).toLowerCase()===base(canon(name)).toLowerCase());}
export function options(R,raw,type='skill'){
 raw=canon(raw);if(type==='talent'&&raw==='Artistic')raw='Artistic (Any One)';
 // Alternatives between distinct groups must be split before the inner specialisations.
 if(raw.startsWith('Drive or '))return ['Drive',...options(R,raw.slice(9),type)];
 if(/\) or /.test(raw))return raw.split(/\) or /).flatMap((v,i,a)=>options(R,v+(i<a.length-1?')':''),type));
 const m=raw.match(/^(.+?) \((.+)\)$/);if(!m)return [raw];
 const [_,b,spec]=m;let opts;
 if(/Any|All|as Trade/.test(spec)){
  if(type==='skill'){opts=skillInfo(R,raw)?.options||[];if(spec==='Any Colour')opts=['Aqshy','Azyr','Chamon','Ghur','Ghyran','Hysh','Shyish','Ulgu'];if(spec.includes('Domesticated'))opts=['Dog','Horse','Pigeon'];}
  else {
   const table={'Artistic':R.skills.find(x=>x.name==='Art').options,'Acute Sense':['Sight','Hearing','Taste','Touch','Smell'],'Arcane Magic':COLOURS,Bless:GODS,Invoke:GODS,Craftsman:R.skills.find(x=>x.name==='Trade').options,'Master Tradesman':R.skills.find(x=>x.name==='Trade').options,Savant:R.skills.find(x=>x.name==='Lore').options,Resistant:['Chaos','Disease','Poison'],Etiquette:['Criminals','Cultists','Guilders','Nobles','Scholars','Servants','Soldiers'],'Striding Gait':['Coastal','Rocky','Wetland']};
   opts=table[b]||[...new Set(R.careers.flatMap(c=>c.levels.flatMap(l=>l.talents)).filter(t=>base(t)===b).map(t=>t.match(/\((.+)\)/)?.[1]).filter(t=>t&&!/Any|All| or |,/.test(t)))];
  }
 }else opts=spec.split(/,\s*(?:or )?| or /);
 return opts.length?opts.map(x=>`${b} (${x})`):[raw];
}
export function resolved(R,s,raw,key,type='skill'){const opts=options(R,raw,type);const chosen=(type==='skill'?s.skillChoices:s.talentChoices)[key];return opts.includes(chosen)?chosen:opts[0];}
export const career=(R,s)=>R.careers.find(c=>c.id===s.career);
export function bonusTrappingSlots(R,s){const seen=new Set();return career(R,s).levels[1].trappings.flatMap((name,i)=>{if(name==='None'||seen.has(name))return [];seen.add(name);return [{name,i}];});}
export function bonusTrappingLimit(R,s){return Math.min(s.careerMode==='first'?2:s.careerMode==='three'?1:0,bonusTrappingSlots(R,s).length);}
export function careerSkillSlots(R,s,level=4){return career(R,s).levels.slice(0,level).flatMap(l=>l.skills.map((raw,i)=>({key:`c${l.level}-${i}`,raw,level:l.level,name:resolved(R,s,raw,`c${l.level}-${i}`)})));}
export function speciesSkillSlots(R,s){return R.species[s.species].skills.map((raw,i)=>({key:`s-${i}`,raw,name:resolved(R,s,raw,`s-${i}`)}));}
export function careerTalentOptions(R,s,level=1){return [...new Set(career(R,s).levels.slice(0,level).flatMap(l=>l.talents.flatMap(t=>t.includes('(as Trade)')?careerSkillSlots(R,s,level).filter(x=>base(x.name)==='Trade').map(x=>t.replace('(as Trade)',x.name.slice(6))):options(R,t,'talent'))))];}
export function freeTalents(R,s){const sp=R.species[s.species];return [...sp.talents.map((opts,i)=>opts.includes(s.talentChoices[`species-${i}`])?s.talentChoices[`species-${i}`]:opts[0]),...s.randomTalents.map((t,i)=>t==='Artistic'?(s.talentChoices[`random-${i}`]||'Artistic (Drawing)'):t),...(s.freeTalent?[s.freeTalent]:[])].map(canon);}
export function initial(R,s){const sp=R.species[s.species],ts=freeTalents(R,s);return Object.fromEntries(KEYS.map((k,i)=>[k,sp.offsets[k]+(s.charMode==='points'?s.points[i]:(s.charRolls[s.assignment[i]]??10))+(Number(s.boost[k])||0)+ts.filter(t=>EFFECTS[t]===k).length*5]));}
export function freeSkills(R,s){const out={};for(const l of R.species[s.species].languages)out[`Language (${l})`]=6;for(const slot of speciesSkillSlots(R,s))if(s.speciesSkills.includes(slot.key))out[slot.name]=(out[slot.name]||0)+1;for(const slot of careerSkillSlots(R,s,1))out[slot.name]=(out[slot.name]||0)+(s.careerSkills[slot.key]||0);return out;}
export function derive(R,s){
 const sp=R.species[s.species],c=career(R,s),stats=initial(R,s),charAdv=Object.fromEntries(KEYS.map(k=>[k,0])),skills=freeSkills(R,s),talents=freeTalents(R,s),paidSkills={};let level=1,spent=0,earnedBoxes=s.bonusGear.length;
 const trackerProgress={},trackerCredits=[],trackerProgressAt=[];
 for(const x of s.ledger){
  const amount=x.amount===1?1:5;spent+=x.cost;
  if(x.type==='char'){stats[x.name]+=amount;charAdv[x.name]+=amount;}
  if(x.type==='skill'){skills[x.name]=(skills[x.name]||0)+amount/5;paidSkills[x.name]=(paidSkills[x.name]||0)+amount/5;}
  if(x.type==='talent'){talents.push(x.name);if(EFFECTS[x.name])stats[EFFECTS[x.name]]+=5;}
  if(x.type==='promotion')level++;
  const eligible=x.inCareer??x.tick,pointAdvance=(x.type==='char'||x.type==='skill')&&amount===1;
  let credit=false,progress=0;
  if(pointAdvance&&eligible){const key=`${x.type}:${x.name}`;trackerProgress[key]=(trackerProgress[key]||0)+1;progress=trackerProgress[key]%5;credit=progress===0&&earnedBoxes<36;}
  else if(x.type==='char'||x.type==='skill'||x.type==='talent')credit=!!eligible&&earnedBoxes<36;
  else if(x.type==='trapping')credit=!!x.tick&&earnedBoxes<36;
  if(credit)earnedBoxes++;
  trackerCredits.push(credit);trackerProgressAt.push(progress);
 }
 // The sheet's 10, 12, and 14 boxes form one continuous track. Purchases
 // beyond a promotion threshold already fill boxes in the next segment.
 const trackers=[10,12,14].map((width,i)=>Math.min(width,Math.max(0,earnedBoxes-[0,10,22][i]))).concat(0);
 const ticks=trackers[level-1];
 const sb=Math.floor(stats.S/10),tb=Math.floor(stats.T/10),wpb=Math.floor(stats.WP/10),has=t=>talents.includes(t),count=t=>talents.filter(x=>x===t).length;
 const fate=sp.fate+(s.speciesMode==='first'&&s.careerMode==='first'&&s.charMode==='first'?1:0),fortune=sp.fortune+(s.speciesMode==='first'?1:0)+count('Luck'),movement=sp.movement+(has('Fleet-footed')?1:0);
 let capacity=sb+tb;if(s.sturdyRule==='creation'&&(s.species==='Dwarf'||has('Sturdy')))capacity*=2;else if(s.sturdyRule==='talent'&&has('Sturdy'))capacity+=sb;
 capacity+=count('Strong Back')===1?1:count('Strong Back')>=2?3:0;
 const wounds=sb+2*tb+wpb+(has('Hardy')?tb:0);
 const currentSkills=careerSkillSlots(R,s,level).flatMap(x=>x.raw.includes('(All)')?options(R,x.raw):[x.name]);
 const ownedHigher=[...s.bonusGear.map(x=>({level:2})),...s.ledger.filter(x=>x.type==='trapping')];
 const purchaseNames=new Map(marketCatalog(R).map(x=>[x.id,x.name]));
 const ownedNames=['Clothing','Dagger','Pouch',...(CLASS_KIT[c.class]||[]),...c.levels[0].trappings,...Object.values(s.gearChoices),...s.bonusGear.map(i=>c.levels[1].trappings[i]),...s.ledger.filter(x=>x.type==='trapping').map(x=>x.name),...(s.purchases||[]).map(x=>purchaseNames.get(x.id)).filter(Boolean)];
 let statusLevel=1;for(let l=2;l<=level;l++)if(c.levels[l-1].trappings.some(t=>ownedNames.includes(t)||/^(Weapon|Melee Weapon) \(Any/.test(t)))statusLevel=l;
 const status=c.levels[statusLevel-1];
 const warnings=[];if(has('Doomed'))warnings.push('Agree a Dooming with the GM and record it in your notes (p. 118).');
 if(has('Sturdy')||s.species==='Dwarf')warnings.push(`Encumbrance uses ${s.sturdyRule==='creation'?'the creation rule on p. 40 (double SB + TB)':'the Sturdy description on p. 127 (2 × SB + TB)'}. These passages disagree.`);
 if(s.species==='Halfling')warnings.push('Species “Resistance (Chaos)” is recorded as Resistant (Chaos), matching the Talent heading (pp. 31, 124).');
 if(s.species.endsWith('Elf'))warnings.push('Species “Entertain (Sing)” is recorded as Entertain (Singing); Acute Sight uses Acute Sense (Sight) (pp. 32–35, 111, 114).');
 if(talents.some(t=>base(t)==='Bless'||base(t)==='Invoke')&&!skills.Pray)warnings.push('Pray is untrained. Divine powers need a Pray Advance (p. 40).');
 if(has('Petty Magic')||talents.some(t=>base(t)==='Arcane Magic')||has('Witch!')){if(!has('Second Sight'))warnings.push('Second Sight is absent; review magical perception (p. 40).');if(!skills['Language (Magick)'])warnings.push('Language (Magick) is untrained (p. 40).');if(!Object.keys(skills).some(k=>k.startsWith('Channelling (')&&skills[k]))warnings.push('Channelling is untrained; review casting requirements (p. 40).');}
 if(skills.Research&&!has('Read/Write'))warnings.push('Research cannot be used without Read/Write (p. 113).');
 if(level>statusLevel)warnings.push('Status remains at the highest level with an owned Trapping; promotion does not give equipment (p. 44).');
 return {stats,charAdv,skills,paidSkills,talents,level,ticks,trackers,earnedBoxes,trackerProgress,trackerCredits,trackerProgressAt,spent,remaining:s.xp-spent,fate,fortune,movement,capacity,wounds,sb,tb,wpb,currentSkills,status:`${status.status} ${status.standing}`,warnings};
}
export function invalidTalent(R,s,name){const d=derive(R,s),b=base(name),magical=['Arcane Magic','Chaos Magic','Petty Magic','Witch!'],divine=['Bless','Invoke'],owned=d.talents.map(base),hasChannel=Object.keys(d.skills).some(x=>base(x)==='Channelling'&&d.skills[x]);
 if((b==='Magic Resistance'&&(hasChannel||owned.some(x=>magical.includes(x)||divine.includes(x))))||(magical.includes(b)&&owned.some(x=>divine.includes(x)||x==='Magic Resistance'))||(divine.includes(b)&&(hasChannel||owned.some(x=>magical.includes(x)||x==='Magic Resistance'))))return 'Incompatible magical or divine training (pp. 115, 121–123).';
 if(b==='Savant'&&!d.skills[`Lore (${name.match(/\((.*)\)/)?.[1]})`])return 'Savant requires an Advance in the chosen Lore (p. 125).';
 if(b==='Arcane Magic'&&owned.includes(b)&&!d.talents.includes(name))return 'A second Lore needs a specific exception and GM permission (p. 115).';
 const otherDivine=divine.includes(b)&&d.talents.find(t=>base(t)===b&&t!==name);
 if(otherDivine)return `Already have ${otherDivine}; normally only one ${b} Talent (p. ${b==='Bless'?116:121}).`;
 const patronTalent=divine.includes(b)&&d.talents.find(t=>divine.includes(base(t))&&t.match(/\((.*)\)/)?.[1]!==name.match(/\((.*)\)/)?.[1]);
 if(patronTalent){const patron=patronTalent.match(/\((.*)\)/)?.[1];return `Requires ${b} (${patron}) to match your patron from ${patronTalent} (pp. 40, 116, 121).`;}
 const repeats=d.talents.filter(t=>t===name).length;if(!repeats)return '';
 const text=talentInfo(R,name)?.text||'';let limit=1;
 if(/second time|twice|second purchase/.test(text))limit=2;
 if(/three times/.test(text))limit=3;
 if(repeats>=limit)return 'Already known; this purchase is not repeatable.';
 return '';
}
export function quote(R,s,type,name,amount=5){const d=derive(R,s),c=career(R,s);let cost,tick=false,inCareer=false,error='';
 if(type==='char'){const points=d.charAdv[name];inCareer=!!c.advanceScheme[name]&&c.advanceScheme[name]<=d.level;tick=inCareer&&d.earnedBoxes<36&&(amount===5||((d.trackerProgress[`char:${name}`]||0)+1)%5===0);if(!KEYS.includes(name))error='Unknown Characteristic';else if(![1,5].includes(amount))error='Advance must be +1 or +5';else if(amount===5&&points%5)error='Finish this Characteristic’s current five-point band with +1 Advances before buying +5 (p. 364).';cost=(amount===1?IND_CHAR_COST:CHAR_COST)[amount===1?Math.min(Math.floor(points/5),14):Math.floor(points/5)]*(inCareer?1:2);}
 if(type==='skill'){const info=skillInfo(R,name),points=Math.round((d.skills[name]||0)*5);inCareer=d.currentSkills.includes(name);tick=inCareer&&d.earnedBoxes<36&&(amount===5||((d.trackerProgress[`skill:${name}`]||0)+1)%5===0);if(![1,5].includes(amount))error='Advance must be +1 or +5';else if(amount===5&&points%5)error='Finish this Skill’s current five-point band with +1 Advances before buying +5 (p. 364).';cost=(amount===1?IND_SKILL_COST:SKILL_COST)[Math.min(Math.floor(points/5),14)]*(inCareer?1:2);if(!info)error='Unknown Skill';else if(!inCareer&&info.advanced)error='Non-career Advanced Skills require a Training Endeavour (p. 44).';if(base(name)==='Language'&&name!=='Language (Magick)'&&d.talents.includes('Linguistics'))cost=50;if(base(name)==='Channelling'&&d.talents.some(t=>['Bless','Invoke','Magic Resistance'].includes(base(t))))error='Incompatible with divine training or Magic Resistance.';}
 if(type==='talent'){cost=100;inCareer=careerTalentOptions(R,s,d.level).includes(name);tick=inCareer&&d.earnedBoxes<36;error=!inCareer?'Not available in this Career level.':invalidTalent(R,s,name);}
 if(type==='promotion'){cost=100;if(d.level===4)error='Already at the final Career level.';else if(d.ticks<[10,12,14][d.level-1])error=`Requires ${[10,12,14][d.level-1]} tracker boxes and the Advance Career Endeavour (p. 196).`;}
 if(!Number.isFinite(cost))error='This advance is beyond the published XP table (p. 191).';
 if(cost>d.remaining&&!error)error=`Requires ${cost} XP; ${d.remaining} remain.`;
 return {type,name,cost,tick,inCareer,error,amount:['char','skill'].includes(type)?amount:undefined,page:type==='promotion'?196:type==='talent'?`${career(R,s).page}, 191`:amount===1?364:191};
}
export function purchase(R,s,type,name,amount=5){const q=quote(R,s,type,name,amount);if(q.error)throw Error(q.error);delete q.error;const d=derive(R,s);if(type==='talent'&&name==='Petty Magic')q.freeSpells=d.wpb;if(type==='promotion')q.name=`${career(R,s).levels[d.level-1].name} → ${career(R,s).levels[d.level].name}`;s.ledger.push(q);}
export function validation(R,s){const e=[],sp=R.species[s.species],c=career(R,s);if(!c.species.includes(s.species))e.push('Choose a Career available to your Species.');if(s.charMode==='points'&&(s.points.reduce((a,b)=>a+b,0)!==100||s.points.some(x=>x<4||x>16)))e.push('Allocate exactly 100 Characteristic points, 4–16 in each.');if(s.charMode!=='points'&&(s.charRolls.length!==10||new Set(s.assignment).size!==10))e.push('Assign each of the ten rolled Characteristic results once.');const boost=Object.values(s.boost).reduce((a,b)=>a+Number(b),0),allowed=s.charMode==='first'?6:s.charMode==='rearrange'?3:0;if(boost>allowed||KEYS.some(k=>(s.boost[k]||0)<0||((s.boost[k]||0)>0&&c.advanceScheme[k]!==1)))e.push('Starting Characteristic increases must fit the selected method and first Career level.');if(s.speciesSkills.length!==5||new Set(speciesSkillSlots(R,s).filter(x=>s.speciesSkills.includes(x.key)).map(x=>x.name)).size!==5)e.push('Select five different Species Skills.');if(Object.values(s.careerSkills).reduce((a,b)=>a+b,0)!==8)e.push('Allocate eight free Career Skill Advances.');const free=freeSkills(R,s);for(const [name,n]of Object.entries(free))if(n>3&&!sp.languages.some(l=>name===`Language (${l})`))e.push(`${name} exceeds the three-Advance creation limit.`);if(s.randomTalents.length!==sp.randomTalents)e.push(`Roll ${sp.randomTalents} random Species Talents.`);if(!careerTalentOptions(R,s).includes(s.freeTalent))e.push('Choose one free first-level Career Talent.');if(new Set(freeTalents(R,s)).size!==freeTalents(R,s).length)e.push('Starting Talents must be distinct; change the free Career choice.');if(s.freeTalent){const problem=invalidTalent(R,{...s,freeTalent:'',ledger:[]},s.freeTalent);if(problem)e.push('Free Career Talent: '+problem);}if(!s.wealth)e.push('Roll starting wealth.');if(s.bonusGear.length!==bonusTrappingLimit(R,s)||new Set(s.bonusGear).size!==s.bonusGear.length||s.bonusGear.some(i=>!bonusTrappingSlots(R,s).some(x=>x.i===i)))e.push('Select the bonus level-two Trappings earned by the Career roll.');return e;}
export function spellGrants(R,s){const d=derive(R,s),out=[];for(const name of [...new Set(d.talents)]){let category,count=1;const b=base(name);if(name==='Petty Magic'){category='Petty';count=freeTalents(R,s).includes(name)?Math.floor(initial(R,s).WP/10):s.ledger.find(x=>x.type==='talent'&&x.name===name)?.freeSpells||0;}else if(b==='Arcane Magic'||b==='Invoke')category=name.match(/\((.*)\)/)[1];else if(name==='Witch!')category='Witch!';else continue;out.push({talent:name,category,count,choices:R.spells.filter(x=>category==='Witch!'?[...COLOURS,'Witchcraft'].includes(x.category):(x.category===category||(b==='Arcane Magic'&&x.category==='Arcane')))});}return out;}
export function knownSpells(R,s){const d=derive(R,s),names=[...s.spells,...s.ledger.filter(x=>x.type==='spell').map(x=>x.name)];for(const t of d.talents)if(base(t)==='Bless'){const god=t.match(/\((.*)\)/)[1];for(const n of (BLESSINGS[god]||'').split('|'))names.push(`Blessing of ${n}`);}return [...new Set(names)].map(n=>R.spells.find(x=>x.name===n)).filter(Boolean);}
