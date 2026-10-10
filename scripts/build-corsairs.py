"""Reviewed Corsairs content from the supplied PDF; keep sparse columns geometric.

Read with MarkItDown in ../corsairs-flariel.md. Named characters, adventure
material and unresolved adaptations are deliberately outside this publication.
"""
import hashlib
import json
import re
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
BOOK = "corsairs-flariel"
PDF = Path(r"C:\Users\ninod\Downloads\The Corsairs of Captain Flariel.pdf")
SHA = "fe5a0cef5b91f482bc7c46cb817bcfa4b34bc4f32d82973a00d148fcae2c8ceb"
PACK = ROOT / "dist/data/books" / BOOK


def clean(text):
    return re.sub(r"\s+", " ", text.replace("\u00ad", "")).strip()


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def ident(kind, name):
    return f"{BOOK}:{kind}:{slug(name)}"


def source(page):
    return {"book": BOOK, "page": page}


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def adjustments(page, header, values):
    blocks = page.get_text("blocks")
    columns = [(w[4], (w[0] + w[2]) / 2) for w in page.get_text("words", clip=pymupdf.Rect(blocks[header][:4]))]
    assert [x[0] for x in columns] == ["M", "WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel", "W"]
    result = {}
    for word in page.get_text("words", clip=pymupdf.Rect(blocks[values][:4])):
        assert re.fullmatch(r"\+\d+", word[4]), word
        key, x = min(columns, key=lambda col: abs(col[1] - (word[0] + word[2]) / 2))
        assert abs(x - (word[0] + word[2]) / 2) < 2 and key not in result
        result[key] = int(word[4])
    return result


LEGACY = {
    "Catfall": "Core Catfall treats falls as deliberate and grants Advantage on falling Athletics Tests, replacing the p. 19 yards-per-SL summary.",
    "Combat Reflexes": "Core Combat Reflexes rolls Combat Initiative twice and chooses a result, replacing the p. 19 +10 Initiative.",
    "Dual Wielder": "Core Dual Wielder uses Fifth Edition two-weapon/free-attack and Parry rules, replacing the p. 18–19 reversed-dice, off-hand and defence penalties.",
    "Furious Assault": "Core Furious Assault loses Momentum for the additional attack; the printed Move alternative on p. 19 is not retained.",
    "In-fighter": "Core In-fighter uses an Opposed Melee Action to begin in-fighting and its Improvised Weapon rules, replacing the p. 18–19 longer-weapon immunity/+10 summary.",
    "Inspiring": "Core Inspiring grants Advantage on combat Leadership, replacing the p. 19 five-times audience multiplier.",
    "Menacing": "Core Menacing grants Advantage on Intimidation, replacing the p. 19 +1 SL summary.",
    "Pilot": "Core Pilot grants Advantage on Row and Sail, replacing the p. 18–19 failed-roll reversal.",
    "Public Speaker": "Printed Public Speaking uses core Public Speaker: group Charm Advantage and subsequent Leadership, replacing the p. 19 five-times audience effect.",
    "Sea Legs": "Core Sea Legs grants Advantage when a seasickness Test is required, replacing the printed abnormal-condition penalty immunity.",
    "Strong Swimmer": "Core Strong Swimmer grants Swim Advantage and +2 SL in swimming Pursuits, replacing the p. 18–19 breath-holding Toughness Bonus.",
    "Old Salt": "Core Old Salt can use the units die as SL on successful ocean Row/Sail Tests, replacing the p. 18 poor-condition immunity; the two-crew benefit remains.",
    "Flee!": "Core Flee! grants an extra Move when Disengaging, prevents Broken when Fleeing and gives +1 SL in escape Pursuits, replacing the p. 18 +1 Movement.",
    "Stone Soup": "Core Stone Soup grants food through party Foraging, replacing the p. 18 half-rations/starvation timing.",
    "Animal Affinity": "Core Animal Affinity concerns non-aggressive wild animals, replacing the p. 19 Bestial-Trait condition.",
    "Crack the Whip": "Core Crack the Whip uses Drive, animal Actions/Tests and Pursuit Movement, replacing the p. 19 whip-dependent fleeing/running bonus.",
}


def skills(text):
    result = []
    for entry in re.split(r",(?![^()]*\))", text):
        match = re.fullmatch(r"(.+?) \+(\d+)", entry.strip())
        assert match, entry
        name = match[1]
        count = 2 if name == "Melee (Any two)" else 1
        if count == 2:
            name = "Melee (Any)"
        if name == "Ride":
            name = "Ride (Any)"
        result.append({"options": [name], "bonus": int(match[2]), "count": count})
    return result


