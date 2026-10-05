import { chapterHeading } from "../design-system.mjs";
import { sourceButton } from "../source-controls.mjs";
import { elfOriginPanel } from "../high-elf-ui.mjs";
import { dwarfOriginPanel } from "../dwarf-guide-ui.mjs";
import { bookName, nameParts } from "../background.mjs";

import { bookPanel, tablePicker } from "../book-ui.mjs";
import {
  creationSpecies,
  creationBackground,
  originProfile,
} from "../origins.mjs";
import {
  speciesRulePanel,
  nameStylePanel,
  nameElementPanel,
} from "../archives-ui.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function originSuggestionField(label, key, kind, value, isName = false) {
    let { R, s, esc, select, button } = getContext();

    const b = creationBackground(R, s);
    if (isName && key === "forename" && b.nameElements)
      return `<div class="field"><label for="origin-forename">Given name</label><input id="origin-forename" type="text" data-bind="namePart" data-key="forename" value="${esc(value || "")}" placeholder="Write your own or combine the elements below" maxlength="90"></div>`;
    const choices = b[kind].map((x) => [isName ? bookName(x) : x, x]),
      id = `origin-${key}`,
      selected = choices.some(([v]) => v === value) ? value : "";
    return `<div class="field origin-suggestion"><label for="${id}">${label}</label><input id="${id}" type="text" data-bind="${isName ? "namePart" : "background"}" data-key="${key}" value="${esc(value || "")}" placeholder="Write your own ${label.toLowerCase()}" maxlength="${isName ? 90 : 80}"><div class="origin-suggestion-tools">${select(`id="book-${key}" data-bind="${isName ? "bookName" : "backgroundChoice"}" data-key="${key}" aria-label="Choose ${label.toLowerCase()} from the book"`, choices, selected, true).replace("Choose…", "Book suggestions…")}${button(isName ? "roll-name-part" : "roll-appearance", "Roll", `data-key="${key}" data-kind="${kind}" aria-label="Roll ${label.toLowerCase()}"`)}</div>
</div>`;
  }

  function regionalOrigins() {
    let { R, s, select, esc, ref } = getContext();

    const choices = R.origins.filter((x) => x.species === s.species),
      o = originProfile(R, s);
    if (!choices.length) return "";
    return `<div class="field section-gap"><label for="regional-origin">Origin / clan</label>${select('id="regional-origin" data-bind="origin"', [["", `Core ${s.species}`], ...choices.map((x) => [x.id, x.name])], s.origin || "")}</div>${o ? `<p class="small muted">${esc(o.name)} · ${ref(o)}. Native languages: ${esc(creationSpecies(R, s).languages.join(" and "))}. Regional choices use Fifth Edition creation allocations.${o.text ? `<br>${esc(o.text)}` : ""}</p>` : ""}`;
  }

  function lucciniTalentChoice() {
    let { R, s, select, ref } = getContext();

    const o = originProfile(R, s),
      sp = creationSpecies(R, s);
    if (!o?.optionalTalent) return "";
    const slots = [
      ...sp.talents.map((opts, i) => [
        `species-${i}`,
        s.talentChoices[`species-${i}`] || opts[0],
      ]),
      ...s.randomTalents.map((t, i) => [`random-${i}`, t]),
    ];
    return `<div class="field"><label for="luccini-doomed">Optional Luccinan Dooming</label>${select('id="luccini-doomed" data-bind="originTalentSlot"', [["", "Keep all starting Talents"], ...slots.map(([key, name]) => [key, `Replace ${name} with Doomed`])], s.originTalentSlot || "")}</div>
<p class="small muted">Replace one regional starting Talent, rather than adding a Talent (${ref(o)}). Original random rolls remain in the record.</p>`;
  }

  function origins() {
    let { R, s, library, select, button, ref, page, esc } = getContext();

    const sp = R.species[s.species],
      b = creationBackground(R, s),
      parts = nameParts(s),
      surnameLabel =
        s.species === "Gnome"
          ? "Clan name / epithet"
          : b.nameElements
            ? "Title / clan name"
            : s.species.includes("Elf")
              ? "Epithet"
              : s.species === "Dwarf"
                ? "Surname / clan name"
                : "Surname";
    return `<span class="eyebrow">01 / Origins</span>${chapterHeading("Origins & identity")}${bookPanel(library, R)}<p class="muted">Choose your Species, name and appearance.</p>
<div class="origin-species"><div class="field"><label for="species">Species</label>${select('id="species" data-bind="species"', Object.keys(R.species), s.species)}</div>${button("species-roll", "Roll Species · d100", "", "primary")}</div>${tablePicker(R, s, "species")}<p class="small muted">${s.speciesMode === "first" ? "+1 Fortune · first roll accepted" : s.speciesAttempts ? "Later roll / choice · no bonus" : "Chosen Species · no random bonus"}</p>
<div class="notice">${s.species} begins with ${sp.fate} Fate, ${sp.fortune} Fortune and Movement ${sp.movement}. Fate and Fortune are separate values. ${ref(sp)}<br>Accepting your first Species roll adds 1 Fortune. Accepting the first Species, Career and Characteristics rolls adds 1 Fate. ${page("23, 40")}</div>${speciesRulePanel(R, s)}${regionalOrigins()}${dwarfOriginPanel(R, s)}${elfOriginPanel(R, s)}<h2>Your name ${sourceButton(R, b)}</h2>${nameStylePanel(R, s, { select })}<p class="small muted">Write your own, choose from the book, or roll each part separately.</p>
<div class="cols">${originSuggestionField("First name", "forename", "forenames", parts.forename, true)}${originSuggestionField(surnameLabel, "surname", "surnames", parts.surname, true)}</div>
<div class="identity-preview"><div><span class="small muted">Character name</span><strong aria-live="polite">${esc(s.name || "Your character")}</strong></div>${button("suggest-name", b.nameElements ? "Roll given name & title" : "Roll full name")}</div>${nameElementPanel(R, s, { select, button })}<h2>Appearance ${sourceButton(R, R.background[s.species])}</h2>
<div class="cols">${originSuggestionField("Eye colour", "eyes", "eyes", s.background?.eyes)}${originSuggestionField("Hair colour", "hair", "hair", s.background?.hair)}</div>${b.clans ? originSuggestionField("Dwarf clan", "clan", "clans", s.background?.clan) : ""}<p class="small muted">${b.dwarfNames ? "Names use the printed d1000 ranges; core appearance and clan suggestions use their printed lists." : R.background[s.species].rollTables ? "Eye and hair rolls use the printed 2d10 tables." : "Random suggestions choose uniformly from the printed lists."} All rolls are recorded.</p>
<div class="field"><label for="appearance">Age, height & background</label><textarea id="appearance" data-bind="appearance" placeholder="Age, height, distinguishing features, and a few words about your past…">${esc(s.appearance)}</textarea></div>${button("age", s.longbeard ? "Roll height · use chosen Longbeard age" : "Roll age & height")}<div class="cols section-gap"><div class="field"><label for="ambition">Personal ambition</label><textarea id="ambition" data-bind="ambition" placeholder="What are you striving for?">${esc(s.ambition)}</textarea></div>
<div class="field"><label for="partyAmbition">Party ambition</label><textarea id="partyAmbition" data-bind="partyAmbition" placeholder="Agree this with your group (p. 42).">${esc(s.partyAmbition)}</textarea></div>
</div>
<p class="small muted">Biography is your character’s fiction. Rules and options come only from your selected supplied books.</p>`;
  }
  return {
    originSuggestionField,
    regionalOrigins,
    lucciniTalentChoice,
    origins,
  };
}
