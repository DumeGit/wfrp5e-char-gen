"""Publish reviewed Salzenmund content from the supplied, hash-checked PDF.

MarkItDown reading: ../salzenmund.md. Stat blocks and references are bounded
by PDF geometry. Named NPCs and hireling systems are deliberately excluded.
"""
import hashlib
import json
import re
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
BOOK = "salzenmund"
PDF = Path(r"C:\Users\ninod\Downloads\Salzenmund - City Of Salt & Silver (1).pdf")
SHA = "a09f59d0c2ccd854987de09be3bdbfd2828e5bfa7b8175c97af5dea11dbc81ea"
PACK = ROOT / "content/sources/data/books" / BOOK
KEYS = ["M", "WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel", "W"]


def clean(text): return re.sub(r"\s+", " ", text.replace("\u00ad", "")).strip()
def slug(text): return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
def ident(kind, name): return f"{BOOK}:{kind}:{slug(name)}"
def source(page): return {"book": BOOK, "page": page}
def read(path): return json.loads(path.read_text(encoding="utf-8"))
def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
def split(text): return [clean(x) for x in re.split(r",(?![^()]*\))", text) if clean(x)]


def origins():
    common_dwarf = ["Consume Alcohol", "Cool", "Endurance", "Entertain (Storytelling)", "Evaluate", "Intimidate"]
    rows = [
        ("Nordlander", "Human", ["Consume Alcohol", "Evaluate", "Gossip", "Haggle", "Language (Norse)", "Language (Wastelander)", "Lore (Nordland)", "Melee (Basic)", "Ranged (Bow)", "Sail", "Swim", "Trade (Any)"], [["Fisherman", "Rover"], ["Stout-hearted", "Very Resilient"]], 3),
        ("Salzenmunder", "Human", ["Charm", "Cool", "Entertain (Storytelling)", "Evaluate", "Gossip", "Haggle", "Language (Norse)", "Leadership", "Lore (Nordland)", "Melee (Basic)", "Ranged (Bow)", "Trade (Any)"], [["Doomed"], ["Savvy", "Suave"]], 3),
        ("Cragforge Clan", "Dwarf", common_dwarf + ["Language (Khazalid)", "Lore (Dwarfs)", "Lore (Geology)", "Lore (Metallurgy)", "Melee (Basic)", "Trade (Silversmith)"], [["Magic Resistance"], ["Night Vision"], ["Read/Write", "Relentless"], ["Resolute", "Strong-minded"], ["Sturdy"]], 0),
        ("Grumsson Clan", "Dwarf", common_dwarf + ["Language (Norse)", "Language (Khazalid)", "Lore (Dwarfs)", "Melee (Basic)", "Sail", "Trade (Any)"], [["Magic Resistance"], ["Night Vision"], ["Relentless", "Strong-minded"], ["Sturdy"]], 1),
    ]
    return [{"id": ident("origin", name), "name": name, "species": species, "page": 142, "skills": skills, "talents": talents, "randomTalents": random,
        "languages": ["Reikspiel"] if species == "Human" else ["Khazalid", "Reikspiel"],
        "conversion": "Use core Fifth Edition attributes, five Species Skills at +5, native Languages and Talent limits. Printed Norscan uses the existing Norse language; Sail (Any) uses the ungrouped core Sail Skill. No regional Career-roll probabilities are invented.",
        "adaptation": "Printed Fourth Edition starting Skill allocations use the approved Fifth Edition five Skills at +5 and native-language rules.",
        **({"randomTalentAlternative": "Doomed"} if name == "Nordlander" else {})} for name, species, skills, talents, random in rows]


