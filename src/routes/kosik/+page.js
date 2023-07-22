/* import client from '../../lib/sanityClient'

export async function load() {
	try {		
	const data = await client.fetch('*[_type == "order"] | order(_createdAt desc) [0]')
	console.log(data);
		if (data) {			
			return {
				orders: data
				
			}
		}
		throw new Error('No order data found.')
	} catch (error) {
		console.error('Error:', error.message)
		return {
			status: 500,
			body: new Error('Internal Server Error')
		}
	}
}
 */