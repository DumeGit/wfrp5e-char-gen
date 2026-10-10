"""Publish the independently compatible Lustria batch from its supplied PDF.

MarkItDown extraction: ../lustria.md. Pending species, bestiary/template and
overlapping-magic decisions are recorded in coverage, never silently resolved.
"""
import hashlib
import json
import re
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
BOOK = "lustria"
PDF = Path(r"C:\Users\ninod\Downloads\Lustria.pdf")
SHA = "8899d0341f58ced71ac4f1fdedaa16d702718d41f4e1b4759543bfee73157844"
PACK = ROOT / "dist/data/books" / BOOK


def clean(text):
    return re.sub(r"\s+", " ", text.replace("\u00ad", "")).strip()


def ident(kind, name):
    return f"{BOOK}:{kind}:" + re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def split(text):
    return [clean(x) for x in re.split(r",(?![^()]*\))", text)]


def careers(doc):
    # Verified from the printed skull/hammer/shield colours, not extracted 'h'.
    schemes = {
        194: {"T": 1, "I": 3, "Dex": 4, "Int": 1, "WP": 2, "Fel": 1},
        196: {"T": 4, "I": 1, "Ag": 1, "Int": 2, "WP": 1, "Fel": 3},
        198: {"S": 3, "T": 1, "I": 2, "Ag": 4, "Int": 1, "WP": 1},
        200: {"T": 2, "I": 1, "Ag": 1, "Int": 1, "WP": 3, "Fel": 4},
    }
    result = []
    for page, name, cls in [(194, "Interpreter", "Academic"), (196, "Oracle", "Peasant"), (198, "Survivalist", "Ranger"), (200, "Trailblazer", "Ranger")]:
        blocks = doc[page - 1].get_text("blocks")
        title = next(b[4] for b in blocks if b[4].startswith(name.upper() + "\n"))
        levels = []
        for b in blocks:
            text = clean(b[4])
            if "Skills:" not in text or "Trappings:" not in text:
                continue
            match = re.fullmatch(r"(?:h )?(.+?) [–—] (Brass|Silver|Gold) (\d+) Skills: (.+?) Talents: (.+?) Trappings: (.+)", text)
            assert match, (name, text)
            skills = split(match[4])
            skill_aliases = {"Sail (Any)": "Sail", "Animal Training": "Animal Training (Any)"}
            skills = [skill_aliases.get(s, s) for s in skills]
            talent_aliases = {
                "Resistance (Any)": "Resistant (Any)",
                "Strider (Any)": "Striding Gait (Any)",
                "Impassioned Zeal": "Impassioned Zeal (Cause)",
                "Fleet Footed": "Fleet-footed",
            }
            talents = [talent_aliases.get(s, s) for s in split(match[5])]
            levels.append({"level": len(levels) + 1, "name": match[1], "status": match[2], "standing": int(match[3]), "skills": skills, "talents": talents, "trappings": split(match[6])})
        assert len(levels) == 4
        row = {"id": ident("career", name), "name": name, "class": cls,
            "species": split(clean(title.split("\n", 1)[1])), "page": page,
            "advanceScheme": {k: schemes[page].get(k) for k in ["WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel"]}, "levels": levels,
            "conversion": "Uses current core Skills/Talents and Fifth Edition creation/advancement. Unspecified Trappings remain descriptive with no invented prices, ammunition quantities or equipment grants."}
        if name == "Trailblazer":
            row["adaptation"] = "Printed Strider (Any) uses current core Striding Gait (Any), with core movement/terrain effects."
        result.append(row)
    return result


