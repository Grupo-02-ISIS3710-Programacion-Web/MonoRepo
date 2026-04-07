import { Page } from "@playwright/test";

const AUTH_STORAGE_KEY = "skin4all.auth.userId";

export async function gotoEs(page: Page, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  await page.goto(`/es${normalizedPath}`);
}

export async function loginAsUser(page: Page, userId = "u1") {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: AUTH_STORAGE_KEY, value: userId }
  );
}

export async function logout(page: Page) {
  await page.addInitScript((key) => {
    window.localStorage.removeItem(key);
  }, AUTH_STORAGE_KEY);
}
