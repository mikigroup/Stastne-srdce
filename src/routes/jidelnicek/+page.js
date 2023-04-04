import { error } from '@sveltejs/kit';
import client from "../sanityClient"; 

 let currentDate = new Date();

let toDate = new Date(currentDate);
	toDate.setDate(currentDate.getDate() + 10);

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
    

export async function load() {
  const data = await client.fetch(`*[_type == "menu" && releaseDate > "${currentDate.toISOString()}" && releaseDate < "${toDate.toISOString()}"] | order(releaseDate) { _id, title, _createdAt, _type, description, content, price, releaseDate, quantity }`)

  if (data) {
    return {
      menus: data
    };
  }
  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}


