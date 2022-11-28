import {writable} from "svelte/store";
import client from "../sanityClient"; 

/* zde doplnit currentdate, import funkce - loadmenu */

let currentDate = new Date();

let toDate = new Date(currentDate);
	toDate.setDate(currentDate.getDate() + 7);


 export async function GET() {
  /* const data2 = await client.fetch(`*[_type == "menu"] | order(_createdAt) { _id, title, _createdAt, _type, description, price, releaseDate, quantity }`); */
  const data = await client.fetch(`*[_type == "menu" && releaseDate > "${currentDate.toISOString()}" && releaseDate < "${toDate.toISOString()}"] | order(releaseDate) { _id, title, _createdAt, _type, description, price, releaseDate, quantity }`);
  
  if (data) {
    return {
      status: 200,
      body: {
        menu: data,      
      }
    };
  }
  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}

/* export const menu = writable([]); */


/* let { name, price } = item; */





