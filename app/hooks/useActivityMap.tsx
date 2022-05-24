import React from 'react';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PersonIcon from '@mui/icons-material/Person';
import LabelIcon from '@mui/icons-material/Label';
import PaidIcon from '@mui/icons-material/Paid';
import HailIcon from '@mui/icons-material/Hail';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CommentIcon from '@mui/icons-material/Comment';
import DoneIcon from '@mui/icons-material/Done';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArchiveIcon from '@mui/icons-material/Archive';
import AddTaskIcon from '@mui/icons-material/AddTask';
import CategoryIcon from '@mui/icons-material/Category';
import { ListItemText, Box, Typography, Link } from '@mui/material';
import { utcToZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { Task } from '../types';
import { useGlobal } from '../context/globalContext';
import { findDiffBetweenArrays } from '../utils/utils';

export type ChangeLog = {
  prev: any;
  next: any;
};

export default function useActivityMap(task: Task) {
  const { space } = useSpace();
  const {
    state: { registry },
  } = useGlobal();
  const activityIcons: any = {
    99: <CategoryIcon />,
    100: <AddTaskIcon />,
    101: <DateRangeIcon />,
    102: <LabelIcon />,
    104: <PaidIcon />,
    105: <PersonIcon />,
    106: <PersonIcon />,
    150: <HailIcon />,
    151: <HailIcon />,
    152: <CheckBoxIcon />,
    200: <VisibilityIcon />,
    201: <CommentIcon />,
    205: <DoneIcon />,
    300: <PaidIcon />,
    301: <ChatBubbleIcon />,
    400: <SyncAltIcon />,
    500: <ArchiveIcon />,
  };

  const resolveActivityComponent = (update: any) => {
    // eslint-disable-next-line no-use-before-define
    return <ListItemText>{generateActivityLine(update)}</ListItemText>;
  };

  const getCommaSeparatedMemberUsername = (members: Array<any>) => {
    return members.map((a: any, index: number) => {
      return (
        <>
          <Typography
            sx={{ color: 'text.secondary', ml: 1, mr: 1 }}
          >{`${space.memberDetails[a]?.username}`}</Typography>
          {index !== members.length - 1 && ', '}
        </>
      );
    });
  };

  const getCommaSeparatedValue = (values: Array<any>) => {
    return values.map((a: any, index: number) => {
      return (
        <>
          <Typography
            sx={{ color: 'text.secondary', ml: 1, mr: 1 }}
          >{`${a}`}</Typography>
          {index !== values.length - 1 && ', '}
        </>
      );
    });
  };

  // eslint-disable-next-line consistent-return
  const resolveArrayTypeActivityContent = (update: any, fieldName: string) => {
    const [added, removed] = findDiffBetweenArrays(
      update?.changeLog?.prev,
      update?.changeLog?.next
    );
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {`${space.memberDetails[update.actor]?.username} `}
        {added.length === 1 && `added ${fieldName} `}
        {added.length > 1 && `added ${fieldName}s `}
        {['assignee', 'reviewer'].includes(fieldName) &&
          getCommaSeparatedMemberUsername(added)}
        {['label'].includes(fieldName) && getCommaSeparatedValue(added)}
        {added.length > 0 && removed.length > 0 && ' and removed '}
        {added.length === 0 && removed.length === 1 && `removed ${fieldName}`}
        {added.length === 0 && removed.length > 1 && `removed ${fieldName}s`}
        {['assignee', 'reviewer'].includes(fieldName) &&
          getCommaSeparatedMemberUsername(removed)}
        {['label'].includes(fieldName) && getCommaSeparatedValue(removed)}
      </Box>
    );
  };

  const generateActivityLine = (update: any) => {
    switch (update.action) {
      case 99:
        return `${
          space.memberDetails[update.actor]?.username
        } changed the card type from "${update.changeLog?.prev}" to "${
          update.changeLog?.next
        }"`;
      case 100:
        return `${
          space.memberDetails[update.actor]?.username
        } created card of type "${update?.changeLog?.next}"`;
      case 101:
        return `${
          space.memberDetails[update.actor]?.username
        } updated due date to ${format(
          utcToZonedTime(
            new Date(update.deadline),
            Intl.DateTimeFormat().resolvedOptions().timeZone
          ),
          'MMM do, hh:mm a'
        )}`;
      case 102:
        // eslint-disable-next-line no-case-declarations
        const tagChangeContent = resolveArrayTypeActivityContent(
          update,
          'label'
        );
        return tagChangeContent;
      case 104:
        return `${
          space.memberDetails[update.actor]?.username
        } updated reward to ${update.reward?.value} ${
          update.reward?.token?.symbol
        } on ${update.reward?.chain?.name}`;
      case 105:
        // eslint-disable-next-line no-case-declarations
        const assigneeChangeContent = resolveArrayTypeActivityContent(
          update,
          'assignee'
        );
        return assigneeChangeContent;
      case 106:
        // eslint-disable-next-line no-case-declarations
        const reviewerChangeContent = resolveArrayTypeActivityContent(
          update,
          'reviewer'
        );
        return reviewerChangeContent;
      case 150:
        return `${space.memberDetails[update.actor]?.username} applied to ${
          update.taskType
        }`;
      case 200:
        return `${
          space.memberDetails[update.actor]?.username
        } asked for a review`;
      case 201:
        return `${
          space.memberDetails[update.actor]?.username
        } asked for a revision`;
      case 202:
        return `${space.memberDetails[update.actor]?.username} added comments`;
      case 205:
        return `${space.memberDetails[update.actor]?.username} closed ${
          update.taskType
        }`;
      case 300:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body1" sx={{}}>
              {`${space.memberDetails[update.actor]?.username} paid for the ${
                update.taskType
              }`}
            </Typography>
            <Link
              target="_blank"
              href={`${registry[task.chain.chainId]?.blockExplorer}/tx/${
                update.transactionHash
              }`}
              rel="noopener noreferrer"
              sx={{ fontSize: '0.8rem', color: 'text.secondary' }}
            >
              View Transaction
            </Link>
          </Box>
        );
      case 301:
        return `${space.memberDetails[update.actor]?.username} added feedback`;
      case 400:
        return `${space.memberDetails[update.actor]?.username} moved ${
          update.taskType
        } from "${space.columns[update.columnChange?.sourceId]?.title}" to "${
          space.columns[update.columnChange?.destinationId]?.title
        }"`;
      case 500:
        return `${
          space.memberDetails[update.actor]?.username
        } archived this card`;
      default:
        return 'Unknown action';
    }
  };
  return {
    resolveActivityComponent,
    activityIcons,
  };
}
