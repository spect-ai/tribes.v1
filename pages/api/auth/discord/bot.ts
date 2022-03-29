// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(req.query);
  const state = JSON.parse(req.query.state as string);
  console.log(state);
  const r = await fetch(
    `https://pbsxrhv9x6qo.usemoralis.com:2053/server/functions/linkDiscordToSpace?_ApplicationId=cq3uoPVGZeNUgtREjNzcOIxMA132Xsx5IighR4nE&objectId=${state.objectId}&guild_id=${req.query.guild_id}`,
    {
      method: "GET",
    }
  );
  console.log(r);
  res.redirect(state.redirect);
}
