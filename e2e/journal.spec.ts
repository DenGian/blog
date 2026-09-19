import { expect, test } from "@playwright/test";
test("public article navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Lees het journaal" }).click();
  await expect(page).toHaveURL(/\/blog/);
  await expect(page.getByRole("heading", { name: "Artikelen" })).toBeVisible();
});
test("failed login and protected route", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  const password = page.getByLabel("Beheerderswachtwoord");
  if (await password.isDisabled())
    test.skip(true, "Local auth is intentionally not configured");
  await password.fill("definitely-wrong-password");
  await page.getByRole("button", { name: "Veilig aanmelden" }).click();
  await expect(page.getByRole("alert")).toContainText("Onjuiste");
});
test("isolated draft preview, publishing, and logout", async ({ page }) => {
  test.skip(
    process.env.E2E_ALLOW_MUTATION !== "1" || !process.env.E2E_ADMIN_PASSWORD,
    "Requires an isolated test database and explicit mutation opt-in",
  );
  await page.goto("/admin/login");
  await page
    .getByLabel("Beheerderswachtwoord")
    .fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Veilig aanmelden" }).click();
  await page.getByRole("link", { name: "Nieuw artikel" }).click();
  await page.getByLabel("Titel").fill("E2E concept");
  await page
    .getByLabel("Samenvatting")
    .fill("Een geïsoleerd testconcept voor de end-to-end suite.");
  await page.getByLabel("Tags").fill("e2e");
  await page
    .getByRole("textbox", { name: "Artikelinhoud" })
    .fill("Veilige testinhoud");
  await page.getByRole("button", { name: "Bewaar als concept" }).click();
  await expect(page.getByText("E2E concept")).toBeVisible();
  await page.getByRole("link", { name: "Voorbeeld" }).first().click();
  await expect(page.getByText("Beveiligd voorbeeld")).toBeVisible();
  await page.goBack();
  await page.getByRole("link", { name: "Bewerk" }).first().click();
  await page.getByLabel("Publicatiestatus").selectOption("published");
  await page.getByRole("button", { name: "Publiceer wijzigingen" }).click();
  await page.getByRole("button", { name: "Afmelden" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
});
