import {
  Autocomplete,
  Popover,
  TextField,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import React, { useState } from 'react';
import LabelIcon from '@mui/icons-material/Label';
import { labelsMapping } from '../../../../constants';
import { CardButton, PrimaryButton } from '../../../elements/styledComponents';
import { PopoverContainer, LabelChip } from '../styles';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import { useCardContext } from '..';

function LabelPopover() {
  const [open, setOpen] = useState(false);
  const {
    task,
    setTask,
    labels,
    setLabels,
    openPopover,
    closePopover,
    anchorEl,
  } = useCardContext();
  const { getReason, isCardStewardAndUnpaidCardStatus } = useCardDynamism();
  const { updateLabels } = useCardUpdate();
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
            onClick={openPopover(setOpen)}
            color="secondary"
            sx={{
              padding: '6px',
              minWidth: '3rem',
            }}
          >
            {task?.tags?.map((tag, index) => (
              <LabelChip
                color={labelsMapping[tag as keyof typeof labelsMapping]}
                key={tag.toString()}
              >
                #{tag}
              </LabelChip>
            ))}

            {(!task.tags || task.tags?.length === 0) && (
              <>
                <Avatar
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
        open={open}
        anchorEl={anchorEl}
        onClose={() => closePopover(setOpen)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {!isCardStewardAndUnpaidCardStatus() && (
          <PopoverContainer>
            <Typography variant="body2">{getReason('label')}</Typography>
          </PopoverContainer>
        )}
        {isCardStewardAndUnpaidCardStatus() && (
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
              onClick={() => {
                updateLabels(setOpen);
              }}
            >
              Save
            </PrimaryButton>
          </PopoverContainer>
        )}
      </Popover>
    </>
  );
}

export default LabelPopover;
