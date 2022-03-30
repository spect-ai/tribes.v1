import styled from "@emotion/styled";
import {
  Box,
  Breadcrumbs,
  styled as MUIStyled,
  Link as MuiLink,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import { joinTribe } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import {
  PrimaryButton,
  StyledTab,
  StyledTabs,
} from "../../elements/styledComponents";
import { useTribe } from "../../../../pages/tribe/[id]";
import { notify } from "../settingsTab";
import { Toaster } from "react-hot-toast";
import Link from "next/link";

type Props = {};

const TribeHeading = (props: Props) => {
  const { tab, handleTabChange, tribe, isMember, setIsMember, loading } =
    useTribe();
  const router = useRouter();
  const id = router.query.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis, user, isAuthenticated, authenticate } = useMoralis();

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          ml: 4,
        }}
      >
        {tribe.github && (
          <StyledAnchor href={tribe.github} target="_blank">
            <i className="fab fa-github" />
          </StyledAnchor>
        )}
        {tribe.discord && (
          <StyledAnchor href={tribe.discord} target="_blank">
            <i className="fab fa-discord"></i>
          </StyledAnchor>
        )}
        {tribe.twitter && (
          <StyledAnchor href={tribe.twitter} target="_blank">
            <i className="fab fa-twitter" />
          </StyledAnchor>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          ml: 4,
        }}
      >
        {/* <Typography variant="h6">{tribe.name}</Typography> */}
        {/* <PrimaryButton
          sx={{ borderRadius: 1, my: 4, mr: 2 }}
          variant="outlined"
          color="secondary"
          endIcon={<PeopleOutlineIcon />}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href).then(
              function () {
                notify("Link copied to clipboard");
              },
              function (err) {
                notify("Error copying link");
              }
            );
          }}
        >
          Invite
        </PrimaryButton> */}
        {/* {!(user && tribe.members?.includes(user?.id)) && (
          <PrimaryButton
            variant="outlined"
            color="secondary"
            loading={isLoading}
            sx={{ borderRadius: 1 }}
            onClick={async () => {
              if (!isAuthenticated) {
                notify("Connect Wallet to join tribe", "error");
                return;
              }
              setIsLoading(true);
              joinTribe(Moralis, id).then((res: boolean) => {
                setIsMember(res);
                if (res) {
                  notify("Joined Tribe Successfully!");
                }
              });
            }}
          >
            Join Tribe
          </PrimaryButton>
        )} */}
      </Box>
    </Container>
  );
};

const StyledAnchor = MUIStyled("a")(({ theme }) => ({
  color: "rgb(90, 105, 114,0.6)",
  marginRight: "0.8rem",
  fontSize: "1.2rem",
  transition: "0.3s ease-in-out",
  "&:hover": {
    color: "rgb(90, 105, 114,1)",
  },
}));

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default TribeHeading;
