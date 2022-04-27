import CloseIcon from '@mui/icons-material/Close';
import styled from '@emotion/styled';
import {
  Box,
  IconButton,
  InputBase,
  Fade,
  Modal,
  Typography,
  styled as muiStyled,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PaidIcon from '@mui/icons-material/Paid';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LabelIcon from '@mui/icons-material/Label';
import { useMoralis } from 'react-moralis';
import React, { useEffect, useState } from 'react';
import { Chain, Token, Column, Registry } from '../../../types';
import {
  uid,
  getFlattenedCurrencies,
  getFlattenedNetworks,
  getDateDisplay,
} from '../../../utils/utils';
import Editor from '../editor';
import CommonPopover from '../../elements/popover';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useProfileInfo from '../../../hooks/useProfileInfo';
import { useGlobal } from '../../../context/globalContext';
import { labelsMapping } from '../../../constants';
import { CardButton } from '../../elements/styledComponents';
import useCardCreate from '../../../hooks/useCardCreate';
import ConfirmModal from '../../elements/confirmModal';

// @ts-ignore
const ModalContainer = muiStyled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '55rem',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflowY: 'auto',
  overflowX: 'hidden',
  height: '25rem',
  padding: '1.5rem 3rem',
}));

const TaskModalTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const TaskModalBodyContainer = styled.div`
  margin-top: 2px;
  color: #eaeaea;
  font-size: 0.85rem;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  column: Column;
};

function CreateCard({ isOpen, handleClose, column }: Props) {
  const { user } = useMoralis();
  const { createCard } = useCardCreate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState([]);
  const [labels, setLabels] = useState([] as string[]);
  const [assignee, setAssignee] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [columnId, setColumnId] = useState(column.id);
  const [type, setType] = useState('Task');
  const [chain, setChain] = useState({} as Chain);
  const [token, setToken] = useState({} as Token);
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { space } = useSpace();
  const {
    state: { registry },
  } = useGlobal();
  const { getAvatar } = useProfileInfo();

  const confirmClose = () => {
    console.log('confirm close');
    setConfirmOpen(false);
  };

  const updateChain = (newValue: Chain) => {
    setChain(newValue as Chain);
    const tokens = getFlattenedCurrencies(
      registry as Registry,
      newValue?.chainId as string
    );
    if (tokens.length > 0) setToken(tokens[0]);
    else setToken({} as Token);
  };

  const validateAndHandleClose = () => {
    if (
      (title && title !== '') ||
      description.length > 0 ||
      labels.length > 0
    ) {
      setConfirmOpen(true);
    } else {
      handleClose();
    }
  };

  useEffect(() => {
    if (user) {
      setReviewer(user.id);
    }
    updateChain({ chainId: '137', name: 'polygon' });
    setValue('0');
    setTitle('');
    setDescription([]);
    setLabels([]);
    setAssignee('');
    setDate('');
  }, [isOpen]);

  return (
    <>
      <Modal open={isOpen}>
        <Fade in={isOpen}>
          <ModalContainer id="cardModal">
            <Container>
              <TaskModalTitleContainer>
                <InputBase
                  data-testid="iTaskTitle"
                  placeholder="Add Card Title..."
                  sx={{
                    fontSize: '20px',
                    ml: 1,
                  }}
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Box sx={{ flex: '1 1 auto' }} />

                <IconButton
                  sx={{ m: 0, px: 2 }}
                  onClick={validateAndHandleClose}
                >
                  <CloseIcon />
                </IconButton>
              </TaskModalTitleContainer>
              <Box
                sx={{ width: 'fit-content', display: 'flex', flexWrap: 'wrap' }}
              >
                <CommonPopover
                  buttonText={type}
                  popoverContent={[
                    {
                      fieldType: 'autocomplete',
                      options: ['Task', 'Bounty'],
                      currOption: type,
                      setCurrOption: setType,
                    },
                  ]}
                />
                <CommonPopover
                  buttonText={space.columns[columnId].title}
                  popoverContent={[
                    {
                      fieldType: 'autocomplete',
                      options: space.columnOrder,
                      currOption: columnId,
                      setCurrOption: setColumnId,
                      optionLabels: (option: any) =>
                        space.columns[option].title,
                    },
                  ]}
                />
              </Box>

              <Box
                sx={{ display: 'flex', flexWrap: 'wrap', marginBottom: '16px' }}
              >
                <CommonPopover
                  label="Reviewer"
                  buttonText={
                    space.memberDetails[reviewer]?.username || 'No reviewer'
                  }
                  buttonsx={{
                    padding: '6px',
                    minWidth: '3rem',
                  }}
                  avatarSrc={getAvatar(space.memberDetails[reviewer])}
                  avatarDefault={<PersonIcon sx={{ color: 'text.primary' }} />}
                  popoverContent={[
                    {
                      fieldType: 'autocomplete',
                      options: space.members,
                      currOption: reviewer,
                      setCurrOption: setReviewer,
                      optionLabels: (option: any) =>
                        space.memberDetails[option].username,
                    },
                  ]}
                />
                <CommonPopover
                  label="Assignee"
                  buttonText={
                    space.memberDetails[assignee]
                      ? space.memberDetails[assignee].username
                      : 'Unassigned'
                  }
                  buttonsx={{
                    padding: '6px',
                    minWidth: '3rem',
                  }}
                  avatarSrc={
                    space.memberDetails[assignee]
                      ? getAvatar(space.memberDetails[assignee])
                      : null
                  }
                  avatarDefault={<PersonIcon sx={{ color: 'text.primary' }} />}
                  popoverContent={[
                    {
                      fieldType: 'autocomplete',
                      options: space.members,
                      currOption: assignee,
                      setCurrOption: setAssignee,
                      optionLabels: (option: any) =>
                        space.memberDetails[option]?.username || 'Unassigned',
                    },
                  ]}
                />
                <CommonPopover
                  label="Reward"
                  buttonText={
                    parseFloat(value) > 0
                      ? `${value} ${token?.symbol}`
                      : 'No reward'
                  }
                  buttonsx={{
                    padding: '6px',
                    minWidth: '3rem',
                  }}
                  avatarDefault={<PaidIcon sx={{ color: 'text.primary' }} />}
                  popoverContent={[
                    {
                      fieldType: 'autocomplete',
                      options: getFlattenedNetworks(registry as Registry),
                      currOption: chain,
                      setCurrOption: updateChain,
                      sx: { mb: 3 },
                      optionLabels: (option: any) => option.name,
                      closeOnSelect: false,
                    },
                    {
                      fieldType: 'autocomplete',
                      options: getFlattenedCurrencies(
                        registry as Registry,
                        chain?.chainId
                      ),
                      currOption: token,
                      setCurrOption: setToken,
                      sx: { mb: 3 },
                      optionLabels: (option: any) => option.symbol,
                      closeOnSelect: false,
                    },
                    {
                      fieldType: 'textfield',
                      id: 'filled-hidden-label-normal',
                      placeholder: 'Value',
                      type: 'number',
                      value: parseFloat(value),
                      handleChange: setValue,
                    },
                  ]}
                />
                <CommonPopover
                  label="Due Date"
                  buttonText={date ? getDateDisplay(date) : 'No deadline'}
                  buttonsx={{
                    padding: '6px',
                    minWidth: '3rem',
                  }}
                  avatarDefault={
                    <DateRangeIcon sx={{ color: 'text.primary' }} />
                  }
                  popoverContent={[
                    {
                      fieldType: 'textfield',
                      id: 'datetime-local',
                      type: 'datetime-local',
                      value: date,
                      handleChange: setDate,
                      label: 'Due Date',
                    },
                  ]}
                />
                <CommonPopover
                  label="Labels"
                  buttonText={
                    labels.length > 0 ? `#${labels.join('  #')}` : 'No labels'
                  }
                  buttonsx={{
                    padding: '6px',
                    minWidth: '3rem',
                  }}
                  popoverContent={[
                    {
                      fieldType: 'autocomplete',
                      options: Object.keys(labelsMapping),
                      value: labels,
                      currOption: labels,
                      setCurrOption: setLabels,
                      multiple: true,
                      closeOnSelect: false,
                    },
                  ]}
                  avatarDefault={<LabelIcon sx={{ color: 'text.primary' }} />}
                />
              </Box>

              <TaskModalBodyContainer>
                <Box sx={{ width: '100%' }}>
                  <Editor
                    syncBlocksToMoralis={setDescription}
                    initialBlock={[
                      {
                        id: uid(),
                        html: '',
                        tag: 'p',
                        type: '',
                        imageUrl: '',
                        embedUrl: '',
                      },
                    ]}
                    placeholderText={`Add details, press "/" for commands`}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'end',
                    justifyContent: 'end',
                  }}
                >
                  <CardButton
                    data-testid="bCreateTask"
                    variant="outlined"
                    onClick={() =>
                      createCard(
                        space.objectId,
                        title,
                        description,
                        type,
                        labels,
                        date,
                        chain,
                        token,
                        value,
                        assignee,
                        reviewer,
                        columnId,
                        handleClose
                      )
                    }
                    color="secondary"
                    sx={{
                      padding: '2px',
                      minWidth: '3rem',
                      height: '2rem',
                      width: '7rem',
                    }}
                    size="large"
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                      }}
                    >
                      Create Card
                    </Typography>
                  </CardButton>
                </Box>
              </TaskModalBodyContainer>
            </Container>
          </ModalContainer>
        </Fade>
      </Modal>
      <ConfirmModal
        isOpen={confirmOpen}
        handleClose={confirmClose}
        buttonText="Yes, close card"
        runOnConfirm={handleClose}
        modalContent="You have unsaved changes. Are you sure you want to close card?"
      />
    </>
  );
}

export default CreateCard;
