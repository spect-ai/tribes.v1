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
  Button,
  Typography,
  Box,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { PrimaryButton } from "../../elements/styledComponents";
import { useMoralis } from "react-moralis";
import { getBatchPayInfo } from "../../../adapters/moralis";
import { notify } from "../settingsTab";
import { useGlobal } from "../../../context/globalContext";

type Props = {
  handleClose: Function;
  setPaymentInfo: Function;
  handleNextStep: Function;
  chainId: string;
};

const CardList = ({
  handleClose,
  setPaymentInfo,
  handleNextStep,
  chainId,
}: Props) => {
  const { space } = useSpace();
  const { state } = useGlobal();
  const registry = state.registry;
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const getValidCardIds = (columnId: string) => {
    var cardIds = space.columns[columnId].taskIds;

    return cardIds
      .filter((a) => space.tasks[a].value > 0)
      .filter((a) => space.tasks[a].chain?.chainId)
      .filter(
        (a) => space.tasks[a].chain?.chainId === window.ethereum.networkVersion
      )
      .filter((a) => space.tasks[a].value)
      .filter((a) => space.tasks[a].status !== 400)
      .filter((a) => space.tasks[a].status !== 300)
      .filter((a) => space.tasks[a].assignee?.length > 0) as string[];
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
  const { Moralis, user } = useMoralis();

  const getCardIds = () => {
    var cardIds = [] as string[];
    for (let i = 0; i < cards.length; i++) {
      if (isCardChecked.at(i)) {
        cardIds.push(cards[i]);
      }
    }
    return cardIds;
  };

  return (
    <>
      <Typography sx={{ mt: 8, color: "#99ccff", fontSize: "small" }}>
        Which cards are you batch paying for?
      </Typography>
      <Autocomplete
        options={space.columnOrder}
        getOptionLabel={(option) => space.columns[option]?.title}
        value={cardColumn}
        disableClearable
        onChange={(event, newValue) => {
          setCardColumn(newValue);
          const validCardIds = getValidCardIds(newValue);
          setCards(validCardIds);
          setIsCardChecked(Array(validCardIds.length).fill(true));
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
                        "aria-label": "select all desserts",
                      }}
                      checked={isCardChecked.every((elem) => elem === true)}
                      onChange={(e) => {
                        setIsCardChecked(
                          Array(space.columns[cardColumn].taskIds.length).fill(
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
                          color="secondary"
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
                      {space.tasks[card]?.title}
                    </TableCell>
                    <TableCell align="right">
                      {space.tasks[card]?.value || "Not set"}{" "}
                      {space.tasks[card]?.value
                        ? space.tasks[card]?.token.symbol
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      )}
      <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
        <Button
          color="inherit"
          variant="outlined"
          onClick={() => handleClose()}
          sx={{ mr: 1, color: "#f45151" }}
          id="bCancel"
        >
          Cancel
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />
        <PrimaryButton
          sx={{ borderRadius: "3px" }}
          onClick={() => {
            setIsLoading(true);
            const cardIds = getCardIds();
            console.log(window.ethereum);
            getBatchPayInfo(
              Moralis,
              cardIds,
              registry[chainId].distributorAddress as string,
              window.ethereum.chainId
            )
              .then((res: any) => {
                console.log(res);
                setPaymentInfo(res);
                setIsLoading(false);
                handleNextStep(res);
              })
              .catch((err: any) => notify(err.message, "error"));
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
};

export default CardList;
