"""Reproduce the reviewed GM source from frozen, supplied-book references.

The numeric profiles and p. 29/109 tables were checked against the supplied PDF.
No named NPCs, hireling profiles/templates/quirks or live-play systems are imported.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOK = "up-in-arms"
pack = ROOT / "dist/data/books" / BOOK
manifest = json.loads((pack / "manifest.json").read_text(encoding="utf-8"))
references = json.loads((pack / "reference-entries.json").read_text(encoding="utf-8"))
names = ["Riding Horse", "Destrier — Heavy Warhorse", "Demigryph Mount"]
values = [
    [7,25,None,30,45,20,30,None,10,10,20,24],
    [4,35,None,50,50,20,20,None,10,10,30,32],
    [7,55,None,55,45,40,55,None,15,45,15,34],
]
profiles = []
for index, name in enumerate(names):
    if index == 1:  # User explicitly excluded the Destrier after conversion review.
        continue
    ref = next(r for r in references if r["category"] == "profile" and r["name"] == name)
    slug = ["riding-horse", "destrier-heavy-warhorse", "demigryph-mount"][index]
    stats = dict(zip(["M","WS","BS","S","T","I","Ag","Dex","Int","WP","Fel","W"], values[index]))
    original_damage = [6,8,9][index]
    adapted_damage = original_damage + stats["S"] // 10
    training = "Broken, Mount" + (", Shock Cavalry, War" if index else "")
    traits = [dict(name="Size",value="Large"),dict(name="Sprinter",value="",adaptation="Printed Stride is replaced with the Fifth Edition Sprinter Trait (core p. 362), following the approved older-name replacement. Sprinter changes Running movement, not the Movement score."),dict(name="Trained",value=training)]
    if index < 2:
        traits.insert(1,dict(name="Skittish",value=""))
    else:
        traits += [dict(name=n,value="") for n in ["Belligerent","Bestial","Night Vision"]]
    damage_note = f"Fifth Edition Size (Large), core p. 360, adds Strength Bonus to the primary melee attack: printed +{original_damage} becomes +{adapted_damage}. Extra attacks receive no Size bonus."
    attacks = [dict(name="Talons" if index == 2 else "Weapon",skill=stats["WS"],damage=adapted_damage,printedDamage=original_damage,optional=False,text="",adaptation=damage_note)]
    if index == 2:
        attacks.append(dict(name="Bite",skill=stats["WS"],damage=9,optional=False,text="Lose Momentum to make this Free Attack"))
    p = dict(id=f"{BOOK}:creatures:{slug}",name=name,page=ref["page"],source=dict(book=BOOK,page=ref["page"]),descriptionProfile="core:creatures:"+("horse" if index==0 else "demigryph"),category="Mounts",example=False,stats=stats,size="Large",hitLocations=["Head","Body","Forelegs","Rear Legs"],toughnessBonus=stats["T"]//10,traits=traits,skills=[],talents=[],attacks=attacks,armour=[],spells=[],optionalTraits=[],sections=dict(Traits="Size (Large): See page 360 for implications of size",Trappings="Barding (2 AP to Body, Head, Forelegs)" if index == 2 else ""),text=ref["text"],referenceId=ref["id"],adaptation=damage_note+" Printed Stride uses core Sprinter.",notes=["Fourth Edition source; printed Characteristics, Wounds and existing training benefits are retained. Added or changed options use Fifth Edition definitions."])
    if index == 2:
        p["hitLocations"] = ["Head","Body","Forelegs","Rear Legs"]
        p["linkedTrappings"] = True
        p["armour"] = [dict(name="Hide",ap=1,locations="Head, Body, Forelegs, Rear Legs",optional=False,quick=False,shield=False),dict(name="Barding",trapping="Barding (2 AP to Body, Head, Forelegs)",ap=2,locations="Head, Body, Forelegs",optional=False,quick=False,shield=False)]
        p["notes"] += ["The printed Armour values already include Barding: 1 natural AP plus 2 Barding AP on Head, Body and Forelegs; Rear Legs retain 1 AP. Barding is not counted twice.","The prose lists Trained (Magic), but the stat block does not. The starting profile follows the stat block; Magic can be added explicitly."]
    profiles.append(p)

shock = dict(id=f"{BOOK}:training:shock-cavalry",name="Shock Cavalry",source=dict(book=BOOK,page=107),page=107,requires="War",adaptation="The printed Challenging (+0) Dodge Test uses Fifth Edition Challenging (+0 SL), following core Appendix I p. 364.",text="Requires Trained (War). When Charging, a rider may move through smaller creatures to reach their target. Each trampled creature must make a Challenging (+0 SL) Dodge Test or suffer 4 + the mount’s Strength Bonus Damage. Each creature damaged reduces remaining Movement by 2 yards. Creatures the mount’s size or larger stop its progress. At the end of the Charge, enemies within melee range count as Engaged and the Charge is resolved as though one were its target. A smaller creature that has not acted this Round may forgo dodging to make one held-weapon attack against mount or rider. Unless that attack kills or disables the mount, the Charge continues.")
output = dict(schemaVersion=1,id=BOOK,source=manifest["source"],profiles=profiles,training=[shock],review=dict(pages=[29,107,109,113,114,115,116,117],profilePages=[29,109,113,114,115],excluded=["All named NPCs", "Destrier — Heavy Warhorse (p. 29): user explicitly excluded this profile.","Hireling profiles, templates, selection table and quirks (pp. 113–117): user explicitly excludes hirelings.","Mounted combat, Pursuits, Group Advantage, injuries, structure/siege rules, Endeavours and upkeep: live-play/manager systems."] ))
(ROOT / "dist/gm/sources/up-in-arms.json").write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Wrote 2 reviewed Up in Arms mount profiles and Shock Cavalry training.")
