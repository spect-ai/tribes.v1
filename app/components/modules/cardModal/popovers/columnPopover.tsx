import React, { useState } from 'react';
import { useCardContext } from '..';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import CommonPopover from '../../../elements/popover';

function ColumnPopover() {
  const { space, setSpace } = useSpace();
  const { updateColumn } = useCardUpdate();
  const { col, setCol } = useCardContext();
  const { isStakeholderAndStatusUnpaid, getReason } = useCardDynamism();

  return (
    <CommonPopover
      buttonText={space.columns[col].title}
      popoverContent={
        isStakeholderAndStatusUnpaid()
          ? [
              {
                fieldType: 'autocomplete',
                options: space.columnOrder,
                currOption: col,
                setCurrOption: setCol,
                optionLabels: (option: any) => space.columns[option].title,
                beforeClose: updateColumn,
              },
            ]
          : [
              {
                fieldType: 'typography',
                value: getReason('column'),
              },
            ]
      }
    />
  );
}

export default ColumnPopover;
