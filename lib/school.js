import { cookies } from "next/headers";

export const SCHOOLS = {
  "smp-negeri-3-jakarta": { id: 1, name: "SMP Negeri 3 Jakarta" },
  "sma-negeri-37-jakarta": { id: 2, name: "SMA Negeri 37 Jakarta" },
};

export function schoolFromSlug(slug) {
  return SCHOOLS[String(slug || "").toLowerCase()] || null;
}

export async function getSchoolId() {
  const store = await cookies();
  return Number(store.get("schoolhub_school_id")?.value || 1);
}

export async function getSchoolIdFromRequest(request) {
  return Number(request.cookies.get("schoolhub_school_id")?.value || 1);
}

export async function getSchoolSlug() {
  const id = await getSchoolId();
  return id === 2 ? "sma-negeri-37-jakarta" : "smp-negeri-3-jakarta";
}
