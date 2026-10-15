"""Publish reviewed Taverns content from the supplied, hash-checked PDF.

MarkItDown reading: ../taverns-of-the-old-world.md. Geometry extraction below
keeps adjacent staff stat blocks and two-column reference sections separate.
No new creation mechanics, named characters, or tavern manager are imported.
"""
import hashlib
import json
import re
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
BOOK = "taverns-old-world"
PDF = Path(r"C:\Users\ninod\Downloads\Taverns of the Old World.pdf")
SHA = "07edfb947c730388c08b2ae15a50bb128fcdb559b1dbfbe08e1353210b19583c"
PACK = ROOT / "content/sources/data/books" / BOOK


def clean(text):
    return re.sub(r"\s+", " ", text.replace("\u00ad", "")).strip()


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def ident(kind, name):
    return f"{BOOK}:{kind}:{slug(name)}"


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def split(text):
    return [clean(x) for x in re.split(r",(?![^()]*\))", text)]


def skills(text):
    result = []
    for entry in split(text):
        # Printed compact notation: Melee (Basic 35, Brawling 40).
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


def profiles(doc):
    result = []
    for page in [14, 15]:
        blocks = doc[page - 1].get_text("blocks")
        for i, block in enumerate(blocks):
            title = clean(block[4])
            if not re.fullmatch(r"[A-Z ]+ \((?:BRASS|SILVER|GOLD) \d\)", title):
                continue
            name, status = title.rsplit(" (", 1)
            name = name.title()
            values = list(map(int, blocks[i + 2][4].split()))
            assert len(values) == 12, title
            stats = dict(zip(["M", "WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel", "W"], values))
            parts = [clean(b[4]) for b in blocks[i + 3:i + 7]]
            assert [x.split(":", 1)[0] for x in parts] == ["Traits", "Skills", "Talents", "Trappings"], title
            trait_text, skill_text, talent_text, trappings = [x.split(":", 1)[1].strip() for x in parts]
            skill_rows = skills(skill_text)
            attacks = []
            for weapon, damage in re.findall(r"Weapon \(([^)]+)\) \+(\d+)", trait_text):
                skill_name = "Melee (Brawling)" if weapon == "Knuckledusters" else "Melee (Basic)"
                total = next((s["total"] for s in skill_rows if s["name"] == skill_name), stats["WS"])
                attacks.append({"name": weapon, "skillName": skill_name, "skill": total, "damage": int(damage), "optional": False, "text": ""})
            assert attacks, title
            armour = []
            if name.endswith("Doorman"):
                assert "Armour 1" in trait_text and "Leather Jerkin" in trappings
                armour = [{"name": "Leather Jerkin", "ap": 1, "locations": "Body", "optional": False, "quick": False, "shield": False}]
            talent_rows = [{"name": t.replace("Nimble Fingered", "Nimble-fingered"), "ranks": 1} for t in split(talent_text)]
            notes = [f"Printed Status: {status[:-1].title()}. Printed scores, Skill totals and weapon Damage are retained; core Talent definitions govern. Permanent Talent benefits are already included in this baseline."]
            if "Nimble Fingered" in talent_text:
                notes.append("Printed Nimble Fingered uses the canonical core spelling Nimble-fingered; this naming correction is not a rule adaptation.")
            if "Melee (Basic " in skill_text or "Lore (Law " in skill_text:
                notes.append("Printed grouped Skill totals are expanded into separate specialisations without changing any numbers.")
            result.append({"id": ident("creatures", name), "name": name, "page": page,
                "source": {"book": BOOK, "page": page}, "example": False, "category": "Tavern staff",
                "species": "Human", "size": "Average", "stats": stats, "toughnessBonus": stats["T"] // 10,
                "hitLocations": ["Head", "Arms", "Body", "Legs"], "skills": skill_rows, "talents": talent_rows,
                "traits": [], "optionalTraits": [], "attacks": attacks, "armour": armour, "spells": [],
                "sections": {"Traits": "", "Trappings": trappings}, "notes": notes,
                "text": " ".join([title, clean(blocks[i + 2][4]), *parts])})
    assert len(result) == 12
    return sorted(result, key=lambda p: p["name"])


