import client from "../sanityClient"; 

export async function GET() {    
     const dataOrder = await client.fetch(`*[_type == "order"] { order_number }`);
      const dataOrder2 = await client.fetch(`*[_type == "movie"][0...10]{title}`);
 /*  const dataOrder = await client.fetch(`*[_type == "order"] | order(_createdAt desc) { order_number }`); */
  /* const data = await client.fetch(`*[_type == "menu"] | order(releaseDate) { _id, title, _createdAt, _type, description, price, releaseDate, quantity }`); */
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