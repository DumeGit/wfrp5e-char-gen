import fs from "node:fs";
import { R, soldier } from "./fixture.mjs";
import * as M from "../src/engine/rules.mjs";
import { bookSelection } from "../src/engine/books.mjs";
import { freshGM } from "../src/engine/gm/model.mjs";
import { freshMarijan, makeEntry } from "../src/engine/marijan/model.mjs";
const data = JSON.parse(
  fs.readFileSync(new URL("../public/gm/data.json", import.meta.url), "utf8"),
);
const longName = "Siegfried Maximilian von Drachenfels-Wiśniewska-Kowalczyk";
export function reviewFixtures() {
  const result = {};
  for (const mode of ["player", "gm", "marijan"]) {
    result[mode] = {};
    for (const scenario of ["demo", "worst", "empty", "one", "catalogue"]) {
      let s;
      if (mode === "player") {
        s = {
          ...(scenario === "empty" ? M.fresh() : soldier()),
          version: 2,
          navigationVersion: 2,
          books: bookSelection(R),
          rollTables: {},
          step: 0,
        };
        if (scenario === "worst") {
          s.name = longName;
          s.xp = 1000000;
          s.wealth = { amount: 1000000, currency: "gold crowns" };
        }
        if (scenario === "one") s.name = "J";
      } else if (mode === "gm") {
        s = freshGM(
          data,
          scenario === "empty"
            ? ""
            : data.profiles.find((p) => p.name === "Griffon").id,
        );
        s.name =
          scenario === "worst"
            ? "Ancient Moonlit Griffon of Drachenfels-Wiśniewska"
            : scenario === "one"
              ? "J"
              : "Griffon";
        s.description =
          scenario === "worst"
            ? "An old scar runs from its left eye to the tip of its beak. ".repeat(
                30,
              )
            : "";
      } else {
        s = freshMarijan();
        s.name =
          scenario === "worst"
            ? longName
            : scenario === "one"
              ? "J"
              : "Albrecht";
        if (scenario === "empty") s.name = "";
        if (scenario !== "empty")
          for (const k of M.KEYS) s.characteristics[k].initial = 35;
        const skills =
          scenario === "catalogue"
            ? R.skills.map((x) => x.name)
            : scenario === "worst"
              ? [
                  "Lore (The Heraldry of Bretonnia and the Border Princes)",
                  "Seán O’Brien-Ó Súilleabháin",
                  "王秀英",
                  "👩🏽‍💻 Priya",
                  "KnightCommanderOfTheOrderOfTheSilverHammer",
                ]
              : scenario === "one"
                ? ["Climb"]
                : ["Climb", "Perception"];
        if (scenario !== "empty")
          s.entries.skills = skills.map((name) =>
            makeEntry(
              {
                name,
                custom: true,
                char: "Int",
                text: "Review fixture: custom label, no invented game rule.",
              },
              "skills",
            ),
          );
        if (scenario === "worst") {
          s.xpSpent = 1000000;
          s.xpUnspent = 1000000;
          s.coins = { gc: 1000000, ss: 19, d: 11 };
          s.entries.skills[0].amount = 125;
          s.entries.gear = [
            makeEntry(
              {
                name: "Master-crafted ceremonial armour of the Order of the Silver Hammer",
                custom: true,
              },
              "gear",
            ),
          ];
          s.entries.gear[0].amount = 1000;
          s.entries.talents = [
            makeEntry({ name: "Strong Back", custom: true }, "talents"),
          ];
          s.entries.talents[0].amount = 2;
        }
      }
      result[mode][scenario] = s;
    }
  }
  return result;
}
