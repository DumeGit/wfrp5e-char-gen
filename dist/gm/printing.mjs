import { calculateGM, validateGMDraft } from "./model.mjs";
import { prepareGMPrint } from "./print.mjs";
import { esc, button } from "./controls.mjs";

// A print batch is temporary and independent of the editable GM/player drafts.
export function createGMPrinting(data, R, { current, download, toast }) {
  const dialog = document.createElement("dialog");
  dialog.className = "creator-dialog gm-print-dialog";
  dialog.setAttribute("aria-labelledby", "gm-print-title");
  document.body.append(dialog);
  let entries = [],
    perPage = 6,
    prepared,
    revision = 0,
    importErrors = [];
  const snapshot = (s) => {
    const draft = structuredClone(s);
    return { s: draft, r: calculateGM(data, R, draft) };
  };
  async function render() {
    const version = ++revision;
    prepared = null;
    dialog.innerHTML = `<div class="gm-dialog-heading"><h2 id="gm-print-title">Print table cards</h2>${button("Close", "print-close")}</div><p>Six compact stat blocks per A4 page, or four with more room. Actual Traits include their descriptions, with no unselected optional Traits. Other abilities retain compact names and ratings. Larger profiles may need four cards or a full sheet. Source discrepancies stay in the app.</p><div class="gm-print-toolbar"><div class="field"><label for="gm-print-layout">Cards per A4 page</label><select id="gm-print-layout"><option value="6" ${perPage === 6 ? "selected" : ""}>6 cards · 2 columns × 3 rows</option><option value="4" ${perPage === 4 ? "selected" : ""}>4 cards · 2 columns × 2 rows</option></select></div>${button("Add current creature", "print-current", entries.length >= 48 ? "disabled" : "")}${button("Add saved drafts…", "print-import")}</div><p class="gm-small">Use Copy for duplicates. Saved drafts are read locally and do not replace your character. This print batch is kept until you reload the page. Up to 48 cards; empty slots remain blank.</p><ol class="gm-print-list">${entries.map(({ r }, i) => `<li><div><strong>${esc(r.name)}</strong><small>${esc(r.profile?.name || "No starting profile")} · ${esc(r.size || "")}</small>${r.issues.length ? `<ul class="gm-print-errors">${r.issues.map((x) => `<li>${esc(x.message)}</li>`).join("")}</ul>` : ""}</div><div class="gm-print-actions">${button("Copy", "print-copy", `data-index="${i}" ${entries.length >= 48 ? "disabled" : ""}`)}${button("Remove", "print-remove", `data-index="${i}"`)}</div></li>`).join("")}</ol>${importErrors.length ? `<div class="gm-print-errors" role="alert"><strong>Drafts not added</strong><ul>${importErrors.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}<div id="gm-print-status" role="status">Checking card sizes…</div><div class="gm-dialog-actions">${button("Back to workshop", "print-close")}${button("Download A4 PDF", "print-export", "disabled", "primary")}</div><input id="gm-print-files" type="file" multiple accept=".json,application/json" hidden>`;
    let status;
    const issues = entries.some((e) => e.r.issues.length || !e.r.profile);
    if (!entries.length) status = "Add a creature or saved draft to begin.";
    else if (issues)
      status =
        "Resolve the choices listed above in the workshop, then add the corrected draft. These cards cannot be exported yet.";
    else
      try {
        const result = await prepareGMPrint(window.PDFLib, entries, {
          perPage,
        });
        if (version !== revision) return;
        prepared = result;
        status = result.overflow.length
          ? `${result.overflow.join(", ")} ${result.overflow.length === 1 ? "does" : "do"} not fit this layout at readable text size. ${perPage === 6 ? "Try four cards per page." : "Use the full sheet for these profiles, or shorten optional description/notes."}`
          : `${entries.length} card${entries.length === 1 ? "" : "s"} · ${result.pages} A4 page${result.pages === 1 ? "" : "s"} · text ${Math.min(...result.cards.map((c) => c.fontSize))}–${Math.max(...result.cards.map((c) => c.fontSize))} pt · cut along the borders`;
      } catch (e) {
        status = e.message;
      }
    if (version !== revision) return;
    const statusNode = dialog.querySelector("#gm-print-status");
    statusNode.textContent = status;
    statusNode.className =
      issues || prepared?.overflow.length ? "gm-print-errors" : "gm-small";
    dialog.querySelector('[data-action="print-export"]').disabled =
      !prepared || prepared.overflow.length > 0;
  }
  dialog.addEventListener("change", async (e) => {
    if (e.target.id === "gm-print-layout") {
      perPage = Number(e.target.value);
      await render();
    }
    if (e.target.id === "gm-print-files") {
      importErrors = [];
      for (const file of e.target.files) {
        try {
          if (entries.length >= 48)
            throw Error("The print batch already has 48 cards.");
          if (file.size > 2000000) throw Error("This draft is too large.");
          entries.push(
            snapshot(validateGMDraft(data, R, JSON.parse(await file.text()))),
          );
        } catch (error) {
          importErrors.push(`${file.name}: ${error.message}`);
        }
      }
      await render();
    }
  });
  dialog.addEventListener("click", async (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    try {
      switch (target.dataset.action) {
        case "print-close":
          dialog.close();
          revision++;
          return;
        case "print-current":
          if (entries.length < 48) entries.push(snapshot(current()));
          break;
        case "print-copy":
          if (entries.length < 48)
            entries.splice(
              Number(target.dataset.index) + 1,
              0,
              snapshot(entries[Number(target.dataset.index)].s),
            );
          break;
        case "print-remove":
          entries.splice(Number(target.dataset.index), 1);
          break;
        case "print-import":
          dialog.querySelector("#gm-print-files").click();
          return;
        case "print-export":
          if (!prepared || prepared.overflow.length) return;
          target.disabled = true;
          target.textContent = "Preparing…";
          download(
            await prepared.bytes(),
            `Bestiary-${perPage}-per-A4.pdf`,
            "application/pdf",
          );
          toast("A4 table cards exported.");
          break;
        default:
          return;
      }
      await render();
    } catch (error) {
      toast(error.message);
      await render();
    }
  });
  dialog.addEventListener("cancel", () => revision++);
  return {
    async open() {
      if (!entries.length) entries = [snapshot(current())];
      importErrors = [];
      perPage = 6;
      await render();
      dialog.showModal();
      dialog.querySelector("#gm-print-layout").focus();
    },
  };
}
