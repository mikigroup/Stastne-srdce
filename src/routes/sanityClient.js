import sanityClient from "@sanity/client";

const client = sanityClient({
    projectId: "gdle0r99",
    dataset: "production",
    apiVersion: "2021-10-21",
    useCdn: true,
  });

export default client;