import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  Divider,
  Palette,
  Tooltip,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useExplore } from "../../../../pages";
import ExploreIcon from "@mui/icons-material/Explore";
import { useRouter } from "next/router";
import CreateTribeModal from "../createTribeModal";
import { getMyTeams } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { notify } from "../settingsTab";

type Props = {};

const ExploreSidebar = (props: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [myTribes, setMyTribes] = useState<any[]>([] as any[]);
  const onMouseHover = () => setIsCollapsed(false);
  const onMouseLeave = () => setIsCollapsed(true);

  const { palette } = useTheme();
  const { Moralis, isInitialized } = useMoralis();

  const router = useRouter();
  const id = router.query.id;

  useEffect(() => {
    if (isInitialized) {
      getMyTeams(Moralis)
        .then((res: any) => {
          setMyTribes(res);
        })
        .catch((err: any) => {
          notify("Error failed to get my tribes");
          console.log(err);
        });
    }
  }, [isInitialized]);

  return (
    <SidebarContainer
      onMouseEnter={onMouseHover}
      onMouseLeave={onMouseLeave}
      palette={palette}
    >
      <Box sx={{ mt: 4 }} />

      <Link href={"/"} passHref>
        <SidebarButton palette={palette} selected={!id}>
          <Tooltip title="Explore" placement="right" arrow sx={{ m: 0, p: 0 }}>
            <ExploreIcon
              sx={{
                fontSize: 28,
                color: !id ? palette.secondary.main : palette.divider,
              }}
            />
          </Tooltip>
        </SidebarButton>
      </Link>
      <Divider sx={{ my: 5, mx: 3 }} />
      <CreateTribeModal />
      {myTribes?.map((tribe, index) => (
        <Link key={index} href={`/tribe/${tribe.get("teamId")}`} passHref>
          <SidebarButton
            palette={palette}
            selected={tribe.get("teamId") === id}
          >
            <Avatar
              variant="rounded"
              sx={{ p: 0, m: 0, width: 28, height: 28 }}
              src={tribe.get("logo")}
            >
              {tribe.get("name")[0]}
            </Avatar>
          </SidebarButton>
        </Link>
      ))}
    </SidebarContainer>
  );
};

export const SidebarButton = styled.div<{
  palette: Palette;
  selected: boolean;
}>`
  &:hover {
    color: ${(props) => props.palette.secondary.main};
    border-left: 2px solid ${(props) => props.palette.secondary.main};
  }
  transition: all 0.5s ease-in-out;
  cursor: pointer;
  padding: 0rem 1rem;
  border-left: 2px solid
    ${(props) =>
      props.selected ? props.palette.secondary.main : "transparent"};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 8px 0px;
`;

const SidebarContainer = styled.div<{ palette: Palette }>`
  background-color: ${(props) => props.palette.primary.main};
  transition: 0.5s;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 56px);
  width: 3rem;
`;

export const ButtonText = styled.div`
  overflow: hidden;
  height: 20px;
  width: 86%;
  transition: 0.5s;
  text-transform: none;
`;

export default ExploreSidebar;
