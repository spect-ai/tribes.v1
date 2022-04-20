import {
  TextField,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Accordion,
  AccordionDetails,
} from '@mui/material';
import React, { useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';

type Props = {
  setCards: Function;
  setCardColumn: Function;
  cards: string[];
  cardColumn: string;
  isCardChecked: boolean[];
  setIsCardChecked: Function;
};

function CreateEpochTaskList({
  setCards,
  setCardColumn,
  cards,
  cardColumn,
  isCardChecked,
  setIsCardChecked,
}: Props) {
  const { space } = useSpace();
  const [isOpen, setIsOpen] = useState(true);

  const toggleCheckboxValue = (index: number) => {
    setIsCardChecked(isCardChecked.map((v, i) => (i === index ? !v : v)));
  };
  return (
    <>
      <Autocomplete
        options={space.columnOrder}
        getOptionLabel={(option) => space.columns[option]?.title}
        value={cardColumn}
        disableClearable
        onChange={(event, newValue) => {
          setCardColumn(newValue);
          const cardsFilter = space.columns[newValue]?.taskIds.filter(
            (taskId) => {
              return space.tasks[taskId];
            }
          );
          setCards(cardsFilter);
          setIsCardChecked(Array(cardsFilter.length).fill(true));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            id="filled-hidden-label-normal"
            fullWidth
            sx={{ mb: 2, mt: 2 }}
            placeholder="Import task from column"
            size="small"
          />
        )}
      />
      {isOpen && (
        <Accordion>
          <AccordionDetails>
            <Table>
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
                          Array(space.columns[cardColumn].taskIds.length).fill(
                            e.target.checked
                          )
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#99ccff' }}>
                    Card Title
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#99ccff' }}>
                    Reward
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cards?.map((card, index) => {
                  if (space.tasks[card]) {
                    return (
                      <TableRow
                        key={card}
                        sx={{
                          '&:last-child td, &:last-child th': {
                            border: 0,
                          },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          padding="checkbox"
                        >
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
                        <TableCell align="right">
                          {space.tasks[card].title}
                        </TableCell>
                        <TableCell align="right">
                          {space.tasks[card].value || 'Not set'}{' '}
                          {space.tasks[card].value
                            ? space.tasks[card].token.symbol
                            : ''}
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return <div />;
                })}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}

export default CreateEpochTaskList;