def careers():
    levels = [
        ("Legger", "Brass", 2, ["Animal Care", "Bribery", "Consume Alcohol", "Endurance", "Evaluate", "Haggle", "Melee (Basic)", "Outdoor Survival", "Ride (Horse)", "Stealth (Rural or Urban)"], ["Criminal", "Hunter’s Eye", "Striding Gait (Forests)", "Strong Back"], ["Cranky Mule", "Large Sack", "Mask or Scarves", "Tinderbox"]),
        ("Owler", "Brass", 3, ["Athletics", "Charm", "Gossip", "Lore (Local)", "Perception", "Secret Signs (Smuggler)"], ["Dealmaker", "Etiquette (Criminals)", "Orientation", "Very Strong"], ["2 Barrels", "Hand Weapon", "Leather Jack", "Cart"]),
        ("Master Owler", "Brass", 5, ["Intimidate", "Intuition", "Lore (Law)", "Lore (Roadways)"], ["Briber", "Fearless (Roadwardens)", "Seasoned Traveller", "Strong Legs"], ["Draught Horse", "Wagon with false floor"]),
        ("Owler King", "Silver", 2, ["Language (Any)", "Leadership"], ["Kingpin", "Savvy", "Striding Gait (Mountains)", "Sturdy"], ["Disguise Kit", "Network of subordinate Owlers"]),
    ]
    # Visually verified p. 141: white crosses at T/Ag/WP; orange WS,
    # grey I and yellow Int. Text extraction does not retain these symbols.
    return [{"id": ident("career", "Owler"), "name": "Owler", "class": "Riverfolk", "species": ["Dwarf", "Halfling", "High Elf", "Human"], "page": 141,
        "advanceScheme": dict(zip(KEYS[1:-1], [2, None, None, 1, 3, 1, None, 4, 1, None])),
        "levels": [{"level": i, "name": name, "status": status, "standing": standing, "skills": skills, "talents": talents, "trappings": trappings} for i, (name, status, standing, skills, talents, trappings) in enumerate(levels, 1)],
        "conversion": "Explicit selectable alternative to Smuggler using Smuggler’s Riverfolk Class (the source prints no separate Class). Strider (Forests/Mountains) uses core Striding Gait with the printed terrain choices. Fearless (Road Wardens) uses canonical Roadwardens. Seasoned Traveller is already a core Talent and remains unchanged.",
        "adaptation": "Printed Strider uses current core Striding Gait effects. Riverfolk Class is inherited from the explicitly replaced Smuggler Career by user decision."}]


def skills(text):
    result = []
    for entry in split(text):
        group = re.fullmatch(r"(.+?) \((.+)\)", entry)
        if group and re.search(r"\d", group[2]):
            for sub in group[2].split(","):
                match = re.fullmatch(r"(.+?) (\d+)", sub.strip())
                assert match, entry
                result.append({"name": f"{group[1]} ({match[1]})", "total": int(match[2])})
        else:
            match = re.fullmatch(r"(.+?) (\d+)", entry)
            assert match, entry
            result.append({"name": match[1], "total": int(match[2])})
    return result


