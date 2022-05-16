import DateRangeIcon from '@mui/icons-material/DateRange';
import { isValid } from 'date-fns';
import React, { useState } from 'react';
import { useCardContext } from '..';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import { getDateDisplay } from '../../../../utils/utils';
import CardInfoDisplay from '../../../elements/cardInfoDisplay';
import CommonPopover from '../../../elements/popover';

function DatePopover() {
  const { date, setDate } = useCardContext();
  const { getReason, isStakeholderAndStatusUnpaid } = useCardDynamism();
  const { updateDate } = useCardUpdate();
  const handleChange = (newValue: Date | null) => {
    if (isValid(newValue)) {
      if (newValue) setDate(newValue?.toISOString());
    }
  };
  return (
    <CommonPopover
      label="Due Date"
      buttonText={
        <CardInfoDisplay
          avatarDefault={<DateRangeIcon sx={{ color: 'text.primary' }} />}
          info={date ? getDateDisplay(date) : 'No deadline'}
        />
      }
      buttonsx={{
        padding: '6px',
        minWidth: '3rem',
        minHeight: '2.6rem',
      }}
      popoverContent={
        isStakeholderAndStatusUnpaid()
          ? [
              {
                fieldType: 'datetime',
                id: 'datetime-local',
                type: 'datetime-local',
                value: date,
                handleChange,
                label: 'Due Date',
              },
            ]
          : [
              {
                fieldType: 'typography',
                value: getReason('dueDate'),
              },
            ]
      }
      beforeClose={() => updateDate()}
    />
  );
}
export default DatePopover;
