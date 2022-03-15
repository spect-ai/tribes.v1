import { Collapse, useTheme } from "@mui/material";
import React, { useState } from "react";
import { SidebarContainer, SidebarContent } from "../spaceSidebar";

type Props = {};

const TribeSidebar = (props: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { palette } = useTheme();
  const onMouseHover = () => setIsCollapsed(false);
  const onMouseLeave = () => setIsCollapsed(true);
  return (
    <SidebarContainer
      onMouseEnter={onMouseHover}
      onMouseLeave={onMouseLeave}
      palette={palette}
    >
      <Collapse orientation="horizontal" in={!isCollapsed} collapsedSize={50}>
        <SidebarContent>
          <Actions>
            <SidebarButton
              sx={{ mt: 2 }}
              color="inherit"
              onClick={handleClick("viewTribe")}
            >
              <Avatar
                variant="rounded"
                sx={{ p: 0, m: 0, width: 32, height: 32 }}
                src={space.team[0].logo}
              >
                {space.team[0].name && space.team[0].name[0]}
              </Avatar>
              <AvatarText>
                <Typography sx={{ fontSize: 15 }}>
                  {space.team[0].name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: palette.primary.light }}>
                  {space.team[0]?.members?.length} members
                </Typography>
              </AvatarText>
            </SidebarButton>
            <ViewTribePopover
              open={open["viewTribe"]}
              anchorEl={anchorEl}
              handleClose={handleClosePopover}
              type="viewTribe"
            />
          </Actions>
        </SidebarContent>
      </Collapse>
    </SidebarContainer>
  );
};

export default TribeSidebar;
