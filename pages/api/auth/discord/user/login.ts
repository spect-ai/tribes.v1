// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(req.query.code);
  const oauthResult = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: "942494607239958609",
      client_secret: "KlYQynvlUWjfWVlvh0BI8zfqrivf4CtC",
      code: req.query.code as string,
      grant_type: "authorization_code",
      redirect_uri: `https://dev.spect.network/`,
      scope: "identify guilds",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const oauthData = await oauthResult.json();
  console.log(oauthData);
  const userResult = await fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${oauthData.token_type} ${oauthData.access_token}`,
    },
  });
  const userData = await userResult.json();
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
    oauthData: oauthData,
  });
}
