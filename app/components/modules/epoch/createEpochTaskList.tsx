import {
  TextField,
  Autocomplete,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Container,
} from "@mui/material";
import React, { useState } from "react";
import { useBoard } from "../taskBoard";

type Props = {
  setCards: Function;
  setCardColumn: Function;
  cards: string[];
  cardColumn: string;
  isCardChecked: boolean[];
  setIsCardChecked: Function;
};

const CreateEpochTaskList = ({
  setCards,
  setCardColumn,
  cards,
  cardColumn,
  isCardChecked,
  setIsCardChecked,
}: Props) => {
  const { data } = useBoard();
  const [isOpen, setIsOpen] = useState(true);

  const toggleCheckboxValue = (index: number) => {
    setIsCardChecked(isCardChecked.map((v, i) => (i === index ? !v : v)));
  };
  console.log(data.columns[data.columnOrder[0]].taskIds.length);
  return (
    <>
      <Autocomplete
        options={data.columnOrder}
        getOptionLabel={(option) => data.columns[option]?.title}
        value={cardColumn}
        disableClearable
        onChange={(event, newValue) => {
          setCardColumn(newValue);
          setCards(data.columns[newValue]?.taskIds);
          setIsCardChecked(
            Array(data.columns[newValue].taskIds.length).fill(true)
          );
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
                      inputProps={{
                        "aria-label": "select all desserts",
                      }}
                      checked={isCardChecked.every((elem) => elem === true)}
                      onChange={(e) => {
                        setIsCardChecked(
                          Array(data.columns[cardColumn].taskIds.length).fill(
                            e.target.checked
                          )
                        );
                        isCardChecked;
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#99ccff" }}>
                    Card Title
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#99ccff" }}>
                    Reward
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cards?.map((card, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                  >
                    <TableCell component="th" scope="row" padding="checkbox">
                      {
                        <Checkbox
                          color="primary"
                          inputProps={{
                            "aria-label": "select all desserts",
                          }}
                          checked={isCardChecked.at(index)}
                          onClick={() => {
                            toggleCheckboxValue(index);
                          }}
                        />
                      }
                    </TableCell>
                    <TableCell align="right">
                      {data.tasks[card].title}
                    </TableCell>
                    <TableCell align="right">
                      {data.tasks[card].value || "Not set"}{" "}
                      {data.tasks[card].value
                        ? data.tasks[card].token.symbol
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};

export default CreateEpochTaskList;
