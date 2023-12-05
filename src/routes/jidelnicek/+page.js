import { error } from '@sveltejs/kit';
import client from "$lib/sanityClient"; 

export async function load() {
	const currentDate = new Date()
	const targetTime = '17:00:00' // Set your target time
	const targetDate = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth(),
		currentDate.getDate(),
		...targetTime.split(':').map(Number)
	)

	// If current time is after the target time, move to the next day
	if (currentDate >= targetDate) {
		currentDate.setDate(currentDate.getDate() + 1)
	}

	try {
		const data = await client.fetch(`
      *[_type == "menu" && releaseDate > "${currentDate.toISOString()}"]
      | order(releaseDate) { _id, title, _createdAt, _type, description, content, price, releaseDate, quantity }
    `)

		return {
			menus: data
		}
	} catch (e) {
		console.error('Error fetching data:', e)
		throw error(500, 'Internal Server Error')
	}
}


 /* export async function load() {  
  const data = await client.fetch(`*[_type == "menu" && releaseDate > "${currentDate.toISOString()}" && releaseDate < "${toDate.toISOString()}"] | order(releaseDate) { _id, title, _createdAt, _type, description, price, releaseDate, quantity }`);

  if (data) {
    return {
      menus: data
    };
  }
   throw error(404, 'Not found');  
};
 */
/* let currentDate = new Date();

let toDate = new Date(currentDate);
toDate.setDate(currentDate.getDate() + 10);

export async function load() {
  const data = await client.fetch(`*[_type == "menu" && releaseDate > "${currentDate.toISOString()}" && releaseDate < "${toDate.toISOString()}"] | order(releaseDate) { _id, title, _createdAt, _type, description, content, price, releaseDate, quantity }`)
		return  { 
      pets: data 
    }		
	}; */

/*   export const load = () => {
  let propName = "arbitrary data"
  return {
    // remove the props object 
    propName
  }
} */
   

