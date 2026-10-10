"""Stage Sea of Claws creator records without enabling unapproved conversions.

The MarkItDown text is the reading copy. This coordinate-aware extraction
preserves Career symbols, split columns and profile baselines for review.
Output stays outside dist: it is source material, not Fifth Edition app data.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

import pdfplumber
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
SHA = "30b76209db926d2f392f184e5825601f27cffb967e5c667926e0910c775ba62c"
BOOK = "sea-of-claws"
CHARACTERISTICS = ["WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel"]
PROFILE_KEYS = ["M", *CHARACTERISTICS, "W"]
CAREERS = {
    64: "Beachcomber", 66: "Chantyman", 68: "Huffer", 70: "Officer",
    72: "Sailor", 74: "Sailor-Priest of Manann", 76: "Ship’s Gunner",
    78: "Wrecker", 90: "Priest of Stromfels",
}
PROFILES = {
    140: ["LURKERFISH"], 141: ["GYMMCRABS", "LATCH EEL", "DAGGERFISH"],
    142: ["SEA ELEMENTAL"], 143: ["GARGANTUAN"], 144: ["KHARIBDYSS"],
    145: ["MERWYRM", "SYREEN"], 146: ["BONE HYDRA", "LEECH WYRM"],
    147: ["ORB LEVIATHAN", "BLACK LEVIATHAN"],
}


def clean(text):
    return re.sub(r"\s+", " ", text.replace("\u00ad", "").replace("ﬁ", "fi").replace("ﬂ", "fl")).strip()


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def split_list(text):
    result, start, depth = [], 0, 0
    for i, char in enumerate(text):
        depth += (char == "(") - (char == ")")
        if char == "," and depth == 0:
            result.append(clean(text[start:i]))
            start = i + 1
    result.append(clean(text[start:]))
    return [entry for entry in result if entry]


def career(page, number, name):
    words = page.extract_words()
    header = next(word for word in words if word["text"] == "WS")
    y = header["top"]
    columns = [word for word in words if abs(word["top"] - y) < 2 and word["text"] in CHARACTERISTICS + ["Agi"]]
    centers = {("Ag" if word["text"] == "Agi" else word["text"]): (word["x0"] + word["x1"]) / 2 for word in columns}
    assert len(centers) == 10, (number, centers)
    column = lambda x: min(centers, key=lambda key: abs(centers[key] - x))
    scheme = {key: None for key in CHARACTERISTICS}
    for char in page.chars:
        if char["text"] == "h" and "crossbatstfb" in char["fontname"] and y + 8 < char["top"] < y + 25:
            scheme[column((char["x0"] + char["x1"]) / 2)] = 1
    for shape in page.rects + page.curves:
        color = shape.get("non_stroking_color")
        if y + 8 < shape["top"] < y + 21 and 15 < shape["x1"] - shape["x0"] < 35 and isinstance(color, (tuple, list)) and len(color) == 3:
            level = 4 if color[0] > .9 and color[2] < .3 else 3 if abs(color[0] - color[1]) < .05 and .7 < color[0] < .85 else 2 if color[0] > color[1] > color[2] and color[0] > .6 else None
            if level:
                scheme[column((shape["x0"] + shape["x1"]) / 2)] = level
    assert sorted(value for value in scheme.values() if value) == [1, 1, 1, 2, 3, 4], (number, scheme)
    x0, x1 = min(centers.values()) - 17, max(centers.values()) + 22
    path = page.crop((x0, y + 25, x1, page.height - 30))
    path = path.filter(lambda obj: obj.get("object_type") != "char" or 8.8 < obj.get("size", 0) < 9.2)
    text = path.extract_text(x_tolerance=2, y_tolerance=3)
    headings = list(re.finditer(r"(?m)^\s*(?:h\s+)?(.+?)\s*(?:[—–-]\s*)?(Brass|Silver|Gold)\s+(\d)\s*$", text))
    levels = []
    for i, heading in enumerate(headings):
        chunk = text[heading.end():headings[i + 1].start() if i + 1 < len(headings) else len(text)]
        fields = re.search(r"Skills:\s*(.*?)\s*Talents:\s*(.*?)\s*Trappings:\s*(.*)", chunk, re.S)
        assert fields, (number, i, chunk)
        levels.append({"level": i + 1, "name": clean(heading[1]).rstrip(" –—-"), "status": heading[2], "standing": int(heading[3]), "skills": split_list(fields[1]), "talents": split_list(fields[2]), "trappings": split_list(fields[3])})
    assert len(levels) == 4 and [len(level["skills"]) for level in levels] == [10, 6, 4, 2], (number, levels)
    title = page.crop((40, 40, 560, 103)).extract_text()
    species = next(match[0].strip().rstrip(",") for line in title.splitlines() if (match := re.match(r"(?:(?:Dwarf|Halfling|High Elf|Human|Wood Elf)(?:,\s*|\s*(?=$|[‘A-Z])))+", line)))
    return {"id": f"{BOOK}:career:{slug(name)}", "name": name, "class": "Seafarer", "species": split_list(species), "page": number, "advanceScheme": scheme, "levels": levels}


def spells(document):
    result = []
    for number in [15, 87, 91]:
        for block in document[number - 1].get_text("blocks"):
            text = block[4]
            starts = list(re.finditer(r"(?m)^([^\n]+)\n(?:CN:\s*(\d+)\n)?Range:\s*", text))
            for i, match in enumerate(starts):
                body = text[match.end():starts[i + 1].start() if i + 1 < len(starts) else len(text)]
                fields = re.match(r"(.*?)\nTarget: (.*?)\nDuration: (.*?)\n(.*)", body, re.S)
                assert fields, (number, match[1])
                name = clean(match[1])
                category = "Life" if name in ["Living Mire", "Water Water Everywhere", "Whirlpool"] else "Heavens" if number == 15 else "Manann" if number == 87 else "Stromfels"
                result.append({"id": f"{BOOK}:spell:{slug(name)}", "name": name, "category": category, "page": number, **({"cn": int(match[2])} if match[2] else {}), "range": clean(fields[1]), "target": clean(fields[2]), "duration": clean(fields[3]), "text": clean(fields[4])})
    assert len(result) == 21, [(entry["name"], entry["page"]) for entry in result]
    # The overcasting table is separate from the Whirlpool text block.
    result_by_name = {entry["name"]: entry for entry in result}
    result_by_name["Whirlpool"]["text"] += " Overcasting: 5 SL — Whirlpool; 8 SL — Powerful Vortex; 13 SL — A Maelstrom; 21+ SL — The Maelstrom."
    mood_table = document[90].find_tables().tables[0].extract()
    assert mood_table[0] == ["d10 Roll", "Result"] and len(mood_table) == 5
    result_by_name["Manann’s Mood Made Meaningless"]["text"] += " " + " ".join(f"{clean(row[0])}: {clean(row[1]).replace('Teh ', 'The ')}" for row in mood_table[1:])
    return result


def profiles(document):
    result = []
    for number, names in PROFILES.items():
        blocks = document[number - 1].get_text("blocks")
        for name in names:
            heading = next(block for block in blocks if clean(block[4]) == name)
            following = sorted([block for block in blocks if abs((block[0] + block[2]) / 2 - (heading[0] + heading[2]) / 2) < 65 and block[1] > heading[1]], key=lambda block: block[1])
            header = next(block for block in following if clean(block[4]).startswith("M WS BS"))
            values = next(block for block in following if block[1] > header[1])
            raw_values, _, merged_details = values[4].partition("Traits:")
            scores = clean(raw_values).split()
            assert len(scores) == 12 and all(value.isdigit() or value in ["–", "—", "-"] for value in scores), (number, name, scores)
            details = values if merged_details else next(block for block in following if block[1] > values[1] and clean(block[4]).startswith("Traits:"))
            text = "Traits: " + clean(merged_details) if merged_details else clean(details[4])
            # Some optional rows are a separate block beneath the main panel.
            extras = [block for block in following if details[3] <= block[1] < details[3] + 12 and clean(block[4]).startswith(("Optional:", "Optional Traits:", "Talents:"))]
            if extras:
                text += " " + " ".join(clean(block[4]) for block in extras)
            display = "Gymmcrab" if name == "GYMMCRABS" else "Latch-Eel" if name == "LATCH EEL" else name.title()
            result.append({"name": display, "page": number, "stats": dict(zip(PROFILE_KEYS, [int(value) if value.isdigit() else None for value in scores])), "printedSections": text})
    assert len(result) == 13
    return result


def extract(source, output):
    actual_hash = hashlib.sha256(source.read_bytes()).hexdigest()
    if actual_hash != SHA:
        raise ValueError("The supplied Sea of Claws PDF does not match the reviewed source")
    output.mkdir(parents=True, exist_ok=True)
    with pymupdf.open(source) as document, pdfplumber.open(source) as layout:
        careers = [career(layout.pages[number - 1], number, name) for number, name in CAREERS.items()]
        magic = spells(document)
        creatures = profiles(document)
        chanties = []
        for block in document[66].get_text("blocks"):
            if block[0] > 310 and 169 < block[1] < 640:
                name, text = block[4].split("\n", 1)
                chanties.append({"name": clean(name), "page": 67, "text": clean(text)})
        assert len(chanties) == 7, chanties
        tables = [{"page": number, "cells": table.extract()} for number in [44, 57, 63, 100, 101] for table in document[number - 1].find_tables().tables]
    for filename, value in {"careers.raw.json": careers, "spells.raw.json": magic, "profiles.raw.json": creatures, "chanties.raw.json": chanties, "tables.raw.json": tables, "source.json": {"file": source.name, "sha256": SHA, "pages": 159, "status": "staged; not registered or converted"}}.items():
        (output / filename).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"Staged {len(careers)} Careers, {len(magic)} spells/Miracles, {len(creatures)} generic profiles and {len(chanties)} chanties. No app content enabled.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path(r"C:\Users\ninod\Downloads\Sea of Claws (1).pdf"))
    parser.add_argument("--output-dir", type=Path, default=ROOT.parent / "sea-of-claws-review")
    args = parser.parse_args()
    extract(args.source, args.output_dir)
