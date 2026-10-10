"""Curated generic content; excludes named characters and adventure material.

The six disputed conversions are deliberately required input, not defaults.
Regenerate with --decisions scripts/tribes-tribulations-decisions.json.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
PDF = Path(r"C:\Users\ninod\Downloads\Tribes and Tribulations.pdf")
SHA = "008c2e08337b15dd6776ae108acae4749d5276fbcff63eb7db74e3b9daf8dc6e"
BOOK = "tribes-tribulations"
PACK = ROOT / f"dist/data/books/{BOOK}"
KEYS = ["M", "WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel", "W"]

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+"\n", encoding="utf-8", newline="\n")

def slug(name): return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
def identity(kind, name): return f"{BOOK}:{kind}:{slug(name)}"
def source(page): return {"book": BOOK, "page": page}
def trait(name, value="", **kw): return {"name": name, "value": str(value), **kw}
def skill(names, bonus, count=1, **kw): return {"options": names if isinstance(names, list) else [names], "bonus": bonus, "count": count, **kw}
def talent(name, **kw): return {"options": [name], "ranks": 1, **kw}
def gear(label, names=None, kind="weapon", choose=False, **kw):
    return {"label": label, "kind": kind, **({"names": names} if names else {}), **({"choose": True} if choose else {}), **kw}

def profile(name, page, scores, traits, damage, ap=0, size="Average", weapon="Hand Weapon", **kw):
    sb = scores[3] // 10
    addition = sb if size in ["Large", "Enormous"] else 2*sb if size == "Monstrous" else 0
    adaptation = f"Legacy: core Size adds {addition} to the primary melee attack, changing printed {weapon} +{damage} to +{damage+addition}." if addition else ""
    return {"id": identity("creatures", name), "name": name, "page": page, "source": source(page), "example": False,
        "category": "Mounts" if page == 19 else "Trolls" if "Troll" in name else "Ogres" if "Ogre" in name else "Greenskins",
        "stats": dict(zip(KEYS, scores)), "size": size, "toughnessBonus": scores[4]//10,
        "skills": [], "talents": [], "traits": traits, "optionalTraits": [],
        "attacks": [{"name": weapon, "skill": scores[1], "damage": damage+addition, "optional": False, "free": False,
            "text": f"Printed Weapon ({weapon}) +{damage}.", **({"printedDamage": damage, "adaptation": adaptation} if adaptation else {})}],
        "armour": [{"name": f"{name} protection", "ap": ap, "locations": "Head, Arms, Body, Legs", "quick": False, "shield": False, "optional": False}] if ap else [],
        "spells": [], "sections": {}, "adaptation": adaptation, "notes": [], **kw}

def template(name, page, adjustments, skills=None, talents=None, gear=None, **kw):
    return {"id": identity("template", name), "name": name, "page": page, "source": source(page), "eligibility": "any",
        "adjustments": adjustments, "skills": skills or [], "talents": talents or [], "traits": [], "optionalTraits": [], "gear": gear or [], "notes": [], **kw}

def clean(text):
    # Missing glyphs in this PDF represent either punctuation or a minus sign.
    text = re.sub(r"�(?=\d|SL)|(?<=\s)�(?=\s)", "−", text).replace("�", "’")
    return re.sub(r"\s+", " ", text).strip()

def spells_from_pdf(doc):
    spells = []
    for page in [82,98,99,100,101]:
        category = "The Great Maw" if page == 82 else "Little Waaagh!" if page < 100 else "Big Waaagh!"
        for block in doc[page-1].get_text("blocks"):
            text = block[4]
            # A block occasionally includes two complete spells (Gaze/Hand).
            starts = list(re.finditer(r"(?m)^([^\n]+)\s*\nCN:\s*(\d+)\n", text))
            for i, match in enumerate(starts):
                body = text[match.end():starts[i+1].start() if i+1 < len(starts) else len(text)]
                fields = re.match(r"Range: (.*?)\nTarget: (.*?)\nDuration: (.*?)\n(.*)", body, re.S)
                if not fields: raise ValueError(f"Incomplete spell {match[1]} on {page}")
                name = clean(match[1])
                original = clean(fields[4])
                converted = original
                notes = []
                for label, points, sl in [("Easy",40,4),("Average",20,2),("Challenging",0,0),("Difficult",-10,-1)]:
                    printed = f"{label} ({'+' if points >= 0 else '−'}{abs(points)})"
                    converted = re.sub(r"(?<=\()[–-](?=\d)", "−", converted)
                    if printed in converted:
                        converted = converted.replace(printed, f"{label} ({'+' if sl >= 0 else '−'}{abs(sl)} SL)")
                        if points: notes.append("Printed Test Difficulty converted to Fifth Edition SL (core Appendix I p. 364).")
                if "Advantage" in converted:
                    converted = re.sub(r" If using Group Advantage.*?(?:\.|$)", "", converted)
                    converted = converted.replace("Advantage", "Momentum")
                    notes.append("Printed individual Advantage uses Momentum; the Fourth Edition Group Advantage alternative is omitted.")
                if name == "Gift of the Spider-God":
                    notes.append("Use current core Venom: Wounds inflict Poisoned; Challenging or Difficult specifies recovery Difficulty.")
                spells.append({"id": identity("spell",name), "name":name, "page":page, "category":category,
                    "cn":int(match[2]), "range":clean(fields[1]), "target":clean(fields[2]), "duration":clean(fields[3]), "text":converted,
                    **({"adaptation":" ".join(dict.fromkeys(notes))} if notes else {}), "printedText": original})
    assert len(spells) == 28, [(s['name'],s['page']) for s in spells]
    return spells

def build(decisions):
    assert hashlib.sha256(PDF.read_bytes()).hexdigest() == SHA
    for key in ["dieHard", "swampStrider", "waaaghWind", "eadbutt", "snotlingWounds", "prejudice"]:
        if key not in decisions: raise ValueError(f"User decision still required: {key}")
    doc = pymupdf.open(PDF)
    spells = spells_from_pdf(doc)
    if decisions["eadbutt"] == "one":
        spell = next(s for s in spells if s['name'].endswith('Eadbutt'))
        spell['target'] = '1'
        spell['adaptation'] = 'Legacy: user-approved Target 1 resolves printed Target You conflicting with the magic-missile effect.'
    else:
        next(s for s in spells if s['name'].endswith('Eadbutt'))['conversion'] = 'Printed Target: You conflicts with the effect describing a missile against an opponent; both are retained.'
    for spell in spells:
        spell.pop('printedText')

    an = trait("Animosity", "Greenskins")
    infected, night, dark = trait("Infected"), trait("Night Vision"), trait("Dark Vision")
    afraid = trait("Afraid", "Elves")
    base = [4,25,35,30,30,20,35,30,25,20,20,11]
    profiles = [
        profile("Basic Goblin",9,base,[afraid,an,infected,night],7,2),
        profile("Basic Gnoblar",9,[4,25,35,25,30,30,35,30,25,18,15,9],[an,infected,night],6),
        profile("Basic Forest Goblin",9,base,[afraid,an,trait("Arboreal"),infected,night],7,1),
        profile("Basic Night Goblin",9,[4,25,35,30,30,30,35,30,25,18,20,10],[afraid,an,dark,trait("Hatred","Dwarfs"),infected],7,1),
        profile("Basic Orc",10,[4,35,30,35,45,20,25,20,20,35,20,14],[an,trait("Belligerent"),infected,night],8,3,weapon="Choppa"),
        profile("Basic Savage Orc",10,[4,35,30,35,45,20,25,20,20,35,20,14],[an,trait("Belligerent"),trait("Frenzy"),infected,night,trait("Ward","10")],7,1,weapon="Stone Axe"),
        profile("Basic Black Orc",11,[4,45,30,45,45,20,25,20,20,45,20,16],[trait("Belligerent"),infected,night],9,5,weapon="Choppa"),
        profile("Basic Hobgoblin",12,[4,35,35,30,35,20,35,30,25,25,20,11],[an,infected,night],7,3),
        profile("Basic Snotling",13,[4,25,15,25,20,20,30,15,15,30,15,7],[trait("Bestial"),dark,trait("Immunity","Poison"),infected,trait("Size","Small")],4,size="Small"),
        profile("Basic Ogre",14,[6,30,20,45,45,20,25,20,20,30,20,30],[trait("Hungry"),night,trait("Prejudice","Thin People"),trait("Size","Large")],8,1,"Large",species="Ogre"),
        profile("Basic Common Troll",15,[6,30,15,55,45,10,15,15,10,20,5,30],[trait("Bite","8"),infected,trait("Regeneration"),trait("Size","Large"),trait("Stupid"),trait("Vomit")],9,2,"Large"),
    ]
    for p in profiles:
        if p['name'] in ['Basic Orc','Basic Savage Orc','Basic Black Orc','Basic Common Troll']:
            if decisions['dieHard'] == 'remove':
                p['adaptation'] += ' Legacy: undefined printed Die Hard is omitted by user decision; no resurrection effect is invented.'
            elif decisions['dieHard'] == 'retain':
                p['traits'].append(trait('Die Hard',adaptation='Legacy: retained with the user-supplied older-edition definition; no direct Fifth Edition equivalent.'))
                p['adaptation'] += ' Legacy: Die Hard retains the user-supplied older-edition definition; resurrection is reference only.'
            else:
                p['unresolved'] = ['Die Hard is undefined in the supplied books. Remove this unresolved entry explicitly before export.']
        if p['name'] == 'Basic Snotling':
            p['optionalTraits'] = [trait('Swarm'),trait('Trained','Broken, Fetch, Guard'),trait('Venom','Challenging (+0 SL)')]
            if decisions['snotlingWounds'] == 'four':
                p['stats']['W'] = 4
                p['adaptation'] = 'Legacy: printed 7 Wounds becomes 4 under Fifth Edition Small (2 × TB).'
            else: p['notes'].append('Printed 7 Wounds differs from Fifth Edition Small (2 × TB = 4); retained until explicit recalculation.')
        if p['name'] == 'Basic Savage Orc': p['notes'].append('Normally only Shields are worn; enchanted warpaint grants Ward 10 while maintained. No live faith/warpaint tracking.')
        if p['name'] == 'Basic Black Orc': p['notes'].append('No missile weapons; only Soldier, Elite, Chief or Warlord warband templates (p. 11).')
        if p['name'] == 'Basic Snotling': p['notes'].append('Only Soldier or Skirmisher templates. Only throwing weapons such as knives, rocks or Javelins benefit them (p. 13).')
    mounts = [
        ('War Boar',[7,45,None,33,35,33,35,None,10,35,10,24],6,1,'Large',[trait('Horns','7'),trait('Sprinter'),trait('Trained','Broken, Magic, Mount, War')]),
        ('Giant Wolf',[9,45,None,35,30,35,30,None,15,15,10,20],6,1,'Large',[night,trait('Sprinter'),trait('Tracker'),trait('Trained','Broken, Magic, Mount, War')]),
        ('Giant Spider',[7,35,None,35,29,20,35,30,14,35,10,20],7,1,'Large',[trait('Arboreal'),night,trait('Trained','Broken, Magic, Mount'),trait('Venom','Challenging (+0 SL)'),trait('Wallcrawler'),trait('Web','40')]),
        ('Hopping Squig',[4,45,None,50,30,10,40,None,5,15,10,12],9,0,'Average',[trait('Bounce'),infected,night,trait('Trained','Broken, Mount, War')]),
        ('Giant Squig',[4,55,None,58,38,10,40,None,5,15,10,24],9,0,'Large',[trait('Bounce'),infected,night,trait('Trained','Broken, Mount, War')]),
        ('Mournfang',[8,50,None,55,45,25,35,None,15,35,10,64],9,1,'Enormous',[trait('Horns','9'),trait('Sprinter'),trait('Tracker'),trait('Trained','Broken, Mount, War')]),
    ]
    for name,stats,damage,ap,size,traits in mounts:
        p = profile(name,19,stats,[trait('Bestial'),*traits,*([trait('Size',size)] if size != 'Average' else [])],damage,ap,size,weapon='Fangs' if name == 'Giant Spider' else 'Weapon')
        if any(t['name'] == 'Sprinter' for t in traits): p['adaptation'] += ' Legacy: printed Stride uses the user-approved core Sprinter Trait.'
        p['notes'].append('Printed Trained benefits are already included in the profile; Broken Fellowship and War WS are not applied twice.')
        profiles.append(p)
    profiles[10]['traits'] = [{**t, **({'deriveAttack':True} if t['name'] == 'Vomit' else {})} for t in profiles[10]['traits']]
    for p in profiles:
        for t in p['traits']:
            if t['name'] == 'Horns': t['deriveAttack'] = True
    profiles[10]['attacks'].append({'name':'Bite','skill':30,'damage':8,'free':True,'optional':False,'text':'Lose Momentum to make this Free Attack.'})
    chief = profile('Night Goblin Chief',16,[4,50,45,45,45,55,55,30,35,33,30,15],[afraid,an,dark,trait('Hatred','Dwarfs'),infected],8,3,weapon='Spear',example=True)
    chief['skills'] = [{'name':n,'total':v,'bonus':v-chief['stats'][c]} for n,v,c in [('Cool',48,'WP'),('Dodge',70,'Ag'),('Intimidate',60,'S'),('Intuition',70,'I'),('Leadership',45,'Fel'),('Lore (Warfare)',45,'Int'),('Melee (Basic)',70,'WS'),('Melee (Polearm)',70,'WS'),('Perception',65,'I')]]
    chief['talents'] = [{'name':n,'ranks':1} for n in ['Combat Aware','Combat Reflexes','Furious Assault','Inspiring','Resolute','War Leader']]
    chief['attacks'].append({'name':'Sword','skill':70,'damage':8,'free':False,'optional':False,'text':'Printed Weapon (Sword) +8.'})
    chief['attacks'][0]['skill'] = 70
    chief['sections']['Trappings'] = 'Leather and Mail Armour, Shield, Spear, Sword'
    chief['notes'].append('Generic worked example: printed Melee totals imply +20, while the Chief template grants +15. This foundation preserves the printed example; applying a template is a separate explicit change.')
    profiles.append(chief)
    spider = profile('Purple Skullback Spider',99,[3,35,None,5,5,20,35,30,5,5,None,1],[trait('Arboreal'),night,trait('Size','Tiny'),trait('Venom','Challenging (+0 SL)'),trait('Wallcrawler'),trait('Purple Skullback Bite')],2,size='Tiny',weapon='Fangs')
    spider['notes'].append('Tiny has no core automated Wounds formula. Keep printed 1 Wound until modified; supply a manual Wounds value after changes.')
    profiles.append(spider)

    light = gear('Leather Armour — core Light Armour (1 AP)',['Light Armour'],'armour',adaptation='Legacy: unspecified Leather Armour uses core Light Armour.')
    mail = gear('Mail Armour — core Medium Armour (3 AP)',['Medium Armour'],'armour',adaptation='Legacy: unspecified Mail Armour uses core Medium Armour.')
    armour = gear('Mail / Leather-and-Mail or Plate',['Medium Armour','Heavy Armour'],'armour',True,adaptation='Legacy: unspecified armour uses core Medium (3 AP) or Heavy (5 AP).')
    hand,shield = gear('Hand Weapon',['Hand Weapon']),gear('Shield',['Shield'],'armour')
    longweapon = gear('Polearm or Two-Handed Weapon',groups=['Polearm','Two-Handed'],choose=True)
    templates = [
        template('Soldier',16,{'WS':5,'S':5,'T':5,'I':10,'WP':5},[skill('Cool',10),skill('Dodge',10),skill(['Melee (Basic)','Melee (Polearm)'],10)],[talent('Combat Reflexes'),talent('Resolute')],[hand,light,shield,gear('Spear',['Spear (2H)'])]),
        template('Skirmisher',16,{'BS':5,'I':10,'Ag':10,'WP':5},[skill('Dodge',10),skill('Perception',10),skill(['Ranged (Bow)','Ranged (Sling)','Ranged (Throwing)'],10),skill(['Stealth (Rural)','Stealth (Underground)'],10)],[talent('Accurate Shot'),talent('Flee!')],[hand,gear('Bow, Shortbow, Sling or Throwing Weapon',['Bow (2H)','Shortbow (2H)','Sling'],groups=['Throwing'],choose=True),gear('12 shots for Bow / Sling',['Arrow (12)','Lead Bullet (12)','Stone Bullet (12)'],'ammunition',True,forWeapon=1,ammunitionFor={'Bow (2H)':['Arrow (12)'],'Shortbow (2H)':['Arrow (12)'],'Sling':['Lead Bullet (12)','Stone Bullet (12)']},skipForGroups=['Throwing'])],notes=['Throwing weapons have no printed quantity; select the weapon and enter an explicit quantity rather than invent a bundle.']),
        template('Elite',16,{'WS':10,'S':10,'T':10,'I':20,'Ag':10,'WP':15},[skill('Cool',15),skill('Dodge',15),skill('Intimidate',10),skill('Leadership',5),skill(['Melee (Basic)','Melee (Polearm)','Melee (Two-Handed)'],20)],[talent(n) for n in ['Combat Aware','Combat Reflexes','Resolute']],[longweapon,hand,mail,shield]),
    ]
    for lord in [False,True]:
        skills = [skill('Cool',25 if lord else 15),skill('Dodge',15),skill('Intimidate',25 if lord else 15),skill('Intuition',25 if lord else 15),skill('Leadership',30 if lord else 15),skill('Lore (Warfare)',20 if lord else 10),skill('Melee (Any)',20 if lord else 15,count=2),skill('Perception',20 if lord else 10),skill('Ranged (Bow)',15 if lord else 10,optional=True,label='Optional Bow and 12 arrows')]
        templates.append(template('Warlord' if lord else 'Chief',17,dict(zip(KEYS[1:10]+['Fel'],[35,10,25,30,30,25,0,15,35,15] if lord else [25,10,15,15,25,20,0,10,25,10])),skills,[talent(n) for n in ['Combat Aware','Combat Reflexes','Furious Assault','Inspiring',*(['Luck'] if lord else []),'Resolute',*(['Unshakeable'] if lord else []),'War Leader']],[longweapon,hand,armour,shield,gear('Optional Bow',['Bow (2H)'],whenSkill=8),gear('12 arrows',['Arrow (12)'],'ammunition',whenSkill=8)]))
    for lord in [False,True]:
        templates.append(template('Shaman Lord' if lord else 'Shaman',17,{'WS':10,'S':5,'T':15,'I':20,'Ag':15,'Dex':20,'Int':35,'WP':30,'Fel':10} if lord else {'I':5,'Ag':15,'Int':10,'WP':15,'Fel':15},[skill('Channelling (Any)',20 if lord else 5),skill('Cool',25 if lord else 15),skill('Dodge',20 if lord else 10),skill('Entertain (Storytelling)',25 if lord else 10),skill('Intuition',30 if lord else 15),skill('Language (Magick)',25 if lord else 10),*([skill('Leadership',15)] if lord else []),skill('Lore (Magic)',20 if lord else 10),*([skill('Lore (Theology)',10)] if lord else []),skill(['Melee (Basic)','Melee (Polearm)'],10),skill('Perception',30 if lord else 20)],[*([talent(n) for n in ['Aethyric Attunement','Instinctive Diction','Luck','Magical Sense','Menacing']] if lord else []),talent('Petty Magic'),talent('Second Sight'),*([talent('Sixth Sense')] if lord else [])],[hand,gear('Staff — core Quarterstaff',['Quarterstaff (2H)'])],warbandShaman=True,removeArmour=True,magicGroups=[{'categories':['Petty'],'minimum':0,'count':6 if lord else 3},{'categories':['Little Waaagh!','Big Waaagh!','The Great Maw','Fire'],'minimum':0,'count':9 if lord else 3}],trappings='Ritual Dress incorporating ingredients and fetishes (no quantities or Encumbrance specified)',notes=['Choose up to the printed spell limits; spellcasting in armour follows core rules.']))
    for t in templates:
        t['warband'] = True
        t['adaptation'] = ' '.join(dict.fromkeys(slot['adaptation'] for slot in t['gear'] if slot.get('adaptation')))
        if t.get('warbandShaman'): t['adaptation'] += ' Legacy: Waaagh! uses Channelling (Magick) as a user-approved proposed adaptation.'
        if t['name'] == 'Shaman Lord': t['adaptation'] += ' Printed Instinctive Diction 2 becomes one nonrepeatable core rank.'
        t['skills'].append(skill('Ride (Any)',15,optional=True,label='Optional mounted Skill (mount is a separate sheet)'))
    templates.append(template('Goblin Artillery Crew',41,{},[skill(['Ranged (Crossbow)','Ranged (Catapult)'],10)],eligibility='goblin'))

    resistance = 'Legacy: printed Magic Resistance 2 uses the fixed core Trait (−3 SL to spells targeting it), without an invented second rank.'
    strider = 'Legacy: printed Strider uses the user-approved core Striding Gait Talent.'
    troll = [
        template('Stone Troll',88,{'T':5},[skill('Climb',10)],[talent('Rover'),talent('Striding Gait (Rocky)',adaptation=strider)],eligibility='troll',trollRole='type',armour=3,replaceArmour=True,traits=[trait('Magic Resistance',adaptation=resistance),night],adaptation=resistance+' '+strider),
        template('River Troll',88,{'T':5},eligibility='troll',trollRole='type',traits=[trait('Amphibious'),trait('Distracting'),night,trait('Stealthy')]),
        template('Chaos Troll',88,{'WS':10,'S':5,'I':5,'WP':10},eligibility='troll',trollRole='type',traits=[trait('Corruption','Minor'),trait('Corrupting Vomit')],physicalMutations=2,notes=['Roll twice on the core Physical Corruption table; the Enemy in Shadows Companion alternative is outside the supplied books.']),
        template('Bile Troll',88,{'BS':-10,'T':10,'I':5,'WP':10},eligibility='troll',trollRole='type',traits=[trait('Corrosive Blood'),trait('Corruption','Moderate'),trait('Disease','The Bloody Flux'),trait('Distracting'),trait('Rotten Regeneration'),trait('Bileful Vomit')],removeTraits=['Regeneration','Vomit']),
        template('Old Troll',89,{'M':-1,'WS':10,'S':10,'T':10,'I':-5,'WP':5},talents=[{'options':['Striding Gait (Any)'],'ranks':1,'label':'Home terrain','adaptation':strider}],eligibility='troll',trollRole='modifier',traits=[night,trait('Painless'),trait('Size','Enormous'),trait('That’s No Mound')],adaptation=strider),
        template('Hungry Troll',89,{'M':1,'WS':10,'I':10,'Ag':5,'Int':-5,'WP':-10},eligibility='troll',trollRole='modifier',traits=[trait('Frenzy'),trait('Hungry'),trait('Sated'),trait('Starving')]),
        template('Hulking Troll',89,{'M':-1,'S':5,'T':5,'I':-3,'Ag':-5},eligibility='troll',trollRole='modifier',traits=[trait('Painless'),trait('Size','Enormous')]),
        template('River Troll Hag',89,{'S':10,'T':10,'I':5,'Int':30,'WP':20},[skill('Channelling (Shyish)',20),skill('Language (Magick)',20)],[talent(n) for n in ['Aethyric Attunement','Arcane Magic (Death)','Blather','Instinctive Diction','Magical Sense','Second Sight','War Wizard']],eligibility='troll',trollRole='modifier',requiresTemplate=identity('template','River Troll'),traits=[trait('Breath','Poison',deriveAttack=True,adaptation='Legacy: printed Breath +10 (Poison) uses core Poison Breath Damage TB +2, recalculated from the final Toughness.'),trait('Size','Enormous'),trait('Water Wise')],fixedSpellNames=['Bearings','Careful Step','Drain','Marsh Lights','Terrifying','Ward','Caress of Laniph','Soul Vortex','Steal Life'],notes=['The printed Petty spells are granted directly; the book does not grant a Petty Magic Talent. Water Wise suppresses Stupid only while in water.']),
    ]
    river = troll[1]
    if decisions['swampStrider'] == 'striding':
        river['traits'].append(trait('Striding Gait','Wetland',adaptation='Legacy: proposed replacement of undefined Swamp-strider by core Striding Gait (Wetland), approved by the user.'))
        river['adaptation'] = river['traits'][-1]['adaptation']
    else: river['notes'].append('Swamp-strider is undefined and unavailable; no mechanical effect is invented.')
    core = json.loads((ROOT/'dist/data/book-library.json').read_text(encoding='utf-8'))
    all_spells = [r for pack in core['packs'] if pack['manifest']['id'] == 'core' for r in pack['data'].get('spells',[])]
    for t in troll:
        if 'fixedSpellNames' in t:
            t['fixedSpells'] = []
            for name in t.pop('fixedSpellNames'):
                found = [s for s in all_spells if s['name'] == name and s.get('category') in ['Petty','Arcane','Death']]
                if len(found) != 1: raise ValueError(f'Cannot uniquely link Hag spell {name}: {found}')
                t['fixedSpells'].append(found[0].get('id', 'core:spells:'+slug(name)))
    templates.extend(troll)
    if decisions['prejudice'] == 'omit':
        profiles[9]['traits'] = [t for t in profiles[9]['traits'] if t['name'] != 'Prejudice']
        profiles[9]['adaptation'] += ' Legacy: undefined Prejudice (Thin People) omitted by user decision.'
    custom = [
        ('Die Hard',10,'','All Critical Wounds can be healed. For Toughness Bonus Rounds after death, at the start of each Round make a Challenging (+0 SL) Endurance Test. On success, return to life with 1 Wound.'),
        ('Prejudice',14,'Thin People','Printed Prejudice (Thin People); no Fifth Edition mechanical definition is supplied. This entry is a reference only, without invented Test modifiers.'),
        ('Corrupting Vomit',88,'','Those hit by a Chaos Troll’s vomit risk exposure to Corruption (Moderate).'),
        ('Rotten Regeneration',88,'','Use core Regeneration, but the Wounds restored are 1d10 divided by 2, rounded down (Tribes and Tribulations p. 88).'),
        ('Bileful Vomit',88,'','This Troll’s Vomit follows Stream of Corruption (core Lore of Nurgle); consult that shared spell reference. No live casting or damage resolution is automated.'),
        ('That’s No Mound',89,'','The Troll has Stealthy only while it has not moved or taken an Action.'),
        ('Sated',89,'','After consuming a creature of Average Size or larger in peace, the Hungry Troll template no longer applies.'),
        ('Starving',89,'','If the Hungry Troll does not eat within 24 hours it begins to suffer Starvation.'),
        ('Water Wise',89,'','While within a body of water, the River Troll Hag does not suffer from Stupid. Stupid otherwise remains active.'),
        ('Purple Skullback Bite',99,'','A creature wounded and Poisoned by this bite takes an Average (+2 SL) Cool Test or gains 1 Corruption point. A Forest Goblin Shaman still takes damage and poison, but for 2d10 hours gains a printed +2d10 bonus to Channelling and Language (Magick), and may reroll Waaagh! Miscast results. Situational bonuses are not added permanently.'),
    ]
    stream = next(s for s in all_spells if s['name'] == 'Stream of Corruption')
    custom = [(n,p,param,('The Troll’s Vomit follows core Stream of Corruption: '+stream['text']) if n == 'Bileful Vomit' else text) for n,p,param,text in custom]
    troll[-1]['adaptation'] = troll[-1]['traits'][0]['adaptation']
    abilities = [{'id':identity('trait',n),'name':n,'page':p,'source':source(p),'parameter':param,'text':text,**({'adaptation':'User-supplied older-edition definition retained; no direct Fifth Edition equivalent.'} if n == 'Die Hard' else {})} for n,p,param,text in custom if (n != 'Prejudice' or decisions['prejudice'] != 'omit') and (n != 'Die Hard' or decisions['dieHard'] == 'retain')]

    abilities[-1]['adaptation'] = 'Printed Average (+20) uses core Average (+2 SL); current Venom inflicts Poisoned on Wounds without an avoidance Test.'
    write(PACK/'rule-references.json',[{'id':identity('rule-reference',a['name']),'name':a['name'],'page':a['page'],'category':'trait','topic':'Creature abilities','text':a['text'],**({'adaptation':a['adaptation']} if a.get('adaptation') else {})} for a in abilities if a['name'] != 'Prejudice'])
    write(PACK/'spells.json',spells)
    write(ROOT/f'dist/gm/sources/{BOOK}.json',{'schemaVersion':1,'id':BOOK,'source':{'file':PDF.name,'sha256':SHA},'summary':'19 generic profiles, seven warband templates, eight Troll templates and artillery crew','profiles':profiles,'templates':templates,'training':[],'traits':abilities})
    write(PACK/'manifest.json',{'schemaVersion':1,'id':BOOK,'title':'Tribes and Tribulations','shortTitle':'Tribes & Tribulations','edition':4,'version':'1.0.0','kind':'supplement','dependsOn':['core'],'source':{'file':PDF.name,'sha256':SHA},'compatibility':{'reviewed':True,'notes':['Generic foundations remain separately sourced; named characters and adventures are excluded.','Only actual Fifth Edition replacements receive Legacy explanations.','Die Hard retains the user-supplied older-edition definition; no automatic resurrection.']},'files':{'ruleReferences':'rule-references.json','spells':'spells.json','weapons':'weapons.json','market':'market.json','gear':'gear.json','rules':'rules.json','coverage':'coverage.json','referenceEntries':'reference-entries.json'}})
    write(PACK/'rules.json',[{'id':identity('skills','ranged-catapult'),'path':['skillOptions','Ranged'],'operation':'include','value':['Catapult'],'page':41,'reason':'Printed artillery Skill specialisation.'},{'id':identity('skills','ride-mounts'),'path':['skillOptions','Ride'],'operation':'include','value':['Spider','Wolf','Boar','Squig','Mournfang'],'page':19,'reason':'Printed mounts; no free PC Skill advances.'}])
    weapons = [{'id':identity('weapons',n),'name':n,'page':41,'kind':'ranged','group':g,'enc':enc,'reach':str(r),'damage':str(d),'qualities':q} for n,g,enc,r,d,q in [('Spear Chukka','Crossbow',20,150,12,'Accurate, Crewed 2, Dangerous, Reload 3'),('Doom Diver','Catapult',20,120,13,'Accurate, Dangerous, Impact, Reload 3'),('Rock Lobber','Catapult',40,100,15,'Crewed 3, Dangerous, Imprecise, Reload 3')]]
    write(PACK/'weapons.json',weapons)
    write(PACK/'market.json',[{'id':identity('market',w['name']),'name':w['name'],'page':41,'price':'n/a','enc':w['enc'],'availability':'Not specified','category':'War machines','text':'No purchase price is supplied. Acquired/reference profile only.'} for w in weapons])
    def section(page, start, end=None, column=None):
        blocks = [b for b in doc[page-1].get_text('blocks') if b[4].strip() not in [str(page),'I','III','VII','VIII','IX','TRIBES AND TRIBUL ATIONS','TROLL T YPES']]
        if column is not None: blocks = [b for b in blocks if (b[0] >= 300) == (column == 'right')]
        text = '\n'.join(b[4] for b in sorted(blocks,key=lambda b:(b[0]>=300,b[1])))
        a = text.find(start)
        if a < 0: raise ValueError(f'Missing reviewed heading {start} p{page}')
        text = text[a+len(start):]
        if end:
            b = text.find(end)
            if b < 0: raise ValueError(f'Missing end {end} p{page}')
            text = text[:b]
        return clean(text)
    items = []
    for n,end in [('Copper Staff','Dangly Wotnotz'),('Dangly Wotnotz','Effigy of Mork'),('Effigy of Mork','Effigy of Gork'),('Effigy of Gork','Glowy Green Amulet'),('Glowy Green Amulet',None),('Shaman Staff','RESEARCH AND ORC AND GOBLIN')]:
        text = section(97,n,end,'right' if n == 'Shaman Staff' else 'left')
        adaptation = ''
        if n == 'Glowy Green Amulet':
            text = text.replace('Magic Resistance 2','Magic Resistance')
            adaptation = 'Legacy: printed Magic Resistance 2 becomes one core Talent rank; its fixed Fifth Edition effects apply.'
        items.append({'id':identity('gear',n),'name':n,'page':97,'price':'n/a','enc':None,'availability':'Not specified','category':'Magical artefacts','text':text+' No price or Encumbrance is supplied; acquired/reference only.',**({'adaptation':adaptation} if adaptation else {})})
    for n,enc,q in [('War Machine Bolt',1,'Impale, Penetrating'),('War Machine Stone',3,'Damaging, Impact')]:
        items.append({'id':identity('gear',n),'name':n,'page':41,'price':'n/a','enc':enc,'availability':'Not specified','category':'Ammunition','ammunition':{'range':'As weapon','damage':'—','qualities':q},'text':f'Printed name: {n.removeprefix("War Machine ")}. Range: as weapon; Damage: —; {q}. No price supplied.'})
    items.append({'id':identity('gear','Wulfang’s Pelt'),'name':'Wulfang’s Pelt','page':63,'price':'n/a','enc':None,'availability':'Unique artefact','category':'Magical artefacts','wearable':True,'text':'Grants the wearer one rank of core Rough Rider while worn and their mount +1 Movement. Printed name Roughrider uses the documented core spelling. No price or Encumbrance supplied; acquired/reference only. The conditional Talent and mount bonus are not permanent creator grants.'})
    write(PACK/'gear.json',items)
    refs = []
    def ref(n,page,text,category='rule'):
        refs.append({'id':identity('reference',n),'name':n,'page':page,'category':category,'topic':'Greenskins, Ogres and Trolls','text':text})
    ref('Waaagh! Channelling and Miscasts',94,'When isolated from other Orcs and Goblins, a Shaman suffers −2 SL to Channelling and Casting. When Channelling, gain +1 SL per Orc, Hobgoblin or two Goblins within Willpower yards. Use the Waaagh! Miscast table and add 2 per Orc, Hobgoblin or two Goblins within Willpower Bonus yards. The two ranges differ as printed.')
    ref('Waaagh! Lore Access',95,'Orc and Savage Orc Shamans use Big Waaagh!; Goblin, Night Goblin and Forest Goblin Shamans use Little Waaagh!. Hobgoblins may choose either; Shaman Lords can have both, with no more than two spells from one of the Talents.')
    ref('Little Waaagh! Lore Benefit',98,'A Shaman may use Casting SL to Overcast or to buy a single Fortune point. This may exceed normal maximum Fortune, but the excess lasts only until the end of the encounter.')
    ref('Big Waaagh! Lore Benefit',100,'Whenever a Big Waaagh! spell is cast, any Orcs, Hobgoblins or Goblins within Willpower yards lose their Broken Conditions.')
    ref('Shaman Shrooms',99,'Eating a piece is an Action. For 2d10 Rounds make Casting and Channelling Tests as if 2d10 additional Goblins were within Willpower Bonus yards; also add this number to Waaagh! Miscast results. Shroom Spurt has a specific additional consequence for an affected Night Goblin Shaman.')
    ref('Purple Skullback Bite',99,'On a Wound and Poisoned from the bite, make an Average (+20) Cool Test or gain 1 Corruption point. Forest Goblin Shamans instead gain a printed +2d10 Channelling and Language (Magick) bonus for 2d10 hours, and may reroll Waaagh! Miscasts. They still suffer damage and poison; Fifth Edition uses its full Venom rule.')
    ref('Idols of Gork and Mork',101,'Within Willpower yards of an idol, an Orc or Goblin Shaman gains +1 SL to Casting and Channelling. An idol of Mork additionally grants +1 SL to successfully cast Little Waaagh! spells; Gork does the same for Big Waaagh!. Animated Rogue Idols refer to the separate constructs system; no new profile is specified here.')
    ref('Gut Magic',82,section(82,'Gut Magic','Bilebrew','left'))
    for n,page in [('Gut Magic Miscast Table',83),('Waaagh! Miscast Table',96)]:
        text = section(page,n.upper())
        ref(n,page,text,'table')
    ref('Crewed War Machines',41,'The full crew needs the relevant Ranged Skill and nominates one shooter. Crew shortages impose cumulative penalties: one missing member doubles Reload time; two missing members add Imprecise; three add Shoddy. Gaining an already-owned Flaw instead adds the printed −10 Ranged Test penalty. One crew member can assist reloading Tests. Misfires affect the entire crew. Doom Divers shoot Goblins equipped with leather batwings and have no Crewed Flaw.')
    ref('Snotling Puffballs',13,'Puffballs use Rock range and Damage. A Wound also inflicts Venom of Challenging potency; use current core Venom for Poisoned and recovery.')
    ref('Savage Orc Armour',17,'Under normal circumstances Savage Orcs wear no armour except a Shield. They retain enchanted warpaint and Ward 10.')
    ref('Mounted Warband Skills',16,'A mounted character may add Ride (Any) +15. A mount is selected separately; no additional automatic characteristic or career grant is printed.')
    ref('Black Orc Restrictions',11,'Only Soldier, Elite, Chief and Warlord templates are appropriate. Black Orcs do not use missile weapons.')
    write(PACK/'reference-entries.json',refs)
    features = [('profiles','19 generic profiles','adapted',9,'Core Size, Sprinter, Snotling Wounds and Die Hard decisions; printed values otherwise preserved.'),('warband','Seven warband templates and artillery crew','adapted',16,'Current core Talents/armour, explicit equipment and species/Lore limits.'),('trolls','Four Troll types and four combinable character templates','adapted',88,'Approved Swamp-strider and core Striding Gait/Magic Resistance replacements; conditional abilities remain references.'),('magic','24 Waaagh! and four Great Maw spells','adapted',82,'Difficulty/Momentum compatibility, Target 1 correction and Magick Channelling decision.'),('equipment','War machines, ammunition and seven magic items','reference-only',41,'No supplied prices; acquired/reference profiles, unknown weights remain unresolved.'),('live','Conditional abilities, casting and campaign play','reference-only',94,'Descriptions only; no live resurrection, Conditions, healing or staff rolls automated.'),('excluded','Named characters, adventures and narrative Nemesis traits','deferred',26,'Explicit user scope; not selectable or global search content.')]
    write(PACK/'coverage.json',{'schemaVersion':1,'records':[],'features':[{'id':identity('feature',s),'name':n,'status':status,'source':source(page),'reason':reason} for s,n,status,page,reason in features]})
    index = ROOT/'dist/data/books/index.json'
    registry = json.loads(index.read_text(encoding='utf-8'))
    if not any(p['id'] == BOOK for p in registry['packs']): registry['packs'].append({'id':BOOK,'path':f'{BOOK}/manifest.json'})
    write(index,registry)
    audit = ROOT/'scripts/search-reference-review.json'
    review = json.loads(audit.read_text(encoding='utf-8'))
    review['books'][BOOK] = {'sourceHash':SHA,'publishedSHA256':hashlib.sha256((PACK/'reference-entries.json').read_bytes()).hexdigest(),'entries':len(refs),'areas':[{'first':9,'last':19,'topic':'Generic creatures and advancement'},{'first':41,'last':41,'topic':'Artillery'},{'first':82,'last':101,'topic':'Gut Magic, Trolls and Waaagh!'}],'records':[*[{'id':r['id'],'name':r['name'],'page':r['page'],'disposition':'included'} for r in refs],*[{'id':r['id'],'name':r['name'],'page':r['page'],'disposition':'included','reason':'Creator profile/template only; excluded from global search.'} for r in profiles+templates],{'id':identity('excluded','named-and-adventures'),'name':'Named characters and adventures','page':'20–81, 90–93, 102–112','disposition':'excluded','reason':'User excludes named characters; no adventure/flavour entries in mechanical search.'}]}
    write(audit,review)
    return profiles,templates,spells,doc

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--decisions',required=True)
    args = parser.parse_args()
    build(json.loads(Path(args.decisions).read_text(encoding='utf-8')))
