"""Reviewed Cluster-Eye import with the user-approved Fifth Edition conversions."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF = Path(r"C:\Users\ninod\Downloads\The Cluster-Eye Tribe.pdf")
SHA = "ec7d5a19124409fc45103a35a38b94d0792ccea1ef3af8ffc1a28ad5dd6d2e8a"
assert hashlib.sha256(PDF.read_bytes()).hexdigest() == SHA
BOOK = "cluster-eye-tribe"
PACK = ROOT / f"dist/data/books/{BOOK}"
PACK.mkdir(exist_ok=True)

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+"\n", encoding="utf-8", newline="\n")

def identity(kind, slug): return f"{BOOK}:{kind}:{slug}"
def source(page): return {"book": BOOK, "page": page}
def trait(name, value="", **extra): return {"name": name, "value": str(value), **extra}
def skill(names, amount, count=1, **extra): return {"options": names if isinstance(names, list) else [names], "bonus": amount, "count": count, **extra}
def talent(name, **extra): return {"options": [name], "ranks": 1, **extra}
def gear(label, names=None, kind="weapon", choose=False, **extra):
    return {"label": label, **({"names": names} if names else {}), "kind": kind, **({"choose": True} if choose else {}), **extra}
def template(slug, name, page, adjustments, skills, talents, gear, **extra):
    return {"id": identity("template", slug), "name": name, "page": page, "source": source(page), "eligibility": "any", "adjustments": adjustments, "skills": skills, "talents": talents, "traits": [], "optionalTraits": [], "gear": gear, "notes": [], **extra}

afraid = "Legacy: the p. 19 summary gives −1 SL against Elves until a Cool Test is passed. Use core Afraid/Fear instead: no Momentum and the feared opponent's Melee attacks gain Advantage until the Extended Psychology Test is completed."
infected = "Legacy: the p. 19 Easy (+40) Endurance Test uses core Easy (+4 SL), following Appendix I p. 364."
flee = "Legacy: p. 19 increases Movement when fleeing. Core Flee! instead grants an extra Move when Disengaging, prevents Broken when Fleeing, and grants +1 SL to Pursuit Tests when escaping."
arboreal = "Add the creature's Agility Bonus in SL to Stealth and Climb Tests in woodlands."

profiles = [{
    "id": identity("creatures", "forest-goblin"), "name": "Forest Goblin", "page": 9, "source": source(9), "example": False, "category": "Greenskins",
    "stats": dict(zip(["M", "WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel", "W"], [4,25,35,30,30,20,35,30,30,20,20,11])),
    "size": "Average", "toughnessBonus": 3, "skills": [], "talents": [],
    "traits": [trait("Animosity", requiresParameter=True), trait("Arboreal"), trait("Afraid", "Elves", adaptation=afraid), trait("Infected", adaptation=infected), trait("Night Vision")],
    "optionalTraits": [], "attacks": [{"name": "Hand Weapon", "skill": 25, "damage": 7, "optional": False, "text": "Printed Weapon +7; no specific weapon is named."}],
    "armour": [{"name": "Forest Goblin Armour", "ap": 1, "locations": "Head, Arms, Body, Legs", "quick": False, "shield": False, "optional": False}],
    "spells": [], "sections": {}, "adaptation": afraid + " " + infected,
    "notes": ["This is the book's Basic Forest Goblin profile, not the Fifth Edition core Goblin with its different Characteristics.", "Animosity has no printed target: enter one explicitly before export. Armour 1 does not silently become a Shield or a particular armour piece.", "The optional Ranged +7 (25) entry names no weapon. Add an explicit ranged weapon from shared equipment rather than inventing its profile.", "Arboreal's woodlands-only bonus remains reference text. Goblins may explicitly add Ride (Spider) or Ride (Wolf) +20 (p. 9); a mount is a separate sheet."]
}]
templates = [{
    "id": identity("template", "skirmisher"), "name": "Skirmisher", "page": 8, "source": source(8), "eligibility": "any",
    "adjustments": {"BS": 5, "I": 10, "Ag": 10, "WP": 5},
    "skills": [skill("Dodge", 10), skill("Perception", 10), skill(["Ranged (Bow)", "Ranged (Sling)"], 10), skill(["Stealth (Rural)", "Stealth (Underground)"], 10)],
    "talents": [{"options": ["Flee!"], "ranks": 1, "adaptation": flee}, {"options": ["Marksman"], "ranks": 1}],
    "traits": [], "optionalTraits": [],
    "gear": [gear("Hand Weapon", ["Hand Weapon"]), gear("Bow or Sling", ["Bow (2H)", "Sling"], choose=True), gear("Ammunition for 12 shots", ["Arrow (12)", "Lead Bullet (12)", "Stone Bullet (12)"], "ammunition", True, forWeapon=1, ammunitionFor={"Bow (2H)": ["Arrow (12)"], "Sling": ["Lead Bullet (12)", "Stone Bullet (12)"]})],
    "adaptation": flee,
    "notes": ["This book's Skirmisher is a separately sourced template; it does not replace the core version.", "The Characteristic table explicitly grants BS +5. Core Marksman independently grants another +5 BS. The named Bugshot example appears to include only one of those bonuses; use the template table and current Talent rule, without copying that example's total.", "Choose the weapon, matching ammunition and Skill specialisations explicitly. One ammunition pack supplies the printed 12 shots; no free extra packs are added."]
}]
size_note = "Legacy: core Large Size adds SB3 to the primary melee attack, changing printed Fangs +7 to +10."
profiles.append({
    "id": identity("creatures", "drakwald-mancatcher"), "name": "Drakwald Mancatcher", "page": 9, "source": source(9), "example": False, "category": "Mounts",
    "stats": dict(zip(["M", "WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel", "W"], [7,35,None,35,29,20,35,30,14,35,None,20])),
    "size": "Large", "toughnessBonus": 2, "skills": [], "talents": [],
    "traits": [trait("Arboreal"), trait("Bestial"), trait("Night Vision"), trait("Size", "Large"), trait("Venom", requiresParameter=True), trait("Trained", "Mount"), trait("Wallcrawler"), trait("Web", "40")],
    "optionalTraits": [], "attacks": [{"name": "Fangs", "skill": 35, "damage": 10, "printedDamage": 7, "optional": False, "free": False, "text": "Primary melee attack", "adaptation": size_note}],
    "armour": [{"name": "Mancatcher Armour", "ap": 1, "locations": "Head, Arms, Body, Legs", "quick": False, "shield": False, "optional": False}],
    "spells": [], "sections": {}, "adaptation": size_note,
    "notes": ["The book does not specify Venom's recovery Difficulty. The GM must select it explicitly before export; no default is inferred.", "Use core Venom (p. 363): Wounds inflict Poisoned; the Difficulty applies to recovery. Spider Venom Arrows (p. 10) are a separate, nonlethal ammunition rule."]
})
hand = gear("Hand Weapon", ["Hand Weapon"])
shield = gear("Shield", ["Shield"], "armour")
light_note = "Legacy: printed Leather Armour uses core Light Armour (1 AP)."
mail_note = "Legacy: printed Mail or Leather-and-Mail uses core Medium Armour (3 AP); Plate uses core Heavy Armour (5 AP)."
light = gear("Leather Armour — core Light Armour (1 AP)", ["Light Armour"], "armour", adaptation=light_note)
mail = gear("Mail Armour — core Medium Armour (3 AP)", ["Medium Armour"], "armour", adaptation=mail_note)
armour_choice = gear("Mail / Leather-and-Mail (3 AP) or Plate (5 AP)", ["Medium Armour", "Heavy Armour"], "armour", True, adaptation=mail_note)
longweapon = gear("Polearm or Two-Handed Weapon", groups=["Polearm", "Two-Handed"], choose=True)
templates.append(template("soldier", "Soldier", 8, {"WS":5,"S":5,"T":5,"I":10,"WP":5,"Fel":5}, [skill("Cool",10),skill("Dodge",10),skill(["Melee (Basic)","Melee (Polearm)"],10)], [talent("Combat Reflexes"),talent("Resolute")], [light,hand,gear("Spear",["Spear (2H)"]),shield], adaptation=light_note))
templates.append(template("elite", "Elite", 8, {"WS":10,"S":10,"T":10,"I":20,"Ag":10,"WP":15}, [skill("Cool",15),skill("Dodge",15),skill("Intimidate",10),skill("Leadership",5),skill(["Melee (Basic)","Melee (Polearm)","Melee (Two-Handed)"],20)], [talent(n) for n in ["Combat Aware","Combat Reflexes","Feint","Resolute"]], [mail,hand,shield,longweapon], adaptation=mail_note))
for lord in [False, True]:
    bow_note = "Legacy: printed Longbow uses the core Bow (2H) profile." if lord else ""
    skills = [skill("Cool",25 if lord else 15),skill("Dodge",15),skill("Intimidate",25 if lord else 15),skill("Intuition",25 if lord else 15),skill("Leadership",30 if lord else 15),skill("Lore (Warfare)",20 if lord else 10),skill("Melee (Any)",20,count=2),skill("Perception",20 if lord else 10),skill("Ranged (Bow)",10,optional=True,forProfiles=["core:creatures:goblin",identity("creatures","forest-goblin")],label="Optional Goblin bow · includes Bow and 12 arrows",emptyLabel="No bow")]
    talents = [talent(n) for n in ["Combat Aware","Combat Reflexes","Feint","Inspiring",*(["Luck"] if lord else []),"Resolute",*(["Unshakeable"] if lord else []),"War Leader"]]
    templates.append(template("warlord" if lord else "chief", "Warlord" if lord else "Chief",8,dict(zip(["WS","BS","S","T","I","Ag","Int","WP","Fel"],[35,10,25,30,30,25,15,35,15] if lord else [25,10,15,15,25,20,10,25,10])),skills,talents,[armour_choice,hand,shield,longweapon,gear("Optional Goblin Longbow — core Bow (2H)" if lord else "Optional Goblin Bow",["Bow (2H)"],whenSkill=8,**({"adaptation":bow_note} if lord else {})),gear("12 arrows for optional Goblin bow",["Arrow (12)"],"ammunition",whenSkill=8)],adaptation=mail_note + (" " + bow_note if lord else ""),notes=["The optional bow package is restricted to Goblin foundations. Selecting its Skill also grants exactly one Bow and one pack of 12 arrows; removing the choice removes both.","Printed Warleader / Unshakable use core War Leader / Unshakeable spelling."]))

legacy_talents = {
    "Combat Reflexes": "Legacy: p. 19 gives a fixed Initiative bonus for turn order; core Combat Reflexes instead rolls Combat Initiative twice and chooses the preferred result.",
    "Resolute": "Legacy: p. 19 grants extra Strength Bonus when Charging; core Resolute instead permits a Cool Test to retain Momentum when gaining a Condition.",
    "Inspiring": "Legacy: p. 19 extends Leadership to a number of followers; core Inspiring instead grants Advantage on combat Leadership Tests.",
    "War Leader": "Legacy: p. 19 grants an ally +1 SL on a Willpower Test; core War Leader instead lets influenced allies use Leadership rather than Cool to resist Fear.",
}
for entry in templates:
    notes = []
    for slot in entry["talents"]:
        if slot["options"][0] in legacy_talents:
            slot["adaptation"] = legacy_talents[slot["options"][0]]
            notes.append(slot["adaptation"])
    if notes: entry["adaptation"] = " ".join([entry.get("adaptation", ""), *notes]).strip()

shaman_note = "Legacy: unspecified printed Arcane Magic becomes core Spellcaster (Arcane), with an explicit Channelling Wind. Beastmen may instead choose Beasts, Death or Shadows alongside Arcane spells."
diction_note = "Legacy: printed Instinctive Diction 2 is reduced to one core rank; the Fifth Edition Talent is not repeatable."
for lord in [False, True]:
    skills = [skill("Channelling (Any)",20 if lord else 5),skill("Cool",25 if lord else 15),skill("Dodge",20 if lord else 10),skill("Entertain (Storytelling)",25 if lord else 10),skill("Intuition",30 if lord else 15),skill("Language (Magick)",25 if lord else 10),*([skill("Leadership",15)] if lord else []),skill("Lore (Magic)",20 if lord else 10),*([skill("Lore (Theology)",10)] if lord else []),skill(["Melee (Basic)","Melee (Polearm)"],10),skill("Perception",30 if lord else 20)]
    talents = [*([talent("Aethyric Attunement"),talent("Instinctive Diction",adaptation=diction_note),talent("Luck"),talent("Magical Sense"),talent("Menacing")] if lord else []),talent("Petty Magic"),talent("Second Sight"),*([talent("Sixth Sense")] if lord else [])]
    templates.append(template("shaman-lord" if lord else "shaman","Shaman Lord" if lord else "Shaman",9,{"WS":10,"S":5,"T":15,"I":20,"Ag":15,"Dex":20,"Int":35,"WP":30,"Fel":10} if lord else {"T":5,"I":15,"Dex":10,"Int":15,"WP":15},skills,talents,[hand,gear("Staff — choose its core Polearm profile",groups=["Polearm"],choose=True)],traits=[trait("Spellcaster","Arcane",adaptation=shaman_note)],shaman=True,removeArmour=True,matchWind=True,magicGroups=[{"categories":["Petty"],"count":6 if lord else 3},{"categories":["Arcane"],"count":9 if lord else 3}],trappings="Ritual Dress incorporating ingredients and fetishes (no quantities or equipment statistics printed)",adaptation=shaman_note+(" "+diction_note if lord else ""),notes=["Printed spell counts are exact: six Petty and nine Arcane spells for Shaman Lord, or three of each for Shaman. Beastmen can use their selected additional Lore within the same Arcane-spell count, not as extra spells.","The template removes the foundation's printed armour. Add explicit armour only when using a GM exception such as a Skaven Warlock-Engineer; no casting immunity is automated.","Fimir spell-list options remain references because no Fimir foundation is installed. Ogre core-compatible Lore restrictions still apply: remove incompatible Spellcaster (Arcane), add an explicitly permitted Lore, choose a permitted Wind, and retain the printed spell-list/count limits. No Great Maw spells are granted by this template."]))
refs = [{"id": identity("reference", slug), "name": name, "category": "rule", "topic": "Creature templates", "page": page, "text": text} for slug,name,page,text in [
    ("applying-templates", "Applying Creature Advancement Templates", 3, "Add the template's Characteristic Advances and its Skill Advances, Talents and Trappings to a basic creature. Options may further customise it. Recalculate Wounds after changing Strength, Toughness or Willpower."),
    ("shaman-spell-lists", "Shaman Spell Lists", 8, "Ogre, Skaven and Greenskin Shamans use Petty Magic and Arcane spells. Fimir Shamans additionally use either Daemonology or Witchcraft, and may choose Fire or Shadows. Beastmen Shamans additionally choose Beasts, Death or Shadows."),
    ("shaman-armour", "Shamans and Armour", 9, "Remove the basic creature's Armour Trait when applying a Shaman template. Certain Skaven spellcasters, such as Warlock-Engineers, may be exceptions that wear armour while casting."),
    ("mounted-skills", "Goblin and Orc Mount Skills", 9, "Any Goblin may optionally take Ride (Spider) +20 or Ride (Wolf) +20. Any Orc may optionally take Ride (Boar) +20 as an additional Skill."),
    ("venom-arrows", "Spider Venom Arrows", 10, "A target wounded by an arrow dipped in Spider Venom makes a Challenging (+0) Endurance Test; failure inflicts one Poisoned Condition. A target reduced to 0 Wounds while suffering this arrow's poison becomes Unconscious, but remaining Poisoned Conditions do not put it at risk of death.")
]]
ability = {"id": identity("trait", "arboreal"), "name": "Arboreal", "page": 19, "source": source(19), "parameter": "", "text": arboreal}
write(ROOT/f"dist/gm/sources/{BOOK}.json", {"schemaVersion": 1, "id": BOOK, "source": {"file": PDF.name, "sha256": SHA}, "summary": "Forest Goblin, Drakwald Mancatcher and seven creature advancement templates", "profiles": profiles, "templates": templates, "training": [], "traits": [ability]})
write(PACK/"manifest.json", {"schemaVersion": 1, "id": BOOK, "title": "The Cluster-Eye Tribe", "shortTitle": "Cluster-Eye Tribe", "edition": 4, "version": "1.0.0", "kind": "supplement", "dependsOn": ["core"], "source": {"file": PDF.name, "sha256": SHA}, "compatibility": {"reviewed": True, "notes": ["Printed Forest Goblin statistics are retained; current core Afraid, Infected and Flee! definitions carry selective Legacy notes.", "Arboreal is an unchanged situational SL bonus, not a permanent Skill increase.", "Two profiles and seven templates use the user-approved Size, armour, Longbow and spellcasting conversions. Named NPCs, setting and adventures are excluded."]}, "files": {"rules": "rules.json", "ruleReferences": "rule-references.json", "coverage": "coverage.json", "referenceEntries": "reference-entries.json"}})
write(PACK/"rules.json", [{"id": identity("skills", "ride"), "path": ["skillOptions", "Ride"], "operation": "append", "value": ["Spider", "Wolf", "Boar"], "page": 9, "reason": "Printed mount specialisations; optional GM bonuses are separate from PC creation allocations."}])
write(PACK/"rule-references.json", [{"id": identity("rule-reference", "arboreal"), "name": "Arboreal", "category": "trait", "topic": "Creature Traits", "page": 19, "text": arboreal}])
write(PACK/"reference-entries.json", refs)
features = [("gm", "Two profiles and seven advancement templates", "adapted", 8, "Approved Size, core armour/Longbow, bounded Shaman spells, explicit choices and core Talent/Trait definitions."), ("arboreal", "Arboreal", "implemented", 19, "Printed situational SL effect; no permanent Skill calculation or Legacy conversion."), ("riding", "Goblin and Orc mount Skills", "implemented", 9, "Explicit optional +20 Ride grants; no automatic mount sheet or PC advances."), ("venom-arrows", "Spider Venom Arrows", "reference-only", 10, "Specific nonlethal ammunition rule; no printed purchase profile or live poison tracking."), ("fimir", "Fimir Shaman spell lists", "reference-only", 8, "No installed Fimir foundation; Ogre Lore restrictions remain enforced without invented grants."), ("excluded", "Named characters and adventures", "deferred", 12, "Named Vish, Bograt, Nurd and Bugshot, setting and encounters excluded by user scope.")]
write(PACK/"coverage.json", {"schemaVersion": 1, "records": [], "features": [{"id": identity("feature", slug), "name": name, "status": status, "source": source(page), "reason": reason} for slug,name,status,page,reason in features]})
index = ROOT/"dist/data/books/index.json"
registry = json.loads(index.read_text(encoding="utf-8"))
if not any(x["id"] == BOOK for x in registry["packs"]): registry["packs"].append({"id": BOOK, "path": f"{BOOK}/manifest.json"})
write(index, registry)
audit = ROOT/"scripts/search-reference-review.json"
review = json.loads(audit.read_text(encoding="utf-8"))
review["books"][BOOK] = {"sourceHash": SHA, "publishedSHA256": hashlib.sha256((PACK/"reference-entries.json").read_bytes()).hexdigest(), "entries": len(refs), "areas": [{"first": 3, "last": 19, "topic": "Creature templates, mounts, spell restrictions, Arboreal and nonlethal venom arrows"}], "records": [*[ {"id": r["id"], "name": r["name"], "page": r["page"], "disposition": "included"} for r in refs], *[{"id": x["id"], "name": x["name"], "page": x["page"], "disposition": "included", "reason": "GM creator only; excluded from shared search."} for x in profiles+templates], {"id": identity("excluded", "named"), "name": "Vish Venombarb, Bograt the Blasted, Blackhearted Nurd and Bugshot", "page": "12–15", "disposition": "excluded", "reason": "Named characters excluded by user scope."}, {"id": identity("excluded", "prose"), "name": "Incunabulum, disposition, adventures and encounter scenes", "page": "4–18", "disposition": "excluded", "reason": "Setting and adventure content, not standalone mechanical references."}, {"id": identity("excluded", "summary"), "name": "Older Talent and Trait summaries", "page": 19, "disposition": "existing", "reason": "Reuse current core definitions; Arboreal is imported separately as a sourced Trait reference."}]}
write(audit, review)