def talents(text, optional=False):
    result = []
    for name in text.split(", "):
        name = name.replace("Public Speaking", "Public Speaker")
        row = {"options": [name], "ranks": 1}
        if name in LEGACY:
            row["adaptation"] = "Legacy: " + LEGACY[name]
        if optional:
            row["optional"] = True
        result.append(row)
    return result


def templates(doc):
    result = []
    for name, page, head, nums, skill_block, talent_block, trapping_block in [
        ("Reaver Captain", 6, 15, 16, 17, 18, 19),
        ("Chief Mate", 6, 9, 10, 11, 12, 13),
        ("Corsair", 6, 21, 22, 23, 24, 25),
        ("Oarsman", 7, 10, 11, 12, 13, 14),
        ("Lookout", 7, 22, 23, 24, 25, 26),
        ("Beastmaster", 7, 16, 17, 18, 19, 20),
    ]:
        blocks = doc[page - 1].get_text("blocks")
        skill_text = clean(blocks[skill_block][4]).replace("Skills: Skills:", "Skills:").split(":", 1)[1].strip()
        talent_text = clean(blocks[talent_block][4]).split(":", 1)[1].strip()
        trapping_text = clean(blocks[trapping_block][4]).split(":", 1)[1].strip()
        gear = []
        notes = ["Template Skill bonuses use the higher of existing advances and the printed bonus, following the reviewed core-template interpretation. All printed Characteristic columns are applied exactly; current core Talent definitions govern."]
        if page == 6:
            gear = [{"label": f"Hand Weapon {i} of 2", "names": ["Hand Weapon"], "kind": "weapon"} for i in [1, 2]]
            gear += [{"label": "Leather or Mail Armour", "names": ["Light Armour", "Medium Armour"], "kind": "armour", "choose": True,
                "adaptation": "Legacy: unspecified Leather/Mail Armour uses core Light/Medium quick armour, following the previously approved conversion."},
                {"label": "Ranged Weapon", "groups": ["blackpowder", "bow", "crossbow", "engineering", "entangling", "explosives", "sling", "throwing"], "kind": "weapon", "choose": True}]
            trapping_text = ""
            notes.append("Dark Elf users may add a Sea Dragon Cloak; its printed additional Body 2 AP/Partial and maintenance are references pending the acquired-armour clarification.")
        elif name == "Lookout":
            gear = [{"label": "Knife", "names": ["Knife"], "kind": "weapon"},
                {"label": "Ranged Weapon", "groups": ["blackpowder", "bow", "crossbow", "engineering", "entangling", "explosives", "sling", "throwing"], "kind": "weapon", "choose": True}]
            trapping_text = ""
            notes.append("The duplicated printed 'Skills: Skills:' heading is corrected without changing its entries.")
        elif name == "Beastmaster":
            notes.append("Choose a mount specialisation for the printed ungrouped Ride +15. Crop has no supplied weapon profile; Crop or Whip and Net remain named Trappings for explicit GM equipment selection. Core Whip and both Net profiles are available separately; no statistics or ambiguous Net type are invented. No animal is automatically granted.")
        result.append({"id": ident("template", name), "name": name, "page": page, "source": source(page),
            "eligibility": "any", "adjustments": adjustments(doc[page - 1], head, nums),
            "skills": skills(skill_text), "talents": talents(talent_text, optional=name == "Chief Mate"),
            "traits": [], "optionalTraits": [], "gear": gear, "trappings": trapping_text, "notes": notes,
            "adaptation": "Legacy: current core Talent definitions replace the specific older effects explained on the affected Talent grants."})
    by_name = {t["name"]: t for t in result}
    assert by_name["Corsair"]["adjustments"] == {"WS": 10, "BS": 5, "S": 5, "T": 5, "I": 10, "Ag": 5, "Dex": 5, "WP": 5, "Fel": 5}
    assert by_name["Oarsman"]["adjustments"] == {"S": 10, "T": 5, "Fel": 5}
    assert by_name["Lookout"]["adjustments"] == {"I": 10, "Ag": 5, "Dex": 5}
    return sorted(result, key=lambda t: t["name"])


