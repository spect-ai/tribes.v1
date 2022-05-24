import { Close } from '@mui/icons-material';
import {
  Box,
  Grow,
  IconButton,
  Modal,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { Column } from '../../../types';
import { uid } from '../../../utils/utils';
import { ModalHeading, PrimaryButton } from '../../elements/styledComponents';
import { notify } from '../settingsTab';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  top: '10%',
  left: '25%',
  transform: 'translate(-50%, -50%)',
  width: '35rem',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
}));

const ModalContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 32,
}));

function TrelloImport({ isOpen, handleClose }: Props) {
  const [trelloBoardId, setTrelloBoardId] = useState('');
  const [columnMap, setColumnMap] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [trelloBoard, setTrelloBoard] = useState<any>({} as any);
  const [trelloTasks, setTrelloTasks] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const { space, setSpace } = useSpace();

  const { runMoralisFunction } = useMoralisFunction();

  return (
    <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
      <Grow in={isOpen} timeout={500}>
        <ModalContainer>
          <ModalHeading>
            <Typography sx={{ color: '#99ccff' }}>
              Import from trello
            </Typography>
            <Box sx={{ flex: '1 1 auto' }} />
            <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
              <Close />
            </IconButton>
          </ModalHeading>
          <ModalContent>
            <Box sx={{ display: 'flex' }}>
              <TextField
                placeholder="Trello Board Id"
                size="small"
                value={trelloBoardId}
                onChange={(event) => {
                  setTrelloBoardId(event.target.value);
                }}
                fullWidth
                color="secondary"
              />
              <PrimaryButton
                variant="outlined"
                size="small"
                color="secondary"
                fullWidth
                loading={isFetching}
                sx={{ borderRadius: 1, mx: 4, width: '50%' }}
                onClick={async () => {
                  setIsFetching(true);
                  try {
                    const board = await fetch(
                      `https://api.trello.com/1/boards/${trelloBoardId}`
                    );
                    const boardJson = await board.json();
                    const columns = await fetch(
                      `https://api.trello.com/1/boards/${trelloBoardId}/lists`
                    );

                    const columnsJson = await columns.json();
                    const cards = await fetch(
                      `https://api.trello.com/1/boards/${trelloBoardId}/cards`
                    );

                    const cardsJson = await cards.json();
                    const aColumnOrder = columnsJson.map(
                      (column: any) => column.id
                    );
                    const aColumnMap: {
                      [key: string]: Column;
                    } = {};
                    columnsJson.map((column: any) => {
                      aColumnMap[column.id] = {
                        id: column.id,
                        title: column.name,
                        taskIds: [],
                        cardType: 1,
                        createCard: { 0: false, 1: false, 2: true, 3: true },
                        moveCard: { 0: false, 1: false, 2: true, 3: true },
                      };
                      return null;
                    });
                    cardsJson.map((card: any) => {
                      aColumnMap[card.idList as string].taskIds.push(
                        space.objectId + card.id
                      );
                      return null;
                    });
                    const tasks = cardsJson.map((task: any) => {
                      return {
                        id: space.objectId + task.id,
                        title: task.name,
                        description: [
                          {
                            id: uid(),
                            html: task.desc,
                            tag: 'p',
                            type: '',
                            imageUrl: '',
                            embedUrl: '',
                          },
                        ],
                        columnId: task.idList,
                        value: 0,
                        tags: task.labels.map((label: any) => label.name),
                        deadline: task.due,
                      };
                    });
                    console.log({ tasks });
                    notify('Board Fetched you can now import');
                    setColumnOrder(aColumnOrder);
                    setColumnMap(aColumnMap);
                    setTrelloBoard(boardJson);
                    setTrelloTasks(tasks);
                    setIsFetching(false);
                  } catch (e) {
                    console.log(e);
                    setIsFetching(false);
                    notify('Error fetching trello board', 'error');
                  }
                }}
              >
                Fetch
              </PrimaryButton>
            </Box>
            <Typography color="secondary" sx={{ my: 3 }}>
              {trelloBoard.name}
            </Typography>
            <PrimaryButton
              variant="outlined"
              sx={{ borderRadius: 1, width: '50%', my: 2 }}
              fullWidth
              color="secondary"
              onClick={() => {
                runMoralisFunction('importTasksFromTrello', {
                  boardId: space.objectId,
                  columnMap,
                  columnOrder,
                  tasks: trelloTasks,
                }).then((res) => {
                  setSpace(res);
                  handleClose();
                });
              }}
            >
              Import
            </PrimaryButton>
          </ModalContent>
        </ModalContainer>
      </Grow>
    </Modal>
  );
}

export default TrelloImport;