def references(doc):
    result = []
    def add(name, page, text, category="rule", notes=None):
        entry = {"id": ident("reference", name), "name": name, "category": category, "topic": "Taverns", "page": page, "text": "\n\n".join(clean(part) for part in text.split("\n\n"))}
        if notes:
            entry["notes"] = notes
        result.append(entry)
    def blocks(page, indexes):
        rows = doc[page - 1].get_text("blocks")
        return " ".join(rows[i][4] for i in indexes)
    # Drink/food definitions contain actual prices, serving sizes and Tests.
    for name, indexes in [("Ale", [4, 5]), ("Dwarf Ale", [6, 7]), ("Excellent Spirits", [8, 9]), ("Fine Wine", [10, 11]), ("Legendary Wine", [12, 13]), ("Rough Spirits", [14, 15]), ("Spirits", [16, 17]), ("Small Beer", [18, 19]), ("Strong Ale", [20, 21]), ("Wine", [22, 23])]:
        add(f"Tavern drink: {name}", 16, blocks(16, indexes), "equipment")
    for name, indexes in [("Snacks", [5, 6]), ("Stew", [7, 8]), ("Simple Meal", [9, 10]), ("Meal", [11, 12]), ("Menu", [13]), ("Fine Menu", [14, 15]), ("Lavish Menu", [16, 17])]:
        add(f"Tavern fare: {name}", 17, blocks(17, indexes), "equipment")
    add("Poor quality food and drink", 17, blocks(17, [18, 19, 20, 21]), notes="The printed WFRP p. 187 disease cross-reference belongs to Fourth Edition; use the current core disease definition. No illness is rolled by the creator.")
    for name, indexes in [("Board and Coaching Inns", [4]), ("Common Room", [5, 6]), ("Room", [7, 8]), ("Large Room", [9, 10]), ("Fine Room", [11, 12])]:
        add(f"Tavern board: {name}", 18, blocks(18, indexes), "equipment" if name != "Board and Coaching Inns" else "rule")
    add("Poor quality board", 18, blocks(18, [21]), notes="The printed WFRP p. 187 disease cross-reference belongs to Fourth Edition. Lodging is a reference, not a starting equipment purchase.")
    add("Tavern booths and privacy", 18, blocks(18, [17]))
    add("Tavern games: invitations and stakes", 24, blocks(24, [3, 4]))
    for name, index in [("Discouraged games", 6), ("Al-Zahr", 8), ("Alvatafl", 9), ("Arm Wrestling", 10), ("Beast Among the Tailors", 11), ("Bowls", 12), ("Cerevis", 13), ("Darts", 14), ("Dominos", 15), ("Mühlen", 16), ("Scarlet Empress", 17), ("Stones", 18)]:
        add(f"Tavern game: {name}", 24, blocks(24, [index]))
    # Only concrete hazard mechanics, excluding encounter stories/NPC summaries.
    for page, names in [(9, ["Trapped Treasures"]), (10, ["Hex", "Blue Mould", "Yellow Mould"])]:
        for name in names:
            row = next(b for b in doc[page - 1].get_text("blocks") if name + "." in b[4])
            add(f"Tavern hazard: {name}", page, row[4][row[4].index(name + "."):])
    # Actual tabular generators; flavour/name/customer encounter tables are omitted.
    def table_text(table):
        rows = table.extract()
        headers = [clean(x or "") for x in rows[0]]
        return "\n\n".join(f"{clean(row[0] or '')}: " + "; ".join(f"{header}: {clean(cell or '—')}" for header, cell in zip(headers[1:], row[1:])) + "." for row in rows[1:])
    add("Random Tavern Tier Table", 4, "Roll 2d10. " + table_text(doc[3].find_tables().tables[0]), "table")
    for page, heading, tiers in [(12, "Venue Vital Statistics", ["Brass", "Silver"]), (13, "Venue Vital Statistics", ["Gold"]), (19, "Capacity, Games and Entertainment", ["Brass", "Silver", "Gold"])]:
        tables = doc[page - 1].find_tables().tables
        assert len(tables) == len(tiers)
        for tier, table in zip(tiers, tables):
            legend = ""
            if page in [12, 13]:
                legend = "\n\nA: Ale; DA: Dwarf Ale; ES: Excellent Spirits; FW: Fine Wine; LW: Legendary Wine; RS: Rough Spirits; S: Spirits; SB: Small Beer; SA: Strong Ale; W: Wine. CR: Common Room; R: Room; L: Large Room; FR: Fine Room."
            add(f"{tier} Tavern {heading} Table", page, "Roll d10.\n\n" + table_text(table) + legend, "table")
    return result


