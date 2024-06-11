import * as Sentry from "@sentry/sveltekit";
import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { nodeProfilingIntegration } from "@sentry/profiling-node";


import { PRIVATE_SBKey, PRIVATE_SBUrl } from '$env/static/private';

Sentry.init({
  dsn: "https://945c529c21324f78bf290bf4f0662070@o4504123775188992.ingest.us.sentry.io/4504124579184640",
  tracesSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  ignoreErrors: [
    'Http404',
    /^https?:\/\/localhost(:\d+)?\/?/,
  ],

  denyUrls: [
    /^https?:\/\/localhost(:\d+)?\/?/,
  ],
});


const supabase: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PRIVATE_SBUrl, PRIVATE_SBKey, {
    cookies: {
      get: (key) => event.cookies.get(key),
      set: (key, value, options) => {
        event.cookies.set(key, value, { ...options, path: "/" })
      },
      remove: (key, options) => {
        event.cookies.delete(key, { ...options, path: "/" })
      },
    },
  });

  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    if (!session) {
      return { session: null, user: null }
    }

    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser()
    if (error) {
      return { session: null, user: null }
    }

    return { session, user }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })
};

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession()
  event.locals.session = session
  event.locals.user = user

 /*  if (!event.locals.session && event.url.pathname.startsWith("/private")) {
    return redirect(303, "/auth")
  }

  if (event.locals.session && event.url.pathname === "/auth") {
    return redirect(303, "/private")
  }
 */
  return resolve(event)
};

export const handle: Handle = sequence(Sentry.sentryHandle(), sequence(supabase, authGuard));
export const handleError = Sentry.handleErrorWithSentry();