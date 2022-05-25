import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Button, Grid, styled } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useTribe } from '../../../../pages/tribe/[id]';
import { BoardData } from '../../../types';
import DiscordIntegrationModal from '../discordIntegrationModal';
import CreateBoard from './createBoard';

type Props = {};

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  marginTop: 8,
}));

export const CreateBoardButton = styled(Button)(({ theme }) => ({
  height: '8rem',
  width: '100%',
  borderRadius: 8,
  padding: 2,
  backgroundColor: '#5a6972',
  textTransform: 'none',
  display: 'flex',
  flexDirection: 'column',
}));

export const BoardButton = styled(Button)(({ theme }) => ({
  height: '8rem',
  width: '100%',
  borderRadius: 8,
  padding: 2,
  textTransform: 'none',
  display: 'flex',
  flexDirection: 'column',
}));

const ButtonText = styled('div')(({ theme }) => ({
  fontWeight: 500,
  fontSize: 16,
  color: '#fff',
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
}));

function Board(props: Props) {
  const router = useRouter();
  const { tribe } = useTribe();
  const { user } = useMoralis();
  const [isOpen, setIsOpen] = useState(false);
  const [discordModalOpen, setDiscordModalOpen] = useState(false);
  const handleDiscordModalClose = () => {
    setDiscordModalOpen(false);
  };
  const handleClose = () => setIsOpen(false);
  return (
    <Container>
      <DiscordIntegrationModal
        isOpen={discordModalOpen}
        handleClose={handleDiscordModalClose}
        user
      />
      {isOpen && <CreateBoard isOpen={isOpen} handleClose={handleClose} />}
      {/* {!tribe?.boards?.length && !(user && tribe.members.includes(user?.id)) && (
        <Typography variant="h6" color="text.primary" sx={{ width: "100%" }}>
          No spaces found
        </Typography>
      )} */}
      <Grid container spacing={2}>
        {tribe?.boards?.map((board: BoardData) => (
          <Grid item lg={3} md={4} sm={5} xs={6} key={board._id}>
            <BoardButton
              data-testid={`space-${board._id}`}
              variant="contained"
              onClick={() => {
                router.push(
                  `/tribe/${tribe.teamId}/space/${board._id}`,
                  undefined
                );
              }}
            >
              <ButtonText>{board.name}</ButtonText>
            </BoardButton>
          </Grid>
        ))}

        <Grid item lg={3} md={4} sm={5} xs={6}>
          {user && tribe.roles[user.id] === 3 && (
            <CreateBoardButton
              id="bCreateBoardButton"
              variant="outlined"
              onClick={() => {
                setIsOpen(true);
              }}
              color="secondary"
            >
              <ButtonText>Create new space</ButtonText>
              <AddCircleOutlineIcon sx={{ color: '#eaeaea' }} />
            </CreateBoardButton>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default Board;
