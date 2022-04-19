import { Autocomplete, Box, Popover, styled, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useTribe } from '../../../../pages/tribe/[id]';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { roleMapping } from '../../../constants';
import { useMoralisFunction } from '../../../hooks/useMoralisFunction';
import { roleOptions } from '../inviteMemberModal/constants';

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: () => void;
  member: any;
  roles: any;
};

// @ts-ignore
const PopoverContainer = styled(Box)(({ theme }) => ({
  width: '14rem',
  backgroundColor: theme.palette.primary.main,
  boxShadow: 24,
  overflow: 'auto',
  padding: '4px 8px',
  display: 'flex',
  flexDirection: 'column',
}));

function MemberPopover({ open, anchorEl, handleClose, member, roles }: Props) {
  const [role, setRole] = useState<any>();
  const { runMoralisFunction } = useMoralisFunction();
  const { tribe, setTribe } = useTribe();
  const { space, setSpace } = useSpace();
  const { user } = useMoralis();
  useEffect(() => {
    setRole({
      name: roleMapping[member.role as number],
      role: member.role,
    });
  }, [member]);

  return (
    <Popover
      open
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
    >
      <PopoverContainer>
        <Autocomplete
          options={roleOptions}
          getOptionLabel={(option) => option.name}
          value={role}
          disabled={user?.id === member.id || roles[user?.id as string] !== 3}
          onChange={(event, newValue) => {
            setRole(newValue);
            if (space) {
              runMoralisFunction('changeSpaceRole', {
                boardId: space.objectId,
                userId: member.id,
                role: newValue.role,
              })
                .then((res) => {
                  console.log(res);
                  setSpace(res);
                  handleClose();
                })
                .catch((err) => {
                  console.log(err);
                  handleClose();
                });
            } else {
              runMoralisFunction('changeTribeRole', {
                teamId: tribe.teamId,
                userId: member.id,
                role: newValue.role,
              })
                .then((res) => {
                  console.log(res);
                  setTribe(res);
                  handleClose();
                })
                .catch((err) => {
                  console.log(err);
                  handleClose();
                });
            }
          }}
          fullWidth
          placeholder="Role"
          size="small"
          disableClearable
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              color="secondary"
              placeholder="Role"
            />
          )}
          sx={{ my: 2 }}
        />
      </PopoverContainer>
    </Popover>
  );
}

export default MemberPopover;
