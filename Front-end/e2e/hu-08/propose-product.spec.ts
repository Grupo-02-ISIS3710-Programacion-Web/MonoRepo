import { expect, test } from "@playwright/test";
import { gotoEs } from "../helpers/session";

test.describe("HU-08 Proponer nuevo producto", () => {
  test("muestra errores por campos inválidos o incompletos", async ({ page }) => {
    await gotoEs(page, "/descubrir/crear-producto");

    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("El nombre del producto debe tener al menos 3 caracteres")).toBeVisible();
    await expect(page.getByText("La marca del producto debe tener al menos 3 caracteres")).toBeVisible();
    await expect(page.getByText("La descripción del producto debe tener al menos 10 caracteres")).toBeVisible();
  });

  test("permite enviar formulario válido y muestra confirmación visual", async ({ page }) => {
    await gotoEs(page, "/descubrir/crear-producto");

    await page.getByPlaceholder("CeraVe limpiador hidratante").fill("Producto E2E Skin");
    await page.getByPlaceholder("La Roche Posay").fill("Marca E2E");
    await page.getByPlaceholder("Escriba la descripción del producto").fill("Descripción válida para producto de pruebas E2E.");

    await page.locator("#product-form-primary-category").click();
    await page.getByRole("option", { name: "Limpiadores" }).click();

    await page.getByPlaceholder("Selecciona los tipos de piel del producto").click();
    await page.getByRole("option", { name: "Normal" }).click();
    await page.keyboard.press("Escape");

    await page.getByPlaceholder("Selecciona el tipo de producto").click();
    await page.getByRole("option", { name: "Gel" }).click();
    await page.keyboard.press("Escape");

    await page.getByPlaceholder("Ej: niacinamida, glicerina, ceramidas").fill("niacinamida, glicerina");
    await page.getByPlaceholder("https://...").fill("https://example.com/producto-e2e.jpg");

    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("Producto enviado para revisión ✅").first()).toBeVisible();
  });
});
