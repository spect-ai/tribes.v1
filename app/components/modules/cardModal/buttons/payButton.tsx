import PaidIcon from '@mui/icons-material/Paid';
import { ListItemButton, ListItemText } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useCardContext } from '..';
import { approve } from '../../../../adapters/contract';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import useERC20 from '../../../../hooks/useERC20';
import usePaymentGateway from '../../../../hooks/usePaymentGateway';
import { notify } from '../../settingsTab';

type Props = {
  handleClose: () => void;
};

function PayButton({ handleClose }: Props) {
  const { user } = useMoralis();
  const { task, setTask } = useCardContext();

  const { payButtonView } = useCardDynamism();
  const [payButtonText, setPayButtonText] = useState(
    payButtonView === 'showPay' ? 'Pay' : 'Approve'
  );
  const { isCurrency } = useERC20();
  const { updateStatusAndTransactionHash } = useCardUpdate();

  const { batchPay } = usePaymentGateway(updateStatusAndTransactionHash);

  const handlePaymentError = (err: any) => {
    if (window.ethereum.networkVersion !== task.chain.chainId)
      notify(`Please switch to ${task.chain?.name} network`, 'error');
    else {
      notify(err.message, 'error');
    }
  };

  const handleClick = () => {
    if (payButtonView === 'showPay') {
      setPayButtonText('Paying...');
      batchPay(window.ethereum.networkVersion, {
        cardIds: [task.taskId],
        type: isCurrency(task.token.address) ? 'currency' : 'tokens',
        contributors: task.assignee,
        tokenAddresses: [task.token.address],
        tokenValues: [task.value],
      });
    } else if (payButtonView === 'showApprove') {
      if (task.chain?.chainId !== window.ethereum.networkVersion) {
        handlePaymentError({});
      } else {
        setPayButtonText('Approving...');
        approve(task.chain.chainId, task.token.address as string)
          .then((res: any) => {
            setPayButtonText('Approved');
            if (user) {
              if (
                user.get('distributorApproved') &&
                task.chain.chainId in user.get('distributorApproved')
              ) {
                user
                  .get('distributorApproved')
                  [task.chain.chainId].push(task.token.address as string);
              } else if (user.get('distributorApproved')) {
                user.set('distributorApproved', {
                  ...user.get('distributorApproved'),
                  [task.chain.chainId]: [task.token.address as string],
                });
              } else {
                user.set('distributorApproved', {
                  [task.chain.chainId]: [task.token.address as string],
                });
              }
              user.save();
            }
            setPayButtonText('Pay');
          })
          .catch((err: any) => {
            handlePaymentError(err);
            setPayButtonText('Approve');
          });
      }
    }
  };

  useEffect(() => {
    setPayButtonText(payButtonView === 'showPay' ? 'Pay' : 'Approve');
  }, [payButtonView]);

  if (payButtonView !== 'hide') {
    return (
      <ListItemButton
        onClick={() => {
          handleClick();
        }}
      >
        <PaidIcon sx={{ width: '2rem', mr: 2 }} />
        <ListItemText primary={payButtonText} />
      </ListItemButton>
    );
  }

  return <div />;
}

export default PayButton;
