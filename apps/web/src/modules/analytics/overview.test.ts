import { describe, expect, it } from "vitest";
import { analyticsToCsv } from "./overview";
import { buildDemoAnalytics } from "./demo-data";

describe("analytics export", () => {
  it("builds csv with kpi rows", () => {
    const overview = buildDemoAnalytics("7d");
    const csv = analyticsToCsv(overview);
    expect(csv).toContain("total_calls,");
    expect(csv).toContain("intent,count,pct");
    expect(csv).toContain("Book Appointment");
  });
});
