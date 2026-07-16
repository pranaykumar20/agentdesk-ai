/** Pure helper: cookie org is only honored when it is in the membership set. */
export function pickActiveOrgId(
  membershipOrgIds: string[],
  cookieOrgId: string | undefined | null,
): string | null {
  if (membershipOrgIds.length === 0) return null;
  if (cookieOrgId && membershipOrgIds.includes(cookieOrgId)) return cookieOrgId;
  return membershipOrgIds[0] ?? null;
}
