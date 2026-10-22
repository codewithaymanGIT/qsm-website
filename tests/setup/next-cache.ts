import { vi } from "vitest";

// Outside Next, cache directives are inert: loaders simply query the database.
vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {}, revalidateTag: () => {} }));
