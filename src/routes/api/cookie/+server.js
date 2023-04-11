/* 
** https://kit.svelte.dev/docs/web-standards#fetch-apis-request
*/

export const POST = async ({ cookies, request }) => {
  const session = request.body ? await request.json() : null
  if (session) {
    const { refresh_token, access_token, user } = session
    const options = {
      maxAge: 7200,
      path: '/',
      sameSite: true
    }
    cookies.set('user', JSON.stringify(user), options)
    cookies.set('access-token', JSON.stringify(access_token), options)
    cookies.set('refresh-token', JSON.stringify(refresh_token), options)

    return new Response (null)
  } else {
    return new Response('Expecting JSON body, but body was null.', { status: 400 })
  }
}

export const DELETE = ({ cookies }) => {
  cookies.delete('access-token', { path: '/' })
  cookies.delete('refresh-token', { path: '/' })
  cookies.delete('user', { path: '/' })

  return new Response (null, { status: 204 })
}