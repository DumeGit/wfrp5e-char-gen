"""Compile the reviewed generic Lustria profiles; never infer named NPC data.

The frozen inventory contains only geometric stat-block extractions. Source
abilities are bounded by their own headings. Conversions are explicitly reviewed.
"""
import json
import re
from pathlib import Path
import importlib.util
spec = importlib.util.spec_from_file_location("lustria_source", Path(__file__).with_name("build-lustria.py"))
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)
BOOK, SHA, PDF, ROOT, clean, ident, read, write, split = (getattr(source, n) for n in ["BOOK", "SHA", "PDF", "ROOT", "clean", "ident", "read", "write", "split"])
import pymupdf


def src(page):
    return {"book": BOOK, "page": page}


def difficulty(text):
    # Only named Test Difficulties, never arbitrary numeric characteristic bonuses.
    for label, n in [("Very Easy", 60), ("Easy", 40), ("Average", 20), ("Challenging", 0), ("Difficult", -10), ("Hard", -20), ("Very Hard", -30)]:
        text = re.sub(rf"{label} \([+−–-]?{abs(n)}\)", f"{label} ({'+' if n >= 0 else '−'}{abs(n)//10} SL)", text)
    return text


def build(doc):
    catalogue = {"config": read(ROOT / "content/sources/data/books/core/config.json")}
    core_traits = read(ROOT / "dist/gm/data.json")["traits"]
    definitions = {x["name"] for x in core_traits if x.get("source", {}).get("book") != BOOK}
    traits, profiles = [], []
    def ability(name, page, text, adaptation=None):
        if name not in definitions:
            row = {"id": ident("trait", name), "name": name, "page": page, "source": src(page), "text": difficulty(clean(text))}
            if adaptation: row["adaptation"] = adaptation
            traits.append(row); definitions.add(name)
        return {"name": name, "value": ""}
    for name, page, start, end in [
        ("Telepathy",151,"Telepathy","Chameleon"),
        ("Chameleon",151,"Chameleon","MARKS OF"),
        ("Flammable",165,"New Trait: Flammable","New Trait: Grim"),
        ("Stationary Attacker",166,"New Trait: Stationary Attacker",None),
    ]:
        text = doc[page-1].get_text().split(start,1)[1]
        if end: text = text.split(end,1)[0]
        if name == "Stationary Attacker": text += " Reach: Tiny/Little Very Short; Small Short; Average Medium; Large Long; Enormous Very Long; Monstrous Massive."
        ability(name,page,text,"Named Test Difficulties use Fifth Edition SL modifiers." if name == "Telepathy" else None)
    # Slann rules are distinct from the short general Telepathy Trait.
    for page, headings in [(125,["Auger and Scryer", "Contemplation", "Knack for Total Power", "Master of Magical Mishaps"]), (126,["Emergency Teleportation", "Relic Priest", "Telepathy", "Palanquin"])]:
        text = doc[page-1].get_text()
        for i,name in enumerate(headings):
            body = text.split(name+":",1)[1]
            end = headings[i+1]+":" if i+1 < len(headings) else ("CHANNELLING QUAYSH" if page==126 else None)
            if end: body=body.split(end,1)[0]
            ability("Slann Telepathy" if name=="Telepathy" else name,page,body,
                    "Printed Test Difficulties use core Fifth Edition SL modifiers." if name in ["Contemplation", "Telepathy"] else None)

    aliases = {"Cold-Blooded":"Cold-blooded", "Flight":"Fly", "Tail Attack":"Tail", "Tongue Attack":"Tongue", "Venomous":"Venom", "Immunity to Psychology":"Immune to Psychology", "Hunger":"Hungry"}
    talent_aliases = {"Read/ Write":"Read/Write", "Combate Aware":"Combat Aware", "Warleader":"War Leader", "Arcane Magic (WAAAGH!)":"Arcane Magic (Big Waaagh!)"}
    section_re = r"(?<!\w)(Traits|Attack Traits|Optional|Skills|Talents|Slann Special Rules|Chariots of the Asur|Blood Hungry Spore Cloud|Impale Attack|Entangled Attack|Magical Snack|Posterior Flame|Use as Ammunition|Brain Rot|Excruciating Sting|Odour Attack|Venomous Bite|Boring Attack|Shooting Spine Attack|Unstoppable Charge|Ramming Attack|Blood Frenzy|Toxic Bile|Fearsome Roar):"
    for raw in read(ROOT / "scripts/review/lustria-profiles.json"):
        page=raw["page"]; name=raw["name"].title(); stats=dict(raw["stats"])
        p={"id":ident("creatures",name),"name":name,"page":page,"source":src(page),"example":False,"stats":stats,"skills":[],"talents":[],"traits":[],"optionalTraits":[],"attacks":[],"armour":[],"spells":[],"sections":{},"notes":[],"size":"Average","toughnessBonus":stats["T"]//10,"category":"Lizardmen" if 123<=page<=153 else "Plants" if name in ["Blood Hungry Spore Cloud","Impaling Spikethorn","Vypervine","Grasping Creeper Vine"] else "Greenskins" if page==182 else "Lustrian beasts"}
        body=clean(raw["body"]).replace("Cold- blooded","Cold-blooded").replace("Swamp- strider","Swamp-strider")
        pieces=re.split(section_re,body)
        sections={pieces[i]:pieces[i+1].strip() for i in range(1,len(pieces),2)}
        def add_talent(name, ranks=1, adaptation=None, optional=False):
            if name=="Arcane Magic (WAAAGH!)":adaptation="Printed WAAAGH! uses the existing shared Big Waaagh! Lore with the previously approved Magick Wind conversion."
            name=talent_aliases.get(name,name)
            maximum=catalogue["config"]["talentLimits"].get(name,1)
            if maximum is not None and ranks>maximum:
                adaptation=f"Printed {name} {ranks} is limited to {maximum} core Fifth Edition rank{'s' if maximum!=1 else ''}."
                ranks=maximum
            row={"name":name,"ranks":ranks}
            if adaptation: row["adaptation"]=adaptation
            if optional:
                p.setdefault("optionalTalents",[]).append(row)
            else:p["talents"].append(row)
        def parse_trait(entry, optional=False):
            entry=entry.strip(); rows=p["optionalTraits"] if optional else p["traits"]
            if entry.startswith("Armour"):
                m=re.search(r"(?:Armour(?: \([^)]*\))? )([0-9]+)(?: \(([0-9]+)\))?",entry); assert m,(name,entry)
                p["armour"].append({"name":"Scales" if "Cold-blooded" in body or 136<=page<=153 else "Hide","ap":int(m[1]),"locations":"Head, Arms, Body, Legs","optional":optional,"quick":False,"shield":False})
                if m[2]: p["toughnessBonus"]=int(m[2])-int(m[1])
                return
            attack=re.match(r"(Weapons?|Bite|Tail Attack|Tongue Attack|Claws|Horns|Ranged|Blowpipe|Breath)(?: \(([^)]+)\))? \+([0-9]+)(?: \(([^)]+)\))?$",entry)
            if attack:
                kind,label,damage,param=attack.groups(); damage=int(damage); ranged=kind in ["Ranged","Blowpipe","Breath"]
                primary=kind in ["Weapon","Weapons"]
                title=label or kind
                if primary:title="Weapon"+(f" ({label})" if label else "")
                p["attacks"].append({"name":title,"skill":stats["BS" if ranged else "WS"],"damage":damage,"optional":optional,"free":not primary and not ranged,"ranged":ranged,"text":f"Range {param} yards." if param and param.isdigit() else "", "primary":primary})
                if kind in ["Bite","Tail Attack","Tongue Attack","Horns","Breath"]:
                    row={"name":aliases.get(kind,kind),"value":param if kind=="Breath" else str(damage)}
                    rows.append(row)
                return
            if entry.startswith("Acute Sense"):
                sense="Hearing" if "Hearing" in entry else "Sight"
                add_talent(f"Acute Sense ({sense})",adaptation="Printed Acute Sense explicitly uses the Character Talent; recorded as the core Fifth Edition Talent.",optional=optional);return
            if re.match(r"Swamp[ -][Ss]trider",entry):
                add_talent("Striding Gait (Wetland)",adaptation="Proposed user-approved replacement: printed Swamp-strider uses core Striding Gait (Wetland). The old effect is not defined here; use the core effect.",optional=optional);return
            if entry=="Stride":
                rows.append({"name":"Sprinter","value":"","adaptation":"Printed Stride uses Fifth Edition Sprinter; Running changes, not Movement."});return
            m=re.match(r"([^()0-9]+?)(?: \((.+)\)| ([0-9]+)\+?)?$",entry)
            assert m,(name,entry)
            n=aliases.get(m[1].strip(),m[1].strip()); value=m[2] or m[3] or ""
            if n=="Size":
                if optional:
                    sizes=re.findall(r"Tiny|Little|Small|Average|Large|Enormous|Monstrous",value)
                    if " to " in value: sizes=["Tiny","Small","Average"]
                    rows.extend({"name":"Size","value":s.replace("Little","Tiny")} for s in sizes)
                else:
                    p["size"]=value.replace("Little","Tiny"); rows.append({"name":"Size","value":p["size"]})
                    if value=="Little":p["notes"].append("Printed Size (Little) uses Tiny. Printed Wounds are retained until changed; Tiny then needs a manual Wounds value.");rows[-1]["adaptation"]=p["notes"][-1]
                return
            if n=="Grim": rows.append({"name":n,"value":"","adaptation":f"Printed Grim {value} uses the unranked Fifth Edition Grim effect instead of the old Advantage minimum."});return
            if n=="Spellcaster" and "Slann" in name:
                p["lustriaMagic"]="slann";rows.append({"name":n,"value":"High Magic"});return
            if n=="Spellcaster":
                winds={"Aqshy":"Fire","Chamon":"Metal","Ghur":"Beasts","Shyish":"Death","Ulgu":"Shadows"}
                value=", ".join(winds.get(x.strip(),x.strip()) for x in re.split(r", | or ",value))
            if n not in definitions:
                p.setdefault("unavailableTraits",[]).append({"name":entry,"optional":optional,"reason":"No rule under this name is defined in the supplied Fifth Edition core or Lustria. No effect is invented."});return
            rows.append({"name":n,"value":value,**({"requiresParameter":True} if n=="Venom" and not value else {})})
        for heading in ["Traits","Attack Traits","Optional"]:
            for entry in split(sections.get(heading,"")):
                if entry:parse_trait(entry,heading=="Optional")
        skilltext=sections.get("Skills","")
        for entry in split(skilltext):
            m=re.fullmatch(r"(.+?) (\d+)",entry)
            group=re.fullmatch(r"(Lore|Melee) \((.*)\)",entry)
            if group:
                entries=[f"{group[1]} ({v.rsplit(' ',1)[0]}) {v.rsplit(' ',1)[1]}" for v in split(group[2])]
            else: entries=[entry] if entry else []
            for v in entries:
                m=re.fullmatch(r"(.+?) (\d+)",v); assert m,(name,v)
                sk=m[1].replace("Two Handed","Two-handed")
                if sk=="Channelling" and "Slann" in name:p["channellingTotal"]=int(m[2]);continue
                if sk=="Channelling (Petty, WAAAGH!)":sk="Channelling (Magick)";p["notes"].append("Printed Channelling (Petty, WAAAGH!) uses the approved Channelling (Magick) equivalent for Big Waaagh!, with a Legacy warning.")
                p["skills"].append({"name":sk,"total":int(m[2]),**({"adaptation":"Printed Channelling (Petty, WAAAGH!) uses the approved core Magick specialisation for Big Waaagh!."} if m[1]=="Channelling (Petty, WAAAGH!)" else {})})
        for entry in split(sections.get("Talents","")):
            if not entry:continue
            if entry=="Arcane Magic" and "Slann" in name:continue
            if entry.startswith("Savant (Chaos, History, Magic)"):
                for lore in ["Chaos","History","Magic"]:add_talent(f"Savant ({lore})")
                continue
            m=re.fullmatch(r"(.+?)(?: (\d+))?",entry);add_talent(m[1],int(m[2] or 1))
        for entry in split(sections.get("Slann Special Rules","")):
            if entry:p["traits"].append({"name":"Slann Telepathy" if entry=="Telepathy" else entry,"value":""})
        for heading,text in sections.items():
            if heading in ["Traits","Attack Traits","Optional","Skills","Talents","Slann Special Rules"]:continue
            label=heading if heading!="Venomous Bite" else f"{name} Venomous Bite"
            p["traits"].append(ability(label,page,text,"Old Advantage becomes Momentum; named Test Difficulties use Fifth Edition SL modifiers." if heading=="Unstoppable Charge" else "Named Test Difficulties use Fifth Edition SL modifiers." if difficulty(text)!=text else None))
            if heading=="Unstoppable Charge":next(x for x in traits if x["name"]==label)["text"]=next(x for x in traits if x["name"]==label)["text"].replace("Advantage","Momentum")
        if any(t["name"]=="Stationary Attacker" for t in p["traits"]):p["traits"].append({"name":"Immune to Psychology","value":""})
        if "Slann" in name:
            p["species"]="Slann"
            p["adaptation"]="Slann use explicit Colour Lore choices and matching Winds at the printed Channelling total, retaining High Magic without the Elf-only Blessed by Isha prerequisite. Core Talent repeat limits replace older ranks. No free spell list is invented."
            p["notes"].append("Choose Colour Lores in Customise. Suggested spell counts on pp. 123–124 are guidance, not required grants. Qhaysh is a separate Skill choice; the book prints Quaysh. High Magic retains the existing shared definition; Slann may take it without Blessed by Isha. Palanquin benefits apply only while riding one.")
            gen=next(g for g in ["First","Second","Third","Fourth","Fifth"] if g in name)
            guide=doc[122].get_text().split(gen+" Generation:",1)[1].split("Generation:",1)[0]
            guide=re.split(r"(?:Fourth|Third|Second|First)\s*$|Should the GM wish",guide)[0].strip()
            p["notes"].append("Printed spell guidance (p. 123): "+clean(guide))
        if name in ["Skink","Chameleon Skink"]:p["species"]="Skink"
        if name in ["Saurus","Saurus Temple Guard","Malformed Saurus Spawn","Kroxigor"]:
            p["species"]="Kroxigor" if name=="Kroxigor" else "Saurus"
            p["category"]="Lizardmen"
        if p["size"]=="Small" and not any(t["name"]=="Swarm" for t in p["traits"]):
            new=2*(stats["T"]//10)
            if new!=stats["W"]:p["notes"].append(f"Printed {stats['W']} Wounds become {new} under core Small Size (2 × Toughness Bonus).");p["adaptation"]=" ".join([p.get("adaptation",""),p["notes"][-1]]).strip();stats["W"]=new
        size_bonus={"Large":1,"Enormous":1,"Monstrous":2}.get(p["size"],0)*(stats["S"]//10 if stats["S"] else 0)
        for a in p["attacks"]:
            matching=[s for s in p["skills"] if s["name"].startswith("Melee (")]
            if a["primary"] and matching:
                skill=max(matching,key=lambda s:s["total"])
                a["skillName"]=skill["name"];a["skill"]=skill["total"]
            if a["primary"] and size_bonus:
                a["printedDamage"]=a["damage"];a["damage"]+=size_bonus;a["adaptation"]=f"Core Size ({p['size']}) adds {size_bonus} to the primary melee Damage: printed +{a['printedDamage']} becomes +{a['damage']}. Extra attacks retain printed Damage."
        if name=="Coatl":
            # Its sole Bite is its primary attack, unlike a Weapon creature's extra Bite.
            a=p["attacks"][0];a["free"]=False;a["primary"]=True;a["printedDamage"]=a["damage"];a["damage"]+=size_bonus;a["adaptation"]=f"Core Large Size adds Strength Bonus to the sole primary Bite: +10 becomes +{a['damage']}."
        if p["toughnessBonus"]!=stats["T"]//10:p["notes"].append("Printed total protection conflicts with the Toughness score; select a Toughness Bonus interpretation before recalculating.")
        p["text"]=body
        notes=[p.get("adaptation","")]+[x.get("adaptation","") for field in ["traits","attacks","talents"] for x in p[field]]
        if any(notes):p["adaptation"]=" ".join(dict.fromkeys(x for x in notes if x))
        profiles.append(p)
    return profiles,traits


def templates(profiles):
    skink=[ident("creatures","Skink")]
    all_lizards=[p["id"] for p in profiles if p.get("species") in ["Skink","Saurus","Kroxigor"]]
    restricted=[p["id"] for p in profiles if p.get("species") in ["Skink","Saurus"]]
    def t(name,role,adjust,skills,talents,traits=None,restricted_mark=False,natural=0):
        page=139 if role=="caste" else 151
        return {"id":ident("template",name),"name":name,"page":page,"source":src(page),"lustriaRole":role,"eligibility":"any","profileIds":skink if role=="caste" else restricted if restricted_mark else all_lizards,"foundationLabel":"Skink" if role=="caste" else "Skink / Saurus" if restricted_mark else "Skink / Saurus / Kroxigor","adjustments":adjust,"skills":[{"options":[n] if isinstance(n,str) else n,"bonus":b,"count":1} for n,b in skills],"talents":[{"options":[n] if isinstance(n,str) else n,"ranks":1} for n in talents],"traits":traits or [],"optionalTraits":[],"gear":[],"notes":[],**({"naturalArmour":natural} if natural else {})}
    tr=lambda n,v="",**kw:{"name":n,"value":v,**kw}
    rows=[
        t("Priest caste","caste",{"Int":15,"WP":15,"Fel":10},[("Intuition",15),("Leadership",25),("Perception",20)],["Public Speaker"]),
        t("Functionary caste","caste",{"Int":10,"WP":5,"Fel":10},[("Evaluate",10),("Intuition",10),("Language (Any)",10),("Perception",10)],["Read/Write"]),
        t("Industrial caste","caste",{"Int":5,"T":10,"WP":5},[("Endurance",5),("Evaluate",5),("Trade (Engineer)",10)],["Sturdy","Super Numerate"]),
        t("Martial caste","caste",{"BS":5,"I":10,"Ag":10,"WP":5},[("Dodge",10),("Melee (Any)",5),("Perception",10),(["Ranged (Blowpipe)","Ranged (Throwing)","Ranged (Bow)"],10),("Stealth (Rural)",10)],["Flee!","Marksman"],[tr("Stealthy"),tr("Tracker")]),
        t("Artisan caste","caste",{"Dex":20,"Int":10,"WP":5},[("Evaluate",10),("Trade (Any)",15)],["Artistic (Any)","Craftsman (Any)"]),
        t("Husbandry caste","caste",{"Ag":15,"Fel":10},[("Animal Care",15),("Animal Training (Reptile)",15),("Charm Animal",15),("Outdoor Survival",10)],["Animal Affinity","Tenacious"]),
        t("Chotec","mark",{"I":10,"Ag":10},[],["Combat Reflexes"]),
        t("Huanchi","mark",{"I":5,"Ag":10},[],["Shadow"],[tr("Dark Vision"),tr("Stealthy")],True),
        t("Itzl","mark",{"Ag":5,"Fel":5},[],["Animal Affinity"],restricted_mark=True),
        t("Quetzl","mark",{"T":5},[],["Hardy","Implacable"],natural=1),
        t("Sotek","mark",{"WS":10,"S":5},[],["Berserk Charge"],[tr("Hatred","Skaven"),tr("Immunity","Poison")]),
        t("Tepok","mark",{"I":5,"Int":15},[],["Sixth Sense"],[tr("Magic Resistance",adaptation="Printed Magic Resistance 1 uses the unranked Fifth Edition Creature Trait.")],True),
        t("Tlazcotl","mark",{"WP":10},[],["Fearless (Undead)","Fearless (Warm-bloods)"]),
        t("Tzunki","mark",{"BS":5,"Ag":5},[],["Acute Sense (Sight)"],[tr("Amphibious")]),
        t("Mark of the Old Ones","mark",{"Fel":15},[],["Luck"],restricted_mark=True),
    ]
    rows[0]["lustriaPriest"]=True
    rows[0]["notes"]=["Printed Spellcaster (Beasts or Heavens) requires an explicit Lore choice; core Spellcaster supplies matching Channelling and Language (Magick). Life is a rare GM choice described in the text, not an extra caste grant."]
    rows[0]["adaptation"]="Core Spellcaster uses the chosen printed Lore and its core Skill grants; no free spell list is invented."
    rows[3]["adaptation"]="Printed Javelin / Shortbow Skill groups use core Throwing / Bow."
    rows[-4]["adaptation"]="Printed Magic Resistance 1 uses the unranked core Creature Trait."
    rows[-1]["notes"]=["Leader is unavailable: neither Lustria nor the supplied Fifth Edition core defines this Trait. No leadership bonus is invented."]
    return rows


def main():
    import hashlib
    assert hashlib.sha256(PDF.read_bytes()).hexdigest()==SHA
    doc=pymupdf.open(PDF)
    profiles,traits=build(doc)
    write(ROOT/"content/sources/gm/books/lustria.json",{"schemaVersion":1,"id":BOOK,"source":{"file":PDF.name,"sha256":SHA},"summary":"55 generic profiles, Skink castes and sacred marks","profiles":profiles,"templates":templates(profiles),"traits":traits,"training":[]})
    print(f"Published {len(profiles)} generic profiles, 15 templates and {len(traits)} abilities.")


if __name__=="__main__":main()
