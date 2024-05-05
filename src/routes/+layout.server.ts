import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ url, locals: { safeGetSession } }) => {
  const { session, user } = await safeGetSession()
console.log(session)

  if (!user && url.pathname === "/kosik") {
    throw redirect(302, "/");
  }

  return {
    session,
    user,
  }
}) satisfies LayoutServerLoad