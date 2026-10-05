import {issueStep} from './ui.mjs';
import * as M from './rules.mjs';
import {gearSlots} from './equipment.mjs';

export function issueTarget(R,s,message){
 let step=issueStep(message),target='main h1';
 if(/saved.*purchase|Undo or clear|ledger/i.test(message))return {step:6,target:'.ledger-section'};
 if(/origin available/.test(message))target='#regional-origin';
 else if(/Longbeard/.test(message))target='#longbeard-age';
 else if(/Elder.*allocate/.test(message))target='[data-bind="elfPastPoints"]';
 else if(/Sea Elf/.test(message))target='[data-bind="elfText"][data-key="enclave"]';
 else if(/High Elf ancestry|Aenarion|Prodigy/.test(message))target='[data-group="elf-blood"]';
 else if(/age in your|Elder/.test(message))target='[data-group="elf-elder"]';
 else if(/College/.test(message)){step=1;target='#college-lore';}
 else if(/Psychometry/.test(message)){step=4;target='#psychometry-talent';}
 else if(/Cants/.test(message)){step=4;target='[data-bind="cant"]';}
 else if(/Career available/.test(message))target='#career-search';
 else if(/bonus level-two/.test(message))target='[data-bind="bonusGear"]';
 else if(/Characteristic points/.test(message))target='#point-0';
 else if(/Characteristic results/.test(message))target='[data-bind="assignment"]';
 else if(/starting increases|Starting Characteristic/.test(message))target='[data-bind="boost"]';
 else if(/star sign|Witchling|astrology/.test(message))target='[data-bind="chartEnabled"]';
 else if(/Species Skills/.test(message))target='[data-bind="speciesSkills"]';
 else if(/^Augury requires/.test(message)){step=1;target='#prereq-freeTalent';}
 else if(/Career Skill Advances/.test(message)){const slot=M.careerSkillSlots(R,s,1).find(x=>(s.careerSkills[x.key]||0)<3);target=slot?`[data-action="skill-plus"][data-key="${slot.key}"]`:'[data-action="skill-plus"]';}
 else if(/creation limit/.test(message)){
  const name=message.split(' exceeds')[0],slot=M.careerSkillSlots(R,s,1).find(x=>x.name===name);
  target=slot?`[data-action="skill-minus"][data-key="${slot.key}"]`:'[data-bind="speciesSkills"]';
 }
 else if(/random Species Talents/.test(message))target='[data-action="random-talents"]';
 else if(/free.*spell|free.*Blessing|Old Faith Blessings/.test(message)){
  step=4;let offset=0,index=0;for(const g of M.spellGrants(R,s)){
   if(message.includes(g.talent)||/Old Faith Blessings/.test(message)&&g.category==='Old Faith'){
    const chosen=Array.from({length:g.count},(_,i)=>s.spells[offset+i]);
    const missing=chosen.findIndex((n,i)=>!g.choices.some(x=>x.name===n)||chosen.slice(0,i).includes(n));
    index=offset+Math.max(0,missing);break;
   }offset+=g.count;
  }target=`[data-action="free-magic-picker"][data-index="${index}"]`;
 }
 else if(/Career Talent|Starting Talents/.test(message))target='#freeTalent';
 else if(/Pray|Bless|Invoke|patron/.test(message)){step=4;target='#freeTalent';}
 else if(/starting wealth/i.test(message))target='[data-action="wealth"]';
 else if(/quantity for/.test(message)){step=5;target='[data-action="gear-quantities"]';}
 else if(/Trapping|purchases|sized|size|GM review/.test(message)){
  step=5;const slot=gearSlots(R,s).find(x=>message.includes(x.name));target=slot?`[data-bind="gearChoices"][data-key="${slot.key}"]`:'.shop-disclosure';
 }
 return {step,target};
}
