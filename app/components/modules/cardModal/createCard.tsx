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
  Avatar,
  Tooltip,
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
import MemberInfoDisplay from '../../elements/memberInfoDisplay';
import MemberAvatar from '../../elements/memberAvatar';
import MemberGroupDisplay from '../../elements/memberGroupDisplay';
import CardInfoDisplay from '../../elements/cardInfoDisplay';

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
  const [assignees, setAssignees] = useState([] as string[]);
  const [reviewers, setReviewers] = useState([] as string[]);
  const [columnId, setColumnId] = useState('');
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

  const confirmClose = () => {
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
      setReviewers([user.id]);
    }
    setChain(space?.defaultPayment.chain);
    setToken(space?.defaultPayment.token);
    setValue('0');
    setTitle('');
    setDescription([]);
    setLabels([]);
    setAssignees([]);
    setDate('');
    setColumnId(column.id);
  }, [isOpen]);

  if (!isOpen) {
    return <div />;
  }

  return (
    <>
      <Modal open={isOpen}>
        <ModalContainer id="cardModal" data-testid="createCardModal">
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
              data-testid="bCreateCardClose"
            >
              <CloseIcon />
            </IconButton>
          </TaskModalTitleContainer>
          <Box sx={{ width: 'fit-content', display: 'flex', flexWrap: 'wrap' }}>
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
                  optionLabels: (option: any) => space.columns[option].title,
                },
              ]}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <CommonPopover
              label="Reviewer"
              buttonText={
                <MemberGroupDisplay
                  members={reviewers}
                  memberDetails={space.memberDetails}
                  placeholder="No reviewer"
                />
              }
              buttonsx={{
                padding: '6px',
                minWidth: '3rem',
                minHeight: '2.6rem',
              }}
              popoverContent={[
                {
                  fieldType: 'autocomplete',
                  options: space.members,
                  currOption: reviewers,
                  setCurrOption: setReviewers,
                  // eslint-disable-next-line react/no-unstable-nested-components
                  optionLabels: (option: string) => (
                    <MemberInfoDisplay member={space.memberDetails[option]} />
                  ),
                  multiple: true,
                  closeOnSelect: false,
                },
              ]}
            />
            <CommonPopover
              label="Assignee"
              buttonText={
                <MemberGroupDisplay
                  members={assignees}
                  memberDetails={space.memberDetails}
                  placeholder="No assignee"
                />
              }
              buttonsx={{
                padding: '6px',
                minWidth: '3rem',
                minHeight: '2.6rem',
              }}
              popoverContent={[
                {
                  fieldType: 'autocomplete',
                  options: space.members,
                  currOption: assignees,
                  setCurrOption: setAssignees,
                  // eslint-disable-next-line react/no-unstable-nested-components
                  optionLabels: (option: string) => (
                    <MemberInfoDisplay member={space.memberDetails[option]} />
                  ),
                  multiple: true,
                  closeOnSelect: false,
                },
              ]}
            />
            <CommonPopover
              label="Reward"
              buttonText={
                <CardInfoDisplay
                  avatarDefault={<PaidIcon sx={{ color: 'text.primary' }} />}
                  info={
                    parseFloat(value) > 0
                      ? `${value} ${token?.symbol}`
                      : 'No reward' || 'select'
                  }
                />
              }
              buttonsx={{
                padding: '6px',
                minWidth: '3rem',
                minHeight: '2.6rem',
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
                  disableClearable: true,
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
                  disableClearable: true,
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
              buttonText={
                <CardInfoDisplay
                  avatarDefault={
                    <DateRangeIcon sx={{ color: 'text.primary' }} />
                  }
                  info={date ? getDateDisplay(date) : 'No deadline'}
                />
              }
              buttonsx={{
                padding: '6px',
                minWidth: '3rem',
                minHeight: '2.6rem',
              }}
              popoverContent={[
                {
                  fieldType: 'datetime',
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
                <CardInfoDisplay
                  avatarDefault={<LabelIcon sx={{ color: 'text.primary' }} />}
                  info={
                    labels.length > 0 ? `#${labels.join('  #')}` : 'No labels'
                  }
                />
              }
              buttonsx={{
                padding: '6px',
                minWidth: '3rem',
                minHeight: '2.6rem',
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
            />
          </Box>

          <TaskModalBodyContainer>
            <Editor
              syncBlocksToMoralis={setDescription}
              initialBlock={[
                {
                  id: uid(),
                  html: '',
                  tag: 'h3',
                  type: '',
                  imageUrl: '',
                  embedUrl: '',
                },
              ]}
              placeholderText={`Add details, press "/" for commands`}
              readonly={false}
              id="task-description"
            />
          </TaskModalBodyContainer>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'end',
              justifyContent: 'end',
              mt: 8,
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
                  assignees,
                  reviewers,
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
        </ModalContainer>
      </Modal>
      <ConfirmModal
        isOpen={confirmOpen}
        handleClose={confirmClose}
        buttonText="Yes, close card"
        runOnConfirm={handleClose}
        modalContent={
          <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
            You have unsaved changes. Are you sure you want to close card?
          </Typography>
        }
      />
    </>
  );
}

export default CreateCard;
