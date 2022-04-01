import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { DiscordResult } from "../types";
import { useMoralisFunction } from "./useMoralisFunction";

export function useDiscord() {
  const [profile, setProfile] = useState<DiscordResult>({} as DiscordResult);
  const { isInitialized } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();

  const linkDiscordUser = async (code: string) => {
    const res = await fetch(`/api/auth/discord/user?code=${code}`, {
      method: "GET",
    });
  };

  const refreshDiscordUser = async (objectId: string) => {
    if (objectId === "undefined") return;
    const refresh_token = await runMoralisFunction("getRefreshToken", {
      objectId,
    });
    console.log(refresh_token);
    const oauthResult = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: "942494607239958609",
        client_secret: "hDFeUWJfa4nEQJpNzhYZdvq60rLEWl4F",
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

  const getUserGuildRole = async (objectId: string, guild: string) => {
    const access_token = await runMoralisFunction("getAccessToken", {
      objectId,
    });
    const userGuildsResult = await fetch(
      `https://discord.com/api/users/@me/guilds/${guild}/member`,
      {
        headers: {
          authorization: `access_token ${access_token}`,
        },
      }
    );
    const userGuilds = await userGuildsResult.json();
    return userGuilds;
  };

  return {
    linkDiscordUser,
    refreshDiscordUser,
    getUserGuildRole,
  };
}