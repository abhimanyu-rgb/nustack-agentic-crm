// Prototype identity: the active user id is stored in a cookie ("nustack_uid").
// No auth — this is a demo "act as" switcher. Server code reads it to scope data
// and gate by role. Defaults to the admin so the full app is visible on first load.

import { cookies } from "next/headers";
import { db, getUser } from "./store";
import type { User, UserRole } from "./types";

export const UID_COOKIE = "nustack_uid";

export async function currentUser(): Promise<User> {
  const jar = await cookies();
  const uid = jar.get(UID_COOKIE)?.value;
  const user = (uid && getUser(uid)) || db.users.find((u) => u.role === "ADMIN") || db.users[0];
  return user;
}

// Roles allowed to see the company-wide Command Center + all-team data.
export function canSeeAllTeam(role: UserRole): boolean {
  return role === "SALES_MANAGER" || role === "REVOPS" || role === "ADMIN" || role === "EXECUTIVE_VIEWER";
}