def main():
    assert hashlib.sha256(PDF.read_bytes()).hexdigest() == SHA, "Supplied source changed"
    doc = pymupdf.open(PDF)
    assert len(doc) == 28
    staff = profiles(doc)
    refs = references(doc)
    # Existing Ale, Dwarf Ale, Spirits, Wine and Meal retain their core profiles.
    # Only distinct printed grades/servings are new purchases. No invented weight
    # or availability; Legendary Wine's lower bounds are not fixed retail prices.
    market = []
    for name, price, page, serving in [
        ("Rough Spirits, pint bottle", "1/–", 16, "8 shots"),
        ("Excellent Spirits, pint bottle", "4/–", 16, "8 shots"),
        ("Fine Wine, bottle", "2/8", 16, "5 glasses"),
        ("Small Beer, pint", "2d", 16, "1 pint"),
        ("Strong Ale, pint", "5d", 16, "1 pint"),
        ("Snacks, tavern serving", "2d", 17, "one serving; no printed portion size"),
        ("Stew, tavern serving", "4d", 17, "one serving; no printed portion size"),
        ("Simple Meal, tavern serving", "10d", 17, "one meal; no printed portion size"),
    ]:
        market.append({"id": ident("item", name), "name": name, "page": page, "price": price, "enc": None,
            "availability": "Unlisted", "category": "Food, drink and lodging",
            "text": f"Printed tavern fair price for {serving}. Encumbrance and Availability are not specified. This purchase records the item only; consumption, illness and venue discounts are not automated."})
    coverage = {"schemaVersion": 1, "records": [], "features": [
        {"id": ident("feature", name), "name": name, "status": status, "source": {"book": BOOK, "page": page}, "reason": reason}
        for name, status, page, reason in [
            ("Twelve generic tavern staff profiles", "implemented", 14, "Printed baseline profiles, core definitions and explicit Skill specialisations; no named NPCs or hiring system."),
            ("Eight distinct fixed-price consumables", "implemented", 16, "Printed fair prices; missing weights/Availability remain unresolved. Core duplicate profiles retained."),
            ("Tavern games, hazards, prices and generator tables", "reference-only", 24, "Concrete printed procedures in shared search, not live play or a tavern generator."),
            ("Tavern generation and management", "deferred", 3, "No venue editor, customer generator, service purchases or live illness/gambling systems."),
            ("Named taverns, patrons and descriptive encounters", "deferred", 26, "Outside creator and mechanical-rule search scope; not published.")]]}
    files = {"market": "market.json", "coverage": "coverage.json", "referenceEntries": "reference-entries.json"}
    manifest = {"schemaVersion": 1, "id": BOOK, "title": "Taverns of the Old World", "shortTitle": "Taverns", "edition": 4,
        "version": "1.0.0", "kind": "supplement", "dependsOn": ["core"], "source": {"file": PDF.name, "sha256": SHA},
        "compatibility": {"reviewed": True, "notes": ["Generic staff retain printed scores, Skill totals, Wounds and Damage. Use canonical Fifth Edition Talents, without reapplying baseline benefits.", "Standalone printed references retain original Fourth Edition wording and warnings; no live play automation or automatic Legacy tagging.", "Core duplicate equipment stays unchanged; only distinct fixed-price consumables are added with unknown weights and Availability."]}, "files": files}
    for name, data in [("manifest", manifest), ("market", market), ("coverage", coverage), ("reference-entries", refs)]:
        write(PACK / f"{name}.json", data)
    write(ROOT / f"content/sources/gm/books/{BOOK}.json", {"schemaVersion": 1, "id": BOOK, "source": manifest["source"], "summary": "Twelve generic tavern staff profiles", "profiles": staff, "templates": [], "traits": [], "training": []})
    registry_path = ROOT / "content/sources/data/books/index.json"
    registry = read(registry_path)
    if not any(p["id"] == BOOK for p in registry["packs"]):
        registry["packs"].append({"id": BOOK, "path": f"{BOOK}/manifest.json"})
    write(registry_path, registry)
    audit_path = ROOT / "scripts/search-reference-review.json"
    audit = read(audit_path)
    audit["books"][BOOK] = {"sourceHash": SHA, "publishedSHA256": hashlib.sha256((PACK / "reference-entries.json").read_bytes()).hexdigest(), "entries": len(refs),
        "areas": [{"first": 12, "last": 19, "topic": "Staff, prices, illness and actual venue tables"}, {"first": 24, "last": 24, "topic": "Abstract game procedures"}, {"first": 9, "last": 10, "topic": "Selected mechanical hazards"}],
        "records": [{"id": r["id"], "name": r["name"], "page": r["page"], "disposition": "included"} for r in refs]
        + [{"id": p["id"], "name": p["name"], "page": p["page"], "disposition": "included", "reason": "GM foundation only; excluded from shared search."} for p in staff]
        + [{"id": ident("excluded", "descriptive-material"), "name": "Flavour, customer encounters and named example venues", "page": "3–27", "disposition": "excluded", "reason": "Not mechanical rules or complete generic profiles; no NPC/template search."}]}
    write(audit_path, audit)
    print(f"Published {len(staff)} generic staff, {len(market)} purchases and {len(refs)} printed references.")


if __name__ == "__main__":
    main()
