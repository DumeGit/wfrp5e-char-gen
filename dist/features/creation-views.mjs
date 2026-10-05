import { chapterHeading } from "../design-system.mjs";
import { sourceButton } from "../source-controls.mjs";
import { detailKey } from "../disclosures.mjs";
import { elfSkillsPanel } from "../high-elf-ui.mjs";
import { grudgePanel, runePanel } from "../dwarf-guide-ui.mjs";
import * as M from "../rules.mjs";
import { characteristicNames } from "../ui.mjs";
import { randomTable } from "../books.mjs";
import { sourceLabel } from "../sources.mjs";
import { legacyTag } from "../legacy.mjs";
import { legacyOption, legacyGear } from "../legacy-character.mjs";
import { tablePicker } from "../book-ui.mjs";
import {
  careerBrowser,
  careerOptions,
  trainingPrerequisites,
  kitSummary,
} from "../flow-ui.mjs";
import {
  creationSpecies,
  originProfile,
  careerRefinementTable,
  regionalCareerChoices,
  startingTalentReplacement,
  careerAvailable,
} from "../origins.mjs";
import { astrologyPanel } from "../archives-ui.mjs";
import { starSign, starEffect } from "../astrology.mjs";
import { speciesMagicReferences } from "../species-mechanics.mjs";
import { originTalentChoice, divinePanel } from "../archives-iii-ui.mjs";
import {
  psychometryPanel,
  psychicSkillPanel,
  womReferencePanel,
  womGearPanel,
  pettyGrantNote,
} from "../winds-of-magic-ui.mjs";
import { psychometrySacrifice } from "../winds-of-magic.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function optionalCareerChoices() {
    let { s, R, esc, ref, button } = getContext();

    if (s.careerMode === "choose") return "";
    const table = careerRefinementTable(R, s),
      refined = s.careerRefinement,
      choices = regionalCareerChoices(R, s, s.regionalCareerBase || s.career);
    return `${table && !refined ? `<div class="notice"><strong>Optional Career roll</strong><p class="small">Keep your rolled Career, or roll once on the additional ${esc(M.career(R, s).name)} table (${ref(table)}). Species restrictions still apply.</p>${button("career-refine", "Roll optional Career · d100")}</div>` : ""}${refined ? `<div class="notice"><p>${esc(refined.message)} ${legacyTag(R, refined)}</p>${refined.career !== refined.base ? button("career-original", "Keep original Career") : ""}</div>` : ""}${
      choices.length
        ? `<div class="notice"><strong>Printed Career alternatives</strong><p class="small">You may keep the rolled Career or choose a printed alternative.</p>
<div class="actions">${s.regionalCareerBase ? button("regional-original", "Keep original regional result") : ""}${choices
            .filter((id) => id !== s.career)
            .map((id) =>
              button(
                "regional-career",
                esc(R.careers.find((c) => c.id === id).name),
                `data-id="${esc(id)}"`,
              ),
            )
            .join("")}</div>
