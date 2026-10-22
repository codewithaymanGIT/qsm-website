// Wrapper for every admin Server Action: role check first, friendly errors back to the
// form, and a refresh of the public pages after a content change.
import "server-only";
import { updateTag } from "next/cache";
import type { Role } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { CATALOG_TAG } from "@/lib/content";
import { AdminInputError } from "./admin-content";
import { requireUser } from "./auth";
import type { SessionUser } from "./auth-core";
import { MediaRejected } from "./media";

export async function adminAction(
  roles: Role[],
  run: (user: SessionUser) => Promise<string | void>,
  { refreshSite = true } = {},
): Promise<ActionResult> {
  const user = await requireUser(roles);
  try {
    const message = await run(user);
    if (refreshSite) updateTag(CATALOG_TAG);
    return { ok: message || "Saved." };
  } catch (e) {
    if (e instanceof AdminInputError || e instanceof MediaRejected) return { error: e.message };
    // redirect() and notFound() also arrive here; the change they follow is already saved.
    if (refreshSite) updateTag(CATALOG_TAG);
    throw e;
  }
}

/** The uploaded file in a form field, or null when the field was left empty. */
export function formFile(form: FormData, key: string): File | null {
  const f = form.get(key);
  return f instanceof File && f.size > 0 ? f : null;
}
