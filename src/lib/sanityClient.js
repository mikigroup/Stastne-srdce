import sanityClient from "@sanity/client";
import { env } from '$env/dynamic/public';

const client = sanityClient({
    projectId: "gdle0r99",
    dataset: "production",
    apiVersion: "2021-10-21",
    token: env.PUBLIC_SANITY_TOKEN,
    useCdn: true,
  });

export default client;