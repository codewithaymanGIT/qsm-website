"use server";

import { rolesFor } from "@/components/admin/nav";
import { adminAction } from "@/lib/server/admin-action";
import { saveSettings, saveTimeline } from "@/lib/server/admin-content";

const roles = rolesFor("/admin/settings/");

export async function saveContactAction(form: FormData) {
  return adminAction(roles, async () => {
    await saveSettings(form);
    return "Saved. Phone, WhatsApp and address are updated across the website.";
  });
}

export async function saveTimelineAction(form: FormData) {
  return adminAction(roles, async () => {
    await saveTimeline(form);
    return "Timeline saved.";
  });
}