def dark_elf():
    return {"id": ident("creatures", "Dark Elf"), "name": "Dark Elf", "page": 6, "source": source(6),
        "example": False, "category": "Elves", "species": "Dark Elf", "size": "Average",
        "stats": dict(zip(["M", "WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel", "W"], [5, 40, 40, 30, 30, 50, 40, 40, 40, 40, 30, 13])),
        "toughnessBonus": 3, "hitLocations": ["Head", "Arms", "Body", "Legs"], "skills": [], "talents": [],
        "traits": [{"name": "Hatred", "value": "High Elves", "adaptation": "Legacy: core Hatred uses a Psychology Test and the current Melee/Ranged and immunity rules, replacing the p. 18 summary."},
            {"name": "Night Vision", "value": "", "adaptation": "Legacy: core Night Vision works in natural darkness without the dim-light prerequisite printed on p. 18."}],
        "optionalTraits": [{"name": "Frenzy", "value": ""},
            {"name": "Spellcaster", "value": "", "requiresParameter": True}, {"name": "Stealthy", "value": ""}],
        "attacks": [{"name": "Hand Weapon", "skill": 40, "damage": 7, "optional": False, "text": ""},
            {"name": "Ranged attack", "skill": 40, "damage": 9, "optional": True, "text": "Range 60 yards."}],
        "armour": [{"name": "Medium Armour", "ap": 3, "locations": "Head, Arms, Body, Legs", "optional": True, "quick": True, "shield": False}],
        "spells": [], "sections": {"Traits": "", "Trappings": ""},
        "adaptation": "Legacy: core Hatred and Night Vision replace the differing p. 18 summaries; printed Characteristics, Wounds and Damage are unchanged.",
        "notes": ["Generic GM foundation only; this is not a playable Dark Elf Species. Printed optional Armour 3 is an unspecified protection profile, not invented pieces.", "Printed Weapon +7 is unnamed. Optional Ranged +9 has range 60 yards and no named weapon. Optional Spellcaster requires an explicit Lore."]}


def spells(doc):
    blocks = doc[7].get_text("blocks")
    result = []
    for heading, body in [(3, 4), (5, 6), (7, 8), (9, 10)]:
        lines = blocks[heading][4].strip().splitlines()
        name = lines[0].title().replace("’S", "’s").replace(" Of ", " of ")
        fields = {key.lower(): clean(value) for key, value in (line.split(":", 1) for line in lines[1:])}
        text = clean(blocks[body][4])
        changes = []
        for printed, converted in [("Difficult (–10)", "Difficult (−1 SL)"), ("Hard (–20)", "Hard (−2 SL)")]:
            if printed in text:
                text = text.replace(printed, converted)
                changes.append(f"{printed} becomes {converted} under core Appendix I p. 364.")
        text = text.replace("Challenging (–0)", "Challenging (+0 SL)")
        row = {"id": ident("spell", name), "name": name, "page": 8, "category": "Dark Magic", **fields, "text": text,
            "conversion": "Printed effects remain descriptions; live casting, Conditions, extra hits and vortex movement are not automated. No playable Dark Elf Species or PC Dark Magic grant is invented."}
        if changes:
            row["adaptation"] = "Legacy: " + " ".join(changes)
        result.append(row)
    return result


def references(doc):
    def block(page, index):
        return clean(doc[page - 1].get_text("blocks")[index][4])
    return [{"id": ident("reference", name), "name": name, "page": page, "category": category,
        "topic": "Dark Elf raiders", "text": text, **({"notes": notes} if notes else {})}
        for name, page, category, text, notes in [
            ("Lore of Dark Magic: additional hits", 8, "rule", block(8, 14), "Printed SL/CN wording is retained as a reference; no live additional-hit calculation."),
            ("Sea Dragon Cloak", 6, "equipment", block(6, 26).removeprefix("SEA DRAGON CLOAKS "), "Price, Encumbrance and Availability are not printed. Acquired-armour integration is pending clarification."),
            ("Reaper bolt thrower", 10, "equipment", "Use the Ballista profile from Sea of Claws p. 100 with the Salvo (6) Quality.", "Reuses the explicitly cross-referenced naval Ballista statistics. No additional retail price or ammunition grant is inferred."),
            ("Ravenship", 10, "equipment", "| Ship name | Crew | Sail M (C) | Oar M (C) | Man | Size | T | W | Carries | Traits and Upgrades |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| Ravenship | 65 | 10 (18) | 4 (30) | +1 SL | 50 | 75 | 180 | 350 | Armoured, Flying Jib |", "Generic printed ship profile only. The named vessel, story and tactics are excluded; ship creation and management are deferred."),
        ]]


