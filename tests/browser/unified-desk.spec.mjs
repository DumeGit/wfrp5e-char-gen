import {
  test,
  expect,
  openPC,
  openGM,
  applyProfile,
  revealCreatorTool,
  noOverflow,
} from "./helpers.mjs";

test("grouped commands preserve feature focus, files and editor identity @interface @mobile", async ({
  page,
}) => {
  await openGM(page);
  await applyProfile(page, "Human");
  const name = page.getByRole("textbox", { name: "Name", exact: true });
  await name.fill("The keeper of the old oak desk");
  await name.evaluate((node) => {
    window.__imperialNameField = node;
  });
  const newCreature = page.getByRole("button", {
    name: "New NPC / creature",
    exact: true,
  });
  await revealCreatorTool(page, newCreature);
  await newCreature.click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  const feature = page.getByRole("dialog");
  await expect(feature).toContainText(/new/i);
  await page.setViewportSize({ width: 1101, height: 700 });
  await expect(feature).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "New & import", exact: true }),
  ).toBeVisible();
  await expect(newCreature).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "New & import", exact: true }),
  ).toBeFocused();
  await expect(name).toHaveValue("The keeper of the old oak desk");
  expect(
    await name.evaluate((node) => node === window.__imperialNameField),
  ).toBe(true);
  const load = page.getByRole("button", { name: "Load draft", exact: true });
  await revealCreatorTool(page, load);
  const chooser = page.waitForEvent("filechooser");
  await load.click();
  await chooser;
  await page.locator('input[type="file"]').dispatchEvent("cancel");
  await expect(load).toBeFocused();
  await expect(name).toHaveValue("The keeper of the old oak desk");
  await page.keyboard.press("Escape");
  await noOverflow(page);
});

test("manager keeps one live shell at the boundary and retains its library @interface @manager @mobile", async ({
  page,
}) => {
  await page.goto("/manager/?verify=1");
  await expect(
    page.getByRole("heading", { name: "Your characters", exact: true }),
  ).toBeVisible();
  for (const width of [1101, 1100, 1099, 320, 768, 1920, 3840]) {
    await page.setViewportSize({ width, height: 900 });
    const compact = width <= 1100;
    const launcher = page.getByRole("button", {
      name: "Open manager menu",
      exact: true,
    });
    await expect(launcher).toBeVisible({ visible: compact });
    if (compact) await launcher.click();
    await expect(
      page.getByRole("button", { name: "Character library", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "New & import", exact: true }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("group", { name: "Edit history", exact: true }),
    ).toHaveCount(1);
    await expect(page.locator(".workspace-menu-content")).toHaveCount(1);
    await expect(
      page.getByRole("button", { name: "Play", exact: true }),
    ).toHaveCount(0);
    await noOverflow(page);
    if (compact) await page.keyboard.press("Escape");
  }
});

test("menu browsing leaves history and lazy tools alone; print has clean paper @interface @mobile", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await openPC(page, { complete: true });
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  const pdfRequests = () =>
    requests.filter((url) => /pdf-lib|pdf-runtime/.test(url));
  expect(pdfRequests()).toEqual([]);
  const source = page.getByRole("button", {
    name: "Sources & decisions",
    exact: true,
  });
  await revealCreatorTool(page, source);
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
  expect(pdfRequests()).toEqual([]);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".workspace-rail")).toHaveCSS("display", "none");
  await expect(page.locator("main")).toHaveCSS("background-image", "none");
  expect(
    await page
      .locator("main")
      .evaluate((node) => getComputedStyle(node, "::before").display),
  ).toBe("none");
});
