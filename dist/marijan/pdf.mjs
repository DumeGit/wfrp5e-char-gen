import { speciesEntry } from "./catalogue.mjs";
import { KEYS, base } from "../rules.mjs";
import { wrapPDFRuns, drawPDFRuns } from "../pdf-text.mjs";
import { GROUPS, entrySource } from "./catalogue.mjs";
import { AUTO_FIELDS } from "./model.mjs";
import { LABELS } from "./views.mjs";

const clean = (font, value) =>
  [
    ...String(value ?? "")
      .replaceAll("−", "-")
      .replaceAll("→", "->")
      .replaceAll("×", "x")
      .replaceAll("ﬂ", "fl")
      .replaceAll("ﬁ", "fi"),
  ]
    .map((c) => {
      if (c === "\n") return c;
      try {
        font.encodeText(c);
        return c;
      } catch {
        return "?";
      }
    })
    .join("");
export async function marijanRecord(
  catalogue,
  s,
  r,
  PDFLib = globalThis.PDFLib,
) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib,
    doc = await PDFDocument.create(),
    font = await doc.embedFont(StandardFonts.Helvetica),
    bold = await doc.embedFont(StandardFonts.HelveticaBold),
    heading = await doc.embedFont(StandardFonts.TimesRomanBold),
    ink = rgb(0.15, 0.13, 0.11),
    accent = rgb(0.42, 0.15, 0.18);
  let page,
    y = 0,
    index = 0;
  function newPage() {
    page = doc.addPage([595.28, 841.89]);
    y = 784;
    index++;
    page.drawText("MARIJAN MODE  /  UNRESTRICTED CHARACTER RECORD", {
      x: 42,
      y: 810,
      font: bold,
      size: 9,
      color: accent,
    });
    page.drawText(String(index), { x: 540, y: 24, font, size: 9, color: ink });
  }
  function line(label, text = "") {
    const runs = [
        { text: clean(bold, label), bold: true },
        { text: clean(font, text) },
      ],
      lines = wrapPDFRuns(runs, font, bold, 10, 511);
    for (const runs of lines) {
      if (y < 48) newPage();
      drawPDFRuns(page, runs, { x: 42, y, size: 10, font, bold, color: ink });
      y -= 14;
    }
    y -= 4;
  }
  function section(title) {
    if (y < 95) newPage();
    y -= 12;
    page.drawText(clean(heading, title), {
      x: 42,
      y,
      size: 16,
      font: heading,
      color: accent,
    });
    y -= 24;
  }
  newPage();
  line(s.name || "Unnamed character");
  line(
    "Mode: ",
    "Directly entered values; creation legality, XP and purchases are not enforced. No verified creation or XP purchase history is claimed.",
  );
  line(
    "Identity: ",
    `${s.species}${s.origin ? "; " + s.origin : ""}; ${r.career?.name || s.career || "No Career"}, level ${s.level}; ${s.status} ${s.standing}`,
  );
  const species = speciesEntry(catalogue, s.species);
  if (species) {
    line("Species reference: ", entrySource(catalogue, species));
    if (species.adaptation)
      line("Legacy Species defaults: ", species.adaptation);
  }
  if (r.career?.adaptation)
    line("Legacy Career reference: ", r.career.adaptation);
  if (s.copiedFrom) line("Copied snapshot: ", s.copiedFrom);
  section("Characteristics");
  for (const k of KEYS)
    line(
      `${k}: `,
      `${r.stats[k]} (Starting ${s.characteristics[k].initial}, Advances ${s.characteristics[k].advances}, Other ${s.characteristics[k].modifier})`,
    );
  line(
    "Printed Talent bonuses: ",
    s.talentEffects
      ? "Basic permanent Characteristic and Movement bonuses enabled; unsupported/situational effects remain references."
      : "Disabled; existing values already include any entered bonuses.",
  );
  section("Resources");
  line("Fate / Fortune: ", `${s.fate} / ${s.fortune}`);
  line(
    "XP: ",
    `${s.xpSpent} spent; ${s.xpUnspent} unspent; ${r.xpTotal} total. Entered directly.`,
  );
  line("Tracker: ", String(s.tracker));
  line("Money: ", `${s.coins.gc} GC; ${s.coins.ss} SS; ${s.coins.d} pennies`);
  line("Sin / Corruption: ", `${s.sin} / ${s.corruption}`);
  line("Size: ", s.size);
  for (const k of AUTO_FIELDS)
    line(
      `${LABELS[k]}: `,
      `${r.values[k] ?? "unknown"}${s.overrides[k] !== null ? " (manual override)" : " (automatic)"}`,
    );
  for (const warning of r.warnings) line("Calculation note: ", warning);
  for (const group of GROUPS) {
    section(
      {
        skills: "Skills",
        talents: "Talents",
        magic: "Magic & prayers",
        gear: "Equipment",
        extras: "Traits, mutations & runes",
      }[group],
    );
    if (!s.entries[group].length) line("None recorded.");
    for (const x of s.entries[group]) {
      const value =
        group === "skills"
          ? `${x.char}; ${x.amount} Advances; total ${r.skills.find((row) => row.key === x.key).total}${x.total !== null ? " (manual)" : ""}`
          : group === "talents"
            ? `${x.amount} ranks`
            : group === "gear"
              ? `${x.amount} units; ${x.state}; unit Enc ${x.enc ?? "unknown"}${x.ap !== null ? "; AP " + x.ap : ""}${x.damage ? "; Damage " + x.damage : ""}${x.locations ? "; " + x.locations : ""}${x.qualities ? "; " + x.qualities : ""}`
              : `${x.kind}${x.rating ? " (" + x.rating + ")" : ""}; ${x.amount} recorded${x.lore ? "; " + x.lore : ""}${x.category ? "; " + x.category : ""}`;
      line(x.name + ": ", value);
      if (group === "magic")
        line(
          "Profile: ",
          `${x.cn !== "" ? "CN " + x.cn + "; " : ""}Range ${x.range || "unspecified"}; Target ${x.target || "unspecified"}; Duration ${x.duration || "unspecified"}`,
        );
      line("Source: ", entrySource(catalogue, x));
      if (x.adaptation) line("Legacy: ", x.adaptation);
      if (x.text) line("", x.text);
    }
  }
  section("Appearance, ambitions & notes");
  if (s.appearance) line("Appearance: ", s.appearance);
  if (s.ambition) line("Personal ambition: ", s.ambition);
  if (s.partyAmbition) line("Party ambition: ", s.partyAmbition);
  if (s.notes) line("Notes: ", s.notes);
  if (s.rolls.length) {
    section("Recorded rolls");
    for (const roll of s.rolls)
      line(
        roll.label + ": ",
        `${roll.faces.join(" + ")} = ${roll.faces.reduce((a, b) => a + b, 0)}; ${roll.at}. Imported roll history is not verified randomness.`,
      );
  }
  doc.setTitle(`${s.name || "Character"} - Marijan Mode record`);
  return doc.save();
}
export function marijanFieldValues(catalogue, s, r) {
  const values = {
    Name: s.name || "Unnamed character",
    Species: s.species,
    Appearance: s.appearance,
    Class_1: r.career?.class || "",
    Career_1:
      r.career?.levels.find((l) => l.level === s.level)?.name ||
      r.career?.name ||
      s.career,
    Career_1_pg: r.career?.page || "",
    Status_1: `${s.status} ${s.standing}`,
    XP_Current: s.xpUnspent,
    XP_Spent: s.xpSpent,
    XP_Total: r.xpTotal,
    Fate: s.fate,
    Fortune_Current: s.fortune,
    Fortune_Max: s.fortune,
    Movement: r.values.movement,
    Movement_Walk: r.values.movement === null ? "" : r.values.movement * 2,
    Movement_Run: r.values.movement === null ? "" : r.values.movement * 4,
    Current_Wounds: r.values.wounds,
    Wounds_Total: r.values.wounds,
    Wounds_SB: s.size === "Small" ? 0 : r.sb,
    Wounds_TBx2: r.tb * 2,
    Wounds_WPB: s.size === "Small" ? 0 : r.wpb,
    Personal_Ambition: s.ambition,
    Party_Ambition: s.partyAmbition,
    Enc_Max: r.values.capacity,
    Enc_Total: r.values.enc,
    Sin_Points: s.sin,
    Wealth_Brass_Pennies_D: s.coins.d,
    Wealth_Silver_Shillings_SS: s.coins.ss,
    Wealth_Gold_Crowns_GC: s.coins.gc,
    AP_Head: r.values.head,
    AP_Right_Arm: r.values.arms,
    AP_Left_Arm: r.values.arms,
    AP_Body: r.values.body,
    AP_Right_Leg: r.values.legs,
    AP_Left_Leg: r.values.legs,
    AP_Shield: r.values.shield,
    Notes: `Marijan Mode - unrestricted, directly entered character. Complete values, custom entries and overrides in the attached record.\n${s.notes}`,
  };
  for (const k of KEYS) {
    values[k + "_Initial"] = r.stats[k] - s.characteristics[k].advances;
    values[k + "_Advances"] = s.characteristics[k].advances;
    values[k + "_Current"] = r.stats[k];
  }
  let extra = 0,
    language = 0,
    melee = 0;
  const used = new Set();
  for (const row of r.skills) {
    let key = row.name.replaceAll(" ", "_"),
      b = base(row.name),
      spec = row.name.match(/\((.*)\)/)?.[1] || "";
    if (row.name === "Melee (Basic)") key = "Melee_Basic";
    else if (b === "Melee" && melee < 2) {
      key = `Melee_${++melee}`;
      values[key + "_Specialisation"] = spec;
    } else if (
      ["Stealth (Rural)", "Stealth (Urban)", "Stealth (Underground)"].includes(
        row.name,
      )
    )
      key = "Stealth_" + spec;
    else if (["Art", "Entertain", "Ride"].includes(b) && !used.has(b)) {
      key = b;
      values[key + "_Specialisation"] = spec;
    } else if (b === "Language" && language < 3) {
      key = `Language_${++language}`;
      values[key] = spec;
    } else if (spec || row.custom || used.has(key)) {
      key = `Skill_Extra_${String(++extra).padStart(2, "0")}`;
      values[key + "_Name"] = row.name;
      values[key + "_Char"] = row.char;
      values[key + "_CharVal"] = r.stats[row.char];
    }
    used.add(b);
    used.add(key);
    if (!key.startsWith("Skill_Extra_"))
      values[key + "_Char"] = r.stats[row.char];
    values[key + "_Adv"] = row.amount;
    values[key + "_Skill"] = row.total;
  }
  s.entries.talents.forEach((x, i) => {
    const n = String(i + 1).padStart(2, "0");
    values[`Talent_${n}_Name`] = `${x.name} x${x.amount}`;
    values[`Talent_${n}_Description`] = x.text;
    values[`Talent_${n}_pg`] = x.source?.page || "";
  });
  let weapon = 0,
    armour = 0,
    trapping = 0;
  for (const x of s.entries.gear) {
    if (x.kind === "weapon") {
      const n = ++weapon;
      for (const [k, v] of Object.entries({
        Name: `${x.name} x${x.amount}`,
        Group: x.group || "",
        ENC: x.enc,
        Range_Reach: x.reach || x.range || "",
        Damage: x.damage,
        Qualities: x.qualities,
      }))
        values[`Weapon_${n}_${k}`] = v;
    } else if (x.kind === "armour") {
      const n = ++armour;
      for (const [k, v] of Object.entries({
        Name: `${x.name} x${x.amount}`,
        ENC: x.enc,
        AP: x.ap,
        Locations: x.locations,
        Qualities: x.qualities,
      }))
        values[`Armour_${n}_${k}`] = v;
    } else
      values[`Trapping_${String(++trapping).padStart(2, "0")}`] =
        `${x.name} x${x.amount} (${x.state})`;
  }
  s.entries.magic.forEach((x, i) => {
    for (const [k, v] of Object.entries({
      Name: x.name,
      CN: x.cn ?? "",
      Range: x.range || "",
      Target: x.target || "",
      Duration: x.duration || "",
      Effect: x.text,
    }))
      values[`Spell_${i + 1}_${k}`] = v;
  });
  let col = 0;
  for (const [segment, width] of [5, 6, 7].entries()) {
    const ticks = Math.min(
      width * 2,
      Math.max(0, Math.floor(s.tracker) - [0, 10, 22][segment]),
    );
    for (let i = 0; i < ticks; i++)
      values[
        `Adv_C1_R${i < width ? 1 : 2}_${String(col + (i % width) + 1).padStart(2, "0")}`
      ] = true;
    col += width;
  }
  for (let i = 1; i <= Math.min(15, s.corruption); i++)
    values[`Corruption_Point_${String(i).padStart(2, "0")}`] = true;
  return values;
}
export async function exportMarijanSheet(
  catalogue,
  s,
  r,
  { PDFLib = globalThis.PDFLib, templateBytes, fieldMeta } = {},
) {
  if (!PDFLib)
    throw Error(
      "The PDF library is unavailable. Reload the app and try again.",
    );
  const {
      PDFDocument,
      PDFTextField,
      PDFCheckBox,
      StandardFonts,
      PDFName,
      PDFBool,
    } = PDFLib,
    template =
      templateBytes ||
      (await (await fetch("assets/character-sheet.pdf")).arrayBuffer()),
    meta = fieldMeta || (await (await fetch("data/sheet-fields.json")).json()),
    doc = await PDFDocument.load(template),
    font = await doc.embedFont(StandardFonts.Helvetica),
    form = doc.getForm(),
    values = marijanFieldValues(catalogue, s, r),
    rects = new Map(meta.map((x) => [x.name, x.rect]));
  for (const f of form.getFields()) {
    if (f instanceof PDFCheckBox) {
      if (values[f.getName()]) f.check();
      else f.uncheck();
      continue;
    }
    if (!(f instanceof PDFTextField)) continue;
    const rect = rects.get(f.getName()),
      width = rect ? rect[2] - rect[0] - 6 : 100,
      height = rect ? rect[3] - rect[1] - 4 : 15;
    let text = clean(font, values[f.getName()]),
      size = 9;
    if (f.isMultiline()) {
      let lines = wrapPDFRuns([{ text }], font, font, size, width);
      while (size > 7 && lines.length * size * 1.15 > height) {
        size -= 0.3;
        lines = wrapPDFRuns([{ text }], font, font, size, width);
      }
      text =
        lines.length * size * 1.15 > height
          ? "See attached record."
          : lines
              .map((line) => line.map((run) => run.text).join(""))
              .join("\n");
    } else {
      text = text.replaceAll("\n", " ");
      while (size > 7 && font.widthOfTextAtSize(text, size) > width)
        size -= 0.3;
      if (font.widthOfTextAtSize(text, size) > width) {
        while (text.length && font.widthOfTextAtSize(text + "*", size) > width)
          text = text.slice(0, -1);
        text += "*";
      }
    }
    f.acroField.setDefaultAppearance(`/Helv ${size} Tf 0 g`);
    f.setText(text);
    f.setFontSize(size);
    f.updateAppearances(font);
  }
  form.updateFieldAppearances(font);
  form.acroForm.dict.set(PDFName.of("NeedAppearances"), PDFBool.False);
  const record = await PDFDocument.load(
    await marijanRecord(catalogue, s, r, PDFLib),
  );
  for (const page of await doc.copyPages(record, record.getPageIndices()))
    doc.addPage(page);
  doc.setTitle(`${s.name || "Character"} - Marijan Mode sheet and record`);
  doc.setAuthor("WFRP Character Ledger");
  return doc.save();
}