def references(doc):
    result = []

    def blocks(page, indexes):
        b = doc[page - 1].get_text("blocks")
        return "\n\n".join(clean(b[i][4]) for i in indexes)

    def add(name, page, indexes=None, text=None, category="rule", topic="Lustria", notes=None):
        row = {"id": ident("reference", name), "name": name, "page": page, "category": category, "topic": topic, "text": text or blocks(page, indexes)}
        if notes:
            row["notes"] = notes
        result.append(row)

    for name, page, indexes, topic in [
        ("Waterlungs — Mathlann prayer", 81, [9], "Mathlann"),
        ("Cloak of Mathlann — Mathlann prayer", 81, [10], "Mathlann"),
        ("Volley", 89, [14], "Weapon Quality"),
        ("Warpdust Typhoons", 89, [15], "Weather"),
        ("Lizardman scales and armour", 163, [12, 13, 14, 15], "Lizardmen"),
        ("Lizardman weapon training and Blowpipes", 163, [17, 18], "Weapons"),
        ("A Bit of a Beast", 191, [5], "Magic"),
        ("Ghyran up the Amaxon", 191, [11], "Magic"),
        ("Generating an Oracle", 197, [7, 8, 9], "Character creation"),
        ("Stifling Humidity", 202, [18], "Weather"),
        ("All is Well", 203, [6], "Weather"),
        ("Find Shelter", 203, [4], "Jungle expeditions"),
        ("Forage for Food", 203, [5], "Jungle expeditions"),
        ("Lingering Vapours", 203, [7], "Weather"),
        ("Rain Showers", 203, [8], "Weather"),
        ("Torrential Downpour", 203, [9], "Weather"),
        ("Tropical Storm", 203, [10], "Weather"),
        ("Travel Endeavours and fatigue", 203, [2], "Jungle expeditions"),
        ("Keep Watch", 204, [2], "Jungle expeditions"),
        ("Map the Route", 204, [3], "Jungle expeditions"),
        ("Make Camp", 204, [4], "Jungle expeditions"),
        ("Exceptional Circumstances", 204, [5], "Jungle expeditions"),
        ("Practise a Skill", 204, [7], "Jungle expeditions"),
        ("Repair a Boat", 204, [8], "Jungle expeditions"),
        ("Disorientation", 188, [4], "Disease symptoms"),
        ("Organ Failure", 188, [5, 8, 9, 10, 11, 16], "Disease symptoms"),
        ("Parasitization", 188, [12, 13, 14, 15], "Disease symptoms"),
    ]:
        add(name, page, indexes, topic=topic)
    for row in result:
        if row["topic"] == "Mathlann":
            row["category"] = "magic"
        elif row["name"] == "Volley":
            row["category"] = "property"
    # Outline font headings are absent from MuPDF text on some disease entries;
    # names and complete mechanics were cross-checked with MarkItDown.
    for name, page, indexes in [
        ("Bilious Ague", 186, [5]), ("Bleeding Eyerot", 186, [6]),
        ("Blindwyrm Fits", 186, [8]), ("Blackwater Fever", 186, [9]),
        ("Brain Rot", 186, [10]), ("Cataleptic Ague", 187, [3]),
        ("Choking Lungblight", 187, [4]), ("Fungal Takeover", 187, [5]),
        ("Necrotic Foot Rot", 187, [7]), ("Thought Fog", 187, [8, 9]),
        ("Yellow-Skull Fever", 188, [3]),
    ]:
        add(name, page, indexes, topic="Jungle maladies")
    next(r for r in result if r["name"] == "Yellow-Skull Fever")["text"] = blocks(188, [3]).split("New Symptoms", 1)[0].strip()
    next(r for r in result if r["name"] == "Cloak of Mathlann — Mathlann prayer")["text"] = blocks(81, [10]).split("Arcane Spell", 1)[0].strip()
    for row in result:
        if row["topic"] == "Mathlann":
            row["text"] = "These Miracles are only available to Elven Priests of Mathlann. " + row["text"]
    next(r for r in result if r["name"] == "Tropical Storm")["text"] = blocks(203, [10]).split("Travel Endeavours", 1)[0].strip()
    next(r for r in result if r["name"] == "Warpdust Typhoons")["text"] = blocks(89, [15]).split("Rules:", 1)[1].strip()
    next(r for r in result if r["name"] == "Lizardman weapon training and Blowpipes")["text"] = blocks(163, [17]).split("New Weapons", 1)[0].strip() + "\n\n" + blocks(163, [18])
    # Include the missing outlined Disorientation heading/body, not only Treatment.
    next(r for r in result if r["name"] == "Disorientation")["text"] = "All Tests based on Ag, Dex, or Int suffer −1 SL while suffering Disorientation. " + blocks(188, [4])
    next(r for r in result if r["name"] == "Travel Endeavours and fatigue")["text"] = "Each Character may choose one Endeavour per Stage, resolved before Encounters, in whatever order the Players choose. " + blocks(203, [2])
    add("Contracting Thought Fog", 187, category="table", topic="Jungle maladies", text="| 1d10 | Test to avoid Thought Fog |\n| --- | --- |\n| 1 | Challenging (+0) Endurance |\n| 2 | Difficult (−10) Endurance |\n| 3 | Hard (−20) Endurance |\n| 4–6 | Challenging (+0) Cool |\n| 7–8 | Difficult (−10) Cool |\n| 9–10 | Hard (−20) Cool |")
    add("Lustrian Weather", 202, category="table", topic="Weather", text=blocks(202, [4]) + "\n\n| Weather | Wet season d10 | Dry season d10 |\n| --- | --- | --- |\n| Stifling Humidity | 1 | 1–4 |\n| All is Well | 2 | 5–6 |\n| Lingering Vapours | 3–4 | 7 |\n| Rain Showers | 5–6 | 8 |\n| Torrential Downpour | 7–8 | 9 |\n| Tropical Storm | 9–10 | 10 |")
    # Exactly bounded mechanical trait descriptions, not adjacent setting prose.
    for name, page, start, end in [("Telepathy",151,"Telepathy","Chameleon"),("Chameleon",151,"Chameleon","MARKS OF"),("Flammable",165,"New Trait: Flammable","New Trait: Grim"),("Grim (Lustria)",165,"New Trait: Grim","A Guide to"),("Stationary Attacker",166,"New Trait: Stationary Attacker",None)]:
        text = doc[page-1].get_text().split(start,1)[1]
        if end:
            text = text.split(end,1)[0]
        add(name,page,text=clean(text),category="trait",topic="Creature Traits",notes="Printed Fourth Edition rule for reading; current core Grim remains the creator definition." if name.startswith("Grim") else None)
    next(r for r in result if r["name"] == "Stationary Attacker")["text"] += "\n\n| Size | Reach |\n| --- | --- |\n| Tiny or Little | Very Short |\n| Small | Short |\n| Average | Medium |\n| Large | Long |\n| Enormous | Very Long |\n| Monstrous | Massive |"
    return result


