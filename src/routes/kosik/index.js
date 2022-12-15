import client from "../sanityClient"; 

export async function GET() {    
     const dataOrder = await client.fetch(`*[_type == "order"] | order(_createdAt desc)[0] { order_number }`);      
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