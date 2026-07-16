import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrganizationForUser, getSessionUser } from "@/lib/auth";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  industry: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const organization = await createOrganizationForUser({
      userId: user.id,
      email: user.email ?? "",
      name: parsed.data.name,
      industry: parsed.data.industry,
    });

    return NextResponse.json({ organization });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create organization";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
