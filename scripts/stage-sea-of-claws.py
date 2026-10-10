"""Prepare independently reviewed additions; do not register a partial book.

Run extract-sea-of-claws.py first. Decisions and new creation handlers are
required before the rest of this pack can be published. Raw source records
remain separate from these Fifth Edition candidates.
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOK = "sea-of-claws"
SHA = "30b76209db926d2f392f184e5825601f27cffb967e5c667926e0910c775ba62c"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def identifier(kind, name):
    return f"{BOOK}:{kind}:" + re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def difficulty(text):
    changed = []
    for label, points in [("Very Easy", 60), ("Easy", 40), ("Average", 20), ("Challenging", 0), ("Difficult", -10), ("Hard", -20), ("Very Hard", -30)]:
        pattern = rf"\b{label} \([+−–-]?{abs(points)}\)"
        # Only labelled Test Difficulty is converted; ordinary numerical
        # effect bonuses and penalties retain their printed values.
        if re.search(pattern, text):
            sl = points // 10
            text = re.sub(pattern, f"{label} ({'+' if sl >= 0 else '−'}{abs(sl)} SL)", text)
            if points:
                changed.append("Printed Test Difficulty uses Fifth Edition SL modifiers (core Appendix I p. 364).")
    return text, list(dict.fromkeys(changed))


def stage(review, output):
    source = read(review / "source.json")
    if source["sha256"] != SHA:
        raise ValueError("Staged source does not match the supplied Sea of Claws PDF")
    rows = read(review / "spells.raw.json")
    candidates = []
    pending = []
    for row in rows:
        if row["name"] == "Seasickness":
            pending.append({"name": row["name"], "page": 91, "reason": "User must decide between Strength Bonus hours and one hour."})
            continue
        text, changes = difficulty(row["text"])
        row = {**row, "text": text}
        if row["name"] == "Sea of Glass":
            row["target"] = row["target"].replace("WiIlpower", "Willpower")
            row["conversion"] = "Printed WiIlpower spelling normalised to Willpower; no rule change."
        if row["name"] == "Breathe Water":
            row["text"] = row["text"].replace("drowing", "drowning")
        if changes:
            row["adaptation"] = " ".join(changes)
        candidates.append(row)
    installed = read(ROOT / "dist/data/spells.json")
    for filename in (ROOT / "dist/data/books").glob("*/spells.json"):
        installed.extend(read(filename))
    names = {entry["name"] for entry in installed}
    overlap = [entry["name"] for entry in candidates if entry["name"] in names]
    if overlap:
        raise ValueError(f"Spell names overlap installed content: {overlap}")
    assert len(candidates) == 20 and len(pending) == 1
    write(output / "spells.json", candidates)
    # No Cult whitelist is needed: the current creator already uses the
    # spells' patron categories for Bless/Invoke and escalation.
    write(output / "rules.json", [
        {"id": identifier("rule", "stromfels-patron"), "path": ["gods"], "operation": "append", "value": ["Stromfels"], "page": 91, "reason": "Printed patron of the seven new Miracles; matching Bless/Invoke remains required."},
        {"id": identifier("rule", "stromfels-blessings"), "path": ["blessings", "Stromfels"], "operation": "add", "value": ["Battle", "Breath", "Courage", "Hardiness", "Savagery", "Tenacity"], "page": 91, "reason": "Six printed Blessings reuse current core effects."},
    ])
    write(output / "market.json", [
        {"id": identifier("item", "norse-dwarf-bolt"), "name": "Norse Dwarf Bolt", "page": 44, "price": "8/–", "enc": 0, "availability": "Scarce", "category": "Ammunition", "ammunition": {"range": "As weapon", "damage": "—", "qualities": "Hullbreaker, Impale, Penetrating"}, "text": "Ballista ammunition. Hullbreaker inflicts +2 Damage against wooden structures and gains Damaging. No ammunition is assumed loaded."},
        {"id": identifier("item", "mortar-bomb"), "name": "Bomb (Mortar)", "page": 101, "price": "3 GC", "enc": 0, "availability": "Rare", "category": "Ammunition", "ammunition": {"range": "As weapon", "damage": "+12", "qualities": "Blast +5, Dangerous, Impact"}, "text": "Mortar ammunition. Printed unit/bundle quantity is not explicitly specified; do not invent a bundle."},
        {"id": identifier("item", "mortar-incendiary"), "name": "Incendiary (Mortar)", "page": 101, "price": "1 GC", "enc": 0, "availability": "Scarce", "category": "Ammunition", "ammunition": {"range": "Half weapon", "damage": "Special", "qualities": "Blast +4, Dangerous"}, "text": "Mortar ammunition, separate from the core Incendiary weapon. Inflicts 1 + SL Ablaze Conditions. Printed unit/bundle quantity is not explicitly specified."},
    ])
    write(output / "review-status.json", {
        "sourceHash": SHA,
        "registered": False,
        "ready": {"spellsAndMiracles": 20, "newAmmunition": 3},
        "pendingSpells": pending,
        "pendingDecisions": ["Norse allocations and languages", "Career variants and optional Seafarer table", "Chanty / Master and Commander", "Little / Small size conversions", "Creature Trait and Talent conversions", "Seasickness duration", "Stromfels advancement stricture", "Missing Career-table rolls 07 and 68", "Skaeling Mark of Khorne", "Artillery profile conflicts"],
        "requiredBeforeRegistration": ["User answers", "Implement and test new Career/origin/Chanty choices", "Compile source-owned GM profiles and abilities", "Finish curated mechanical references and inclusion inventory", "Validate combined packs and focused creator flows"],
        "excluded": ["Named captains and Triton", "Hireling and campaign management"],
    })
    print("Staged 20 Fifth Edition spell/Miracle candidates, Stromfels patron settings and 3 new ammunition entries. No book registered; remaining decisions are explicit.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--review-dir", type=Path, default=ROOT.parent / "sea-of-claws-review")
    parser.add_argument("--output-dir", type=Path, default=ROOT.parent / "sea-of-claws-review/pack-candidates")
    args = parser.parse_args()
    stage(args.review_dir, args.output_dir)
