import styled from "@emotion/styled";
import { Avatar, Box, Collapse, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import { useExplore } from "../../../../pages";
import SidebarProfile from "../../elements/sidebarProfile";
import { SidebarButton } from "../../elements/styledComponents";
import CreateTribeModal from "../createTribeModal";
import { Actions, SidebarContainer, SidebarContent } from "../spaceSidebar";

type Props = {};

const ExploreSidebar = (props: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const onMouseHover = () => setIsCollapsed(false);
  const onMouseLeave = () => setIsCollapsed(true);

  const { myTribes } = useExplore();
  const { palette } = useTheme();
  return (
    <SidebarContainer
      onMouseEnter={onMouseHover}
      onMouseLeave={onMouseLeave}
      palette={palette}
    >
      <Collapse orientation="horizontal" in={!isCollapsed} collapsedSize={50}>
        <SidebarContent>
          <Box sx={{ pt: 0.5 }}>
            <Actions>
              <CreateTribeModal />
              {myTribes?.map((team: any, index: number) => (
                <Link
                  key={index}
                  href={`/tribe/${team.get("teamId")}`}
                  passHref
                >
                  <SidebarButton sx={{ mt: 2 }} color="inherit">
                    <Avatar
                      variant="rounded"
                      sx={{ p: 0, m: 0, width: 32, height: 32 }}
                      src={team.get("logo")}
                    >
                      {team.get("name")[0]}
                    </Avatar>
                    <AvatarText>
                      <Typography sx={{ fontSize: 15 }}>
                        {team.get("name")}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 12, color: palette.primary.light }}
                      >
                        {team.get("members").length} members
                      </Typography>
                    </AvatarText>
                  </SidebarButton>
                </Link>
              ))}
            </Actions>
            <SidebarProfile />
          </Box>
        </SidebarContent>
      </Collapse>
    </SidebarContainer>
  );
};

const AvatarText = styled.div`
  overflow: hidden;
  height: 40px;
  width: 100%;
  transition: 0.5s;
  text-transform: none;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default ExploreSidebar;
