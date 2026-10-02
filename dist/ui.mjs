// Presentation only: these labels do not change character rules or validation.
export const characteristicNames={WS:'Weapon Skill',BS:'Ballistic Skill',S:'Strength',T:'Toughness',I:'Initiative',Ag:'Agility',Dex:'Dexterity',Int:'Intelligence',WP:'Willpower',Fel:'Fellowship'};
export function issueStep(message){
 if(/Career available|bonus level-two/.test(message))return 1;
 if(/Characteristic/.test(message))return 2;
 if(/Species Skills|Career Skill|creation limit/.test(message))return 3;
 return 4;
}
