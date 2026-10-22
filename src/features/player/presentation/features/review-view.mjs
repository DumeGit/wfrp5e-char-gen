import {
  element,
  fragment,
  joinNodes,
  combine,
  interpolate,
} from "../../../../components/react-elements";
import { reviewSheet } from "../review-sheet.mjs";
import { sourceButton } from "../source-controls.mjs";
import { detailKey } from "../../../../engine/disclosures.mjs";
import { elfReview } from "../high-elf-ui.mjs";
import { dwarfReview } from "../dwarf-guide-ui.mjs";

import { steps } from "../../../../engine/ui.mjs";
import { penaltySummary } from "../creator-ui.mjs";
import { LEGACY_EXPLANATION } from "../legacy.mjs";
import { issueTarget } from "../../../../engine/issue-targets.mjs";
import { speciesRulePanel } from "../archives-ui.mjs";
import { cantReview } from "../archives-iii-ui.mjs";
import { womReferencePanel } from "../winds-of-magic-ui.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function ledgerTable() {
    let { result, s, esc, ref } = getContext();

    const d = result().derived;
    return s.ledger.length
      ? element(
          "div",
          { class: "table-wrap" },
          element(
            "table",
            {},
            element(
              "thead",
              {},
              element(
                "tr",
                {},
                element("th", {}, "# / Improvement"),
                element("th", {}, "XP"),
                element("th", {}, "Total"),
                element("th", {}, "Source"),
              ),
            ),
            element(
              "tbody",
              {},
              joinNodes(
                s.ledger.map((x, i) =>
                  element(
                    "tr",
                    {},
                    element(
                      "td",
                      {},
                      combine(i, 1),
                      ". ",
                      esc(x.name),
                      ["char", "skill"].includes(x.type)
                        ? interpolate([" +", ""], [x.amount === 1 ? 1 : 5])
                        : "",
                      element("br", {}),
                      element(
                        "small",
                        {},
                        d.trackerCredits[i]
                          ? "+1 tracker box"
                          : x.type === "promotion"
                            ? "Career advancement"
                            : x.amount === 1 && (x.inCareer ?? x.tick)
                              ? interpolate(
                                  ["", "/5 toward a tracker box"],
                                  [d.trackerProgressAt[i]],
                                )
                              : "No tracker box",
                      ),
                    ),
                    element("td", {}, x.cost),
                    element(
                      "td",
                      {},
                      s.ledger
                        .slice(0, combine(i, 1))
                        .reduce((a, b) => combine(a, b.cost), 0),
                    ),
                    element("td", {}, ref(x)),
                  ),
                ),
                "",
              ),
            ),
          ),
          "\n",
        )
      : element(
          "p",
          { class: "empty" },
          "No XP spent yet. Unspent XP can be kept.",
        );
  }

  function review() {
    const {
      result,
      R,
      s,
      errors,
      esc,
      fullAppendix,
      talentDescription,
      spellDescription,
      ref,
    } = getContext();
    const snapshot = result(),
      e = errors();
    const record = (key, title, body) =>
      element(
        "details",
        {
          class: "review-detail",
          "data-detail-key": ["review-sheet:", key].join(""),
        },
        element("summary", {}, title),
        element("div", { class: "review-detail-body" }, body),
      );
    const recordsHTML = joinNodes(
      [
        record("ledger", "XP record", ledgerTable()),
        record(
          "rolls",
          interpolate(["Dice record · ", ""], [s.rolls.length]),
          fragment(
            element(
              "p",
              { class: "small muted" },
              "Each die uses the browser’s cryptographic random generator with rejection sampling. Raw faces, totals and timestamps are recorded. This editable local history is not a tamper-proof certificate.",
            ),
            s.rolls.length
              ? joinNodes(
                  s.rolls.map((r) =>
                    element(
                      "div",
                      { class: "roll-entry" },
                      element("strong", {}, esc(r.label)),
                      " · ",
                      esc(r.dice),
                      ": ",
                      joinNodes(r.values.map(esc), " + "),
                      " = ",
                      esc(r.total),
                      " ",
                      ref(r),
                      element("br", {}),
                      element("small", { class: "muted" }, esc(r.at)),
                    ),
                  ),
                  "",
                )
              : element("p", { class: "empty" }, "No dice have been rolled."),
          ),
        ),
        record(
          "load",
          "Equipment effects & carrying details",
          penaltySummary(R, s, snapshot),
        ),
        record(
          "book-details",
          "Book-specific abilities & reminders",
          interpolate(
            ["", "", "", "", "", "", ""],
            [
              speciesRulePanel(R, s),
              cantReview(R, s),
              womReferencePanel(R, s),
              dwarfReview(R, s),
              elfReview(R, s),
              reviewNotices(snapshot.derived, snapshot.equipment),
            ],
          ),
        ),
        record(
          "sources",
          "Sources & interpretations",
          fragment(
            element("p", {}, esc(LEGACY_EXPLANATION)),
            element(
              "p",
              {},
              joinNodes(
                R.books.map((b) => esc(b.title)),
                "; ",
              ),
              " are enabled. Each option identifies its book and printed page. Applicable adaptations are always included in the export record.",
            ),
            element(
              "p",
              {},
              "Navigation uses Initiative (p. 112); the sheet’s printed “Int” is corrected to I. Leather Breastplate uses Leather Jerkin statistics with the agreed naming note. The +45 Skill Advance costs 850 XP as printed (p. 191). Optional +1 prices follow Appendix II (p. 364). Five +1 Career Advances in the same Skill or Characteristic count as one tracker box, using your interpretation where the appendix is silent.",
            ),
            element(
              "p",
              {},
              "Unlisted weights are not invented. Situational Talent effects remain in their reference text. GM decisions still apply.",
            ),
          ),
        ),
      ],
      "",
    );
    return reviewSheet(R, s, snapshot, {
      issues: e,
      issueHTML: e.length ? issuePanel(e, "Unfinished choices") : "",
      talentDescription,
      spellDescription,
      recordsHTML,
      fullAppendix,
    });
  }

  function issuePanel(issues, title) {
    let { esc, R, s, button } = getContext();

    return element(
      "div",
      { class: "issue-panel" },
      element("strong", {}, esc(title)),
      element(
        "ul",
        {},
        joinNodes(
          issues.map((message) => {
            const target = issueTarget(R, s, message);
            return element(
              "li",
              {
                "data-issue-code": esc(message.code),
                "data-severity": esc(message.severity),
              },
              button(
                "issue",
                fragment(
                  esc(message.message),
                  " ",
                  element(
                    "span",
                    {},
                    "Open the choice in ",
                    esc(steps[target.step]),
                  ),
                ),
                interpolate(
                  ['data-step="', '" data-target="', '"'],
                  [target.step, esc(target.target)],
                ),
              ),
              " ",
              sourceButton(R, message),
            );
          }),
          "",
        ),
      ),
      "\n",
    );
  }

  function trackerBoxes(d) {
    const goal = [10, 12, 14, 0][d.level - 1];
    return goal
      ? fragment(
          element(
            "div",
            {
              class: "tracker-boxes",
              role: "img",
              "aria-label": [
                d.ticks,
                " of ",
                goal,
                " Career tracker boxes",
              ].join(""),
            },
            joinNodes(
              Array.from({ length: goal }, (_, i) =>
                element(
                  "span",
                  { class: i < d.ticks ? "filled" : "", "aria-hidden": "true" },
                  i < d.ticks ? "✓" : "",
                ),
              ),
              "",
            ),
          ),
          "\n",
          element(
            "p",
            { class: "small muted tracker-caption" },
            d.ticks,
            " / ",
            goal,
            " boxes toward level ",
            combine(d.level, 1),
          ),
        )
      : element("p", { class: "small muted" }, "Final Career level reached.");
  }

  function hasColourMagic() {
    let { result, R } = getContext();

    return result().derived.talents.some(
      (t) =>
        /^Arcane Magic \(/.test(t) &&
        R.config.colours.includes(t.match(/\((.*)\)/)?.[1]),
    );
  }

  function reviewNotices(d, eq) {
    let { esc, result } = getContext();
    const notices = result().notices;
    const data = notices
      .filter((x) => x.severity === "warning")
      .map((x) => x.message);
    const reminders = notices
      .filter((x) => x.severity === "info")
      .map((x) => x.message);
    return fragment(
      data.length
        ? element(
            "details",
            {
              "data-detail-key": detailKey("review-view:reviewNotices:0"),
              class: "review-warnings",
              open: "",
            },
            element("summary", {}, "Unresolved supplied data · ", data.length),
            element(
              "p",
              { class: "small muted" },
              "These are distinct from unfinished creation choices. The app retains unknown values and records the limitation in your export.",
            ),
            joinNodes(
              data.map((x) => element("p", {}, esc(x))),
              "",
            ),
          )
        : "",
      element(
        "details",
        {
          "data-detail-key": detailKey("review-view:reviewNotices:1"),
          class: "review-reminders",
        },
        element(
          "summary",
          {},
          "Rules & reference reminders · ",
          reminders.length,
        ),
        joinNodes(
          reminders.map((x) => element("p", { class: "small" }, esc(x))),
          "",
        ),
      ),
    );
  }
  return {
    ledgerTable,
    review,
    issuePanel,
    trackerBoxes,
    hasColourMagic,
    reviewNotices,
  };
}
