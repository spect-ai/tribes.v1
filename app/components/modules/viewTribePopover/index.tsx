import { Avatar, Popover, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getMyTeams } from "../../../adapters/moralis";
import { Team } from "../../../types";
import { OptionsButton, SidebarPopoverContainer } from "../themePopover";

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  type: string;
};

const ViewTribePopover = ({ open, anchorEl, handleClose, type }: Props) => {
  const { palette } = useTheme();
  const [teams, setTeams] = useState([]);
  const { Moralis } = useMoralis();

  useEffect(() => {
    getMyTeams(Moralis).then((res: any) => {
      console.log(res);
      setTeams(res);
    });
  }, []);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <SidebarPopoverContainer palette={palette}>
        {teams.map((team: any, index) => (
          <Link key={index} href={`/tribe/${team.get("teamId")}`} passHref>
            <OptionsButton
              color="inherit"
              onClick={() => {
                handleClose(type);
              }}
            >
              <Avatar
                variant="rounded"
                sx={{ p: 0, m: 0, width: 32, height: 32 }}
                src={team.get("logo")?._url}
              />
              <Typography fontSize={14} sx={{ width: "70%" }}>
                {team.get("name")}
              </Typography>
            </OptionsButton>
          </Link>
        ))}
      </SidebarPopoverContainer>
    </Popover>
  );
};

export default ViewTribePopover;
