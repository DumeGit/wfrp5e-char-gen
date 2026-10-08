"""Build two reviewed unnamed Archives II GM foundations.

Values checked against supplied PDF pp. 34 and 76. Named NPCs, hirelings,
Career development and ongoing play systems are intentionally excluded.
"""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
BOOK = 'archives-ii'
pack = ROOT / 'dist/data/books' / BOOK
manifest = json.loads((pack / 'manifest.json').read_text(encoding='utf-8'))
refs = json.loads((pack / 'reference-entries.json').read_text(encoding='utf-8'))
KEYS = ['M','WS','BS','S','T','I','Ag','Dex','Int','WP','Fel','W']
def profile(slug, name, page, values, **kwargs):
    return dict(id=f'{BOOK}:creatures:{slug}', name=name, page=page,
        source=dict(book=BOOK,page=page), example=False,
        stats=dict(zip(KEYS,values)), skills=[], talents=[], traits=[],
        attacks=[], armour=[], spells=[], optionalTraits=[],
        sections=dict(Traits='',Trappings=''), notes=[], **kwargs)
size_note = 'Fifth Edition Size (Large), core p. 360, adds Strength Bonus to the primary melee attack: printed Weapon +9 becomes +15. Horns is an extra attack and retains +10.'
frenzy_note = 'Proposed Fifth Edition adaptation approved by the user: printed Fury is replaced with core Frenzy (p. 358). Fury is not defined in the supplied supplement, so equivalence cannot be verified. Use the core Frenzy rule, not an assumed older effect.'
hardy_note = 'Printed Hardy Creature Trait is recorded as one rank of the Fifth Edition Hardy Talent (core p. 120), by user approval. It adds one Toughness Bonus before Size multiplication: (6 SB + 3 × 5 TB + 4 WPB) × 2 = 50 Wounds. Do not add it again to the printed 50.'
stride_note = 'Printed Stride is replaced with Fifth Edition Sprinter (core p. 362), following the approved older-name replacement. Sprinter changes Running movement, not the Movement score.'
r = profile('rhinox','Rhinox',34,[6,55,None,60,55,25,20,None,10,40,20,50],category='Mounts',size='Large',toughnessBonus=5,hitLocations=['Head','Body','Forelegs','Rear Legs'])
r.update(traits=[dict(name='Bestial',value=''),dict(name='Fear',value='1'),dict(name='Frenzy',value='',adaptation=frenzy_note),dict(name='Horns',value='10',deriveAttack=True),dict(name='Painless',value=''),dict(name='Size',value='Large'),dict(name='Sprinter',value='',adaptation=stride_note)],
    talents=[dict(name='Hardy',ranks=1,adaptation=hardy_note)],
    attacks=[dict(name='Weapon',skill=55,damage=15,printedDamage=9,optional=False,text='',adaptation=size_note)],
    armour=[dict(name='Hide',ap=2,locations='Head, Body, Forelegs, Rear Legs',optional=False,quick=False,shield=False)],
    optionalTraits=[dict(name='Trained',value='Broken, Mount, War'),dict(name='Tracker',value='')],
    sections=dict(Traits='Size (Large): See page 360 for implications of size',Trappings=''),
    adaptation=size_note+' '+frenzy_note+' '+hardy_note+' '+stride_note,
    notes=['Printed Characteristics, Toughness Bonus and 50 Wounds are retained. Fifth Edition definitions govern selected Traits and Talents.','Training and Tracker are optional, not automatically granted. Horns is an extra Free Attack only when Charging.'],
    text='RHINOX (Archives II p. 34). M 6, WS 55, BS —, S 60, T 55, I 25, Ag 20, Dex —, Int 10, WP 40, Fel 20, W 50. Traits: Armour 2, Bestial, Fear 1, Fury, Hardy, Horns +10, Painless, Size (Large), Stride, Weapon +9. Optional: Trained (Broken, Mount, War), Tracker.')
ref = next(x for x in refs if x['category']=='profile' and x['id']=='archives-ii:reference:76-profile-typical-sister-nun-shallya-brass-4')
s = profile('typical-sister','Typical Sister',76,[4,25,25,30,30,30,30,35,35,35,35,12],category='Peoples of the Reikland',size='Average',toughnessBonus=3)
s.update(skills=[dict(name=n,total=v) for n,v in [('Charm',35),('Cool',40),('Endurance',35),('Entertain (Storytelling)',35),('Gossip',35),('Heal',40),('Lore (Theology)',40),('Pray',35),('Research',30),('Trade (Herbalist)',35)]],
    talents=[dict(name=n,ranks=1) for n in ['Etiquette (Shallyans)','Field Dressing','Stone Soup','Panhandle','Read/Write']],
    sections=dict(Traits='',Trappings='Robes, Silver Dove Cloak-Pin'),referenceId=ref['id'],text=ref['text'],
    notes=['The printed Research 30 is retained even though Intelligence is 35. No weapon, armour, Bless/Invoke Talent or prayer is invented.'])
output = dict(schemaVersion=1,id=BOOK,source=manifest['source'],summary='Rhinox, Typical Sister, Ogre equipment & Great Maw magic',profiles=[r,s],training=[],review=dict(pages=[14,26,28,29,31,32,33,34,74,75,76,77,78,79,80],profilePages=[34,76],excluded=['All named NPCs and adventure characters.','Typical Orderly (p. 76) gives standard-profile guidance, not a fixed stat block or quantified template; use the existing core Human or other Species foundation.','The multi-row Ogre creation example (p. 26) is not an additional creature profile.','Hirelings, Career development, astrology rewards, artefact generation, mass battles and campaign systems.']))
(ROOT/'dist/gm/sources/archives-ii.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Wrote Rhinox and Typical Sister GM profiles.')
