import "server-only";

export type SniffResult = { ok: true; mime: string } | { ok: false; reason: string };

const ascii = (head: Uint8Array, from = 0, len = head.length) =>
  String.fromCharCode(...head.subarray(from, Math.min(head.length, from + len)));

const startsWith = (head: Uint8Array, sig: number[]) => sig.every((b, i) => head[i] === b);

/** True when the sample is printable text (tabs, newlines and printable ASCII). */
const isText = (head: Uint8Array) => head.every((b) => b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127));

type Check = { mime: string; label: string; test: (head: Uint8Array) => boolean };

const checks: Record<string, Check> = {
  pdf: { mime: "application/pdf", label: "PDF", test: (h) => ascii(h, 0, 5) === "%PDF-" },
  png: { mime: "image/png", label: "PNG image", test: (h) => startsWith(h, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  jpg: { mime: "image/jpeg", label: "JPEG image", test: (h) => startsWith(h, [0xff, 0xd8, 0xff]) },
  webp: { mime: "image/webp", label: "WEBP image", test: (h) => ascii(h, 0, 4) === "RIFF" && ascii(h, 8, 4) === "WEBP" },
  dwg: { mime: "image/vnd.dwg", label: "DWG drawing", test: (h) => /^AC10\d\d$/.test(ascii(h, 0, 6)) },
  step: { mime: "model/step", label: "STEP file", test: (h) => ascii(h, 0, 64).trimStart().startsWith("ISO-10303-21") },
  dxf: {
    mime: "image/vnd.dxf",
    label: "DXF drawing",
    test: (h) => ascii(h, 0, 18) === "AutoCAD Binary DXF" || (h.length > 0 && isText(h.subarray(0, 4096))),
  },
};
checks.jpeg = checks.jpg;
checks.stp = checks.step;

/**
 * Confirms a file's content matches its extension, using the first bytes
 * (at least 4 KB). Blocks renamed executables and other disguised files.
 */
export function sniffFile(ext: string, head: Uint8Array): SniffResult {
  const check = checks[ext.toLowerCase()];
  if (!check) return { ok: false, reason: "This file type is not accepted." };
  return check.test(head)
    ? { ok: true, mime: check.mime }
    : { ok: false, reason: `This file does not look like a ${check.label}. Check the file and try again.` };
}
