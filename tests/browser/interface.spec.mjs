import {
  test,
  expect,
  openPC,
  openGM,
  pcStep,
  gmStep,
  applyProfile,
  search,
  noOverflow,
} from "./helpers.mjs";

for (const mode of ["Player", "GM", "Marijan"]) {
  test(`${mode} shared input and keyboard contract @interface @mobile`, async ({
    page,
  }, info) => {
    if (mode === "Player") await openPC(page, { complete: true });
    else if (mode === "GM") {
      await openGM(page);
      await applyProfile(page, "Griffon");
      await gmStep(page, "Customise");
    } else {
      await page.goto("/marijan.html?verify=1");
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    }
    const skip = page.getByRole("link", {
      name: "Skip to editor",
      exact: true,
    });
    await skip.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#creator-main")).toBeFocused();
    const fields = page.locator('main input[type="number"]');
    if (mode === "Player") {
      await pcStep(page, "Characteristics");
    }
    expect(await fields.count()).toBeGreaterThan(0);
    for (const field of await fields.all()) {
      await expect(field).toHaveAttribute("name", /.+/);
      await expect(field).toHaveAttribute("autocomplete", "off");
      await expect(field).toHaveAttribute("inputmode", /^(numeric|decimal)$/);
      if (info.project.name === "mobile" && (await field.isVisible())) {
        expect((await field.boundingBox()).height).toBeGreaterThanOrEqual(44);
        expect(
          await field.evaluate((el) =>
            parseFloat(getComputedStyle(el).fontSize),
          ),
        ).toBeGreaterThanOrEqual(16);
      }
    }
    if (mode === "GM" && info.project.name === "mobile") {
      for (const selector of [".gm-char-row button", '[role="tab"]']) {
        for (const item of await page.locator(selector).all()) {
          expect((await item.boundingBox()).height).toBeGreaterThanOrEqual(44);
        }
      }
    }
    await noOverflow(page);
    await page.screenshot({
      path: info.outputPath(`${mode.toLowerCase()}-interface.png`),
    });
  });
}

test("Player phone folio has one contextual bottom action @interface @mobile", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "mobile",
    "The contextual strip is phone navigation.",
  );
  await openPC(page, { complete: true });
  const bar = page.locator(".mobile-workspace-bar");
  await expect(
    bar.getByRole("button", { name: "Back to choice", exact: true }),
  ).toHaveCount(0);
  await bar
    .getByRole("button", { name: "View character", exact: true })
    .click();
  await expect(
    bar.getByRole("button", { name: "View character", exact: true }),
  ).toHaveCount(0);
  await expect(
    bar.getByRole("button", { name: "Back to choice", exact: true }),
  ).toBeFocused();
  await bar
    .getByRole("button", { name: "Back to choice", exact: true })
    .click();
  await expect(page.locator(".sheet")).not.toBeVisible();
  await expect(
    bar.getByRole("button", { name: "View character", exact: true }),
  ).toBeFocused();
});

test("Experience keeps purchases near controls and remembers rule disclosures @interface @pc", async ({
  page,
}, info) => {
  await openPC(page, { complete: true });
  await pcStep(page, "Experience");
  const rows = page.locator(".xp-characteristic-row");
  if (info.project.name === "mobile")
    expect((await rows.first().boundingBox()).y).toBeLessThan(780);
  const rules = page.locator(
    'details[data-detail-key="experience:advance-help"]',
  );
  await rules.locator("summary").click();
  await expect(rules).toContainText("An incomplete +1 band");
  await page.getByRole("button", { name: "+1", exact: true }).click();
  await expect(rules).toHaveAttribute("open", "");
  await expect(rules).toContainText("Five +1 Advances");
  await page.getByRole("tab", { name: "Characteristics", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Skills", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("tab", { name: "Skills", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
});

test("GM starts neutrally and explains a blocking choice at its field @interface @gm", async ({
  page,
}) => {
  await openGM(page);
  await expect(
    page.getByRole("region", { name: "Get started", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Choices to finish", exact: true }),
  ).toHaveCount(0);
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await page
    .getByLabel("Size", { exact: true })
    .selectOption({ label: "Tiny" });
  await page
    .getByRole("region", { name: "Choices to finish" })
    .getByRole("button", { name: /Tiny/ })
    .click();
  const wounds = page.getByLabel("Wounds override", { exact: true });
  await expect(wounds).toHaveAttribute("aria-invalid", "true");
  const id = await wounds.getAttribute("aria-describedby");
  await expect(page.locator(`#${id}`)).toContainText("Tiny");
  await wounds.fill("3");
  await wounds.blur();
  await expect(wounds).not.toHaveAttribute("aria-invalid", "true");
});

test("Search excerpts are plain text and Back retains the selected result @interface @search", async ({
  page,
}) => {
  await openPC(page);
  const input = await search(page, "Fortune");
  const result = page.getByRole("option", { name: /^Fortune Rule/ });
  await expect(result).toBeVisible();
  await expect(result).not.toContainText("###");
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page.locator("#book-search-title")).toHaveText("Fortune");
  await page
    .getByRole("button", { name: "Back to search", exact: true })
    .click();
  await expect(result).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Close search", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /^Search rules and book references/ }),
  ).toBeFocused();
});

test("A failed operation stays retryable and excludes duplicate activation @interface", async ({
  page,
}) => {
  await openPC(page, { complete: true });
  const result = await page.evaluate(async () => {
    const { withBusy } = await import("/interface-kit.mjs");
    const wrapper = document.createElement("div"),
      button = document.createElement("button");
    button.textContent = "Export PDF";
    wrapper.append(button);
    document.querySelector("main").append(wrapper);
    button.focus();
    const width = button.getBoundingClientRect().width;
    let release,
      attempts = 0;
    const pending = withBusy(button, "Preparing…", async () => {
      attempts++;
      await new Promise((resolve) => (release = resolve));
      throw Error("Test failure");
    }).catch(() => {});
    await withBusy(button, "Preparing…", async () => {
      attempts++;
    });
    const busy = button.disabled && button.getAttribute("aria-busy") === "true";
    const stableWidth = button.getBoundingClientRect().width >= width;
    while (!release) await new Promise(requestAnimationFrame);
    release();
    await pending;
    const retryable =
      !button.disabled &&
      !button.hasAttribute("aria-busy") &&
      wrapper.textContent.includes("Test failure");
    await withBusy(button, "Preparing…", async () => {
      attempts++;
    });
    const cleared = !wrapper.querySelector(".ui-operation-error");
    wrapper.remove();
    return { attempts, busy, stableWidth, retryable, cleared };
  });
  expect(result).toEqual({
    attempts: 2,
    busy: true,
    stableWidth: true,
    retryable: true,
    cleared: true,
  });
});