</div>`
        : ""
    }`;
  }

  function careerView() {
    let {
      R,
      s,
      esc,
      careerSearch,
      careerFilter,
      careerBook,
      careerPreview,
      careerLimit,
      button,
      select,
      page,
      ref,
      talentDescription,
    } = getContext();

    const c = M.career(R, s),
      available = R.careers.filter((x) => careerAvailable(R, s, x)),
      bonus = M.bonusTrappingLimit(R, s);
    return `${chapterHeading("Choose your Career")}
<p class="muted">${available.length} of ${R.careers.length} enabled Careers are available to ${esc(originProfile(R, s)?.name || s.species)} characters.</p>${careerBrowser(R, s, { query: careerSearch, className: careerFilter, book: careerBook, preview: careerPreview, limit: careerLimit })}${tablePicker(R, s, "career")}<div class="actions">${button("career-roll", s.careerAttempts ? "Roll another Career" : "Roll Career · d100", randomTable(R, s, "career") ? "" : 'disabled title="Choose a printed Career roll table above, or choose a Career directly"', "primary")}${s.careerAttempts === 1 && randomTable(R, s, "career") ? button("career-three", "Roll two more") : ""}</div>${
      s.careerOffers.length === 3
        ? `<p class="small">Choose one result for one bonus Trapping:</p>
<div class="actions">${s.careerOffers.map((id) => button("career-offer", esc(R.careers.find((c) => c.id === id).name), `data-id="${id}"`)).join("")}</div>`
        : ""
    }${optionalCareerChoices()}${careerOptions(R, s)}${trainingPrerequisites(R, s, { select, button })}<div class="notice">${bonus ? `Select ${bonus} level-two Trapping${bonus === 1 ? "" : "s"}. Each earns one tracker box.${s.careerMode === "first" && bonus < 2 ? " This Career lists only one option." : ""}` : "Chosen Career: standard starting Trappings, no bonus tracker boxes."} ${page(36)}</div>
<h2>${esc(c.name)} <span class="small">${esc(c.class)} · ${sourceButton(R, c)}</span>${legacyTag(R, c)}</h2>
<p class="small">Begin as <strong>${esc(c.levels[0].name)}</strong> — ${c.levels[0].status} ${c.levels[0].standing}. Your first advances are ${Object.entries(
      c.advanceScheme,
    )
      .filter(([k, v]) => v === 1)
      .map(([k]) => k)
      .join(", ")}.</p>${
      bonus
        ? `<h3>Bonus Trappings <span class="counter">${s.bonusGear.length}/${bonus}</span></h3>
<div class="checklist">${M.bonusTrappingSlots(R, s)
            .map(
              ({ name: t, i }) =>
                `<label class="check-row"><input type="checkbox" data-bind="bonusGear" value="${i}" ${s.bonusGear.includes(i) ? "checked" : ""}>${esc(t)}</label>`,
            )
            .join("")}</div>`
        : ""
    }${c.text ? `<div class="notice">${esc(c.text)} ${ref(c)}</div>` : ""}${(
      originProfile(R, s)?.additionalCareers || []
    )
      .filter((x) => x.career === c.id)
      .map(
        (x) =>
          `<div class="notice">${esc(x.reason)} ${ref(originProfile(R, s))}</div>`,
      )
      .join("")}<h3>The Career path</h3>${c.levels
      .map(
        (l) =>
          `<details data-detail-key="${detailKey("career:level", c.contentId + ":" + l.level)}" ${l.level === 1 ? "open" : ""}><summary>${l.level}. ${esc(l.name)} · ${l.status} ${l.standing} ${legacyTag(R, l.source ? l : c)}</summary><p><strong>Skills:</strong> ${esc(l.skills.join(", "))}</p>${(l.unavailableSkills || []).map((x) => `<p class="small muted"><strong>${esc(x.name)} · unavailable</strong><br>${esc(x.reason)}</p>`).join("")}<p><strong>Talents:</strong> ${l.talents.map((n) => (M.talentInfo(R, n)?.unavailable ? `<span class="muted">${esc(n)} (unavailable)</span>` : esc(n))).join(", ")}</p>${l.talents
            .filter((n) => M.talentInfo(R, n)?.unavailable)
            .map((n) => talentDescription(n))
            .join(
              "",
            )}<p><strong>Trappings:</strong> ${esc(l.trappings.join(", "))}</p>
</details>`,
      )
      .join("")}`;
  }

  function characteristics() {
    let {
      R,
      s,
      page,
      button,
      characteristicLegend,
      select,
      characteristicClass,
      characteristicBadge,
    } = getContext();

    const c = M.career(R, s),
      sp = R.species[s.species],
      budget = s.charMode === "first" ? 6 : s.charMode === "rearrange" ? 3 : 0;
    return `<span class="eyebrow">03 / Characteristics</span>${chapterHeading("Characteristics")}${legacyTag(R, R.species[s.species])}<p class="muted">Each score starts with your Species modifier and a roll or point allocation. ${page(38)}</p>
<div class="actions">${button("char-roll", s.charAttempts ? "Reroll 10 × 2d10" : "Roll 10 × 2d10", "", "primary")}${button("char-points", "Allocate 100 points")}${s.charRolls.length ? button("char-rearrange", "Rearrange rolled values") : ""}</div>
<div class="notice">${s.charMode === "points" ? "Distribute exactly 100 points, from 4 to 16 in each Characteristic." : s.charMode === "first" ? "First rolls retained in order: up to +6 starting points across your three Career Characteristics." : s.charMode === "rearrange" ? "First results rearranged: up to +3 starting points across your three Career Characteristics." : "Rerolled results: assign each result once; no extra starting points."}</div>${
      s.charMode === "points"
        ? `<p><span class="counter">${s.points.reduce((a, b) => a + b, 0)} / 100 points allocated</span></p>
<div class="points-grid">${M.KEYS.map(
            (
              k,
              i,
            ) => `<div class="field characteristic-cell ${characteristicClass(k)}"><label for="point-${i}" title="${characteristicNames[k]}">${k}</label><div class="characteristic-meta">${characteristicBadge(k)}</div>
<input type="number" id="point-${i}" data-bind="points" data-key="${i}" min="4" max="16" value="${s.points[i]}"><small class="muted">+ ${sp.offsets[k]} Species</small></div>`,
          ).join("")}</div>`
        : `<table class="characteristics-table"><thead><tr><th>Characteristic</th><th>2d10</th><th>Species</th><th>Initial</th></tr></thead><tbody>${M.KEYS.map(
            (k, i) =>
              `<tr class="${characteristicClass(k)}"><td><div class="characteristic-identity"><span class="characteristic-label"><strong>${k}</strong>${characteristicBadge(k)}</span><small class="characteristic-name">${characteristicNames[k]}</small></div></td><td>${
                s.charMode === "first"
                  ? s.charRolls[i]
                  : select(
                      `data-bind="assignment" data-key="${i}" aria-label="Roll for ${k}"`,
                      s.charRolls.map((v, j) => [j, `${j + 1}: ${v}`]),
                      s.assignment[i],
                    )
              }</td><td>+${sp.offsets[k]}</td><td>${M.initial(R, s)[k]}</td></tr>`,
          ).join("")}</tbody></table>`
    }${characteristicLegend()}${
      budget
        ? `<section class="career-starting-increases" aria-label="Career starting increases"><div class="starting-increases-heading"><h3>Career starting increases</h3><span class="counter">${Object.values(s.boost).reduce((a, b) => a + b, 0)} / ${budget}</span></div>
<div class="starting-increases-controls">${M.KEYS.filter(
            (k) => c.advanceScheme[k] === 1,
          )
            .map(
              (k) =>
                `<label class="starting-increase"><span>${k}</span><input type="number" data-bind="boost" data-key="${k}" aria-label="${characteristicNames[k]} starting increase" min="0" max="${budget}" value="${s.boost[k] || 0}"></label>`,
            )
            .join("")}</div></section>`
        : ""
    }<p class="small muted">Starting increases and Talent bonuses are not purchased Advances. Each later Characteristic Advance adds +5; costs begin at 125 XP. ${page(191)}</p>${astrologyPanel(R, s, { select, button, options: M.options })}`;
  }

  function skills() {
    let { R, s, page, ref, skillChoice, esc, button } = getContext();

    const slots = M.careerSkillSlots(R, s),
      total = Object.values(s.careerSkills).reduce((a, b) => a + b, 0);
    return `<span class="eyebrow">04 / Skills</span>${chapterHeading("Starting Skills")}
<p class="muted">Every Advance is +5. Ordinary creation Skills may receive at most three Advances in total. ${page("38–39")}</p>
<div class="allocation-budgets" aria-label="Starting Skill budgets"><span><strong>${s.speciesSkills.length}/5</strong> Species Skills · +5 each</span><span><strong>${total}/8</strong> Career Advances · +5 each</span><small>Native languages and Elder points are separate grants.</small></div>${elfSkillsPanel(R, s)}<section class="species-skill-section"><h3>Species Skills <span class="counter">${s.speciesSkills.length} / 5 chosen</span></h3>
<p class="small muted">Choose five Skills · +5 each. ${ref(creationSpecies(R, s))}</p>
<div class="species-skills-grid">${M.speciesSkillSlots(R, s)
      .map(
        (slot) =>
          `<div class="species-skill-option"><div class="species-skill-info">${skillChoice(slot)}${M.careerSkillSlots(R, s, 1).some((x) => x.name === slot.name) ? '<small class="species-career-marker" title="Also offered by your Career">Career</small>' : ""}</div>
<label class="species-skill-check"><input type="checkbox" data-bind="speciesSkills" value="${slot.key}" aria-label="Choose Species ${esc(slot.name)}" ${s.speciesSkills.includes(slot.key) ? "checked" : ""}><span>+5</span></label></div>`,
      )
      .join("")}</div>
</section>
<div class="notice">Fluent in ${creationSpecies(R, s).languages.join(" and ")}: +30 in each native Language Skill. This explicit Species benefit is separate from the usual +15 limit.</div>
<h3>Career Skills ${legacyTag(R, M.career(R, s))} <span class="counter">${total} / 8 Advances</span></h3>${psychicSkillPanel(R, s)}${slots
      .filter((x) => x.level === 1)
      .map(
        (slot) =>
          `<div class="skill-row"><div>${skillChoice(slot)}<div class="minilabel">${M.skillInfo(R, slot.name, s)?.char} · Species +${M.speciesSkillSlots(R, s).filter((x) => x.name === slot.name && s.speciesSkills.includes(x.key)).length * 5} · Career +${(s.careerSkills[slot.key] || 0) * 5} · total starting +${(M.freeSkills(R, s)[slot.name] || 0) * 5}</div>
</div>
<div class="stepper">${button("skill-minus", "−", `data-key="${slot.key}" aria-label="Decrease ${esc(slot.name)}"`)}<strong>${s.careerSkills[slot.key] || 0}</strong>${button("skill-plus", "+", `data-key="${slot.key}" aria-label="Increase ${esc(slot.name)}"`)}</div>
</div>`,
      )
      .join(
        "",
      )}<details data-detail-key="${detailKey("creation-views:skills:0")}" class="section-gap"><summary>Specialisations for later Career levels</summary><p>Choose these now if you plan to advance your Career with XP.</p>${slots
      .filter((x) => x.level > 1)
      .map(
        (slot) =>
          `<div class="skill-row"><span class="minilabel">Level ${slot.level}</span>${skillChoice(slot)}</div>`,
      )
      .join("")}</details>`;
  }

  function magicSection() {
    let { R, s, result, esc, button, spellDescription } = getContext();

    let idx = 0;
    return (
      speciesMagicReferences(R, s, result().derived.talents)
        .map(
          (x) =>
            `<details data-detail-key="${detailKey("creation-views:magicSection:0", x)}" class="section-gap"><summary>Ogre magic reference · ${esc(sourceLabel(R, x))}</summary><p>${esc(x.text)}</p>
</details>`,
        )
        .join("") +
      divinePanel(R, s) +
      M.spellGrants(R, s)
        .map(
          (g) =>
            `<h3>${esc(g.talent)} ${legacyTag(R, legacyOption(R, s, "talent", g.talent))} — ${g.count} free ${g.category === "Old Faith" ? "Blessing" : R.config.gods.includes(g.category) ? "Miracle" : "Spell"}${g.count === 1 ? "" : "s"}</h3>${pettyGrantNote(R, s, g)}${Array.from(
              { length: g.count },
              () => {
                const i = idx++,
                  chosen = g.choices.find((x) => x.name === s.spells[i]);
                return `<div class="free-magic-choice"><span>Free choice ${i + 1}: <strong>${esc(chosen?.name || "Not chosen")}</strong></span>${button("free-magic-picker", chosen ? "Change" : "Choose", `data-index="${i}"`)}</div>${chosen ? spellDescription({ ...chosen, lore: g.category, talent: g.talent }) : ""}`;
              },
            ).join("")}`,
        )
        .join("")
    );
  }

  function talents() {
    let {
      R,
      s,
      result,
      lucciniTalentChoice,
      ref,
      button,
      select,
      talentDescription,
      page,
      esc,
    } = getContext();

    const sp = creationSpecies(R, s),
      d = result().derived,
      replacement = startingTalentReplacement(R, s);
    return `<span class="eyebrow">05 / Talents</span>${chapterHeading("Starting Talents")}
<p class="muted">Choose your special abilities and any starting spells or Miracles.</p>
<h3>Species Talents</h3>${originTalentChoice(R, s)}${lucciniTalentChoice()}${sp.talents
      .map((_, i) => {
        const opts = M.speciesTalentOptions(R, s, i);
        return replacement?.slot === `species-${i}`
          ? `<span class="chip">${esc(replacement.talent)} · regional replacement ${legacyTag(R, sp)}</span>`
          : opts.length === 1
            ? `<span class="chip">${esc(opts[0])}${legacyTag(R, legacyOption(R, s, "talent", opts[0]))}</span>`
            : `<div class="field"><label for="talent-${i}">Species choice</label>${select(`id="talent-${i}" data-bind="talentChoices" data-key="species-${i}"`, opts, s.talentChoices[`species-${i}`] || opts[0])}</div>`;
      })
      .join(
        "",
      )}${sp.randomTalents ? `${tablePicker(R, s, "talent")}<p class="small">${sp.randomTalents} random Talents from ${ref(randomTable(R, s, "talent"))}. Duplicates are rerolled and retained in your roll record.</p>${s.randomTalents.length ? s.randomTalents.map((t, i) => (psychometrySacrifice(R, s) && s.psychometrySlot === i ? `<span class="chip muted">${esc(t)} · given up for Psychometry</span>` : replacement?.slot === `random-${i}` ? `<span class="chip">${esc(replacement.talent)} · regional replacement ${legacyTag(R, sp)}</span>` : t === "Artistic" ? `<div class="field"><label>Artistic specialisation</label>${select(`data-bind="talentChoices" data-key="random-${i}" aria-label="Artistic specialisation"`, M.options(R, "Artistic", "talent"), s.talentChoices[`random-${i}`] || "Artistic (Drawing)")}</div>` : `<span class="chip">${esc(t)}</span>`)).join("") : button("random-talents", `Roll ${sp.randomTalents} random Talents`, "", "primary")}` : ""}${psychometryPanel(R, s)}${(originProfile(R, s)?.grantedTalents || []).map((t) => `<span class="chip">${esc(t)} · kindred grant</span>${talentDescription(t)}`).join("")}<div class="field section-gap"><label for="freeTalent">One free Career Talent</label>${select(
      'id="freeTalent" data-bind="freeTalent"',
      M.careerTalentOptions(R, s).map((n) => [
        n,
        n,
        M.talentInfo(R, n)?.unavailable,
      ]),
      s.freeTalent,
      true,
    )}</div>${s.freeTalent ? talentDescription(s.freeTalent) : ""}${
      d.talents.includes("Doomed")
        ? `<details data-detail-key="${detailKey("creation-views:talents:0")}" class="section-gap" open><summary>Your Dooming ${page(118)}</summary><p class="small muted">Choose or roll a suggestion from the book, then agree its meaning with your GM.</p>
<div class="field"><label for="dooming">Dooming</label>${select(
            'id="dooming" data-bind="dooming"',
            R.background.doomings.map((x) => [
              x.text,
              `${x.min}–${x.max}: ${x.text}`,
            ]),
            s.dooming,
            true,
          )}</div>${button("roll-dooming", "Roll Dooming · d100")}</details>`
        : ""
    }${
      starSign(R, s)
        ? `<h3>Star-sign benefit · Archives II p. 39 ${legacyTag(R, starSign(R, s))}</h3>
<p>${esc(starSign(R, s).name)}${starEffect(R, s).talent ? ` · ${esc(starEffect(R, s).talent)}` : ""}. Core Talent limits apply.</p>`
        : ""
    }${womReferencePanel(R, s)}${grudgePanel(R, s)}${runePanel(R, s)}${magicSection()}${result().spells.some((x) => x.category === "Blessing" && x.lore !== "Old Faith") ? `<div class="notice">Your patron grants six Blessings automatically (p. 220). All six appear in the export; overflow goes into the creation record.</div>` : ""}<details data-detail-key="${detailKey("creation-views:talents:1")}" class="section-gap"><summary>Read all your Talent rules</summary>${[...new Set(d.talents)].map(talentDescription).join("")}</details>`;
  }

  function gear() {
    let { result, R, s, select, button, page, esc } = getContext();

    const d = result().derived,
      eq = result().equipment;
    return `<span class="eyebrow">06 / Gear & money</span>${chapterHeading("Gear & money")}
<p class="muted">Resolve your starting belongings, roll your purse, and buy extra equipment.</p>${kitSummary(R, s, { select, button, tag: (slot) => legacyTag(R, legacyGear(R, s, slot)) })}${eq.notes
      .filter((n) => !n.startsWith("Creator defaults:"))
      .map((n) => `<div class="notice">${esc(n)}</div>`)
      .join(
        "",
      )}<h3>Starting wealth ${page(39)}</h3>${s.wealth ? `<p><strong>${s.wealth.amount} ${s.wealth.currency}</strong></p>` : button("wealth", "Roll starting wealth", "", "primary")}<p class="small muted">Based on ${M.career(R, s).levels[0].status} ${M.career(R, s).levels[0].standing}. A promotion does not grant another purse.</p>${
      d.talents.includes("Sturdy") || s.species === "Dwarf"
        ? `<div class="field"><label for="sturdyRule">Book discrepancy: carrying capacity</label>${select(
            'id="sturdyRule" data-bind="sturdyRule"',
            [
              ["creation", "Creation rule, p. 40: 2 × (SB + TB)"],
              ["talent", "Sturdy, p. 127: 2 × SB + TB"],
            ],
            s.sturdyRule,
          )}<small class="muted">Both formulas appear in the book. Your selection is recorded.</small></div>`
        : ""
    }${result().derived.talents.some((x) => /Magic|Witch!/.test(x)) ? womGearPanel(R) : ""}`;
  }
  return {
    optionalCareerChoices,
    careerView,
    characteristics,
    skills,
    magicSection,
    talents,
    gear,
  };
}