def main():
    assert hashlib.sha256(PDF.read_bytes()).hexdigest() == SHA, "Supplied source changed"
    doc = pymupdf.open(PDF)
    assert len(doc) == 21
    profile_rows = [dark_elf()]
    reviewed_templates = templates(doc)
    template_rows = [t for t in reviewed_templates if t["name"] != "Beastmaster"]
    spell_rows = spells(doc)
    refs = references(doc)
    ballista = next(w for w in read(ROOT / "dist/data/books/sea-of-claws-artillery/weapons.json") if w["name"] == "Ballista")
    reaper = {k: ballista[k] for k in ["kind", "group", "enc", "reach", "damage", "qualities"]}
    reaper.update({"id": ident("weapon", "Reaper"), "name": "Reaper", "page": 10, "qualities": reaper["qualities"] + ", Salvo 6",
        "text": "Use the naval Ballista profile (Sea of Claws p. 100) with Salvo (6), as explicitly directed on Corsairs p. 10. Acquired/reference profile only: no extra retail price is inferred."})
    features = [
        ("Dark Elf foundation", "adapted", 6, "Printed baseline and reviewed current core Trait definitions; no playable Species."),
        ("Five sea-raider templates", "adapted", 6, "Exact geometric Characteristic columns, explicit specialisations, optional Chief Mate Talents and selective core Talent/quick-armour replacements."),
        ("Four Dark Magic spells", "adapted", 8, "Printed spell parameters, core Appendix I Test Difficulties and reference-only live effects."),
        ("Reaper", "implemented", 10, "Explicit naval Ballista cross-reference plus Salvo 6; no invented price."),
        ("Sea Dragon Cloak", "reference-only", 6, "Printed additional Body protection/maintenance; acquired armour awaits clarification."),
        ("Ship's Crew and Druchii Sorceress", "deferred", 7, "Fixed-profile/Skill-heading and mixed-Lore adaptations await user answers."),
        ("Warhounds", "deferred", 13, "Dog/Size/training recipe awaits clarification; named pack is excluded."),
        ("Beastmaster", "deferred", 7, "Crop/Whip/Net equipment compatibility awaits clarification; no unchosen alternative is exported as an actual belonging."),
        ("Named characters, ships and adventures", "deferred", 11, "No named foundations, ship manager, encounter generator or adventure scenes."),
    ]
    coverage = {"schemaVersion": 1, "records": [], "features": [{"id": ident("feature", name), "name": name, "status": status, "source": source(page), "reason": reason} for name, status, page, reason in features]}
    manifest = {"schemaVersion": 1, "id": BOOK, "title": "The Corsairs of Captain Flariel", "shortTitle": "Corsairs", "edition": 4,
        "version": "1.0.0", "kind": "supplement", "dependsOn": ["core"], "source": {"file": PDF.name, "sha256": SHA},
        "compatibility": {"reviewed": True, "notes": ["Generic foundations and templates only; named characters excluded.", "Core Talents/Traits replace reviewed differing summaries with selective Legacy notes. Sparse table bonuses follow their printed columns.", "Four Dark Magic spells and acquired Reaper statistics are shared catalogues, without invented PC magic access or playable Species."]},
        "files": {"spells": "spells.json", "weapons": "weapons.json", "coverage": "coverage.json", "referenceEntries": "reference-entries.json"}}
    for name, data in [("manifest", manifest), ("spells", spell_rows), ("weapons", [reaper]), ("coverage", coverage), ("reference-entries", refs)]:
        write(PACK / f"{name}.json", data)
    write(ROOT / f"dist/gm/sources/{BOOK}.json", {"schemaVersion": 1, "id": BOOK, "source": manifest["source"],
        "summary": "Dark Elf foundation and five sea-raider templates", "profiles": profile_rows, "templates": template_rows, "traits": [], "training": []})
    path = ROOT / "dist/data/books/index.json"
    registry = read(path)
    if not any(p["id"] == BOOK for p in registry["packs"]):
        registry["packs"].append({"id": BOOK, "path": f"{BOOK}/manifest.json"})
    write(path, registry)
    path = ROOT / "scripts/search-reference-review.json"
    audit = read(path)
    audit["books"][BOOK] = {"sourceHash": SHA, "publishedSHA256": hashlib.sha256((PACK / "reference-entries.json").read_bytes()).hexdigest(), "entries": len(refs),
        "areas": [{"first": 6, "last": 8, "topic": "Generic sea-raider profiles/templates, cloak and Dark Magic"}, {"first": 10, "last": 13, "topic": "Selected generic equipment and creature recipes"}],
        "records": [{"id": r["id"], "name": r["name"], "page": r["page"], "disposition": "included"} for r in refs + profile_rows + template_rows]
        + [{"id": ident("excluded", name), "name": name, "page": page, "disposition": "excluded", "reason": reason} for name, page, reason in [
            ("Named characters, ship scenes and adventures", "3–17", "Outside creator and mechanical reference scope."),
            ("Ship's Crew and Druchii Sorceress", 7, "Adaptation questions pending."),
            ("Warhound recipe", 13, "Size/training question pending; named owner/pack excluded."),
            ("Beastmaster", 7, "Crop/Whip/Net equipment clarification pending."),
            ("Older Talent and Trait summaries", "18–19", "Reuse reviewed current core definitions; actual differences appear on affected grants, not duplicated old rule results.")]]}
    write(path, audit)
    print(f"Published {len(profile_rows)} foundation, {len(template_rows)} templates, {len(spell_rows)} spells, Reaper and {len(refs)} references; unresolved adaptations remain pending.")


if __name__ == "__main__":
    main()
