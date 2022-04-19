import styled from '@emotion/styled';
import {
  Autocomplete,
  Popover,
  TextField,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { updateTaskLabels } from '../../../../adapters/moralis';
import { labelsMapping } from '../../../../constants';
import { BoardData, Task } from '../../../../types';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { PopoverContainer } from '../styles';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import { notify } from '../../settingsTab';
import LabelIcon from '@mui/icons-material/Label';
import { LabelChip } from '../styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useMoralisFunction } from '../../../../hooks/useMoralisFunction';
import { useCardDynamism } from '../../../../hooks/useCardDynamism';

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const LabelPopover = ({ task, setTask }: Props) => {
  const [labels, setLabels] = useState(task.tags);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { runMoralisFunction } = useMoralisFunction();
  const { space, setSpace } = useSpace();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { editAbleComponents, getReason } = useCardDynamism(task);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleClick = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (editAbleComponents['label']) {
      setOpen(true);
    } else {
      setFeedbackOpen(true);
    }
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
  };

  const handleSave = () => {
    const prevTask = Object.assign({}, task);
    const temp = Object.assign({}, task);
    temp.tags = labels;
    setTask(temp);
    handleClose();
    runMoralisFunction('updateCard', {
      updates: {
        tags: labels,
        taskId: task.taskId,
      },
    })
      .then((res) => {
        console.log(res);
        setSpace(res.space);
        setTask(res.task);
      })
      .catch((err: any) => {
        setTask(prevTask);
        notify(`${err.message}`, 'error');
      });
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mt: 2,
          mx: 1,
        }}
      >
        <Typography
          sx={{ fontSize: 12, color: 'text.secondary', width: '100%' }}
        >
          Labels
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <CardButton
            variant="outlined"
            onClick={handleClick()}
            color="secondary"
            sx={{
              padding: '6px',
              minWidth: '3rem',
            }}
          >
            {task?.tags?.map((tag, index) => (
              <LabelChip
                color={labelsMapping[tag as keyof typeof labelsMapping]}
                key={index}
              >
                #{tag}
              </LabelChip>
            ))}

            {(!task.tags || task.tags?.length === 0) && (
              <>
                <Avatar
                  variant="rounded"
                  sx={{
                    p: 0,
                    mr: 2,
                    width: 20,
                    height: 20,
                    backgroundColor: 'transparent',
                  }}
                >
                  <LabelIcon
                    sx={{
                      color: 'text.primary',
                    }}
                  />
                </Avatar>
                <Typography
                  sx={{
                    fontSize: 14,
                    maxWidth: '6rem',
                    minWidth: '3rem',
                    minHeight: '1.3rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: '100',
                  }}
                >
                  No labels
                </Typography>
              </>
            )}
          </CardButton>
        </Box>
      </Box>
      <Popover
        open={feedbackOpen}
        anchorEl={anchorEl}
        onClose={() => handleFeedbackClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <PopoverContainer>
          <Typography variant="body2">{getReason('label')}</Typography>
        </PopoverContainer>
      </Popover>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <PopoverContainer>
          <Autocomplete
            options={Object.keys(labelsMapping)}
            multiple
            value={labels}
            onChange={(event, newValue) => {
              setLabels(newValue as string[]);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="filled-hidden-label-normal"
                size="small"
                fullWidth
                placeholder="Search Labels"
              />
            )}
          />
          <PrimaryButton
            variant="outlined"
            sx={{ mt: 4, borderRadius: 1 }}
            color="secondary"
            onClick={handleSave}
          >
            Save
          </PrimaryButton>
        </PopoverContainer>
      </Popover>
    </>
  );
};

export default LabelPopover;
