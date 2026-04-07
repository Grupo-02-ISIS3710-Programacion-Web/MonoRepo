import { expect, test } from "@playwright/test";
import { gotoEs } from "../helpers/session";

function extractProductCount(text: string | null): number {
  if (!text) {
    return 0;
  }
  const match = text.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

test.describe("HU-06 Descubrir y filtrar productos", () => {
  test("filtra productos al seleccionar una categoría", async ({ page }) => {
    await gotoEs(page, "/descubrir");

    const countLabel = page.getByText(/Mostrando \d+ productos/).first();
    const allCount = extractProductCount(await countLabel.textContent());

    await gotoEs(page, "/descubrir?category=limpieza");
    await expect(page).toHaveURL(/category=limpieza/);

    const filteredCount = extractProductCount(await countLabel.textContent());
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(allCount);
  });

  test("actualiza la lista al aplicar filtros y permite quitar chips", async ({ page }) => {
    await gotoEs(page, "/descubrir");

    await page.getByPlaceholder("Tipo de piel").first().click();
    await page.getByRole("option", { name: "Opaca" }).click();
    await page.keyboard.press("Escape");

    await expect(page.getByText(/Piel\s+Opaca/).first()).toBeVisible();

    const chip = page.locator(".MuiChip-root", { hasText: /Piel\s+Opaca/ }).first();
    await chip.locator(".MuiChip-deleteIcon").click();

    await expect(page.getByText(/Piel\s+Opaca/)).toHaveCount(0);
  });

  test("muestra estado vacío cuando no hay resultados y acción para añadir producto", async ({ page }) => {
    await gotoEs(page, "/descubrir");

    await page.getByPlaceholder("Tipo de piel").first().click();
    await page.getByRole("option", { name: "Opaca" }).click();

    await page.getByPlaceholder("Marca").first().click();
    await page.getByRole("option", { name: /Cerave|CeraVe/ }).click();
    await page.keyboard.press("Escape");

    await expect(page.getByText("¿No encontraste lo que estabas buscando?")).toBeVisible();

    await page.getByRole("button", { name: "Añade un producto a nuestro catálogo" }).click();
    await expect(page).toHaveURL(/\/es\/descubrir\/crear-producto$/);
  });
});
