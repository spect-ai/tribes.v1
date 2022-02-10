import React from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import GitHubLogin from "react-github-login";
import { getGithubToken, endEpoch } from "../../../adapters/moralis";
import { PrimaryButton } from "../styledComponents";

type Props = {};

const GithubLoginButton = (props: Props) => {
  return (
    <GitHubLogin
      clientId="4403e769e4d52b24eeab"
      scope="repo"
      buttonText=""
      className="githubButton"
      // onSuccess={(res: any) => {
      //   console.log(res);
      //   getGithubToken(Moralis, res.code)
      //     .then((token: string) => {
      //       console.log(token);
      //       const accessToken = token.substring(
      //         token.indexOf("=") + 1,
      //         token.lastIndexOf("&scope")
      //       );
      //       setGithubToken(accessToken);
      //       setGithubLoading(false);
      //     })
      //     .catch((err: any) => {
      //       console.log(err);
      //       setGithubLoading(false);
      //     });
      // }}
      onFailure={(err: any) => console.log(err)}
      // onclick={() => setGithubLoading(true)}
      redirectUri="http://localhost:3000/"
    >
      <PrimaryButton
        variant="outlined"
        size="large"
        type="submit"
        endIcon={<GitHubIcon />}
        onClick={() => {}}
        sx={{ ml: 3 }}
      >
        Integrate Github
      </PrimaryButton>
    </GitHubLogin>
  );
};

export default GithubLoginButton;
