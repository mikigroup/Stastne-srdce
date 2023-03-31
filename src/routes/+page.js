/* import client from "../sanityClient";

export async function load() {
  const data = await client.fetch(`*[_type == "menu"] | order(_createdAt) { _id, title, _createdAt, _type, description, price, releaseDate }`);
  const data2 = await client.fetch(`*[_type == "menu"] { title }`); //testík


  if (data) {
    return {
      status: 200,
      menu: data,
      title: data2
};
  }
  throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292699)");
  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
} */





