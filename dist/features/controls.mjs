import { detailKey } from "../disclosures.mjs";
import { button as sharedButton } from "../controls.mjs";
import { runeChoiceDescription } from "../dwarf-guide-ui.mjs";
import * as M from "../rules.mjs";
import { characteristicNames } from "../ui.mjs";
import { gearSlots } from "../equipment.mjs";
import { sourceLabel } from "../sources.mjs";
import { legacyTag, legacyName, legacySources } from "../legacy.mjs";
import { legacyOption, legacyGear, legacyMagic } from "../legacy-character.mjs";
import { talentCalculation } from "../workspace.mjs";
import { creationSpecies } from "../origins.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function selectionEntry(attrs, value) {
    let { R, s } = getContext();

    const bind = attrs.match(/data-bind="([^"]+)"/)?.[1],
      key = attrs.match(/data-key="([^"]+)"/)?.[1];
    if (bind === "species") return R.species[value];
    if (bind === "origin") return R.origins.find((x) => x.id === value);
    if (["career", "freeTalent"].includes(bind))
      return bind === "career"
        ? R.careers.find((x) => x.id === value)
        : legacyOption(R, s, "talent", value);
    if (bind === "skillChoices")
      return {
        ...legacyOption(R, s, "skill", value),
        legacySources: [
          ...(legacyOption(R, s, "skill", value).legacySources || []),
          ...(key?.startsWith("s-")
            ? legacySources(R, creationSpecies(R, s))
            : []),
        ].filter(Boolean),
      };
    if (bind === "talentChoices")
      return {
        ...legacyOption(R, s, "talent", value),
        legacySources: legacyOption(R, s, "talent", value).legacySources,
      };
    if (bind === "gearChoices") {
      const slot = gearSlots(R, s).find((x) => x.key === key);
      return slot ? legacyGear(R, s, slot, value) : null;
    }
    return null;
  }

  function select(attrs, items, value, empty = false) {
    let { esc, R } = getContext();
    return `<select ${attrs}>${empty ? '<option value="">Choose…</option>' : ""}${items
      .map((x) => {
        const [v, label, disabled] = Array.isArray(x) ? x : [x, x];
        return `<option value="${esc(v)}" ${disabled ? "disabled" : ""} ${v === value ? "selected" : ""}>${esc(String(label).includes("Legacy") ? label : legacyName(R, selectionEntry(attrs, v), label))}</option>`;
      })
      .join("")}</select>`;
  }

  function button(action, label, attrs = "", style = "quiet") {
    return sharedButton(label, action, attrs, style);
  }

  function page(p) {
    let { esc } = getContext();
    return `<button type="button" class="source source-button" data-action="source-info" data-book="core" data-page="${esc(p)}">p. ${esc(p)}</button>`;
  }

  function ref(x) {
    let { esc, R } = getContext();
    return `<button type="button" class="source source-button book-reference" data-action="source-info" data-book="${esc(x?.source?.book || "core")}" data-page="${esc(x?.source?.page || x?.page || "")}">${esc(sourceLabel(R, x, { legacy: false }))}</button>${legacyTag(R, x)}`;
  }

  function skillChoice(slot) {
    let { R, s, esc } = getContext();

    const opts = M.options(R, slot.raw, "skill", s);
    return opts.length > 1
      ? select(
          `data-bind="skillChoices" data-key="${slot.key}" aria-label="${esc(slot.raw)}"`,
          opts,
          slot.name,
        )
      : `<strong>${esc(slot.name)}</strong>${legacyTag(R, { ...legacyOption(R, s, "skill", slot.name), legacySources: [...legacyOption(R, s, "skill", slot.name).legacySources, ...(slot.key.startsWith("s-") ? legacySources(R, creationSpecies(R, s)) : [])].filter(Boolean) })}`;
  }

  function talentDescription(name, { quote = null, metadata = "" } = {}) {
    let { R, s, esc } = getContext();

    const t = M.talentInfo(R, name),
      context = legacyOption(R, s, "talent", name);
    return `<details class="talent-description" data-detail-key="talent:${esc(name)}"><summary><span>${esc(name)} ${ref({ ...t, legacySources: [...context.legacySources, ...legacySources(R, quote)] })}</span>${metadata}</summary>${talentDetailsBody(name)}</details>`;
  }

  function talentDetailsBody(name, { text, includeNotes = true } = {}) {
    const { R, esc } = getContext(),
      t = M.talentInfo(R, name);
    return `<p>${esc(text ?? t?.text ?? "See the supplied Career and Talent descriptions.")}</p>${t?.limit ? `<p class="small muted">${includeNotes ? "Printed purchase limit" : "Purchase limit"}: ${esc(Array.isArray(t.limit) ? t.limit.map((k) => characteristicNames[k] + " Bonus").join(" + ") : t.limit)}.</p>` : ""}${includeNotes ? `${t?.conversion ? `<p class="small muted">${esc(t.conversion)}</p>` : ""}<p class="calculation-status">${esc(talentCalculation(R, name))}</p>` : ""}${runeChoiceDescription(R, name)}${includeNotes && t?.unavailable ? `<p class="purchase-error">${esc(t.unavailable)}</p>` : ""}`;
  }

  function characteristicClass(k) {
    let { R, s, result } = getContext();

    const unlock = M.career(R, s).advanceScheme[k];
    return unlock
      ? `career-characteristic career-level-${unlock} ${result().derived.level >= unlock ? "career-current" : "career-future"}`
      : "career-none";
  }

  function characteristicTitle(k) {
    let { R, s, result } = getContext();

    const unlock = M.career(R, s).advanceScheme[k];
    return unlock
      ? `Career level ${unlock} · ${result().derived.level >= unlock ? "currently available" : "currently non-career"}`
      : "Non-career Characteristic";
  }

  function characteristicBadge(k, compact = true) {
    let { R, s, result, esc } = getContext();

    const unlock = M.career(R, s).advanceScheme[k];
    if (!unlock)
      return compact
        ? ""
        : '<span class="characteristic-badge">Non-career</span>';
    const available = result().derived.level >= unlock;
    return `<span class="characteristic-badge" title="${esc(characteristicTitle(k))}">${compact ? `L${unlock}${available ? " · ✓" : ""}` : `Career L${unlock} · ${available ? "✓ available" : "later level"}`}</span>`;
  }

  function characteristicLegend({ compact = false } = {}) {
    return `<div class="career-legend" aria-label="Career Characteristic colours">${[1, 2, 3, 4].map((level) => `<span class="career-level-${level}"><i aria-hidden="true"></i>Level ${level}${level === 1 ? " · starting" : ""}</span>`).join("")}</div>
${compact ? "" : `<p class="small muted">✓ marks currently available Career Characteristics. Later levels become Career Characteristics when you reach that level; non-career purchases cost double. ${page(191)}</p>`}`;
  }

  function spellDetailsBody(x, { includeCreatorNote = true } = {}) {
    let { esc } = getContext();

    const fields = [
        ["CN", "cn"],
        ["Range", "range"],
        ["Target", "target"],
        ["Duration", "duration"],
      ].filter(([, key]) => x[key] != null && x[key] !== ""),
      prefix = fields.map(([label, key]) => `${label}: ${x[key]}`).join(" ");
    const effect = x.text.startsWith(prefix)
      ? x.text.slice(prefix.length).trim()
      : x.text;
    return `${includeCreatorNote ? '<p class="calculation-status">Reference for play: casting, targets and situational effects are not applied during creation.</p>' : ""}
<dl class="spell-meta">${fields.map(([label, key]) => `<div><dt>${label}</dt><dd>${esc(x[key])}</dd></div>`).join("")}</dl><p>${esc(effect)}</p>`;
  }

  function spellDescription(x) {
    let { R, s, esc } = getContext();

    x = legacyMagic(R, s, x);
    return `<details data-detail-key="${detailKey("controls:spellDescription:0", x)}" class="spell-description"><summary>${esc(x.displayName || x.name)} · ${esc(x.category)} ${ref(x)}</summary>${x.grantSource ? `<p class="small muted">Available through ${esc(x.lore)} · ${ref({ source: x.grantSource })}. Reimagined for this patron using the core Miracle’s effects.</p>` : ""}${spellDetailsBody(x)}${x.conversion ? `<p class="small muted">${esc(x.conversion)}</p>` : ""}</details>`;
  }
  return {
    selectionEntry,
    select,
    button,
    page,
    ref,
    skillChoice,
    talentDescription,
    talentDetailsBody,
    characteristicClass,
    characteristicTitle,
    characteristicBadge,
    characteristicLegend,
    spellDetailsBody,
    spellDescription,
  };
}
