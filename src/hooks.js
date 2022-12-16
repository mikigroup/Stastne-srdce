import * as cookie from 'cookie';
import client from "./sanityClient"; 

export const handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	event.locals.userid = cookies['userid'] || crypto.randomUUID();

	const response = await resolve(event);

	if (!cookies['userid']) {
		// if this is the first time the user has visited this app,
		// set a cookie so that we recognise them when they return
		response.headers.set(
			'set-cookie',
			cookie.serialize('userid', event.locals.userid, {
				path: '/',
				httpOnly: true
			})
		);
	}

	return response;
};

export async function GET() {    
     const dataOrder = await client.fetch(`*[_type == "order"] | order(_createdAt desc)[0] { order_number }`);      
  if (dataOrder) {
    return {
      status: 200,
      body: {        
        dataOrder: dataOrder,      
      }
    };
  }
  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}
