import sanityClient from "@sanity/client";

const client = sanityClient({
    projectId: "gdle0r99",
    dataset: "production",
    apiVersion: "2021-10-21",
<<<<<<< HEAD
    token: 'skSiAHmOOniITWMheMz077OTBnAeoOVFgim8TIHfZmgUyJMLsJ8CVd9NHjQOfsJgB6RW4qB8TTfiEF54ogepVkgXkAnOM37lro1KKbQBiAaPcsa8GP4KAjtX3YM8xEP3UllOXhul3D51CCfEMcXP19Ryeu0zcUS9lMHTr3ddSVpsN4jOuNOy',    
    useCdn: true,
=======
    useCdn: false,
>>>>>>> parent of 66f1e7ac2 (1)
  });

export default client;