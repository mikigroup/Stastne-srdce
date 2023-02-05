import client from "../sanityClient"; 

let currentDate = new Date();

let toDate = new Date(currentDate);
	toDate.setDate(currentDate.getDate() + 10);


 export async function GET() {  
  const data = await client.fetch(`*[_type == "menu" && releaseDate > "${currentDate.toISOString()}" && releaseDate < "${toDate.toISOString()}"] | order(releaseDate) { _id, title, _createdAt, _type, description, content, price, releaseDate, quantity }`);
  // const data2 = await client.fetch(`*[_type == "menu"] { title }`); //testík
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





