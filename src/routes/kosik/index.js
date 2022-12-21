import client from "../sanityClient"; 

export async function GET() {    
    const dataOrder = await client.fetch(`*[_type == "order"] | order(_createdAt desc)[0] { orderNumber }`);
    const dataOrder2 = await client.fetch(`*[_type == 'order']{"order": count(_type)}`);
    const dataOrder3 = await client.fetch(`*[_type == "order"] { orderNumber }  `);     
  if (dataOrder) {
    return {
      status: 200,
      body: {        
        dataOrder: dataOrder,      
        dataOrder2: dataOrder2,
        dataOrder3: dataOrder3,
      }
    };
  }
  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}
// Returns number of elements in array 'actors' on each movie
// *[_type == 'movie']{"actorCount": count(actors)} 

// Returns number of R-rated movies
// count(*[_type == 'movie' && rating == 'R']) 