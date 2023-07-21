import client from '../../lib/sanityClient'

export async function load() {
	const data = await client.fetch(`*[_type == "order"] | order(releaseDate) { _id }`)

	if (data) {
		return {
			menus: data
		}
	}
	return {
		status: 500,
		body: new Error('Internal Server Error')
	}
}