def main():
    assert hashlib.sha256(PDF.read_bytes()).hexdigest() == SHA
    doc = pymupdf.open(PDF)
    assert len(doc) == 224
    career_rows = careers(doc)
    refs = references(doc)
    rules = [
        {"id":ident("rule",name),"path":["skillOptions",group],"operation":"include","value":values,"page":page,"reason":reason}
        for name,group,values,page,reason in [
            ("lore-choices","Lore",["Lustria","Old Ones"],196,"Printed regional and Oracle Lore choices, using core Lore rules."),
            ("lizardman-signs","Secret Signs",["Lizardman"],196,"Printed Oracle first-level Skill."),
            ("blowpipe-skill","Ranged",["Blowpipe"],163,"Printed new ranged group uses the existing core Ranged Skill rules."),
        ]]
    weapon_rows = []
    market = []
    for name,kind,group,enc,reach,damage,qualities,price,availability,page in [
        ("Obsinite Club","melee","Basic",1,"Short","SB+3","Penetrating","1 GC","Scarce",163),
        ("Obsinite Spiked Maul","melee","Basic",2,"Average","SB+4","Penetrating, Pummel","2 GC","Scarce",163),
        ("Blowpipe","ranged","Blowpipe",1,"20 yards","0","Reload 1","3 GC","Exotic",163),
        ("Eagle Claw","ranged","Engineering",25,"150 yards","13","Accurate or Volley 6, Crewed 2, Reload 3","200 GC","Exotic",89),
        ("Eagle Eye","ranged","Engineering",4,"90 yards","11","Damaging, Crewed 1, Reload 1","45 GC","Exotic",89),
    ]:
        weapon_rows.append({"id":ident("weapon",name),"name":name,"kind":kind,"group":group,"enc":enc,"reach":reach,"damage":damage,"qualities":qualities,"page":page,"text":"Printed Lustrian-market price and Availability; Old World prices are not specified." if page==163 else "Printed Elven artillery profile. Volley reduces Damage by 4 and rolls each shot separately." if name=="Eagle Claw" else "Printed compact Eagle Eye bolt thrower."})
        market.append({"id":ident("item",name),"name":name,"page":page,"price":price,"enc":enc,"availability":availability,"category":"Weapons","text":weapon_rows[-1]["text"]})
    market.append({"id":ident("item","Blowpipe Dart (12)"),"name":"Blowpipe Dart (12)","page":163,"price":"10/–","enc":0,"availability":"Exotic","category":"Ammunition","ammunition":{"range":"As weapon","damage":"+1","qualities":"—"},"text":"Twelve printed darts. Poison is separate and is not automatically supplied. Price/Availability assume a suitable Lustrian market."})
    spell = {"id":ident("spell","Shroud of Fog"),"name":"Shroud of Fog","category":"Shadows","page":81,"cn":"8","range":"You","target":"AoE (Willpower Bonus Miles)","duration":"Willpower minutes","text":"You summon a thick fog that blankets the region. Visibility is reduced to 10 yards. The fog is non-magical and cannot be Dispelled."}
    features = [
        ("Four player Careers","implemented",194,"Interpreter, Oracle, Survivalist and Trailblazer reuse core Skills/Talents and current advancement; no automatic core Career replacements."),
        ("Five weapon profiles and six purchases","implemented",163,"Printed weapon profiles, prices, weights and quantities; Blowpipe group added. Existing duplicate profiles are not overwritten."),
        ("Shroud of Fog","implemented",81,"Compatible new Shadows spell; situational effects are descriptive."),
        ("Curated mechanical references","reference-only",186,"Disease/symptom procedures, weather, expedition actions and new Traits. No live disease, travel or combat automation."),
        ("Playable Skinks and Chameleon Skinks","deferred",160,"Awaiting the user's Fifth Edition allocations, inherent-Trait and Fate/Fortune decisions; no invented starting values."),
        ("Generic creatures and caste/mark templates","deferred",139,"Geometric source inventory extracted; publication awaits the user's requested Size, Trait and sacred-mark conversions."),
        ("High Magic and Mathlann prayers","deferred",127,"Awaiting explicit duplicate-definition policy and distinct patron options; original prayers remain readable references."),
        ("Lustrian Career roll table","unavailable",192,"Multiple overlapping/missing ranges, including High Elf Sailor/Smuggler and Dwarf/Halfling Smuggler/Stevedore. Probabilities are not guessed."),
        ("Named characters and campaign management","deferred",210,"Named foundations, colony/ship managers, live play and adventure scenes remain outside creator scope."),
    ]
    coverage = {"schemaVersion":1,"records":[],"features":[{"id":ident("feature",name),"name":name,"status":status,"source":{"book":BOOK,"page":page},"reason":reason} for name,status,page,reason in features]}
    manifest = {"schemaVersion":1,"id":BOOK,"title":"Lustria","shortTitle":"Lustria","edition":4,"version":"0.1.0","kind":"supplement","dependsOn":["core"],"source":{"file":PDF.name,"sha256":SHA},"compatibility":{"reviewed":True,"notes":["Current core Skills/Talents and Fifth Edition advancement govern. Printed Strider uses Striding Gait; Resistance uses the core Resistant heading.","Only the independent, reviewed batch is published; unresolved playable Species, creature/template conversions, conflicting tables and duplicate magic are explicitly pending.","Read-only source references preserve printed Fourth Edition wording. Named NPCs, campaign managers and setting/adventure prose are excluded."]},"files":{key:filename+".json" for key,filename in [("careers","careers"),("weapons","weapons"),("market","market"),("spells","spells"),("rules","rules"),("coverage","coverage"),("referenceEntries","reference-entries")]}}
    for filename,data in [("manifest",manifest),("careers",career_rows),("weapons",weapon_rows),("market",market),("spells",[spell]),("rules",rules),("coverage",coverage),("reference-entries",refs)]:
        write(PACK/f"{filename}.json",data)
    path=ROOT/"dist/data/books/index.json";registry=read(path)
    if not any(p["id"]==BOOK for p in registry["packs"]):registry["packs"].append({"id":BOOK,"path":f"{BOOK}/manifest.json"})
    write(path,registry)
    path=ROOT/"scripts/search-reference-review.json";audit=read(path)
    audit["books"][BOOK]={"sourceHash":SHA,"publishedSHA256":hashlib.sha256((PACK/"reference-entries.json").read_bytes()).hexdigest(),"entries":len(refs),"areas":[{"first":81,"last":89,"topic":"Selected magic/artillery mechanics"},{"first":151,"last":166,"topic":"New Traits and weapon/armour rules"},{"first":186,"last":188,"topic":"Disease and symptoms"},{"first":191,"last":204,"topic":"Selected creation and expedition procedures"}],"records":[{"id":r["id"],"name":r["name"],"page":r["page"],"disposition":"included"} for r in refs]+[{"id":ident("excluded",name),"name":name,"page":page,"disposition":"excluded","reason":reason} for name,page,reason in [("Setting and adventure prose","4–224","Not mechanical reference content."),("NPC and template search results","42–182","Profiles/templates are excluded from shared search by user instruction."),("Unresolved random Career tables","161–193","Overlaps require explicit decisions; not exposed as working random tables.")]]}
    write(path,audit)
    print(f"Published four Careers, five weapons, six purchases, one Shadows spell and {len(refs)} references; remaining conversions are pending.")


if __name__ == "__main__":
    main()
