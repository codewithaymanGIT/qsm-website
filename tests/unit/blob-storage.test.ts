import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// An in-memory stand-in for Vercel Blob, so the Vercel code path runs without the network.
const store = vi.hoisted(() => new Map<string, { bytes: Uint8Array; access: string; contentType?: string }>());
vi.mock("@vercel/blob", () => ({
  put: vi.fn(async (pathname: string, body: Buffer, opts: { access: string; contentType?: string }) => {
    store.set(pathname, { bytes: new Uint8Array(body), access: opts.access, contentType: opts.contentType });
    return { pathname };
  }),
  head: vi.fn(async (pathname: string) => {
    const b = store.get(pathname);
    if (!b) throw new Error("not found");
    return { pathname, size: b.bytes.length };
  }),
  get: vi.fn(async (pathname: string) => {
    const b = store.get(pathname);
    return b ? { statusCode: 200, stream: new Response(b.bytes as BodyInit).body } : null;
  }),
  del: vi.fn(async (paths: string | string[]) => {
    for (const p of [paths].flat()) store.delete(p);
  }),
  list: vi.fn(async () => ({ blobs: [] })),
}));

const { incomingFile } = await import("@/lib/server/incoming");
const { storeMedia } = await import("@/lib/server/media");
const { storeUpload } = await import("@/lib/server/storage");
const { readFile } = await import("@/lib/server/file-store");

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const incoming = (name: string) => `incoming/123e4567-e89b-12d3-a456-426614174000/${name}`;
const formWith = (value: string) => {
  const f = new FormData();
  f.set("file", value);
  return f;
};

beforeEach(() => {
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test-token");
  store.clear();
});
afterAll(() => vi.unstubAllEnvs());

describe("Vercel Blob storage", () => {
  it("keeps a browser-uploaded image privately and removes the temporary copy", async () => {
    store.set(incoming("logo.png"), { bytes: PNG, access: "private" });
    const file = await incomingFile(formWith(incoming("logo.png")), "file");
    const m = await storeMedia(file!, "image");
    expect(store.has(incoming("logo.png"))).toBe(false);
    expect(store.get(`media/${m.key}`)).toMatchObject({ access: "private", contentType: "image/png" });
    const body = await readFile("media", m.key);
    expect(new Uint8Array(await new Response(body as BodyInit).arrayBuffer())).toEqual(PNG);
  });

  it("rejects a disguised file and still removes the temporary copy", async () => {
    store.set(incoming("photo.png"), { bytes: new TextEncoder().encode("MZ\x90\x00 not an image"), access: "private" });
    const file = await incomingFile(formWith(incoming("photo.png")), "file");
    await expect(storeMedia(file!, "image")).rejects.toThrow(/does not look like/);
    expect(store.size).toBe(0);
  });

  it("only accepts references inside incoming/<uuid>/", async () => {
    store.set("media/secret.pdf", { bytes: PNG, access: "private" });
    for (const ref of ["media/secret.pdf", "incoming/../media/secret.pdf", "incoming/not-a-uuid/x.png", incoming("a/b.png")]) {
      expect(await incomingFile(formWith(ref), "file")).toBeNull();
    }
    expect(store.has("media/secret.pdf")).toBe(true);
  });

  it("stores enquiry drawings under uploads/ with a checksum", async () => {
    const pdf = new TextEncoder().encode("%PDF-1.7\n");
    store.set(incoming("drawing.pdf"), { bytes: pdf, access: "private" });
    const u = await storeUpload((await incomingFile(formWith(incoming("drawing.pdf")), "file"))!, "DRAWING");
    expect(u.originalName).toBe("drawing.pdf");
    expect(store.get(`uploads/${u.storedName}`)?.access).toBe("private");
    expect(u.sha256).toMatch(/^[0-9a-f]{64}$/);
  });
});
