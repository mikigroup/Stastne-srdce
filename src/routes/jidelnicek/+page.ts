import { error } from "@sveltejs/kit";
import client from "$lib/sanityClient"; 


export async function load() {
	const currentDate = new Date()
	const targetTime = '17:00:00'
	const targetDate = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth(),
		currentDate.getDate(),
		...targetTime.split(':').map(Number)
	)
	
	if (currentDate >= targetDate) {
		currentDate.setDate(currentDate.getDate() + 1)
	}

	try {
		const data = await client.fetch(`
      *[_type == "menu" && releaseDate > "${currentDate.toISOString()}"]
      | order(releaseDate) { _id, title, _createdAt, _type, description, content, price, releaseDate }
    `)

		return {
			menus: data
		}
	} catch (e) {
		console.error('Error fetching data:', e)
		error(500, 'Internal Server Error');
	}
};


