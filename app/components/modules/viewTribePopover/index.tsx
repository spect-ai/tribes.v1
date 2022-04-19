import { Avatar, Popover, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useMoralisFunction } from '../../../hooks/useMoralisFunction';
import { OptionsButton, SidebarPopoverContainer } from '../themePopover';

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  type: string;
};

function ViewTribePopover({ open, anchorEl, handleClose, type }: Props) {
  const { palette } = useTheme();
  const [teams, setTeams] = useState([]);
  const { runMoralisFunction } = useMoralisFunction();

  useEffect(() => {
    runMoralisFunction('getMyTeams', {}).then((res: any) => {
      setTeams(res);
    });
  }, []);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <SidebarPopoverContainer palette={palette}>
        {teams.map((team: any, index) => (
          <Link
            key={team.get('teamId')}
            href={`/tribe/${team.get('teamId')}`}
            passHref
          >
            <OptionsButton
              color="inherit"
              onClick={() => {
                handleClose(type);
              }}
            >
              <Avatar
                variant="rounded"
                sx={{ p: 0, m: 0, width: 32, height: 32 }}
                src={team.get('logo')?._url}
              />
              <Typography fontSize={14} sx={{ width: '70%' }}>
                {team.get('name')}
              </Typography>
            </OptionsButton>
          </Link>
        ))}
      </SidebarPopoverContainer>
    </Popover>
  );
}

export default ViewTribePopover;
