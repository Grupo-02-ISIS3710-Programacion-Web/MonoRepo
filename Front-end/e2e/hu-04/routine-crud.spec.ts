import { expect, test } from "@playwright/test";
import { gotoEs, loginAsUser } from "../helpers/session";

async function fillRoutineMainFields(page: import("@playwright/test").Page) {
  await page.getByPlaceholder("Nombre de la rutina").fill("Rutina E2E CRUD");
  await page.getByPlaceholder("Descripción de la rutina").fill("Descripción de rutina E2E para validar flujo completo.");
  await page.locator("#routine-skin-type").selectOption("normal");
}

async function addFirstProductAsStep(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Agregar un paso" }).click();
  await page.getByRole("button", { name: "Añadir a rutina" }).first().click();
  await page.keyboard.press("Escape");

  await page.getByPlaceholder("Nombre del paso").first().fill("Paso 1 E2E");
  await page.getByPlaceholder("Descripción del paso").first().fill("Descripción del paso para pruebas E2E.");
}

test.describe("HU-04 Gestionar rutinas (CRUD)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, "u1");
  });

  test("crea una rutina válida y muestra confirmación visual", async ({ page }) => {
    await gotoEs(page, "/routine/crear");

    await fillRoutineMainFields(page);
    await addFirstProductAsStep(page);
    await page.getByRole("button", { name: "Crear Rutina" }).click();

    await expect(page.getByText("Tu rutina ha sido creada exitosamente").first()).toBeVisible();
  });

  test("muestra rutinas en perfil con nombre, descripción, momento y cantidad de pasos", async ({ page }) => {
    await gotoEs(page, "/profile");

    const firstRoutineCard = page.locator("div.group.bg-white").first();
    await expect(firstRoutineCard.locator("h2").first()).toBeVisible();
    await expect(firstRoutineCard.locator("p.text-sm.text-gray-500").first()).toBeVisible();
    await expect(firstRoutineCard.getByText(/AM|PM/).first()).toBeVisible();
    await expect(firstRoutineCard.getByText(/pasos/).first()).toBeVisible();
  });

  test("abre edición de rutina con datos precargados y permite guardar cambios", async ({ page }) => {
    await gotoEs(page, "/profile");

    await page.locator('button[title="Editar rutina"]').first().click();

    await expect(page).toHaveURL(/\/es\/routine\/editar\?id=/);
    await expect(page.getByPlaceholder("Nombre de la rutina")).not.toHaveValue("");
    await expect(page.getByText("Paso 1").first()).toBeVisible();

    const descriptionField = page.getByPlaceholder("Descripción de la rutina");
    await descriptionField.fill("Descripción editada en E2E.");
    await page.getByRole("button", { name: "Guardar Cambios" }).click();

    await expect(page.getByText("Los cambios han sido guardados exitosamente").first()).toBeVisible();
  });

  test("elimina una rutina desde perfil y desaparece de la lista", async ({ page }) => {
    await gotoEs(page, "/profile");

    const routineHeading = page.locator("div.group.bg-white h2").first();
    const routineName = (await routineHeading.textContent())?.trim() ?? "";

    await page.locator('button[title="Eliminar rutina"]').first().click();
    await page.getByRole("button", { name: "Eliminar" }).click();

    await expect(page.getByText(routineName)).toHaveCount(0);
  });
});
