import { MAX_UPLOAD_BYTES } from "@/lib/upload-rules";
import { LeadValidationError, RateLimitError, submitLead } from "@/lib/server/leads";

// Two files of up to 20 MB plus form fields.
const MAX_REQUEST_BYTES = 2 * MAX_UPLOAD_BYTES + 512 * 1024;

const json = (body: unknown, status: number) => Response.json(body, { status });

export async function POST(request: Request) {
  // Reject oversized bodies before parsing (and buffering) them.
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_REQUEST_BYTES) return json({ error: "Files must be 20 MB or smaller." }, 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Send the enquiry as a form." }, 415);
  }

  // Spam trap: real visitors never see or fill this field.
  if (String(form.get("website") ?? "").trim()) return json({ ok: true }, 200);

  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) if (typeof value === "string") fields[key] = value;
  const file = (key: string) => {
    const v = form.get(key);
    return v instanceof File && v.size > 0 ? v : null;
  };

  try {
    const { reference } = await submitLead({
      fields,
      drawing: file("drawing"),
      cad: file("cad"),
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip"),
      userAgent: request.headers.get("user-agent"),
    });
    return json({ reference }, 201);
  } catch (e) {
    if (e instanceof LeadValidationError) return json({ errors: e.errors }, 400);
    if (e instanceof RateLimitError) return json({ error: e.message }, 429);
    console.error("Lead submission failed", e);
    return json({ error: "Your enquiry could not be saved. Please contact us on WhatsApp or by phone." }, 500);
  }
}
