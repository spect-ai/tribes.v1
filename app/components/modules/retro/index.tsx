import styled from '@emotion/styled';
import DateRange from '@mui/icons-material/DateRange';
import {
  Box,
  Palette,
  Skeleton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { utcToZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import usePeriod from '../../../hooks/usePeriod';
import { Epoch } from '../../../types';
import CreatePeriod from '../createPeriod';
import { notify } from '../settingsTab';
import { Chip } from '../task';
import MemberAvatarGroup from '../../elements/memberAvatarGroup';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';

interface RetroContextType {
  periods: Epoch[];
  setPeriods: (periods: Epoch[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (isCreateModalOpen: boolean) => void;
}

const RetroContext = createContext<RetroContextType>({} as RetroContextType);

function useProviderRetro() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [periods, setPeriods] = useState<Epoch[]>([]);
  return {
    isLoading,
    setIsLoading,
    periods,
    setPeriods,
    isCreateModalOpen,
    setIsCreateModalOpen,
  };
}

export const useRetro = () => useContext(RetroContext);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  @media only screen and (min-width: 0px) {
    padding: 0.1rem;
  }
  @media only screen and (min-width: 768px) {
    padding: 0.5rem;
  }
  margin-left: 1.5rem;
  margin-right: 1.5rem;
`;

const RetroLabelsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 45%;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const RetroItem = styled.div<{
  isDragging: boolean;
  palette: Palette;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.palette.primary.main};
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  cursor: pointer;
  border: ${(props) =>
    props.isDragging
      ? `0.1px solid ${props.palette.text.secondary}`
      : `0.1px solid transparent`};
  transition: border 0.5s ease-in-out;
  &:hover {
    border: 0.1px solid rgb(234, 234, 234, 0.3);
  }
  @media only screen and (min-width: 0px) {
    margin: 0.5rem 0rem;
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
    width: 90%;
  }
  @media only screen and (min-width: 768px) {
    margin: 0.5rem 0rem;
    padding: 0.5rem 2rem;
    border-radius: 5px;
    width: 95%;
  }
`;

const AvatarContainer = styled.div`
  @media only screen and (min-width: 0px) {
    width: 10%;
  }
  @media only screen and (min-width: 768px) {
    width: 5%;
  }
  display: flex;
  justify-content: center;
`;

function ViewRetro() {
  const context = useProviderRetro();
  const router = useRouter();
  const { loadPeriods } = usePeriod();
  const { isLoading, setIsLoading, periods, setPeriods } = context;
  const spaceId = router.query.bid as string;
  const [isOpen, setIsOpen] = useState(false);
  const { palette } = useTheme();
  const { space } = useSpace();

  useEffect(() => {
    setIsLoading(true);
    loadPeriods(spaceId)
      .then((res: any) => {
        console.log(res);
        setPeriods(res);
        setIsLoading(false);
      })
      .catch((err: any) => {
        notify(
          `Sorry! There was an error while getting retro periods.`,
          'error'
        );
        setIsLoading(false);
      });
  }, []);
  if (isLoading) {
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        animation="wave"
        sx={{ mt: 8, mx: '1.5rem' }}
      />
    );
  }
  return (
    <RetroContext.Provider value={context}>
      <Container data-testid="periodsListView">
        <Box sx={{ width: { xs: '90%', md: '20%' } }}>
          {periods?.length !== 0 && <CreatePeriod />}
        </Box>
        {periods.map((period) => (
          <RetroItem
            palette={palette}
            onClick={() => setIsOpen(true)}
            isDragging={false}
          >
            <Typography
              sx={{
                width: { xs: '40%', md: '50%' },
                color: 'text.primary',
              }}
              fontSize={{
                xs: '0.8rem',
                md: '1rem',
              }}
            >
              {period.name}
            </Typography>
            <RetroLabelsContainer>
              {period.active && (
                <Typography
                  sx={{
                    width: { xs: '40%', md: '50%' },
                    color: 'success.light',
                  }}
                  fontSize={{
                    xs: '0.8rem',
                    md: '1rem',
                  }}
                >
                  Ongoing
                </Typography>
              )}
              {period.budget && period.budget > 0 ? (
                <Tooltip
                  title={`A budget of ${period.budget} ${period.token.symbol} will be split among all the members of this retro period.`}
                >
                  <Chip color="rgb(153, 204, 255, 0.2)">
                    {period.budget} {period.token.symbol}
                  </Chip>
                </Tooltip>
              ) : null}
              {period.endTime && (
                <Tooltip
                  title={`Retro period ends on ${format(
                    utcToZonedTime(
                      new Date(period.endTime),
                      Intl.DateTimeFormat().resolvedOptions().timeZone
                    ),
                    'MMM do, hh:mm a'
                  )}.`}
                >
                  <Chip color="rgb(153, 204, 255, 0.2)">
                    <DateRange sx={{ fontSize: 12, mr: 1 }} />
                    <Typography sx={{ fontSize: 12 }}>
                      {format(
                        utcToZonedTime(
                          new Date(period.endTime),
                          Intl.DateTimeFormat().resolvedOptions().timeZone
                        ),
                        'MMM do'
                      )}
                    </Typography>
                  </Chip>
                </Tooltip>
              )}
              <MemberAvatarGroup
                memberIds={Object.keys(period.memberStats)}
                memberDetails={space.memberDetails}
                maxAvatars={6}
                avatarGroupsx={{ ml: '1rem' }}
              />
            </RetroLabelsContainer>
          </RetroItem>
        ))}
      </Container>
    </RetroContext.Provider>
  );
}

export default ViewRetro;
