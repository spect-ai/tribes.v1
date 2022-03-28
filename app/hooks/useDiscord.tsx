import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { DiscordResult } from "../types";
import { useMoralisFunction } from "./useMoralisFunction";

export function useDiscord() {
  const [profile, setProfile] = useState<DiscordResult>({} as DiscordResult);
  const { isInitialized } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();

  const initializeDiscordUser = async (code: string) => {
    const oauthResult = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: "942494607239958609",
        client_secret: "Flci7Du4jcxDxjucavVmmiTThDxzW7qE",
        code,
        grant_type: "authorization_code",
        redirect_uri: `http://localhost:3000/redirect`,
        scope: "identify",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const oauthData = await oauthResult.json();
    const userResult = await fetch("https://discord.com/api/users/@me", {
      headers: {
        authorization: `${oauthData.token_type} ${oauthData.access_token}`,
      },
    });
    const userData = await userResult.json();
    const res = await runMoralisFunction("getOrCreateDiscordUser", {
      userId: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      email: userData.email,
      access_token: oauthData.access_token,
      refresh_token: oauthData.refresh_token,
    });
    localStorage.setItem("objectId", res.objectId);
    return res;
  };

  const refreshDiscordUser = async (objectId: string) => {
    if (objectId === "undefined") return;
    console.log(objectId);
    const refresh_token = await runMoralisFunction("getRefreshToken", {
      objectId,
    });
    console.log(refresh_token);
    const oauthResult = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: "942494607239958609",
        client_secret: "Flci7Du4jcxDxjucavVmmiTThDxzW7qE",
        grant_type: "refresh_token",
        refresh_token,
        redirect_uri: `http://localhost:3000/redirect`,
        scope: "identify",
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
    const res = await runMoralisFunction("getOrCreateDiscordUser", {
      userId: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      email: userData.email,
      access_token: oauthData.access_token,
      refresh_token: oauthData.refresh_token,
    });
    localStorage.setItem("objectId", res.objectId);
    return res;
  };

  return {
    initializeDiscordUser,
    refreshDiscordUser,
  };
}
