"""Corrections verified against the supplied PDF. Run after the extractors."""
from pathlib import Path
import json, re
root=Path(__file__).resolve().parents[1]/'dist/data'
def read(name):return json.loads((root/name).read_text(encoding='utf-8'))
def write(name,data):(root/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
skills=read('skills.json')
for skill in skills:
 if skill['name']=='Animal Training':skill['options']=['Demigryph','Dog','Hawk','Horse','Pigeon']
 if skill['name']=='Language':skill['options']=sorted(set(skill['options']+['Albion','Estalian','Gospodarinyi','Grumbarth','Norse','Pilgrim Sign','Queekish','Tilean']))
write('skills.json',skills)
talents=read('talents.json')
for t in talents:
 if t['name']=='Disarm':t['text']='You are able to disarm an opponent with a careful flick of the wrist or a well-aimed blow to the hand. Upon a successful melee strike as the attacker, you may choose to sacrifice the Damage. If you do so, your opponent loses a held weapon, which flies 1d10 feet in a random direction. If you wish, you may lose Momentum to pluck the weapon from the air with a flourish. This Talent is of no use if your opponent fights unarmed, is securely attached to their weapon, or has a larger Size than you (see page 360).'
 if t['name']=='Doomed':t['text']='At the age of 10, you underwent the Dooming, a coming-of-age ritual observed by many humans in the Old World. During the incense-laden rite, a priest of Morr known as a doomsayer foretold the manner of your death. In conjunction with your GM, devise a suitable Doom. If your Character dies in the manner foretold, all allied Characters immediately refresh their Fortune, and your next Character begins play with an additional Fate Point.'
 if t['name']=='Mimic' and 'If you are familiar with an accent' not in t['text']:t['text']+=' If you are familiar with an accent, you know if another is attempting to fake it or hide it unless they also have Mimic.'
write('talents.json',talents)
spells=read('spells.json')
for s in spells:
 if s['name']=='As Verena Is My Witness':s['duration']='Fellowship Bonus Rounds'
write('spells.json',spells)
print('Applied PDF-verified skill, talent and spell corrections.')
