import LabelIcon from '@mui/icons-material/Label';
import React, { useState } from 'react';
import { useCardContext } from '..';
import { labelsMapping } from '../../../../constants';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import CommonPopover from '../../../elements/popover';
import CardInfoDisplay from '../../../elements/cardInfoDisplay';

function LabelPopover() {
  const [open, setOpen] = useState(false);
  const { task, setTask, labels, setLabels } = useCardContext();
  const { getReason, isCardStewardAndUnpaidCardStatus } = useCardDynamism();
  const { updateLabels } = useCardUpdate();
  return (
    <CommonPopover
      label="Labels"
      buttonText={
        <CardInfoDisplay
          avatarDefault={<LabelIcon sx={{ color: 'text.primary' }} />}
          info={labels.length > 0 ? `${labels.join(', ')}` : 'No labels'}
        />
      }
      buttonsx={{
        padding: '6px',
        minWidth: '3rem',
        minHeight: '2.6rem',
      }}
      popoverContent={
        isCardStewardAndUnpaidCardStatus()
          ? [
              {
                fieldType: 'autocomplete',
                options: Object.keys(labelsMapping),
                value: labels,
                currOption: labels,
                setCurrOption: setLabels,
                multiple: true,
                closeOnSelect: false,
              },
            ]
          : [
              {
                fieldType: 'typography',
                value: getReason('label'),
              },
            ]
      }
      beforeClose={() => updateLabels()}
    />
  );
}

export default LabelPopover;
