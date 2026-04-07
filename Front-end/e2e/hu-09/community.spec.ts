import { expect, test } from "@playwright/test";
import { gotoEs, loginAsUser } from "../helpers/session";

test.describe("HU-09 Participar en la comunidad", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, "u1");
  });

  test("reordena listado al cambiar entre pestañas", async ({ page }) => {
    await gotoEs(page, "/community");

    const firstTitle = page.locator("h3").first();
    const recentFirst = (await firstTitle.textContent())?.trim();

    await page.getByRole("button", { name: "Más comentadas" }).click();
    const mostCommentedFirst = (await firstTitle.textContent())?.trim();

    await page.getByRole("button", { name: "Más votadas" }).click();
    const mostVotedFirst = (await firstTitle.textContent())?.trim();

    expect(new Set([recentFirst, mostCommentedFirst, mostVotedFirst]).size).toBeGreaterThan(1);
  });

  test("filtra por tipo de piel y deja solo rutinas del tipo seleccionado", async ({ page }) => {
    await gotoEs(page, "/community");

    await page.locator('button:visible', { hasText: /Acnéica/i }).first().click();

    const tags = page.locator("div.inline-flex.items-center.rounded-md");
    await expect(tags.first()).toContainText(/Acnéica/i);
  });

  test("permite votar rutina en detalle con comportamiento toggle", async ({ page }) => {
    await gotoEs(page, "/routine/detail/r1");

    const upvoteButton = page.getByRole("button", { name: "Votar positivo" }).first();
    const initialLabel = (await upvoteButton.textContent())?.trim() ?? "";

    await upvoteButton.click();
    const afterVote = (await upvoteButton.textContent())?.trim() ?? "";
    expect(afterVote).not.toEqual(initialLabel);

    await upvoteButton.click();
    await expect(upvoteButton).toHaveText(initialLabel);
  });

  test("publica comentario no vacío y actualiza listado", async ({ page }) => {
    await gotoEs(page, "/routine/detail/r1");

    await page.getByPlaceholder("Comparte tu experiencia con esta rutina...").fill("Comentario E2E para validar publicación.");
    await page.getByRole("button", { name: "Publicar comentario" }).click();

    await expect(page.getByText("Comentario E2E para validar publicación.")).toBeVisible();
    await expect(page.getByText("Tu comentario ha sido publicado").first()).toBeVisible();
  });

  test("permite votar comentarios con alternancia de conteo", async ({ page }) => {
    await gotoEs(page, "/routine/detail/r1");

    const firstComment = page.locator("article.rounded-xl.bg-transparent.p-3").first();
    const upvoteCommentButton = firstComment.getByRole("button", { name: "Votar positivo" });

    const before = (await upvoteCommentButton.textContent())?.trim() ?? "";
    await upvoteCommentButton.click();
    const afterUpvote = (await upvoteCommentButton.textContent())?.trim() ?? "";
    expect(afterUpvote).not.toEqual(before);

    await upvoteCommentButton.click();
    await expect(upvoteCommentButton).toHaveText(before);
  });
});
