import { detailKey } from "../disclosures.mjs";
import { CAUSE_KEY, namedCause } from "../talent-targets.mjs";
import { elfAction, elfChange } from "../high-elf-ui.mjs";
import { birthEra, elfState, elderSkills } from "../high-elf.mjs";
import * as M from "../rules.mjs";
import { hasCharacterChanges } from "../ui.mjs";
import { gearSlots, recordAcquisition } from "../equipment.mjs";
import { buyTrapping, formatMoney } from "../market.mjs";
import { exportSheet, exportRecord } from "../export.mjs";
import { withBusy } from "../interface-kit.mjs";
import {
  setAgeHeight,
  suggestion,
  traditionalName,
  selectedTraditionalName,
  bookName,
  setNamePart,
  doomingResult,
} from "../background.mjs";
import { assembleBooks, randomTable, tableResult } from "../books.mjs";
import { comparisonHTML } from "../flow-ui.mjs";
import {
  clearCareerSelections,
  switchCareerVariant,
  isCareerVariant,
} from "../career-variants.mjs";
import {
  creationSpecies,
  creationBackground,
  careerAvailable,
} from "../origins.mjs";
import {
  refineCareer,
  regionalCareer,
  storedRefinement,
} from "../regional-careers.mjs";
import { chartState, rollStar, rollWitchling } from "../astrology.mjs";
import {
  psychometrySacrifice,
  psychicSkillIssue,
  extraCareerSkills,
} from "../winds-of-magic.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function download(bytes, name, type) {
    const url = URL.createObjectURL(new Blob([bytes], { type })),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 20000);
  }

  async function action(el) {
    let {
      R,
      s,
      xpTab,
      render,
      $,
      pendingChange,
      sourceInfo,
      dialog,
      esc,
      showCalculation,
      freeMagicPicker,
      jumpToIssue,
      setupOpen,
      careerPreview,
      careerLimit,
      magicFilters,
      choiceReturn,
      summaryExpanded,
      saveFolioPreferences,
      toast,
      newCharacter,
      library,
      careerFilter,
      detailsState,
      resetDependent,
      rolledCareer,
      changeCareer,
      result,
      errors,
      fullAppendix,
      startHistoryDocument,
    } = getContext();

    const a = el.dataset.action;
    if (a === "close-dialog") {
      $("#creator-dialog").close();
      setContext("pendingChange", (pendingChange = null));
      return;
    }
    if (a === "confirm-change") {
      const apply = pendingChange;
      setContext("pendingChange", (pendingChange = null));
      $("#creator-dialog").close();
      apply?.();
      return;
    }
    if (a === "source-info") {
      sourceInfo(el.dataset.book, el.dataset.page);
      return;
    }
    if (a === "legacy-info") {
      dialog(
        "Legacy adaptation",
        `<p>${esc(el.dataset.explanation || el.title)}</p>
<p class="small muted">This badge marks a specific change to a printed rule for Fifth Edition, not every option from an older book.</p>`,
      );
      return;
    }
    if (a === "sources") {
      dialog(
        "Selected books & decisions",
        R.books
          .map(
            (b) =>
              `<details data-detail-key="${detailKey("actions:action:0", b)}"><summary>${esc(b.title)}</summary><p class="small">Version ${esc(b.version)} · ${esc(b.source.file)}</p>${[...(b.compatibility?.notes || []), ...(b.notes || [])].map((x) => `<p class="small">${esc(x)}</p>`).join("")}</details>`,
          )
          .join(""),
      );
      return;
    }
    if (a === "calculation") {
      showCalculation(el.dataset.kind, el.dataset.name);
      return;
    }
    if (a === "free-magic-picker") {
      freeMagicPicker(Number(el.dataset.index));
      return;
    }
    if (a === "choose-free-magic") {
      s.spells[Number(el.dataset.index)] = el.dataset.name;
      $("#creator-dialog").close();
      render();
      return;
    }
    if (a === "issue") {
      jumpToIssue(el.dataset.step, el.dataset.target);
      return;
    }
    if (a === "books") {
      setContext("setupOpen", (setupOpen = true));
      render();
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    if (a === "books-cancel") {
      setContext("setupOpen", (setupOpen = false));
      render();
      return;
    }
    if (a === "career-preview") {
      setContext("careerPreview", (careerPreview = el.dataset.id));
      render();
      $(".career-preview")?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (a === "career-more") {
      setContext("careerLimit", (careerLimit += 12));
      render();
      return;
    }
    if (a === "career-apply") {
      handleChange({
        target: { dataset: { bind: "career" }, value: el.dataset.id },
      });
      return;
    }
    if (a === "browse-magic") {
      magicFilters.status = "all";
      render();
      return;
    }
    if (a === "mobile-folio") {
      setContext(
        "choiceReturn",
        (choiceReturn = { step: s.step, y: window.scrollY }),
      );
      setContext("summaryExpanded", (summaryExpanded = true));
      saveFolioPreferences();
      render();
      $(".sheet")?.scrollIntoView({ block: "start", behavior: "instant" });
      $(".mobile-workspace-bar [data-action=mobile-choice]")?.focus({
        preventScroll: true,
      });
      return;
    }
    if (a === "mobile-choice") {
      setContext("summaryExpanded", (summaryExpanded = false));
      saveFolioPreferences();
      render();
      $(".mobile-workspace-bar [data-action=mobile-folio]")?.focus({
        preventScroll: true,
      });
      if (choiceReturn?.step === s.step)
        window.scrollTo({ top: choiceReturn.y, behavior: "instant" });
      else
        document
          .querySelector("main h1")
          ?.scrollIntoView({ block: "start", behavior: "instant" });
      return;
    }
    if (
      elfAction(R, s, el, (sides, p, label, source, count = 1) => {
        const n = M.roll(s, label, count, sides, p).reduce((a, b) => a + b, 0);
        s.rolls.at(-1).source = source;
        return n;
      })
    ) {
      render();
      return;
    }
    if (a === "step") {
      setContext("setupOpen", (setupOpen = false));
      s.step = Number(el.dataset.step);
      render();
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    if (a === "new") {
      if (
        !confirm(
          "Start a new character? Save the current character first if you want to keep it.",
        )
      )
        return;
      setContext("s", (s = newCharacter()));
      startHistoryDocument();
      setContext("setupOpen", (setupOpen = true));
    }
    if (a === "save-file") {
      download(
        JSON.stringify(s, null, 2),
        `${s.name || "character"}.json`,
        "application/json",
      );
      toast("Character file saved.");
      return;
    }
    if (a === "load-file") {
      $("#import-file").click();
      return;
    }
    if (a === "unlock") {
      if (!confirm("Clear the XP ledger and spells so you can edit creation?"))
        return;
      s.ledger = [];
      s.spells = [];
    }
    if (a === "apply-books") {
      const ids = [...document.querySelectorAll("[data-book]:checked")].map(
          (x) => x.dataset.book,
        ),
        next = assembleBooks(library, ids);
      if (
        JSON.stringify(next.selection) ===
        JSON.stringify(R.selection.filter((b) => !isCareerVariant(b.id)))
      ) {
        setContext("setupOpen", (setupOpen = false));
        render();
        toast("These books are already selected.");
        return;
      }
      if (
        hasCharacterChanges(s, newCharacter()) &&
        !confirm(
          "Changing books starts a new character. Save the current character first if you want to keep it.",
        )
      )
        return;
      setContext("R", (R = next));
      setContext("s", (s = newCharacter()));
      startHistoryDocument();
      setContext("setupOpen", (setupOpen = false));
      setContext("careerPreview", (careerPreview = ""));
      setContext("careerFilter", (careerFilter = "All classes"));
      detailsState.clear();
      toast("Selected books are ready for a new character.");
    }
    const chartRoll = (label, count, sides, p) => {
      const total = M.roll(s, label, count, sides, p).reduce(
        (a, b) => a + b,
        0,
      );
      s.rolls.at(-1).source = { book: "archives-ii", page: p };
      return total;
    };
    if (a === "star-roll") rollStar(R, s, chartRoll);
    if (a === "witchling-roll") rollWitchling(R, s, chartRoll);
    if (a === "ascendant-roll" || a === "mansion-roll") {
      const n = chartRoll(
          a === "ascendant-roll"
            ? "Ascendant sign"
            : `Celestial mansion ${Number(el.dataset.key) + 1}`,
          1,
          100,
          50,
        ),
        id = R.astrology.find((x) => n >= x.min && n <= x.max).id;
      const chart = chartState(s);
      if (a === "ascendant-roll") chart.ascendant = id;
      else chart.mansions[Number(el.dataset.key)] = id;
      s.chart = chart;
    }
    if (a === "traditional-name") {
      const values = [];
      setNamePart(
        s,
        "forename",
        traditionalName(R, s, (sides, p, kind, source, count) => {
          const n = M.roll(s, kind, count, sides, p).reduce((a, b) => a + b, 0);
          s.rolls.at(-1).source = source;
          values.push(n);
          return n;
        }),
      );
      s.nameElements = values;
    }
    if (a === "species-roll") {
      const table = randomTable(R, s, "species"),
        n = M.roll(s, "Species", 1, table.sides, table.page)[0],
        result = tableResult(table, n);
      s.rolls.at(-1).source = table.source;
      s.speciesAttempts++;
      if (s.species !== result) {
        delete s.origin;
        s.background = {};
        delete s.rollTables.career;
      }
      s.species = result;
      s.speciesMode = s.speciesAttempts === 1 ? "first" : "later";
      resetDependent();
      s.careerAttempts = 0;
      s.careerMode = "choose";
      s.careerOffers = [];
      if (!careerAvailable(R, s, M.career(R, s)))
        s.career = R.careers.find((x) => careerAvailable(R, s, x)).id;
      toast(`d100 ${n} → ${s.species}`);
    }
    if (a === "age" && birthEra(R, s)) {
      if (!Number.isInteger(elfState(s).elderAge))
        throw Error("Set or roll your Elder age first.");
      const sp = R.species[s.species],
        height =
          sp.height[0] +
          M.roll(
            s,
            "Height (inches)",
            sp.height[1],
            10,
            sp.appearancePage || sp.page,
          ).reduce((a, b) => a + b, 0);
      s.rolls.at(-1).source = sp.source;
      setAgeHeight(s, elfState(s).elderAge, height);
      render();
      return;
    }
    if (a === "age") {
      const sp = R.species[s.species];
      if (
        s.longbeard &&
        (!Number.isInteger(s.longbeardAge) || s.longbeardAge < 120)
      )
        throw Error("Choose a Longbeard age of at least 120 first.");
      const age = s.longbeard
          ? s.longbeardAge
          : sp.age[0] +
            M.roll(
              s,
              "Age",
              sp.age[1],
              10,
              sp.appearancePage || sp.page,
            ).reduce((a, b) => a + b, 0),
        height =
          sp.height[0] +
          M.roll(
            s,
            "Height (inches)",
            sp.height[1],
            10,
            sp.appearancePage || sp.page,
          ).reduce((a, b) => a + b, 0);
      for (const r of s.rolls.slice(s.longbeard ? -1 : -2))
        r.source = { ...sp.source, page: sp.appearancePage || sp.page };
      setAgeHeight(s, age, height);
    }
    if (a === "career-roll") {
      delete s.careerRefinements;
      const id = rolledCareer();
      s.careerOffers = [id];
      changeCareer(id, s.careerAttempts === 1 ? "first" : "later");
    }
    if (a === "career-three") {
      const first = s.careerOffers[0],
        second = rolledCareer(),
        third = rolledCareer();
      s.careerOffers = [first, second, third];
      changeCareer(first, "three");
      s.careerRefinement = storedRefinement(s);
    }
    if (a === "career-offer") {
      changeCareer(el.dataset.id, "three");
      s.careerRefinement = storedRefinement(s);
    }
    if (a === "career-refine") {
      const result = refineCareer(R, s, (sides, p, label, source) => {
        const n = M.roll(s, label, 1, sides, p)[0];
        s.rolls.at(-1).source = source;
        return n;
      });
      const mode = s.careerMode;
      changeCareer(result.career, mode);
      s.careerRefinement = result;
      (s.careerRefinements ??= {})[result.base] = result;
      s.careerOffers = s.careerOffers.map((id) =>
        id === result.base ? result.career : id,
      );
      toast(result.message);
    }
    if (a === "career-original") {
      const previous = s.careerRefinement,
        base = previous.base,
        mode = s.careerMode;
      changeCareer(base, mode);
      const result = {
        ...previous,
        career: base,
        message: previous.message + " Original Career kept by choice.",
      };
      s.careerRefinement = result;
      (s.careerRefinements ??= {})[base] = result;
      s.careerOffers = s.careerOffers.map((id) =>
        id === previous.career ? base : id,
      );
      toast("Original Career retained; its optional roll remains recorded.");
    }
    if (a === "regional-original") {
      const previous = s.career,
        base = s.regionalCareerBase,
        mode = s.careerMode;
      changeCareer(base, mode);
      s.careerRefinement = storedRefinement(s);
      s.careerOffers = s.careerOffers.map((id) =>
        id === previous ? base : id,
      );
    }
    if (a === "regional-career") {
      const result = regionalCareer(R, s, el.dataset.id),
        mode = s.careerMode;
      changeCareer(result.career, mode);
      s.regionalCareerBase = result.base;
      s.careerOffers = s.careerOffers.map((id) =>
        id === result.base ? result.career : id,
      );
    }
    if (a === "char-roll") {
      s.charAttempts++;
      s.charRolls = M.KEYS.map((k) =>
        M.roll(s, `${k} starting roll`, 2, 10, 38).reduce((a, b) => a + b, 0),
      );
      s.assignment = M.KEYS.map((_, i) => i);
      s.charMode = s.charAttempts === 1 ? "first" : "reroll";
      s.boost = {};
    }
    if (a === "char-points") {
      s.charMode = "points";
      s.boost = {};
    }
    if (a === "char-rearrange") {
      s.charMode = s.charAttempts === 1 ? "rearrange" : "reroll";
      s.boost = {};
    }
    if (a === "skill-plus" || a === "skill-minus") {
      const key = el.dataset.key,
        now = s.careerSkills[key] || 0,
        slot = M.careerSkillSlots(R, s, 1).find((x) => x.key === key);
      if (a === "skill-plus") {
        const issue = psychicSkillIssue(R, s, slot.name);
        if (issue) throw Error(issue);
        if (Object.values(s.careerSkills).reduce((a, b) => a + b, 0) >= 8)
          throw Error("All eight Career Advances are allocated.");
        if (
          (M.freeSkills(R, s)[slot.name] || 0) -
            (elderSkills(R, s)[slot.name] || 0) >=
          3
        )
          throw Error("This Skill already has three free Advances.");
        s.careerSkills[key] = now + 1;
      } else s.careerSkills[key] = Math.max(0, now - 1);
    }
    if (a === "random-talents") {
      if (s.randomTalents.length) return;
      const known = M.freeTalents(R, s, false),
        table = randomTable(R, s, "talent");
      if (!table)
        throw Error("Choose Talents using an implemented printed table.");
      const valid = [...new Set(table.rows.map((x) => x.result))].filter(
        (x) => !known.includes(x),
      );
      if (valid.length < creationSpecies(R, s).randomTalents)
        throw Error("This table has too few distinct unowned Talents.");
      let attempts = 0;
      while (s.randomTalents.length < creationSpecies(R, s).randomTalents) {
        if (++attempts > 1000)
          throw Error("Too many duplicate rolls; try again.");
        const n = M.roll(
            s,
            "Random Species Talent",
            1,
            table.sides,
            table.page,
          )[0],
          talent = tableResult(table, n);
        s.rolls.at(-1).source = table.source;
        if (known.includes(talent) || s.randomTalents.includes(talent)) {
          s.rolls.at(-1).label += ` — duplicate ${talent}; rerolled`;
          continue;
        }
        s.randomTalents.push(talent);
      }
    }

    if (a === "wealth") {
      if (s.wealth) return;
      const l = M.career(R, s).levels[0],
        count =
          l.status === "Brass"
            ? 2 * l.standing
            : l.status === "Silver"
              ? l.standing
              : 0,
        total = count
          ? M.roll(s, "Starting wealth", count, 10, 39).reduce(
              (a, b) => a + b,
              0,
            )
          : l.standing;
      s.wealth = {
        amount:
          (l.status === "Brass" ? 20 : l.status === "Silver" ? 10 : 2) + total,
        currency:
          l.status === "Brass"
            ? "brass pennies"
            : l.status === "Silver"
              ? "silver shillings"
              : "gold crowns",
      };
    }
    if (a === "dwarf-birthplace") {
      const n = M.roll(s, "Dwarf birthplace", 1, 100, 41)[0];
      s.rolls.at(-1).source = { book: "dwarf-guide", page: 41 };
      (s.background ??= {}).birthplace = R.dwarfCreation.birthplaces.rows.find(
        (x) => n >= x.min && n <= x.max,
      ).result;
    }
    if (a === "suggest-name" || a === "roll-name-part") {
      const keys =
        a === "suggest-name" ? ["forename", "surname"] : [el.dataset.key];
      for (const key of keys) {
        const b = creationBackground(R, s),
          roll = (sides, p, kind, source, count = 1) => {
            const n = M.roll(
              s,
              `Book ${kind} suggestion`,
              count,
              sides,
              p,
            ).reduce((a, b) => a + b, 0);
            s.rolls.at(-1).source = source;
            if (kind.startsWith("Name element"))
              (s.nameElements ??= [])[Number(kind.slice(-1)) - 1] = n;
            return n;
          };
        setNamePart(
          s,
          key,
          key === "forename" && b.nameElements
            ? traditionalName(R, s, roll)
            : bookName(
                suggestion(
                  R,
                  s,
                  key === "forename" ? "forenames" : "surnames",
                  roll,
                ),
              ),
        );
      }
    }
    if (a === "roll-appearance") {
      (s.background ??= {})[el.dataset.key] = suggestion(
        R,
        s,
        el.dataset.kind,
        (sides, p, kind, source, count = 1) => {
          const n = M.roll(
            s,
            `Book ${kind} suggestion`,
            count,
            sides,
            p,
          ).reduce((a, b) => a + b, 0);
          s.rolls.at(-1).source = source;
          return n;
        },
      );
    }
    if (a === "roll-dooming") {
      s.dooming = doomingResult(R, M.roll(s, "Dooming", 1, 100, 118)[0]).text;
    }
    if (a === "buy-trapping") {
      const item = buyTrapping(R, s, el.dataset.id);
      toast(
        `${item.name} bought for ${item.price}. ${formatMoney(result().wallet.remaining)} remains.`,
      );
    }
    if (a === "remove-trapping") {
      const index = Number(el.dataset.index);
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= (s.purchases || []).length
      )
        throw Error("Purchased item not found.");
      const itemKey = s.purchases[index].uid
        ? `purchase-${s.purchases[index].uid}`
        : `purchase-${index}`;
      if (s.ledger.some((x) => x.linkedGear === itemKey))
        throw Error(
          "Undo the linked Career acquisition before removing this purchase.",
        );
      s.purchases.splice(index, 1);
      toast("Purchase removed and money restored.");
    }
    if (a === "gear-quantities") {
      for (const g of gearSlots(R, s))
        for (const m of g.name.matchAll(/\{?(\d+)d10\}?/g)) {
          const key = `${g.key}:${m[0]}`;
          if (s.gearRolls[key] === undefined)
            s.gearRolls[key] = M.roll(
              s,
              `Trapping: ${g.name}`,
              Number(m[1]),
              10,
              39,
            ).reduce((a, b) => a + b, 0);
        }
    }
    if (a === "xp-tab") setContext("xpTab", (xpTab = el.dataset.tab));
    if (a === "summary-toggle") {
      setContext("summaryExpanded", (summaryExpanded = !summaryExpanded));
      saveFolioPreferences();
    }
    if (a === "set-xp") {
      const n = Number($("#xp").value);
      if (
        !Number.isInteger(n) ||
        n < Math.max(0, result().derived.spent - result().derived.xpBonus) ||
        n > 1000000
      )
        throw Error(
          "XP must be a whole number at least equal to the amount spent.",
        );
      s.xp = n;
      toast("XP budget updated.");
    }
    if (a === "advance-size") s.advanceSize = Number(el.dataset.size);
    if (a === "set-cause") {
      const value = $("#impassioned-cause").value.trim();
      if (!namedCause(value)) throw Error("Enter a Cause, without brackets.");
      s.talentChoices[CAUSE_KEY] = value;
      if (M.base(s.freeTalent) === "Impassioned Zeal")
        s.freeTalent = namedCause(value);
    }
    if (a === "buy" || a === "promote") {
      if (errors().length)
        throw Error("Finish the creation choices above first.");
      M.purchase(
        R,
        s,
        a === "promote" ? "promotion" : el.dataset.type,
        el.dataset.name || "",
        Number(el.dataset.amount) || 5,
      );
      toast(
        a === "promote"
          ? "Career advanced."
          : "Improvement added to the XP ledger.",
      );
    }
    if (a === "buy-technique") {
      if (errors().length) throw Error("Finish creation first.");
      M.purchase(R, s, "technique", el.dataset.name);
    }
    if (a === "buy-spell") {
      if (errors().length) throw Error("Finish the free magic choices first.");
      M.purchaseSpell(R, s, el.dataset.name, el.dataset.talent);
    }
    if (a === "acquire") {
      if (errors().length) throw Error("Finish creation first.");
      const [l, i] = $("#new-trapping").value.split(":").map(Number);
      recordAcquisition(
        R,
        s,
        l,
        i,
        $("#acquisition").value,
        $("#owned-trapping").value,
      );
    }
    if (a === "sheet" || a === "record") {
      if (errors().length) throw Error("Finish creation before exporting.");
      await withBusy(el, "Preparing…", async () => {
        const bytes =
          a === "sheet"
            ? await exportSheet(R, s, undefined, undefined, {
                fullAppendix,
                result: result(),
              })
            : await exportRecord(R, s, { fullAppendix, result: result() });
        download(
          bytes,
          `${s.name || "Character"}_${a === "sheet" ? "Character_Sheet" : "Creation_and_XP_Record"}.pdf`,
          "application/pdf",
        );
        toast("Your PDF is ready.");
      });
      return;
    }
    render();
  }

  function handleChange(e, approved = false) {
    let {
      s,
      R,
      careerBook,
      shopBook,
      shopGroup,
      shopSort,
      shopAffordable,
      xpCareerOnly,
      xpAffordable,
      fullAppendix,
      magicFilters,
      render,
      locked,
      proposedCareer,
      showImpact,
      toast,
      setupOpen,
      careerFilter,
      resetDependent,
      changeCareer,
      library,
      result,
      careerPreview,
    } = getContext();

    const el = e.target,
      { bind, key } = el.dataset;
    const ui = {
      careerBook: (v) => setContext("careerBook", (careerBook = v)),
      shopBook: (v) => setContext("shopBook", (shopBook = v)),
      shopGroup: (v) => setContext("shopGroup", (shopGroup = v)),
      shopSort: (v) => setContext("shopSort", (shopSort = v)),
      shopAffordable: () =>
        setContext("shopAffordable", (shopAffordable = el.checked)),
      xpCareerOnly: () =>
        setContext("xpCareerOnly", (xpCareerOnly = el.checked)),
      xpAffordable: () =>
        setContext("xpAffordable", (xpAffordable = el.checked)),
      fullAppendix: () =>
        setContext("fullAppendix", (fullAppendix = el.checked)),
      magicFilter: (v) => (magicFilters[key] = v),
    };
    if (ui[bind]) {
      ui[bind](el.value);
      render();
      return;
    }
    const descriptor = {
        dataset: { ...el.dataset },
        value: el.value,
        checked: el.checked,
      },
      destructive =
        [
          "species",
          "origin",
          "career",
          "dwarfCareerProfile",
          "dwarfTrappingSwaps",
          "dwarfCareerUpdate",
          "careerVariant",
          "originTalentMode",
        ].includes(bind) ||
        (bind === "elfChoice" && key === "careerVariant");
    if (destructive && !approved) {
      if (locked()) {
        toast(
          "Undo or clear advancement before changing foundational choices.",
        );
        render();
        return;
      }
      const diff =
        [
          "career",
          "dwarfCareerProfile",
          "dwarfTrappingSwaps",
          "dwarfCareerUpdate",
          "careerVariant",
        ].includes(bind) ||
        (bind === "elfChoice" && key === "careerVariant")
          ? comparisonHTML(
              M.career(R, s),
              proposedCareer(bind, key, el.value, el.checked),
            )
          : "";
      showImpact(
        "Review this creation change",
        () => handleChange({ target: descriptor }, true),
        diff,
        bind,
      );
      return;
    }
    const before = { s: structuredClone(s), R };
    try {
      if (
        !bind ||
        [
          "namePart",
          "background",
          "name",
          "appearance",
          "ambition",
          "partyAmbition",
          "notes",
        ].includes(bind)
      )
        return;
      if (elfChange(R, s, el)) {
        if (key === "careerVariant") clearCareerSelections(s);
        render();
        return;
      }
      if (bind === "bookName") {
        if (el.value) setNamePart(s, key, el.value);
        render();
        return;
      }
      if (bind === "backgroundChoice") {
        if (el.value) (s.background ??= {})[key] = el.value;
        render();
        return;
      }
      if (bind === "stepSwitch") {
        setContext("setupOpen", (setupOpen = false));
        s.step = Number(el.value);
        render();
        window.scrollTo({ top: 0, behavior: "instant" });
        return;
      }
      if (bind === "careerFilter") {
        setContext("careerFilter", (careerFilter = el.value));
        render();
        return;
      }
      if (bind === "rollTable") {
        (s.rollTables ??= {})[key] = el.value;
        randomTable(R, s, key);
      } else if (bind === "nameStyle") s.nameStyle = el.value;
      else if (bind === "nameElement") {
        (s.nameElements ??= [])[Number(key)] = Number(el.value);
        const name = selectedTraditionalName(R, s);
        if (name) setNamePart(s, "forename", name);
      } else if (
        ["chartEnabled", "starSign", "starTalent", "mansionCount"].includes(
          bind,
        )
      ) {
        if (s.ledger.length)
          throw Error(
            "Undo or clear advancement before changing your star chart.",
          );
        const chart = chartState(s);
        if (bind === "chartEnabled") {
          chart.enabled = el.checked;
          s.spells = [];
        }
        if (bind === "starSign") {
          chart.sign = el.value;
          chart.talent = "";
          s.spells = [];
        }
        if (bind === "starTalent") chart.talent = el.value;
        if (bind === "mansionCount")
          chart.mansions = Array.from(
            { length: Number(el.value) },
            (_, i) => chart.mansions[i] || "",
          );
        s.chart = chart;
      } else if (bind === "species") {
        if (s.species !== el.value) {
          delete s.origin;
          s.background = {};
          delete s.rollTables.career;
        }
        s.species = el.value;
        s.speciesMode = "choose";
        resetDependent();
        s.careerAttempts = 0;
        s.careerMode = "choose";
        s.careerOffers = [];
        if (!careerAvailable(R, s, M.career(R, s)))
          s.career = R.careers.find((x) => careerAvailable(R, s, x)).id;
      } else if (bind === "origin") {
        if (s.ledger.length)
          throw Error("Undo or clear advancement before changing your origin.");
        s.origin = el.value;
        resetDependent();
        s.careerMode = "choose";
        s.careerAttempts = 0;
        s.careerOffers = [];
        delete s.rollTables.career;
        if (!careerAvailable(R, s, M.career(R, s)))
          s.career = R.careers.find((c) => careerAvailable(R, s, c)).id;
      } else if (bind === "originTalentMode") {
        if (s.ledger.length)
          throw Error(
            "Undo or clear advancement before changing starting Talents.",
          );
        s.originTalentMode = el.value;
        delete s.psychometrySlot;
        s.randomTalents = [];
        s.talentChoices = {};
        s.freeTalent = "";
        s.spells = [];
      } else if (bind === "longbeard") {
        if (locked())
          throw Error("Clear advancement before changing Longbeard.");
        s.longbeard = el.checked;
      } else if (bind === "longbeardAge") {
        const n = Number(el.value);
        if (!Number.isInteger(n) || n < 120)
          throw Error("Enter an age of at least 120.");
        s.longbeardAge = n;
      } else if (bind === "grudgeTarget") {
        (s.grudgeTargets ??= [])[Number(key)] = el.value;
      } else if (bind === "dwarfCareerProfile") {
        if (locked())
          throw Error("Clear advancement before changing your profile.");
        const speciesChoices = Object.fromEntries(
          Object.entries(s.skillChoices).filter(([k]) => k.startsWith("s-")),
        );
        changeCareer(el.value, s.careerMode);
        s.skillChoices = speciesChoices;
      } else if (bind === "dwarfTrappingSwaps") {
        if (locked())
          throw Error("Clear advancement before changing equipment swaps.");
        const speciesChoices = Object.fromEntries(
            Object.entries(s.skillChoices).filter(([k]) => k.startsWith("s-")),
          ),
          boost = s.boost;
        clearCareerSelections(s);
        s.skillChoices = speciesChoices;
        s.boost = boost;
        s.dwarfTrappingSwaps = el.checked;
      } else if (bind === "dwarfCareerUpdate") {
        if (locked())
          throw Error("Clear advancement before changing Career levels.");
        const u = R.careerUpdates.find(
          (x) =>
            x.id === el.value &&
            x.careers.includes(s.career) &&
            x.profile.level === Number(key),
        );
        if (el.value && (!u || u.unavailable))
          throw Error(u?.unavailable || "Unavailable variant.");
        const previous = { ...s.dwarfCareerUpdates },
          speciesChoices = Object.fromEntries(
            Object.entries(s.skillChoices).filter(([k]) => k.startsWith("s-")),
          ),
          boost = s.boost;
        clearCareerSelections(s);
        s.skillChoices = speciesChoices;
        s.boost = boost;
        s.dwarfCareerUpdates = { ...previous, [key]: el.value };
        if (!el.value) delete s.dwarfCareerUpdates[key];
      } else if (bind === "careerVariant") {
        setContext("R", (R = switchCareerVariant(library, R, s, el.value)));
        toast(
          el.value
            ? "Animal-doctor Hedge Witch selected."
            : "Standard Hedge Witch selected.",
        );
      } else if (bind === "college") {
        if (locked())
          throw Error(
            "Undo or clear advancement before changing your College.",
          );
        s.college = el.value;
        s.spells = [];
      } else if (bind === "psychometrySlot") {
        if (locked())
          throw Error(
            "Undo or clear advancement before changing the Psychometry trade.",
          );
        if (el.value === "") delete s.psychometrySlot;
        else {
          s.psychometrySlot = Number(el.value);
          if (
            !psychometrySacrifice(R, s) ||
            result().derived.skills.Augury > 0
          ) {
            delete s.psychometrySlot;
            throw Error(
              "Choose an available random Talent without possessing Augury.",
            );
          }
        }
        s.spells = [];
      } else if (bind === "cantsEnabled") {
        s.cants = { enabled: el.checked, choices: s.cants?.choices || {} };
      } else if (bind === "cant") {
        const choices = s.cants.choices[el.dataset.lore] || [];
        s.cants.choices[el.dataset.lore] = Array.from(
          { length: Math.max(choices.length, Number(key) + 1) },
          (_, i) => (i === Number(key) ? el.value : choices[i] || ""),
        );
      } else if (bind === "originTalentSlot") {
        s.originTalentSlot = el.value;
        if (el.value === `random-${s.psychometrySlot}`)
          delete s.psychometrySlot;
        s.freeTalent = "";
        s.spells = [];
      } else if (bind === "career") {
        delete s.careerRefinements;
        changeCareer(el.value);
        setContext("careerPreview", (careerPreview = el.value));
      } else if (bind === "speciesSkills" || bind === "bonusGear") {
        const value = bind === "bonusGear" ? Number(el.value) : el.value;
        if (el.checked) {
          const max = bind === "speciesSkills" ? 5 : M.bonusTrappingLimit(R, s);
          if (s[bind].length >= max) throw Error(`Choose at most ${max}.`);
          s[bind].push(value);
        } else s[bind] = s[bind].filter((x) => x !== value);
      } else if (["points", "boost", "assignment"].includes(bind)) {
        const n = Number(el.value);
        if (!Number.isInteger(n)) throw Error("Use a whole number.");
        if (bind === "points" && (n < 4 || n > 16))
          throw Error("Allocate 4–16 points per Characteristic.");
        if (bind === "boost" && (n < 0 || n > 6))
          throw Error("Starting increases must be 0–6.");
        if (bind === "assignment") {
          const other = s.assignment.indexOf(n);
          s.assignment[other] = s.assignment[key];
        }
        s[bind][key] = n;
      } else if (
        ["skillChoices", "talentChoices", "gearChoices"].includes(bind)
      )
        s[bind][key] = el.value;
      else if (bind === "spells") s.spells[Number(key)] = el.value;
      else if (bind === "xp") {
        const n = Number(el.value);
        if (
          !Number.isInteger(n) ||
          n < Math.max(0, result().derived.spent - result().derived.xpBonus) ||
          n > 1000000
        )
          throw Error(
            "XP must be a whole number at least equal to the amount spent.",
          );
        s.xp = n;
      } else {
        s[bind] = el.value;
        if (bind === "freeTalent") {
          s.spells = [];
          if (!extraCareerSkills(R, s).length)
            delete s.careerSkills["c1-wom-augury"];
        }
      }
      render();
    } catch (err) {
      setContext("s", (s = before.s));
      setContext("R", (R = before.R));
      toast(err.message);
      render();
    }
  }
  return { download, action, handleChange };
}
