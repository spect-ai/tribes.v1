import styled from '@emotion/styled';
import {
  Avatar,
  Box,
  Button,
  Palette,
  styled as MUIStyled,
  Typography,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import React from 'react';
import { normalTrim } from '../../../utils/utils';

type Props = {
  image: string;
  title: string;
  members: number;
  teamId: string;
};

const TribeAvatar = MUIStyled(Avatar)(({ theme }) => ({
  height: 60,
  width: 60,
  objectFit: 'cover',
}));

const Card = styled.div<{ palette: Palette }>`
  width: 100%;
  height: 14rem;
  border: 1px solid ${(props) => props.palette.divider};
  border-radius: 4px;
  &:hover {
    cursor: pointer;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
    border: 1px solid ${(props) => props.palette.text.primary};
  }
  transition: all 0.5s ease;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
`;

function DAOCard({ image, title, members, teamId }: Props) {
  const { palette } = useTheme();
  return (
    <Link href={`/tribe/${teamId}`} passHref>
      <Card palette={palette}>
        <CardContent>
          <TribeAvatar alt="Remy Sharp" src={image} variant="rounded" />
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            color={palette.text.primary}
            sx={{
              textAlign: 'center',
              height: '4rem',
              overflow: 'hidden',
              mt: 2,
            }}
          >
            {normalTrim(title, 17)}
          </Typography>
          <Typography
            gutterBottom
            component="div"
            sx={{
              textAlign: 'center',
              color: '#5a6972',
              fontSize: 13,
              height: '100%',
            }}
          >
            {members} members
          </Typography>
          {/* <Button
            variant="outlined"
            color="secondary"
            disableElevation
            sx={{
              borderRadius: 2,
              width: 100,
              textTransform: 'none',
              mt: 4,
            }}
          >
            View
          </Button> */}
        </CardContent>
      </Card>
    </Link>
  );
}

export default DAOCard;
