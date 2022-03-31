// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const access_token = req.query.access_token as string;
  const guild = req.query.guild as string;
  console.log({ access_token, guild });
  const userRoleResult = await fetch(
    `https://discord.com/api/users/@me/guilds/${guild}/member`,
    {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    }
  );
  const userData = await userRoleResult.json();
  console.log(userData);
  // const r = await fetch(
  //   `https://pbsxrhv9x6qo.usemoralis.com:2053/server/functions/getOrCreateDiscordUser?_ApplicationId=cq3uoPVGZeNUgtREjNzcOIxMA132Xsx5IighR4nE&userId=${userData.id}&refreshToken=${oauthData.refresh_token}&accessToken=${oauthData.access_token}&username=${userData.username}&avatar=${userData.avatar}&email=${userData.email}`,
  //   {
  //     method: "GET",
  //   }
  // );
  // const userInfo = await r.json();
  // console.log(userInfo);

  res.status(200).json({
    // @ts-ignore
    userData: userData,
  });
}
