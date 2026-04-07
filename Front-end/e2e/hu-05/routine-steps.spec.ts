import { expect, test } from "@playwright/test";
import { gotoEs, loginAsUser } from "../helpers/session";

async function openRoutineBuilder(page: import("@playwright/test").Page) {
  await loginAsUser(page, "u1");
  await gotoEs(page, "/routine/crear");
}

test.describe("HU-05 Gestionar pasos de rutina", () => {
  test("agrega productos al selector y crea pasos asociados", async ({ page }) => {
    await openRoutineBuilder(page);

    await page.getByRole("button", { name: "Agregar un paso" }).click();
    await page.getByRole("button", { name: "Añadir a rutina" }).nth(0).click();
    await page.getByRole("button", { name: "Añadir a rutina" }).nth(1).click();
    await page.keyboard.press("Escape");

    await expect(page.getByText("2 productos seleccionados")).toBeVisible();
    await expect(page.getByText("Paso 1").first()).toBeVisible();
    await expect(page.getByText("Paso 2").first()).toBeVisible();
  });

  test("muestra error cuando se intenta guardar sin pasos", async ({ page }) => {
    await openRoutineBuilder(page);

    await page.getByPlaceholder("Nombre de la rutina").fill("Rutina sin pasos");
    await page.getByPlaceholder("Descripción de la rutina").fill("Esta rutina no tiene pasos para disparar validación.");
    await page.locator("#routine-skin-type").selectOption("seca");
    await page.getByRole("button", { name: "Crear Rutina" }).click();

    await expect(page.getByText("Debes agregar al menos un paso a la rutina")).toBeVisible();
  });

  test("permite reordenar pasos hacia arriba y abajo", async ({ page }) => {
    await openRoutineBuilder(page);

    await page.getByRole("button", { name: "Agregar un paso" }).click();
    await page.getByRole("button", { name: "Añadir a rutina" }).nth(0).click();
    await page.getByRole("button", { name: "Añadir a rutina" }).nth(1).click();
    await page.keyboard.press("Escape");

    const stepCards = page.locator('div[data-slot="card"]', {
      has: page.getByText(/Paso\s+[12]/),
    });

    const firstProductBefore = await stepCards.nth(0).getByRole("heading", { level: 3 }).textContent();
    const secondProductBefore = await stepCards.nth(1).getByRole("heading", { level: 3 }).textContent();

    await page.locator('button[aria-label="Mover paso arriba"]:not([disabled])').first().click();

    const firstProductAfter = await stepCards.nth(0).getByRole("heading", { level: 3 }).textContent();
    const secondProductAfter = await stepCards.nth(1).getByRole("heading", { level: 3 }).textContent();

    expect(firstProductAfter?.trim()).toBe(secondProductBefore?.trim());
    expect(secondProductAfter?.trim()).toBe(firstProductBefore?.trim());
  });

  test("elimina un paso y lo remueve de la secuencia", async ({ page }) => {
    await openRoutineBuilder(page);

    await page.getByRole("button", { name: "Agregar un paso" }).click();
    await page.getByRole("button", { name: "Añadir a rutina" }).first().click();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Eliminar paso" }).first().click();

    await expect(page.getByText("No hay pasos en la rutina. Agrega productos desde el selector para empezar.")).toBeVisible();
    await expect(page.getByText("0 productos seleccionados")).toBeVisible();
  });
});
