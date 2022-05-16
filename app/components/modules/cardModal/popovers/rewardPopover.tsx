import PaidIcon from '@mui/icons-material/Paid';
import React, { useEffect, useState } from 'react';
import { useCardContext } from '..';
import { useGlobal } from '../../../../context/globalContext';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import { Registry } from '../../../../types';
import {
  getFlattenedCurrencies,
  getFlattenedNetworks,
} from '../../../../utils/utils';
import CardInfoDisplay from '../../../elements/cardInfoDisplay';
import CommonPopover from '../../../elements/popover';

function RewardPopover() {
  const {
    state: { registry },
  } = useGlobal();
  const { chain, setChain, token, setToken, value, setValue } =
    useCardContext();
  const [prevChain, setPrevChain] = useState(chain);
  const { updateReward } = useCardUpdate();
  const { getReason, isCardStewardAndUnpaidCardStatus } = useCardDynamism();

  useEffect(() => {
    const { tokenAddresses } = registry[chain.chainId];
    const { tokens } = registry[chain.chainId];
    if (prevChain.chainId === chain.chainId) return;
    if (tokenAddresses?.length > 0) {
      setPrevChain(chain);
      setToken(tokens[tokenAddresses[0]]);
    }
  }, [chain]);

  return (
    <CommonPopover
      label="Reward"
      buttonText={
        <CardInfoDisplay
          avatarDefault={<PaidIcon sx={{ color: 'text.primary' }} />}
          info={
            parseFloat(value) > 0
              ? `${value} ${token?.symbol}`
              : 'No reward' || 'select'
          }
        />
      }
      buttonsx={{
        padding: '6px',
        minWidth: '3rem',
        minHeight: '2.6rem',
      }}
      avatarDefault={<PaidIcon sx={{ color: 'text.primary' }} />}
      popoverContent={
        isCardStewardAndUnpaidCardStatus()
          ? [
              {
                fieldType: 'autocomplete',
                options: getFlattenedNetworks(registry as Registry),
                currOption: chain,
                setCurrOption: setChain,
                sx: { mb: 3 },
                optionLabels: (option: any) => option.name,
                closeOnSelect: false,
              },
              {
                fieldType: 'autocomplete',
                options: getFlattenedCurrencies(
                  registry as Registry,
                  chain?.chainId
                ),
                currOption: token,
                setCurrOption: setToken,
                sx: { mb: 3 },
                optionLabels: (option: any) => option.symbol,
                closeOnSelect: false,
              },
              {
                fieldType: 'textfield',
                id: 'filled-hidden-label-normal',
                placeholder: 'Value',
                type: 'number',
                value: parseFloat(value),
                handleChange: setValue,
              },
            ]
          : [
              {
                fieldType: 'typography',
                value: getReason('reward'),
              },
            ]
      }
      beforeClose={() => updateReward()}
    />
  );
}

export default RewardPopover;
