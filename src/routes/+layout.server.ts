import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ url, locals: { safeGetSession } }) => {
  const { session, user } = await safeGetSession();
 // console.log("Session:", session)
 // console.log("User:", user)
 // console.log("User:", user)



if (!user && url.pathname === "/kosik") {  
    throw redirect(302, "/");
  }

  return {
    session,
    user,
  }
}) satisfies LayoutServerLoad