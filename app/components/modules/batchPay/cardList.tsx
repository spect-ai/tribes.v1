import {
  Accordion,
  AccordionDetails,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { useGlobal } from '../../../context/globalContext';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import useERC20 from '../../../hooks/useERC20';
import { PrimaryButton } from '../../elements/styledComponents';
import { notify } from '../settingsTab';
import { useWalletContext } from '../../../context/WalletContext';
import { capitalizeFirstLetter } from '../../../utils/utils';
import { PaymentInfo } from '../../../types';

type Props = {
  handleClose: Function;
  setPaymentInfo: Function;
  handleNextStep: Function;
};

function CardList({ handleClose, setPaymentInfo, handleNextStep }: Props) {
  const { space } = useSpace();
  const { state } = useGlobal();
  const { registry } = state;
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { runMoralisFunction } = useMoralisFunction();
  const { user } = useMoralis();
  const { areApproved } = useERC20();
  const { networkVersion, chainIdHex } = useWalletContext();
  const getValidCardIds = (columnId: string) => {
    const cardIds = space.columns[columnId].taskIds.filter((taskId) => {
      return space.tasks[taskId];
    });
    return cardIds
      .filter((a) => space.tasks[a].value > 0)
      .filter((a) => space.tasks[a].chain?.chainId)
      .filter((a) => space.tasks[a].chain?.chainId === networkVersion)
      .filter((a) => space.tasks[a].value)
      .filter((a) => space.tasks[a].status !== 400)
      .filter((a) => space.tasks[a].status !== 300)
      .filter((a) => space.tasks[a].assignee?.length > 0);
  };
  const [cardColumn, setCardColumn] = useState(
    space.columnOrder[space.columnOrder.length - 1]
  );
  const [cards, setCards] = useState(
    getValidCardIds(space.columnOrder[space.columnOrder.length - 1]) as string[]
  );
  const [isCardChecked, setIsCardChecked] = useState(
    Array(
      getValidCardIds(space.columnOrder[space.columnOrder.length - 1]).length
    ).fill(true)
  );

  const toggleCheckboxValue = (index: number) => {
    setIsCardChecked(isCardChecked.map((v, i) => (i === index ? !v : v)));
  };

  const getCardIds = () => {
    const cardIds = [] as string[];
    for (let i = 0; i < cards.length; i += 1) {
      if (isCardChecked.at(i)) {
        cardIds.push(cards[i]);
      }
    }
    return cardIds;
  };

  useEffect(() => {
    const validCardIds = getValidCardIds(cardColumn);
    setCards(validCardIds);
    setIsCardChecked(Array(validCardIds.length).fill(true));
  }, [networkVersion, cardColumn]);

  return (
    <>
      <Typography sx={{ mt: 8, color: '#99ccff', fontSize: 'small' }}>
        Which cards are you batch paying for?
      </Typography>
      <Autocomplete
        options={space.columnOrder}
        getOptionLabel={(option) => space.columns[option]?.title}
        value={cardColumn}
        disableClearable
        onChange={(event, newValue) => {
          setCardColumn(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            id="filled-hidden-label-normal"
            fullWidth
            sx={{ mb: 2, mt: 2 }}
            placeholder="Import card from column"
            size="small"
          />
        )}
      />
      {isOpen && (
        <Accordion>
          <AccordionDetails>
            <Table>
              {cards?.length > 0 && (
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="default"
                        inputProps={{
                          'aria-label': 'select all desserts',
                        }}
                        checked={isCardChecked.every((elem) => elem === true)}
                        onChange={(e) => {
                          setIsCardChecked(
                            Array(
                              space.columns[cardColumn].taskIds.length
                            ).fill(e.target.checked)
                          );
                          // isCardChecked;
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" sx={{ color: '#99ccff' }}>
                      Card Title
                    </TableCell>
                    <TableCell align="left" sx={{ color: '#99ccff' }}>
                      Reward
                    </TableCell>
                  </TableRow>
                </TableHead>
              )}
              <TableBody>
                {cards?.map((card, index) => (
                  <TableRow
                    key={card}
                    sx={{
                      '&:last-child td, &:last-child th': {
                        border: 0,
                      },
                    }}
                  >
                    <TableCell component="th" scope="row" padding="checkbox">
                      <Checkbox
                        color="secondary"
                        inputProps={{
                          'aria-label': 'select all desserts',
                        }}
                        checked={isCardChecked.at(index)}
                        onClick={() => {
                          toggleCheckboxValue(index);
                        }}
                      />
                    </TableCell>
                    <TableCell align="left">
                      {space.tasks[card]?.title}
                    </TableCell>
                    <TableCell align="left">
                      {space.tasks[card]?.value || 'Not set'}{' '}
                      {space.tasks[card]?.value
                        ? space.tasks[card]?.token.symbol
                        : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {cards.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: '4rem',
                    textAlign: 'center',
                    width: '100%',
                    mt: '2rem',
                  }}
                >
                  {`No cards with assignee on this column that have rewards on ${capitalizeFirstLetter(
                    registry[networkVersion]?.name
                  )} Network`}
                </Box>
              )}
            </Table>
          </AccordionDetails>
        </Accordion>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button
          color="inherit"
          variant="outlined"
          onClick={() => handleClose()}
          sx={{ mr: 1, color: '#f45151' }}
          id="bCancel"
        >
          Cancel
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <PrimaryButton
          data-testid="bCardListNextButton"
          sx={{ borderRadius: '3px' }}
          onClick={() => {
            setIsLoading(true);
            const cardIds = getCardIds();
            runMoralisFunction('getBatchPayInfo', {
              taskIds: cardIds,
              distributor: registry[networkVersion]
                .distributorAddress as string,
              chainIdHex,
            })
              .then((paymentInfo: PaymentInfo) => {
                console.log(paymentInfo);
                if (user) {
                  areApproved(
                    paymentInfo.tokens.tokenAddresses,
                    registry[networkVersion].distributorAddress as string,
                    paymentInfo.tokens.tokenValues,
                    user?.get('ethAddress')
                  )
                    .then((res) => {
                      if (res[0].length > 0) {
                        // eslint-disable-next-line no-param-reassign
                        paymentInfo.approval = {
                          required: true,
                          uniqueTokenAddresses: res[0],
                          aggregatedTokenValues: res[1],
                        };
                      }
                      console.log(paymentInfo);

                      setPaymentInfo(paymentInfo);
                      setIsLoading(false);
                      handleNextStep(paymentInfo);
                    })
                    .catch((err) => {
                      console.log(err);
                      notify(
                        'There was some error while getting token approval info',
                        'error'
                      );
                      setIsLoading(false);
                    });
                } else {
                  notify('You must be logged in to use this feature', 'error');
                  setIsLoading(false);
                }
              })
              .catch((err: any) => notify(err.message, 'error'));
          }}
          variant="outlined"
          id="bApprove"
          color="secondary"
          disabled={getCardIds().length < 1}
        >
          Next
        </PrimaryButton>
      </Box>
    </>
  );
}

export default CardList;
