import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import { updateUser, useGlobal } from "../../app/context/globalContext";
import { useDiscord } from "../../app/hooks/useDiscord";
import { useMoralisFunction } from "../../app/hooks/useMoralisFunction";

const RedirectPage: NextPage = () => {
  const { initializeDiscordUser } = useDiscord();
  const { isInitialized } = useMoralis();
  const router = useRouter();
  const { dispatch } = useGlobal();

  useEffect(() => {
    if (isInitialized && router.query.code) {
      console.log("hiiii");
      initializeDiscordUser(router.query.code as string).then((res) => {
        console.log(res);
        updateUser(dispatch, res);
        router.push("/");
      });
    }
  }, [isInitialized, router.query.code]);

  return <div>Redirecting...</div>;
};

export default RedirectPage;
