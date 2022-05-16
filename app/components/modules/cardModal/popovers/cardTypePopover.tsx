import React, { useEffect } from 'react';
import { useCardContext } from '..';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import CommonPopover from '../../../elements/popover';

function CardTypePopover() {
  const { type, setType } = useCardContext();

  const { getReason, isCardStewardAndUnpaidCardStatus } = useCardDynamism();
  const { updateType } = useCardUpdate();

  useEffect(() => {
    console.log(type);
  }, [type]);

  return (
    <CommonPopover
      buttonText={type}
      popoverContent={
        isCardStewardAndUnpaidCardStatus()
          ? [
              {
                fieldType: 'autocomplete',
                options: ['Task', 'Bounty'],
                currOption: type,
                setCurrOption: setType,
                beforeClose: updateType,
              },
            ]
          : [
              {
                fieldType: 'typography',
                value: getReason('type'),
              },
            ]
      }
    />
  );
}

export default CardTypePopover;
