import { expect, test } from "@playwright/test";
import { gotoEs } from "../helpers/session";

test.describe("HU-02 Iniciar sesión", () => {
  test("muestra errores cuando faltan email o contraseña", async ({ page }) => {
    await gotoEs(page, "/login");

    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page.getByText("El email es obligatorio")).toBeVisible();
    await expect(page.getByText("La contraseña es obligatoria")).toBeVisible();
  });

  test("permite ver y ocultar la contraseña", async ({ page }) => {
    await gotoEs(page, "/login");

    const passwordInput = page.getByPlaceholder("••••••••");
    await expect(passwordInput).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Mostrar contraseña" }).click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "Ocultar contraseña" }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("navega a registro desde login", async ({ page }) => {
    await gotoEs(page, "/login");

    await page.getByRole("link", { name: "Regístrate" }).click();

    await expect(page).toHaveURL(/\/es\/register$/);
  });

  test("permite enviar formulario con credenciales válidas y redirige", async ({ page }) => {
    await gotoEs(page, "/login");

    await page.getByPlaceholder("glowing.skin@example.com").fill("sofian");
    await page.getByPlaceholder("••••••••").fill("skin4all123");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/(es\/)?home$/);
  });
});
