import type { Page } from "@playwright/test";
import { USERS } from "./global-setup";

export async function signIn(page: Page, who: keyof typeof USERS = "admin") {
  await page.goto("/admin/login/");
  await page.getByLabel("Email").fill(USERS[who].email);
  await page.getByLabel("Password").fill(USERS[who].password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/admin\/(?!login)/);
}
