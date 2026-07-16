import { describe, expect, it } from "vitest";
import { isNavActive } from "./dashboard";

describe("isNavActive", () => {
  it("matches dashboard root exactly", () => {
    expect(isNavActive("/dashboard", "/dashboard")).toBe(true);
    expect(isNavActive("/dashboard/calls", "/dashboard")).toBe(false);
  });

  it("matches nested routes for section hrefs", () => {
    expect(isNavActive("/dashboard/calls", "/dashboard/calls")).toBe(true);
    expect(isNavActive("/dashboard/calls/abc", "/dashboard/calls")).toBe(true);
    expect(isNavActive("/dashboard/appointments", "/dashboard/calls")).toBe(false);
  });
});