def gm_source(doc):
    profiles = []
    for page, start, name in [(110, 12, "Revenant Agent of the Doom Lord"), (115, 9, "Spite"), (122, 10, "Miner"), (129, 13, "Shiny Moon Goblins"), (129, 19, "Shiny Moon Skulkas"), (129, 26, "Shiny Moon Runts"), (130, 17, "Shiny Moon Snotlings")]:
        blocks = doc[page - 1].get_text("blocks")
        assert name.upper() in clean(blocks[start][4]), name
        values = [None if x == "-" else int(x) for x in blocks[start + 2][4].split()]
        assert len(values) == 12, name
        stats = dict(zip(KEYS, values))
        end = next((i for i in range(start+3, len(blocks)) if clean(blocks[i][4]).startswith("Trappings:")), start+3)
        if name == "Shiny Moon Runts": end = 30
        if name == "Revenant Agent of the Doom Lord": end = 15
        printed = " ".join(clean(b[4]) for b in blocks[start+3:end+1])
        parts = re.split(r"(Traits:|Skills:|Talents:|Trappings:|Options:)", printed)
        sections = {parts[i][:-1]: parts[i+1].strip() for i in range(1, len(parts), 2)}
        trait_text = sections["Traits"]
        skill_rows = skills(sections.get("Skills", ""))
        changes = []
        for row in skill_rows:
            row["name"] = row["name"].replace("Eltharin", "Elthárin").replace("Reikspeil", "Reikspiel")
            if row["name"] == "Ranged (Net)":
                row["name"] = "Ranged (Entangling)"
                row["adaptation"] = "User-approved Ranged (Net) → core Ranged (Entangling), retaining the printed total of 40. The distinct Night Goblin Net equipment profile remains reference-only."
                changes.append(row["adaptation"])
        talents = []
        for t in split(sections.get("Talents", "")):
            adaptation = None
            if t == "Strider (Rocky)": t = "Striding Gait (Rocky)"; adaptation = "Printed Strider (Rocky) uses core Striding Gait (Rocky)."
            if t == "Tunnel Rat": t = "Tunnel Fighter"; adaptation = "Printed Tunnel Rat uses the user-approved core Tunnel Fighter replacement."
            talents.append({"name": t, "ranks": 1, **({"adaptation": adaptation} if adaptation else {})})
        traits = []
        armour = []
        size = "Small" if name.endswith(("Runts", "Snotlings")) else "Tiny" if name == "Spite" else "Average"
        for entry in split(trait_text):
            if entry.startswith(("Armour", "Weapon", "Ranged", "Size")): continue
            match = re.fullmatch(r"(.+?)(?: \((.*)\))?", entry)
            t, value = match.groups(); value = value or ""
            adaptation = None
            if t == "Fast": t = "Sprinter"; adaptation = "Proposed user-approved Fast → core Sprinter replacement. Run movement is ×1.5; this differs from the supplied older +1 Movement/+10 Agility effect. Printed M 4 / Ag 62 remain the baseline, without adding bonuses again."
            if t == "Broken": t = "Trained"; value = "Broken"; adaptation = "Printed Broken uses core Trained (Broken), with a recorded 2d10 Fellowship roll. An absent Fellowship becomes the roll total."
            if t == "Die Hard": adaptation = "Reuses the user-approved older-edition Die Hard adaptation from Tribes and Tribulations; no direct Fifth Edition equivalent or automatic resurrection."
            if t == "Venom": value = ""; adaptation = "Printed Venom (2) provides no recovery Difficulty. Choose a core Difficulty; use full Fifth Edition Venom’s on-Wounds Poisoned effect and recovery Test."
            traits.append({"name": t, "value": value, **({"adaptation": adaptation} if adaptation else {}), **({"requiresParameter": True} if t == "Venom" else {}), **({"deriveTraining": True} if t == "Trained" else {})})
            if adaptation: changes.append(adaptation)
        if size != "Average": traits.append({"name": "Size", "value": size})
        if size == "Small":
            old = stats["W"]; stats["W"] = 2 * (stats["T"] // 10)
            changes.append(f"Printed {old} Wounds uses core Small (2 × TB): {stats['W']} Wounds.")
        if "Armour 1" in trait_text:
            armour.append({"name": "Leather Jack" if name == "Miner" else "Printed armour", "ap": 1, "locations": "Arms, Body" if name == "Miner" else "Unspecified", "optional": False, "quick": False, "shield": False})
        slots = []
        for row in list(skill_rows):
            if row["name"] == "Stealth":
                slots.append({"options": ["Stealth (Any)"], "bonus": row["total"] - stats["Ag"], "label": "Stealth specialisation (printed 70)"}); skill_rows.remove(row)
            elif row["name"] == "Melee (Basic or Polearm)":
                slots.append({"options": ["Melee (Basic)", "Melee (Polearm)"], "bonus": row["total"] - stats["WS"], "label": "Melee specialisation (printed 35)"}); skill_rows.remove(row)
        attacks = []
        for weapon, damage in re.findall(r"Weapon(?: \(([^)]+)\))? \+(\d+)", trait_text):
            weapon = weapon or ("Knife" if name.endswith("Runts") else "Sharp rocks" if name.endswith("Snotlings") else "Weapon")
            group = "Polearm" if weapon == "Sword or Spear" else "Basic"
            skill_name = f"Melee ({group})"
            score = next((s["total"] for s in skill_rows if s["name"] == skill_name), stats["WS"])
            if weapon == "Sword or Spear":
                for choice, group in [("Sword", "Basic"), ("Spear", "Polearm")]:
                    attacks.append({"name": choice, "skillName": f"Melee ({group})", "skill": stats["WS"], "damage": int(damage), "optional": choice == "Spear", "ranged": False, "free": False, "text": "Printed alternative Sword or Spear; choose the relevant Melee specialisation."})
            else:
                attacks.append({"name": weapon, "skillName": skill_name, "skill": score, "damage": int(damage), "optional": False, "ranged": False, "free": False, "text": ""})
        if "Ranged (Shortbow) +5" in trait_text:
            attacks.append({"name": "Shortbow", "skillName": "Ranged (Bow)", "skill": 45, "damage": 5, "ranged": True, "free": False, "optional": True, "text": "Printed alternative to Spear and Shield; Quiver with 10 arrows."})
        notes = ["Printed scores and Skill totals are the starting baseline; existing Talent benefits are not applied a second time."]
        if name == "Spite": notes += ["Claws, Teeth or Sharp Sticks have no printed attack Damage; choose an explicit attack rather than invent a value.", "Optional Consume Alcohol has no printed Skill total; add an explicit GM total if wanted. Old Little uses Tiny/manual Wounds; core Tiny has no automated formula.", "Spites serving Naiads may replace Arboreal with Amphibious (p. 116). Eltharin/Reikspeil use canonical Elthárin/Reikspiel spellings."]
        if name == "Miner": notes.append("Printed Melee (Two-Handed) 45 is retained, while the Hand Weapon (Pick) is Basic. Its listed +8 Damage is retained; no unprinted Melee (Basic) advance is granted. Status: Brass 4.")
        if armour and name != "Miner": notes.append("The source gives Armour 1 without locations or pieces. Protection remains labelled Unspecified; no armour pieces or location coverage are invented.")
        optional = [{"name": "Fly", "value": "6"}, {"name": "Size", "value": "Tiny", "adaptation": "Printed optional Little uses Tiny with manual Wounds after changes."}, {"name": "Size", "value": "Small"}, {"name": "Swarm", "value": ""}, {"name": "Territorial", "value": ""}] if name == "Spite" else []
        profiles.append({"id": ident("creatures", name), "name": name, "page": page, "source": source(page), "example": False, "category": "Forest spirits" if name == "Spite" else "Greenskins" if name.startswith("Shiny Moon") else "Undead" if name.startswith("Revenant") else "Townsfolk", "species": "Spite" if name == "Spite" else "Snotling" if name.endswith("Snotlings") else "Goblin" if name.startswith("Shiny Moon") else "Human", "size": size, "stats": stats, "toughnessBonus": stats["T"] // 10, "hitLocations": ["Head", "Arms", "Body", "Legs"], "skills": skill_rows, "skillSlots": slots, "talents": talents, "traits": traits, "optionalTraits": optional, "attacks": attacks, "armour": armour, "spells": [], "sections": {"Traits": "", "Trappings": sections.get("Trappings", "")}, "notes": notes, "text": printed, **({"adaptation": " ".join(changes)} if changes else {})})
    templates = []
    spite = next(p for p in profiles if p["name"] == "Spite")
    skill_chars = {s["name"]: s["char"] for s in read(ROOT / "content/sources/data/skills.json")}
    spell_ids = {s["name"]: "core:spells:" + slug(s["name"]) for s in read(ROOT / "content/sources/data/spells.json")}
    for name, page, start in [("Shrike", 115, 17), ("Mischief", 115, 23), ("Terror", 115, 30), ("Despair", 116, 11)]:
        blocks = doc[page-1].get_text("blocks")
        assert clean(blocks[start][4]) == name.upper() + " TEMPLATE"
        values = blocks[start+2][4].split(); assert len(values) == 12
        adjustments = {key: int(v) for key, v in zip(KEYS, values) if v != "-"}; assert "W" not in adjustments
        traits = []; changes = []; notes = []
        for entry in split(clean(blocks[start+3][4]).split(":",1)[1]):
            match = re.fullmatch(r"(.+?)(?: \((.*)\))?", entry); t, value = match.groups(); value = value or ""
            adaptation = None
            if t == "Flight": t = "Fly"
            if t == "Fury": t = "Frenzy"; adaptation = "Proposed user-approved Fury → core Frenzy replacement; equivalence of the older effect is not verified."
            if value == "Lore of Life": value = "Life"
            traits.append({"name": t, "value": value, **({"requiresParameter": True} if t == "Ward" else {}), **({"adaptation": adaptation} if adaptation else {})})
            if adaptation: changes.append(adaptation)
        skill_rows = []
        for s in skills(clean(blocks[start+4][4]).split(":",1)[1]):
            group = s["name"].split(" (")[0]; char = skill_chars[group]
            options = [s["name"]]
            if group == "Channelling":
                options = ["Channelling (Ghyran)"] if name == "Despair" else ["Channelling (Any)"]
                amount = 10
                changes.append(f"Printed Channelling {s['total']} is replaced by core Spellcaster’s WP +10 (83 on this foundation), with an explicit {'Ghyran Wind for Life' if name == 'Despair' else 'Wind choice'}.")
            else: amount = s["total"] - spite["stats"][char] - adjustments.get(char, 0)
            # Despair explicitly prints Charm 47 below its Fellowship 51.
            # Preserve a sourced total, rather than invent negative Advances.
            skill_rows.append({"options": options, "bonus": max(0, amount), "count": 1, **({"printedTotal": s["total"]} if amount < 0 else {})})
            if amount < 0: notes.append(f"Printed {s['name']} {s['total']} is below its resulting {char}; retain the explicit total, not invented negative Advances. Later Characteristic changes adjust that total by their difference.")
        talent_rows = [{"options": [x], "ranks": 1} for x in split(clean(blocks[start+5][4]).split(":",1)[1])]
        fixed_spells = [spell_ids[x] for x in split(clean(blocks[start+6][4]).split(":",1)[1])] if name in ["Mischief", "Despair"] else []
        if name == "Despair":
            fixed_spells.append(spell_ids["Dooming"])
            notes.append("Ward has no printed rating: choose it explicitly before export. Dooming is the innate Spite Trait using Willpower; it does not grant Bless/Invoke or require worship of Morr.")
        if name == "Shrike": notes += ["Core Tiny has no defined Wounds formula, including for its Swarm; set Wounds explicitly after applying the template.", "Core Swarm adds +10 WS after the printed template adjustments. Template Skills retain their printed bonus relative to the adjusted foundation, so Melee (Basic) becomes 68 with Swarm; GM totals can be overridden explicitly."]
        templates.append({"id": ident("templates", name), "name": name, "page": page, "source": source(page), "eligibility": "any", "profileIds": [spite["id"]], "foundationLabel": "Spite", "adjustments": adjustments, "skills": skill_rows, "talents": talent_rows, "traits": traits, "optionalTraits": [], "gear": [], "fixedSpells": fixed_spells, "notes": notes, **({"adaptation": " ".join(changes)} if changes else {})})
    dooming = clean(doc[115].get_text("blocks")[9][4]).split(":",1)[1].strip()
    return {"schemaVersion": 1, "id": BOOK, "source": {"file": PDF.name, "sha256": SHA}, "summary": "Seven generic profiles and four Spite templates", "profiles": sorted(profiles, key=lambda x:x["name"]), "templates": sorted(templates, key=lambda x:x["name"]), "traits": [{"id": ident("trait", "Dooming"), "name": "Dooming", "page": 116, "source": source(116), "text": dooming}], "training": []}


def references(doc):
    result = []
    def blocks(page, indexes): return "\n\n".join(clean(doc[page-1].get_text("blocks")[i][4]) for i in indexes)
    def table(page, index=0):
        rows = doc[page-1].find_tables().tables[index].extract()
        headers = [clean(x or "") for x in rows[0]]
        return "\n\n".join(f"{clean(row[0] or '')}: " + "; ".join(f"{heading}: {clean(cell or '—')}" for heading, cell in zip(headers[1:], row[1:])) + "." for row in rows[1:])
    def add(name, page, text, category="rule", topic="Salzenmund", notes=None):
        result.append({"id": ident("reference", name), "name": name, "page": page, "category": category, "topic": topic, "text": text, **({"notes": notes} if notes else {})})
    add("Enchanted Masks", 57, "Choose a suitable personality or roll d10.\n\n" + table(57) + "\n\n" + blocks(57,[46]), "table", "Magic items", "Printed magical rewards for reading only; no price, Encumbrance or automatic mask effects are invented. Older Talent names/bonuses remain source wording.")
    add("Fulcrum of Azyr", 62, blocks(62,[4]).removeprefix("FULCRUM OF AZYR "), topic="Magic")
    add("Morning Fury", 100, blocks(100,[10]).split("The Steinhafen Pits",1)[0] + "\n\n" + blocks(100,[11]).split("The Red Child",1)[0], topic="Psychology")
    add("Chokan’s Fate rewards", 101, "A supplicant offering a shiny object and praying has a 5% chance of receiving a reward. Roll d100.\n\n" + table(101), "table", "Fate and Fortune", "Printed Fourth Edition reward/refill rules are references only; Fifth Edition Fate and Fortune are separate. No creator rewards are granted.")
    add("Dooming — Spite ability", 116, blocks(116,[9]).split(":",1)[1].strip(), "trait", "Creature Traits")
    add("Spites serving Naiads", 116, "Spites who serve Naiads may swap the Arboreal Trait for Amphibious.", topic="Creature Traits")
    add("Join the Dance — resisting Spite enchantment", 117, blocks(117,[7]), topic="Magic")
    add("Prospecting for a mineral strike", 125, blocks(125,[5]).removeprefix("How Large a Strike? "), topic="Mining")
    add("Prospecting Factors", 125, table(125), "table", "Mining", "The source prints Challenging (−20) Gossip, an inconsistent label/modifier. This reference preserves that ambiguity; the creator does not resolve or roll prospecting.")
    add("Size of Strike", 126, table(126,1), "table", "Mining", "Printed +0 to +1 and −0 to −1 both include zero; no automatic result or invented correction is supplied.")
    add("Mining Equipment", 126, table(126,2), "table", "Mining", "Mine-enterprise assets and maintenance are references, not ordinary carried equipment. No missing weights or campaign manager are invented.")
    add("Mine Events", 127, blocks(127,range(3,18)), "table", "Mining")
    add("Night Goblin Net", 129, blocks(129,[3]) + "\n\n" + table(129,3), "equipment", "Weapons", "Printed Night Goblins Group/Strength 40 Entangle profile is reference-only; it does not replace the existing core Net or invent a Ranged group, price or weight.")
    trap_text = blocks(130,[22]).split("Deadfall",1)[1]
    for name,end in [("Deadfall", "Spiky Pit"), ("Spiky Pit", "Snare"), ("Snare", None)]:
        text = ("Deadfall" + trap_text).split(name,1)[1]
        if end: text = text.split(end,1)[0]
        add(name + " — Shiny Moon trap", 130, name + " " + text.strip(), topic="Traps")
    add("Bribery for smuggled cargo", 136, blocks(136,[10]) + "\n\n" + table(136), "table", "Smuggling")
    add("Caught smuggling", 136, blocks(136,[30]) + "\n\n" + blocks(136,[3]).split("The Silversmiths’ Guild",1)[0], topic="Smuggling")
    add("Community Size ratings", 138, table(138), "table", "Smuggling")
    add("Community Wealth ratings", 138, table(138,1), "table", "Smuggling")
    add("Finding contraband", 138, blocks(138,[25]), topic="Smuggling")
    add("Smuggled Goods Generator", 139, "Roll d100.\n\n" + table(139) + "\n\n" + blocks(139,[17]), "table", "Smuggling")
    add("Selling smuggled goods", 139, blocks(139,[18,19,20,21]), topic="Smuggling")
    add("Smuggling Events", 140, blocks(139,[24]) + "\n\nRoll d10.\n\n" + table(140), "table", "Smuggling")
    return result


def main():
    assert hashlib.sha256(PDF.read_bytes()).hexdigest() == SHA, "Supplied source changed"
    doc = pymupdf.open(PDF); assert len(doc) == 143
    gm = gm_source(doc); refs = references(doc)
    rules = [{"id": ident("rule", group), "path": [kind, group], "operation": "include", "value": values, "page": page, "reason": reason} for kind,group,values,page,reason in [
        ("skillOptions", "Lore", ["Nordland", "Roadways"],142,"Printed regional/Career Lore choices use core Lore."),
        ("skillOptions", "Trade", ["Silversmith"],142,"Printed Cragforge Trade choice uses core Trade."),
        ("talentOptions", "Striding Gait", ["Forests", "Mountains"],141,"Preserve printed terrain names as core Striding Gait choices; the core list gives examples, not a closed list.")]]
    feature_rows = [
        ("Four regional origins", "adapted",142,"Approved five Skills at +5, native Languages and core limits; Nordlander Doomed/random is one exclusive slot."),
        ("Owler Smuggler variant", "adapted",141,"Explicit Riverfolk alternative; printed scheme and Career options, Strider → Striding Gait. Core Smuggler and roll probabilities stay unchanged."),
        ("Seven generic foundations and four Spite templates", "adapted",115,"Approved core Size, Sprinter, Frenzy, Die Hard, Tunnel Fighter and Trained conversions; explicit Stealth/Melee/Wind/Venom/Ward choices. No named NPCs."),
        ("Dooming Spite ability", "implemented",116,"Printed innate Willpower-based Dooming with core Miracle reference, no invented worship/Talents."),
        ("Curated mechanical rules and tables", "reference-only",125,"Bounded mining/smuggling, mask and magic procedures; original source wording with separate discrepancy/scope notes."),
        ("Night Goblin Net", "reference-only",129,"Unknown core weapon Group/price/weight is not guessed; core Net stays unchanged."),
        ("Mine enterprises, hirelings, live smuggling and magical rewards", "deferred",126,"No campaign/enterprise/hiring manager, mask bonuses or automatically granted boons."),
        ("Named characters, rumours, encounters and setting prose", "deferred",118,"Named characters and flavour-only material are excluded from foundations and shared rules search.")]
    coverage = {"schemaVersion":1,"records":[],"features":[{"id":ident("feature",name),"name":name,"status":status,"source":source(page),"reason":reason} for name,status,page,reason in feature_rows]}
    files = {key:key+".json" for key in ["origins","careers","rules","coverage"]}; files["referenceEntries"] = "reference-entries.json"
    manifest = {"schemaVersion":1,"id":BOOK,"title":"Salzenmund: City of Salt and Silver","shortTitle":"Salzenmund","edition":4,"version":"1.0.0","kind":"supplement","dependsOn":["core"],"source":{"file":PDF.name,"sha256":SHA},"compatibility":{"reviewed":True,"notes":["Explicit user-approved Fifth Edition origins and Riverfolk Owler alternative; existing core careers/equipment remain unchanged.","Generic profiles use current Traits/Talents and approved individual conversions with selective Legacy notes. Printed baseline benefits are not reapplied.","Four Spite templates require their Spite foundation, explicit missing parameters and Tiny/manual Wounds. Spellcaster uses current WP +10 Channelling rather than conflicting source totals.","Standalone source references retain printed Fourth Edition wording. Named NPCs, hireling systems, enterprise/live-play managers and flavour-only prose are excluded."]},"files":files}
    for name,data in [("manifest",manifest),("origins",origins()),("careers",careers()),("rules",rules),("coverage",coverage),("reference-entries",refs)]: write(PACK / (name+".json"),data)
    write(ROOT / "content/sources/gm/books/salzenmund.json",gm)
    path = ROOT / "content/sources/data/books/index.json"; registry = read(path)
    if not any(p["id"] == BOOK for p in registry["packs"]): registry["packs"].append({"id":BOOK,"path":f"{BOOK}/manifest.json"})
    write(path,registry)
    path = ROOT / "scripts/search-reference-review.json"; audit = read(path)
    audit["books"][BOOK] = {"sourceHash":SHA,"publishedSHA256":hashlib.sha256((PACK / "reference-entries.json").read_bytes()).hexdigest(),"entries":len(refs),"areas":[{"first":57,"last":62,"topic":"Bounded magic effects"},{"first":100,"last":101,"topic":"Morning Fury and fate rewards"},{"first":115,"last":117,"topic":"Spite rules"},{"first":125,"last":130,"topic":"Mining tables and traps"},{"first":136,"last":142,"topic":"Smuggling and creation"}],"records":[{"id":r["id"],"name":r["name"],"page":r["page"],"disposition":"included"} for r in refs]+[{"id":p["id"],"name":p["name"],"page":p["page"],"disposition":"included","reason":"GM catalogue only; no NPC/template search."} for p in gm["profiles"]+gm["templates"]]+[{"id":ident("excluded",name),"name":name,"page":page,"disposition":"excluded","reason":reason} for name,page,reason in [("Named characters and named Spites","18–137","User excludes named foundations/encounters."),("Attendant Spites and mine staff hiring","116–126","Hireling systems deferred."),("Setting, adventures and rumours","4–140","No flavour-only rules results or named NPCs.")]]}
    write(path,audit)
    print(f"Published four origins, Owler, {len(gm['profiles'])} profiles, {len(gm['templates'])} templates and {len(refs)} references.")


if __name__ == "__main__": main()
