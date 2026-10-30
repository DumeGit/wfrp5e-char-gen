import {
  test,
  expect,
  openPC,
  openGM,
  pcStep,
  gmStep,
  applyProfile,
  revealCreatorTool,
  noOverflow,
} from "./helpers.mjs";

async function variant(button, name) {
  await expect(button).toHaveClass(new RegExp(`(^| )${name}( |$)`));
  if (await button.isDisabled()) return;
  await button.page().mouse.move(0, 0);
  const skin = await button.evaluate((node) => {
    const style = getComputedStyle(node);
    const rgb = (token) => {
      const hex = style.getPropertyValue(token).trim().replace("#", "");
      return `rgb(${[0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
    };
    return {
      ink: style.color,
      fill: style.backgroundColor,
      line: style.borderTopColor,
      image: style.backgroundImage,
      normalInk: rgb("--color-ink"),
      primaryInk: rgb("--color-on-crimson"),
      errorInk: rgb("--color-error"),
      dangerInk: rgb("--color-on-error"),
      paper: rgb("--color-paper-raised"),
    };
  });
  if (name === "quiet") {
    expect(skin.fill).toBe(skin.paper);
    expect(skin.ink).toBe(skin.normalInk);
  } else if (name === "primary") expect(skin.ink).toBe(skin.primaryInk);
  else if (name === "danger") {
    expect(skin.fill).toBe(skin.errorInk);
    expect(skin.ink).toBe(skin.dangerInk);
  } else if (name === "danger-text") expect(skin.ink).toBe(skin.errorInk);
}

test("Player button roles cover navigation, repeat purchases and the shared specimens @interface @pc @mobile", async ({
  page,
}, info) => {
  await openPC(page, { complete: true });
  await pcStep(page, "Career");
  await variant(page.locator(".contextual-continue button"), "quiet");
  await variant(page.locator(".step-footer button").last(), "quiet");
  await variant(
    page.getByRole("button", { name: "Roll Career · d100", exact: true }),
    "primary",
  );
  await pcStep(page, "Experience");
  await variant(
    page.locator(".purchase-button:not(:disabled)").first(),
    "quiet",
  );
  await page.getByText("Edit XP budget", { exact: true }).click();
  await variant(
    page.getByRole("button", { name: "Update budget", exact: true }),
    "primary",
  );
  await noOverflow(page);
  await page.screenshot({
    path: info.outputPath("player-purchase-buttons.png"),
  });
  await page.locator(".purchase-button:not(:disabled)").first().click();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeEnabled();
  await pcStep(page, "Review");
  await variant(
    page.getByRole("button", {
      name: "Open in character manager",
      exact: true,
    }),
    "primary",
  );
  await variant(
    page.getByRole("button", { name: "Download character sheet", exact: true }),
    "quiet",
  );
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("player-buttons.png") });
  await page.goto("/design-system.html");
  const gallery = page.locator("#button-roles");
  for (const [label, role] of [
    ["Save changes", "primary"],
    ["Back", "quiet"],
    ["Open picker", "quiet"],
    ["Confirm delete", "danger"],
    ["Remove entry", "danger-text"],
  ])
    await variant(
      gallery.getByRole("button", { name: label, exact: true }),
      role,
    );
  const primary = gallery.getByRole("button", {
    name: "Save changes",
    exact: true,
  });
  await primary.focus();
  await expect(primary).toBeFocused();
  await expect(primary).toHaveCSS("outline-style", "solid");
  const unavailable = gallery.getByRole("button", {
    name: "Unavailable",
    exact: true,
  });
  await expect(unavailable).toBeDisabled();
  await expect(unavailable).toHaveCSS("opacity", "1");
  await expect(unavailable).toHaveCSS("background-color", "rgb(247, 237, 218)");
  await gallery.scrollIntoViewIfNeeded();
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("button-specimens.png") });
});

test("Bestiary launchers, batch confirmation and destructive reset use distinct variants @interface @gm @mobile", async ({
  page,
}, info) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await variant(
    page.getByRole("button", { name: "Choose template", exact: true }),
    "quiet",
  );
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  const add = page.getByRole("button", { name: "Add Talent", exact: true });
  await variant(add, "quiet");
  await add.click();
  const dialog = page.getByRole("dialog", { name: "Add Talent", exact: true });
  await dialog.getByLabel("Search talent", { exact: true }).fill("Very Strong");
  await dialog
    .getByRole("checkbox", { name: "Select Very Strong", exact: true })
    .check();
  await variant(
    dialog.getByRole("button", { name: "Cancel", exact: true }),
    "quiet",
  );
  const commit = dialog.getByRole("button", {
    name: "Add 1 Talent",
    exact: true,
  });
  await variant(commit, "primary");
  await commit.click();
  await variant(
    page
      .locator(".gm-entry")
      .filter({ has: page.getByLabel("Very Strong ranks", { exact: true }) })
      .getByRole("button", { name: "Remove this entry", exact: true }),
    "danger-text",
  );
  const fresh = page.getByRole("button", {
    name: "New NPC / creature",
    exact: true,
  });
  await revealCreatorTool(page, fresh);
  await fresh.click();
  await variant(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "Start new", exact: true }),
    "danger",
  );
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("bestiary-buttons.png") });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await expect(
    page.getByLabel("Very Strong ranks", { exact: true }),
  ).toHaveValue("1");
});

test("Marijan keeps launchers quiet and actual entry confirmation primary @interface @marijan @mobile", async ({
  page,
}, info) => {
  await page.goto("/marijan/?verify=1");
  await expect(
    page.getByRole("heading", { name: "Marijan Mode", exact: true }),
  ).toBeVisible();
  await variant(
    page.getByRole("button", { name: "Generate character", exact: true }),
    "quiet",
  );
  await variant(
    page.getByRole("button", { name: "Roll starting values", exact: true }),
    "primary",
  );
  await page.locator('[data-action="custom"]').first().click();
  const dialog = page.getByRole("dialog");
  await variant(
    dialog.getByRole("button", { name: "Add entry", exact: true }),
    "primary",
  );
  await variant(
    dialog.getByRole("button", { name: "Close dialog", exact: true }),
    "quiet",
  );
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("marijan-buttons.png") });
  await dialog
    .getByRole("button", { name: "Close dialog", exact: true })
    .click();
});

test("Manager uses shared primary commits and red deletion rather than its olive accent @interface @manager @mobile", async ({
  page,
}, info) => {
  await page.goto("/manager/?verify=1");
  const create = page
    .locator(".manager-empty")
    .getByRole("button", { name: "New blank character", exact: true });
  await expect(create).toBeVisible();
  await variant(
    page
      .locator(".manager-empty")
      .getByRole("button", { name: "Import character", exact: true }),
    "quiet",
  );
  await create.click();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  const profile = page.getByRole("dialog", {
    name: "Edit profile",
    exact: true,
  });
  await variant(
    profile.getByRole("button", { name: "Save profile", exact: true }),
    "primary",
  );
  await profile
    .getByLabel("Character name", { exact: true })
    .fill("Button audit");
  await profile
    .getByRole("button", { name: "Save profile", exact: true })
    .click();
  await expect(page.locator("#manager-character-name")).toHaveText(
    "Button audit",
  );
  const menu = page.getByRole("button", {
    name: "Open manager menu",
    exact: true,
  });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page
    .getByRole("button", { name: "Permanently delete character", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Permanently delete character",
    exact: true,
  });
  const remove = dialog.getByRole("button", {
    name: "Permanently delete character",
    exact: true,
  });
  await variant(remove, "danger");
  await variant(
    dialog.getByRole("button", { name: "Keep character", exact: true }),
    "quiet",
  );
  if (info.project.name === "desktop") {
    await remove.hover();
    await expect(remove).toHaveCSS("background-color", "rgb(95, 30, 36)");
  }
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("manager-buttons.png") });
  await dialog
    .getByRole("button", { name: "Keep character", exact: true })
    .click();
  await expect(page.locator("#manager-character-name")).toHaveText(
    "Button audit",
  );
});
