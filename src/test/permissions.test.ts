import { describe, expect, it } from "vitest";

import { canAccessAdmin } from "@/lib/permissions";

describe("admin access", () => {
  it("allows the admin role", () => {
    expect(canAccessAdmin("admin")).toBe(true);
  });

  it("does not allow the standard user role", () => {
    expect(canAccessAdmin("user")).toBe(false);
  });

  it("does not allow an unassigned role", () => {
    expect(canAccessAdmin(null)).toBe(false);
  });
});