import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { gotoEs } from "../helpers/session";

async function fillValidRegistrationForm(page: Page) {
  await page.getByPlaceholder("Ej: Pepito Pérez").fill("E2E Usuario");

  await page.locator("#date").click();
  await page.locator(".rdp-day_button:not([disabled])").nth(10).click();

  await page.locator("#register-tipo-piel").selectOption("normal");
  await page.getByRole("button", { name: "Sí" }).click();
  await page.locator("#register-como-entero").selectOption("instagram");
  await page.getByPlaceholder("correo@ejemplo.com").fill("e2e.usuario@example.com");
  await page.locator('input[name="contrasenia"]').fill("password123");
  await page.locator('input[name="confirmarContrasenia"]').fill("password123");
}

test.describe("HU-01 Registrar nueva cuenta", () => {
  test("muestra validaciones cuando faltan campos obligatorios", async ({ page }) => {
    await gotoEs(page, "/register");

    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page.getByText("Este campo es obligatorio").first()).toBeVisible();
  });

  test("muestra errores cuando la contraseña es corta o no coincide", async ({ page }) => {
    await gotoEs(page, "/register");

    await page.getByPlaceholder("Ej: Pepito Pérez").fill("E2E Usuario");
    await page.locator("#date").click();
    await page.locator(".rdp-day_button:not([disabled])").nth(10).click();
    await page.locator("#register-tipo-piel").selectOption("mixta");
    await page.getByRole("button", { name: "Sí" }).click();
    await page.locator("#register-como-entero").selectOption("google");
    await page.getByPlaceholder("correo@ejemplo.com").fill("e2e.usuario@example.com");

    await page.locator('input[name="contrasenia"]').fill("1234");
    await page.locator('input[name="confirmarContrasenia"]').fill("12345");

    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page.locator("span.text-red-500", { hasText: "La contraseña debe tener al menos 8 caracteres" })).toBeVisible();
    await expect(page.locator("span.text-red-500", { hasText: "Las contraseñas no coinciden" })).toBeVisible();
  });

  test("permite enviar el formulario cuando se completa correctamente", async ({ page }) => {
    await gotoEs(page, "/register");

    await fillValidRegistrationForm(page);
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page.locator("span.text-red-500", { hasText: "Este campo es obligatorio" })).toHaveCount(0);
    await expect(page.locator("span.text-red-500", { hasText: "La contraseña debe tener al menos 8 caracteres" })).toHaveCount(0);
    await expect(page.locator("span.text-red-500", { hasText: "Las contraseñas no coinciden" })).toHaveCount(0);
  });

  test("navega a términos y condiciones desde el enlace legal", async ({ page }) => {
    await gotoEs(page, "/register");

    await page.locator("form").getByRole("link", { name: "Términos y condiciones" }).click();

    await expect(page).toHaveURL(/\/es\/ToS$/);
    await expect(page.getByRole("heading", { name: "Terminos y Condiciones" })).toBeVisible();
  });
});
