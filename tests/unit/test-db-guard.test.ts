import { describe, expect, it } from "vitest";
import { assertDisposableTestDatabase } from "../setup/global";

describe("test database guard", () => {
  it("allows only a local *_test database", () => {
    expect(() => assertDisposableTestDatabase("postgresql://u:p@127.0.0.1:5432/qsm_test")).not.toThrow();
    expect(() => assertDisposableTestDatabase("postgresql://u:p@127.0.0.1:5432/qsm")).toThrow(/Refusing/);
    expect(() => assertDisposableTestDatabase("postgresql://u:p@db.example.com:5432/qsm_test")).toThrow(/Refusing/);
  });
});
