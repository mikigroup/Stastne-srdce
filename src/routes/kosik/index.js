import client from "../sanityClient"; 

let currentDate = new Date();
let toDate = new Date(currentDate);
	toDate.setDate(currentDate.getDate() + 7);


export async function GET() {  
  const data = await client.fetch(`*[_type == "menu" && releaseDate > "${currentDate.toISOString()}" && releaseDate < "${toDate.toISOString()}"] | order(releaseDate) { _id, title, _createdAt, _type, description, price, releaseDate, quantity }`);
  const dataOrder = await client.fetch(`*[_type == "order"] { order_number }`);
  
  if (data) {
    return {
      status: 200,
      body: {
        menu: data,
        dataOrder: dataOrder,      
      }
    };
  }
  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}


/* export async function GET() {    
  const dataOrder = client.fetch(`*[_type == "order"] { order_number }`);

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
} */
