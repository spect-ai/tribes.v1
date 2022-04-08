import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";

type Props = {};

export const useProfileInfo = () => {
  const { user, isAuthenticated } = useMoralis();
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      setAvatar(
        user?.get("profilePicture")
          ? user.get("profilePicture")._url
          : `https://cdn.discordapp.com/avatars/${user?.get(
              "discordId"
            )}/${user?.get("avatar")}.png`
      );
    }
  }, [isAuthenticated, user]);

  return {
    avatar,
  };
};
