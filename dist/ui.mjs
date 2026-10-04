// Presentation only: these labels do not change character rules or validation.
export const characteristicNames={WS:'Weapon Skill',BS:'Ballistic Skill',S:'Strength',T:'Toughness',I:'Initiative',Ag:'Agility',Dex:'Dexterity',Int:'Intelligence',WP:'Willpower',Fel:'Fellowship'};
export const steps=['Origins','Career','Characteristics','Skills','Talents','Gear & money','Experience','Review & export'];
export const creationStepCount=6,experienceStep=6,reviewStep=7;
export const hasCharacterChanges=(character,empty)=>JSON.stringify({...character,step:0})!==JSON.stringify({...empty,step:0});
export function restoreNavigation(character){
 let step=Number.isInteger(character.step)?character.step:0;
 if(character.navigationVersion!==2&&step>=5)step++;
 return {...character,step:Math.max(0,Math.min(steps.length-1,step)),navigationVersion:2};
}
export function issueStep(message){
 if(/origin available|GM-approval requirement/.test(message))return 0;
 if(/Career available|bonus level-two/.test(message))return 1;
 if(/Characteristic|star sign|Witchling|astrology/.test(message))return 2;
 if(/Species Skills|Career Skill|creation limit/.test(message))return 3;
 if(/starting wealth|quantity for|Trapping.*price|Trapping purchases|GM review.*Archives II/i.test(message))return 5;
 return 4;
}
