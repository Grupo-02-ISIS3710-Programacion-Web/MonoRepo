import { expect, test } from "@playwright/test";
import { gotoEs, loginAsUser } from "../helpers/session";

test.describe("HU-07 Detalle de producto e incorporación al flujo", () => {
  test("muestra detalle completo del producto", async ({ page }) => {
    await gotoEs(page, "/descubrir/green-tea-seed-serum");

    await expect(page.getByText("Innisfree")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Green Tea Seed Serum" })).toBeVisible();
    await expect(page.getByText("Categoría")).toBeVisible();
    await expect(page.getByText("Tipo de producto")).toBeVisible();
    await expect(page.getByText("Ingredientes detallados")).toBeVisible();
  });

  test("cambia la imagen principal en el carrusel", async ({ page }) => {
    await gotoEs(page, "/descubrir/green-tea-seed-serum");

    const mainImage = page.locator('img[alt="Green Tea Seed Serum"]').first();
    const previousSrc = await mainImage.getAttribute("src");

    await page.getByRole("button", { name: "Imagen siguiente" }).click();

    await expect
      .poll(async () => mainImage.getAttribute("src"))
      .not.toEqual(previousSrc);
  });

  test("permite navegar a crear rutina con producto preseleccionado", async ({ page }) => {
    await loginAsUser(page, "u1");
    await gotoEs(page, "/descubrir/green-tea-seed-serum");

    await page.getByRole("link", { name: "Agregar a una rutina" }).click();

    await expect(page).toHaveURL(/\/es\/routine\/crear\?product=7$/);
  });

  test("alterna el estado visual del botón de favorito", async ({ page }) => {
    await gotoEs(page, "/descubrir/green-tea-seed-serum");

    const favoriteButton = page.getByRole("button", { name: "Agregar a favoritos" });
    await favoriteButton.click();
    await expect(page.getByRole("button", { name: "Quitar de favoritos" })).toBeVisible();

    await page.getByRole("button", { name: "Quitar de favoritos" }).click();
    await expect(page.getByRole("button", { name: "Agregar a favoritos" })).toBeVisible();
  });
});
