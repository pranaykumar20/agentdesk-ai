import { describe, expect, it } from "vitest";
import { can, roleAtLeast } from "./can";

describe("can()", () => {
  it("allows OWNER full billing access", () => {
    expect(can("OWNER", "manage", "billing")).toBe(true);
    expect(can("OWNER", "delete", "organization")).toBe(true);
  });

  it("prevents ADMIN from deleting organization", () => {
    expect(can("ADMIN", "delete", "organization")).toBe(false);
    expect(can("ADMIN", "manage", "members")).toBe(true);
  });

  it("limits VIEWER to read", () => {
    expect(can("VIEWER", "read", "calls")).toBe(true);
    expect(can("VIEWER", "update", "calls")).toBe(false);
    expect(can("VIEWER", "manage", "billing")).toBe(false);
  });

  it("allows AGENT to update calls but not manage team", () => {
    expect(can("AGENT", "update", "calls")).toBe(true);
    expect(can("AGENT", "invite", "members")).toBe(false);
  });

  it("allows MANAGER CRUD on appointments/knowledge but not billing manage", () => {
    expect(can("MANAGER", "create", "appointments")).toBe(true);
    expect(can("MANAGER", "create", "knowledge")).toBe(true);
    expect(can("MANAGER", "manage", "billing")).toBe(false);
  });

  it("denies VIEWER create on appointments and knowledge", () => {
    expect(can("VIEWER", "create", "appointments")).toBe(false);
    expect(can("VIEWER", "create", "knowledge")).toBe(false);
  });
});

describe("roleAtLeast()", () => {
  it("compares role hierarchy", () => {
    expect(roleAtLeast("ADMIN", "MANAGER")).toBe(true);
    expect(roleAtLeast("AGENT", "ADMIN")).toBe(false);
  });
});
