import client from "../sanityClient";


export async function GET() {
  const data = await client.fetch(`*[_type == "menu"] | order(_createdAt) { _id, title, _createdAt, _type, description, content, price, releaseDate }`);
  const data2 = await client.fetch(`*[_type == "menu"] { title }`); //testík


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