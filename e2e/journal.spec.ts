import { expect, test, type Page } from "@playwright/test";
const password =
  process.env.E2E_ADMIN_PASSWORD ?? "isolated-e2e-admin-password";
async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Beheerderswachtwoord").fill(password);
  await page.getByRole("button", { name: "Aanmelden" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
async function expectNotFound(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Deze pagina bestaat niet." }),
  ).toBeVisible();
}
test("public navigation, search, tags, and 404", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Recente weken" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Docker fundamentals" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Lees de blog" }).click();
  await expect(page.getByRole("heading", { name: "De blog" })).toBeVisible();
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
  await expectNotFound(page, "/blog/unknown-article");
  await expect(page.locator(".site-header")).toHaveCount(1);
  await expect(page.locator(".site-footer")).toHaveCount(1);
  await page.goto("/admin/unknown-page");
  await expect(page.locator(".site-header")).toHaveCount(0);
  await expect(page.locator(".site-footer")).toHaveCount(0);
  await expectNotFound(page, "/unknown-page");
  await expect(page.locator(".site-header")).toHaveCount(1);
  await expect(page.locator(".site-footer")).toHaveCount(1);
});
test("public layout fits mobile, tablet and desktop", async ({ page }) => {
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  }
});

test("journal pages keep their layout and links across screen sizes", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/blog",
      "/about",
      "/contact",
      "/blog/docker-fundamentals",
      "/admin/login",
      "/unknown-page",
      "/admin/unknown-page",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        ),
        `${path} overflows at ${width}px`,
      ).toBe(false);
      if (path.startsWith("/admin/")) {
        await expect(page.locator(".site-header, .site-footer")).toHaveCount(0);
      }
    }
  }
  await page.goto("/contact");
  for (const label of [/LinkedIn-profiel/, /GitHub-projecten/]) {
    const link = page.locator("main").getByRole("link", { name: label });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveAttribute("href", /^https:\/\//);
  }
  expect(pageErrors).toEqual([]);
});
test("removed personal photos are unavailable and unreferenced", async ({
  page,
  request,
}) => {
  for (const asset of ["/profile-image.jpg", "/profile.png"]) {
    expect((await request.get(asset)).status()).toBe(404);
  }
  for (const path of [
    "/",
    "/blog",
    "/about",
    "/contact",
    "/blog/docker-fundamentals",
    "/blog/legacy-refactoring",
  ]) {
    await page.goto(path);
    const html = await page.locator("body").innerHTML();
    expect(html).not.toMatch(/profile-image\.jpg|profile\.png/);
  }
  await page.goto("/about");
  await expect(page.locator("main img")).toHaveCount(0);
});
test("protected route, invalid login, secure session, and logout", async ({
  page,
  context,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Beheerderswachtwoord").fill("wrong-password");
  await expect(page.locator(".site-header")).toHaveCount(0);
  await expect(page.locator(".site-footer")).toHaveCount(0);
  await page.getByRole("button", { name: "Aanmelden" }).click();
  await expect(page.getByText("Onjuiste aanmeldgegevens.")).toBeVisible();
  await login(page);
  await expect(page.locator(".site-header")).toHaveCount(0);
  await expect(page.locator(".site-footer")).toHaveCount(0);
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
  await page.getByRole("link", { name: "Nieuwe blogpost" }).last().click();
  await page.getByLabel("Titel", { exact: true }).fill("E2E lifecycle article");
  await page
    .getByLabel("Samenvatting", { exact: true })
    .fill("An isolated deterministic article lifecycle fixture.");
  await page.getByLabel("Tags").fill("e2e, testing");
  await page
    .getByRole("textbox", { name: "Blogpostinhoud" })
    .fill("Initial safe browser content");
  await page.getByRole("button", { name: "Bewaar als concept" }).click();
  await expect(page.getByText("E2E lifecycle article")).toBeVisible();
  await expectNotFound(page, "/blog/e2e-lifecycle-article");
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
  await expectNotFound(page, "/blog/e2e-lifecycle-article");
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "e2e-lifecycle-article",
  );
  expect(await (await request.get("/feed.xml")).text()).not.toContain(
    "e2e-lifecycle-article",
  );
});
