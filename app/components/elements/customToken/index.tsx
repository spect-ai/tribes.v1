import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Chain, Token } from "../../../types";
import { useMoralis } from "react-moralis";
import { useGlobal } from "../../../context/globalContext";
import { addERC20Token } from "../../../adapters/moralis";

type Props = {
  open: boolean;
  handleClose: () => void;
  setToken: (token: Token) => void;
  chain: Chain;
};

const CustomTokenDialog = ({ open, handleClose, setToken, chain }: Props) => {
  const [address, setAddress] = useState("");
  const [symbol, setSymbol] = useState("");
  const { Moralis } = useMoralis();
  const {
    state: { registry },
    dispatch,
  } = useGlobal();
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add a new Token</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Did you miss any token in our list? Please, add it!
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          value={address}
          onChange={async (event) => {
            const options = {
              chain: chain.name,
              addresses: event.target.value,
            };
            setAddress(event.target.value);
            if (event.target.value.length === 42) {
              const token = await Moralis.Web3API.token.getTokenMetadata(
                options as any
              );
              setSymbol(token[0].symbol || "Token Not Found");
            }
          }}
          label="Token address"
          type="text"
          variant="standard"
          sx={{ mr: 4 }}
        />
        <TextField
          margin="dense"
          id="name"
          value={symbol}
          variant="standard"
          label="Symbol"
          inputProps={{
            readOnly: true,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="outlined"
          color="secondary"
          onClick={() => {
            addERC20Token(address, chain.chainId, symbol, symbol, Moralis)
              .then((res: any) => {
                console.log(res);
                dispatch({
                  type: "SET_REGISTRY",
                  registry: res,
                });
                setToken({
                  symbol: symbol,
                  address: address,
                });
              })
              .catch((err: any) => {
                console.log(err);
              });

            handleClose();
          }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomTokenDialog;
