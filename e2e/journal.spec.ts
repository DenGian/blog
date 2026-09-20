import { expect, test, type Page } from "@playwright/test";
const password =
  process.env.E2E_ADMIN_PASSWORD ?? "isolated-e2e-admin-password";
async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Beheerderswachtwoord").fill(password);
  await page.getByRole("button", { name: "Veilig aanmelden" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
test("public navigation, search, tags, and 404", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Lees het journaal" }).click();
  await expect(page.getByRole("heading", { name: "Artikelen" })).toBeVisible();
  await page
    .getByLabel("Zoek in titels, samenvattingen en tags")
    .fill("Docker");
  await page.getByRole("button", { name: "Zoeken" }).click();
  await expect(
    page.getByRole("heading", { name: "Docker fundamentals" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Docker", exact: true }).first().click();
  await expect(
    page.getByRole("heading", { name: "Docker fundamentals" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Docker fundamentals" }).click();
  await expect(page).toHaveURL(/docker-fundamentals/);
  await page.goto("/blog/unknown-article");
  await expect(page).toHaveTitle(/niet gevonden/i);
});
test("protected route, invalid login, secure session, and logout", async ({
  page,
  context,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Beheerderswachtwoord").fill("wrong-password");
  await page.getByRole("button", { name: "Veilig aanmelden" }).click();
  await expect(page.getByText("Onjuiste aanmeldgegevens.")).toBeVisible();
  await login(page);
  const cookie = (await context.cookies()).find(
    (item) => item.name === "journal_admin",
  );
  expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Strict" });
  await page.getByRole("button", { name: "Afmelden" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
test("draft lifecycle, protected preview, publish, edit, unpublish, and API rejection", async ({
  page,
  request,
}) => {
  const rejected = await request.post("/api/posts", { data: {} });
  expect(rejected.status()).toBe(401);
  await login(page);
  await page.getByRole("link", { name: "Nieuw artikel" }).last().click();
  await page.getByLabel("Titel", { exact: true }).fill("E2E lifecycle article");
  await page
    .getByLabel("Samenvatting", { exact: true })
    .fill("An isolated deterministic article lifecycle fixture.");
  await page.getByLabel("Tags").fill("e2e, testing");
  await page
    .getByRole("textbox", { name: "Artikelinhoud" })
    .fill("Initial safe browser content");
  await page.getByRole("button", { name: "Bewaar als concept" }).click();
  await expect(page.getByText("E2E lifecycle article")).toBeVisible();
  await page.goto("/blog/e2e-lifecycle-article");
  await expect(page).toHaveTitle(/niet gevonden/i);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "e2e-lifecycle-article",
  );
  expect(await (await request.get("/feed.xml")).text()).not.toContain(
    "e2e-lifecycle-article",
  );
  await page.goto("/admin");
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Voorbeeld" }).first().click();
  const preview = await popupPromise;
  await expect(preview.getByText("Beveiligd voorbeeld")).toBeVisible();
  await preview.close();
  await page.getByRole("link", { name: "Bewerk" }).first().click();
  await page
    .getByLabel("Samenvatting", { exact: true })
    .fill("Edited isolated deterministic article lifecycle fixture.");
  await page.getByLabel("Publicatiestatus").selectOption("published");
  await page.getByRole("button", { name: "Publiceer wijzigingen" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/blog/e2e-lifecycle-article");
  await expect(page.getByText("Edited isolated deterministic")).toBeVisible();
  expect(await (await request.get("/feed.xml")).text()).toContain(
    "e2e-lifecycle-article",
  );
  await page.goto("/admin");
  await page.getByRole("link", { name: "Bewerk" }).first().click();
  await page.getByRole("button", { name: "Bewaar als concept" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/blog/e2e-lifecycle-article");
  await expect(page).toHaveTitle(/niet gevonden/i);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "e2e-lifecycle-article",
  );
  expect(await (await request.get("/feed.xml")).text()).not.toContain(
    "e2e-lifecycle-article",
  );
});
