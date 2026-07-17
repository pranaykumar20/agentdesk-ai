import { describe, expect, it } from "vitest";
import { buildFaqJsonLd, buildOrganizationJsonLd, buildSoftwareApplicationJsonLd } from "./seo";
import { HOMEPAGE_FAQ } from "@/content/marketing/faq";

describe("marketing seo json-ld", () => {
  it("builds organization and software application schemas", () => {
    expect(buildOrganizationJsonLd()["@type"]).toBe("Organization");
    expect(buildSoftwareApplicationJsonLd()["@type"]).toBe("SoftwareApplication");
  });

  it("builds FAQPage schema from homepage FAQ", () => {
    const schema = buildFaqJsonLd();
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(HOMEPAGE_FAQ.length);
  });
});
