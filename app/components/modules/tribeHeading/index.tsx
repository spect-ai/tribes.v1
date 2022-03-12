import styled from "@emotion/styled";
import { Box, styled as MUIStyled } from "@mui/material";
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
      <Toaster />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          ml: 4,
        }}
      >
        {/* <Typography variant="h6">{tribe.name}</Typography> */}
        <PrimaryButton
          sx={{ borderRadius: 1, mr: 4 }}
          variant="outlined"
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
        </PrimaryButton>
        {!(user && tribe.members.includes(user?.id)) && (
          <PrimaryButton
            variant="outlined"
            loading={isLoading}
            disabled={!isAuthenticated}
            sx={{ borderRadius: 1 }}
            onClick={async () => {
              if (!isAuthenticated) {
                await authenticate();
              }
              setIsLoading(true);
              joinTribe(Moralis, parseInt(id)).then((res: boolean) => {
                setIsMember(res);
                if (res) {
                  notify("Joined Tribe Successfully!");
                }
              });
            }}
          >
            Join Tribe
          </PrimaryButton>
        )}
      </Box>
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
      <StyledTabs value={tab} onChange={handleTabChange}>
        <StyledTab label="Overview" />
        <StyledTab
          label="Settings"
          disabled={user ? tribe.roles[user?.id] !== "admin" : true}
        />
      </StyledTabs>
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
