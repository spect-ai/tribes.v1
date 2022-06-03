import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import RateReviewIcon from '@mui/icons-material/RateReview';
import {
  Modal,
  styled,
  Fade,
  Box,
  Typography,
  Grid,
  Breadcrumbs,
  Link,
  Tab,
  Tabs,
  InputBase,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  Tooltip,
} from '@mui/material';
import SkeletonLoader from './skeletonLoader';
import { useRetro } from '.';
import { Epoch } from '../../../types';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { useTribe } from '../../../../pages/tribe/[id]';
import { useGlobal } from '../../../context/globalContext';
import { StyledTab, StyledTabs } from '../../elements/styledComponents';
import OptionsPopover from './optionsPopover';

export const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  transform: 'translate(-50%, -50%)',
  border: '2px solid #fff',
  borderRadius: '1rem',
  overflowY: 'auto',
  overflowX: 'hidden',
  backgroundColor: theme.palette.background.default,
  padding: '1rem 2rem',
  [theme.breakpoints.down('md')]: {
    top: '50%',
    left: '50%',
    width: '80%',
    height: '76%',
  },
  [theme.breakpoints.up('md')]: {
    width: '88%',
    height: '85%',
    top: '50%',
    left: '50%',
  },
  [theme.breakpoints.up('lg')]: {
    width: '93%',
    height: '91%',
    top: '50%',
    left: '50%',
  },
}));

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleClose: () => void;
  period: Epoch;
};

function RetroModal({ handleClose, isOpen, setIsOpen, period }: Props) {
  const { space } = useSpace();
  const { tribe } = useTribe();
  const [name, setName] = useState('Jojo');
  const [description, setDescription] = useState('Jojxxxxxo');
  const [isLoading, setIsLoading] = useState(false);
  const {
    state: { registry },
  } = useGlobal();
  const [tab, setTab] = useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Modal open={isOpen} onClose={handleClose}>
      <ModalContainer id="cardModal">
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <Fade in={!isLoading}>
            <Box sx={{ height: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: '100%',
                  height: '2rem',
                  color: '#808080',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: '1rem',
                }}
              >
                <Breadcrumbs aria-label="breadcrumb">
                  <Link
                    underline="hover"
                    color="inherit"
                    href={`/tribe/${space.team[0].teamId}`}
                  >
                    {space.team[0].name}
                  </Link>
                  <Link
                    underline="hover"
                    color="inherit"
                    href={`/tribe/${space.team[0].teamId}/space/${space.objectId}`}
                  >
                    {space.name}
                  </Link>
                  <Link
                    underline="hover"
                    color="text.primary"
                    href={`/tribe/${space.team[0].teamId}/space/${space.objectId}`}
                    aria-current="page"
                  >
                    {`Retro period #${period.epochNumber}`}
                  </Link>
                </Breadcrumbs>
                <Box sx={{ flex: '1 1 auto' }} />
                <IconButton
                  data-testid="bCloseButton"
                  sx={{
                    height: '2.5rem',
                  }}
                  onClick={handleClose}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid item xs={8} sx={{ height: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      height: '90%',
                      borderRight: 1,
                      borderColor: 'text.secondary',
                      pr: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <InputBase
                        placeholder="Add Title..."
                        sx={{
                          fontSize: '30px',
                          width: '85%',
                        }}
                        value={period.name}
                        onChange={(e) => setName(e.target.value)}
                        // onBlur={() => updateTitle()}
                        // readOnly={
                        //   !(task?.access?.creator || task?.access?.reviewer)
                        // }
                        multiline
                        maxRows={3}
                      />
                      {period.budget && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <Avatar
                            src={registry[period.chain.chainId]?.pictureUrl}
                            sx={{
                              width: '2rem',
                              height: '2rem',
                              objectFit: 'cover',
                              my: 1,
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.primary"
                            sx={{ ml: 2, fontSize: 16 }}
                          >
                            {`${period.budget}`}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.primary"
                            sx={{ ml: 2, fontSize: 16 }}
                          >
                            {`${period.token.symbol}`}
                          </Typography>
                        </Box>
                      )}
                      <OptionsPopover
                        period={period}
                        handleModalClose={handleClose}
                      />
                    </Box>
                    <TextField
                      sx={{ border: 0, mt: 6 }}
                      placeholder="Lets retro..."
                      multiline
                      fullWidth
                      rows={8}
                      onChange={(event) => {
                        setDescription(event.target.value);
                      }}
                      defaultValue={period.description}
                      InputProps={{
                        disableUnderline: true, // <== added this
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <StyledTabs
                    value={tab}
                    onChange={handleTabChange}
                    sx={{ ml: '1rem', borderRadius: '0.5rem' }}
                  >
                    <StyledTab label="Member" />
                  </StyledTabs>
                  <List sx={{ ml: '1rem', mt: '1rem' }}>
                    {period.choices.map((choice, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <ListItem key={index}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              width: '70%',
                            }}
                          >
                            <Avatar
                              sx={{
                                p: 0,
                                mr: 2,
                                width: 30,
                                height: 30,
                              }}
                              src={
                                space.memberDetails[choice]?.profilePicture
                                  ?._url
                              }
                              alt={space.memberDetails[choice]?.username}
                            />
                            <Typography color="text.primary">
                              {space.memberDetails[choice].username}
                            </Typography>
                          </Box>
                          <Tooltip title="Give feedback">
                            <IconButton
                              data-testid="bCloseButton"
                              sx={{
                                height: '2.5rem',
                                mr: '1rem',
                              }}
                              onClick={handleClose}
                            >
                              <RateReviewIcon
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  color: 'text.secondary',
                                }}
                              />{' '}
                            </IconButton>
                          </Tooltip>
                          <TextField
                            id="filled-hidden-label-normal"
                            value={0}
                            onChange={() => {}}
                            size="small"
                            type="number"
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              width: '6rem',
                              justifyContent: 'end',
                            }}
                          />
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}
      </ModalContainer>
    </Modal>
  );
}

export default RetroModal;
