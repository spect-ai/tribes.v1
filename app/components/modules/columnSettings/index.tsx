import styled from '@emotion/styled';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControlLabel,
  Grow,
  IconButton,
  Modal,
  styled as MUIStyled,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { BoardData, Column } from '../../../types';
import {
  PrimaryButton,
  StyledAccordian,
} from '../../elements/styledComponents';
import { notify } from '../settingsTab';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  column: Column;
};

// @ts-ignore
const ModalContainer = MUIStyled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  top: '10%',
  left: '25%',
  transform: 'translate(-50%, -50%)',
  width: '50rem',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
}));

const Heading = MUIStyled('div')(({ theme }) => ({
  fontWeight: 500,
  fontSize: 16,
  color: theme.palette.text.secondary,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderBottom: '1px solid #99ccff',
  padding: 16,
  paddingLeft: 32,
}));

const Content = styled.div`
  padding: 2rem;
`;

function ColumnSettings({ isOpen, handleClose, column }: Props) {
  const [name, setName] = useState(column?.title);
  const [createCardRoles, setCreateCardRoles] = useState(column?.createCard);
  const [moveCardRoles, setMoveCardRoles] = useState(column?.moveCard);
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis } = useMoralis();
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  return (
    <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
      <Grow in={isOpen} timeout={500}>
        <ModalContainer>
          <Heading>
            <Typography>Column Settings</Typography>
            <Box sx={{ flex: '1 1 auto' }} />
            <IconButton sx={{ m: 0, p: 1 }} onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Heading>
          <Content>
            <TextField
              placeholder="Column Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <StyledAccordian disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Permissions</Typography>
              </AccordionSummary>

              <AccordionDetails>
                {/* <Typography>Set permissions for this column</Typography> */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ mr: 8, width: '30%' }}>
                    Can create cards
                  </Typography>
                  <FormControlLabel
                    value="end"
                    control={
                      <Checkbox
                        color="default"
                        checked={createCardRoles[0]}
                        onChange={(event) => {
                          setCreateCardRoles({
                            ...createCardRoles,
                            0: event.target.checked,
                          });
                        }}
                      />
                    }
                    label="Anyone"
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value="end"
                    control={
                      <Checkbox
                        color="default"
                        checked={createCardRoles[1]}
                        onChange={(event) => {
                          setCreateCardRoles({
                            ...createCardRoles,
                            1: event.target.checked,
                          });
                        }}
                      />
                    }
                    label="Member"
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value="end"
                    control={
                      <Checkbox
                        color="default"
                        checked={createCardRoles[2]}
                        onChange={(event) => {
                          setCreateCardRoles({
                            ...createCardRoles,
                            2: event.target.checked,
                          });
                        }}
                      />
                    }
                    label="Contributor"
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value="end"
                    control={
                      <Checkbox
                        color="default"
                        checked={createCardRoles[3]}
                        onChange={(event) => {
                          setCreateCardRoles({
                            ...createCardRoles,
                            3: event.target.checked,
                          });
                        }}
                      />
                    }
                    label="Steward"
                    labelPlacement="end"
                  />
                </Box>
              </AccordionDetails>
            </StyledAccordian>
            <Box sx={{ display: 'flex' }}>
              <PrimaryButton
                variant="outlined"
                color="secondary"
                sx={{ width: '50%', mt: 2, mr: 4, borderRadius: 1 }}
                loading={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  runMoralisFunction('updateColumnPermissions', {
                    boardId: space.objectId,
                    columnId: column.id,
                    createCardRoles,
                    moveCardRoles,
                  })
                    .then((res: BoardData) => {
                      notify('Settings updated');
                      setSpace(res);
                      setIsLoading(false);
                      handleClose();
                    })
                    .catch((err: any) => {
                      setIsLoading(false);
                      console.log(err);
                      notify(err.message);
                    });
                }}
              >
                Save
              </PrimaryButton>
              <PrimaryButton
                variant="outlined"
                color="error"
                sx={{ width: '50%', mt: 2, mr: 4, borderRadius: 1 }}
                onClick={() => {
                  runMoralisFunction('removeColumn', {
                    boardId: space.objectId,
                    columnId: column.id,
                  })
                    .then((res: BoardData) => {
                      setSpace(res);
                    })
                    .catch((err: any) => {
                      console.log(err);
                      notify(err.message, 'error');
                    });
                }}
              >
                Delete
              </PrimaryButton>
            </Box>
          </Content>
        </ModalContainer>
      </Grow>
    </Modal>
  );
}

export default ColumnSettings;
