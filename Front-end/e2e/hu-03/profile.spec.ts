import { expect, test } from "@playwright/test";
import { gotoEs, loginAsUser } from "../helpers/session";

test.describe("HU-03 Gestionar perfil", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, "u1");
    await gotoEs(page, "/profile");
  });

  test("muestra datos principales del perfil al cargar", async ({ page }) => {
    await expect(page.getByText("Sofía Navarro")).toBeVisible();
    await expect(page.getByText("Madrid, Spain")).toBeVisible();
    await expect(page.getByText("Combination / Sensitive")).toBeVisible();
    await expect(page.getByText("Focused on keeping my barrier healthy with lightweight hydration and gentle actives.")).toBeVisible();
    await expect(page.getByText("RESEÑAS")).toBeVisible();
    await expect(page.getByText("PUBLICACIONES")).toBeVisible();
  });

  test("permite editar datos y verlos reflejados en la tarjeta", async ({ page }) => {
    await page.getByRole("button", { name: "Editar perfil" }).click();

    const modal = page.locator("div.fixed.inset-0").first();
    await expect(modal).toBeVisible();

    await modal.locator("label", { hasText: "Nombre" }).locator("..").locator("input").fill("E2E Nombre Perfil");
    await modal.locator("label", { hasText: "Ciudad" }).locator("..").locator("input").fill("Medellín, Colombia");
    await modal.locator("label", { hasText: "Tipo de piel" }).locator("..").locator("input").fill("Mixta");
    await modal.locator("textarea").fill("Bio actualizada desde E2E.");

    await modal.getByRole("button", { name: "Guardar" }).click();

    await expect(modal).toBeHidden();
    await expect(page.getByText("E2E Nombre Perfil")).toBeVisible();
    await expect(page.getByText("Medellín, Colombia")).toBeVisible();
    await expect(page.getByText("Mixta")).toBeVisible();
    await expect(page.getByText("Bio actualizada desde E2E.")).toBeVisible();
  });

  test("previsualiza la foto al seleccionar un archivo", async ({ page }) => {
    await page.getByRole("button", { name: "Editar perfil" }).click();

    const modal = page.locator("div.fixed.inset-0").first();
    const previewImage = modal.locator("img").first();
    const beforeSrc = await previewImage.getAttribute("src");

    await modal.locator("input[type='file']").setInputFiles("public/avatar2.jpeg");

    await expect
      .poll(async () => previewImage.getAttribute("src"))
      .not.toEqual(beforeSrc);

    await modal.getByRole("button", { name: "Cancelar" }).click();
  });
});
