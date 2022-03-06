import styled from "@emotion/styled";
import { Avatar, Box, Button } from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getMyTeams } from "../../../adapters/moralis";
import CreateTribeModal from "../createTribeModal";

type Props = {};

const Sidebar = (props: Props) => {
  const { Moralis, isInitialized, isAuthenticated } = useMoralis();
  const [myTeams, setMyTeams] = useState([] as any[]);
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      getMyTeams(Moralis).then((res: any) => {
        setMyTeams(res);
      });
    } else {
      setMyTeams([]);
    }
  }, [isInitialized, isAuthenticated]);

  return (
    <SidebarContainer>
      <Box
        sx={{
          px: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          zIndex: 1,
        }}
      >
        {myTeams?.map((team: any, index: number) => (
          <Link key={index} href={`/tribe/${team.get("teamId")}`} passHref>
            <Button sx={{ p: 0 }}>
              <Avatar
                sx={{
                  width: "3rem",
                  height: "3rem",
                  objectFit: "cover",
                  my: 1,
                }}
                src={team.get("logo")}
              >
                {team.get("name")[0]}
              </Avatar>
            </Button>
          </Link>
        ))}
        <CreateTribeModal />
      </Box>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  minheight: 100vh;
  display: flex;
  flex-direction: column;
  width: 4.5rem;
  margin-top: -14rem;
  padding-top: 4rem;
  align-items: center;
  justify-content: center;
  background-color: #00194a;
  z-index: 1; /* Stay on top */
`;

export default Sidebar;
