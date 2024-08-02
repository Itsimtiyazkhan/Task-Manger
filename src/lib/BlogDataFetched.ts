// "createdAt": "2024-04-30T23:19:48.334Z",
// "name": "Walter Volkman",
// "avatar": "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/191.jpg",
// "body": "Incidunt quidem eos quidem laboriosam neque aspernatur quas. Temporibus praesentium exercitationem laudantium provident omnis ut consectetur. Nam nesciunt ipsum necessitatibus nam sit. Nemo accusamus voluptates accusantium quae amet cumque.",
// "id": "1"

export type BlogDataType = {
  id: string;
  createdAt: string;
  name: string;
  avatar: string;
  body: string;
};
export const BlogData = async () => {
  const res = await fetch("https://66327210c51e14d695647a1b.mockapi.io/post");
  const post: BlogDataType[] = await res.json();
  return post;
};
