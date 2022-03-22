import {
  Autocomplete,
  Box,
  createFilterOptions,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { useGlobal } from "../../../context/globalContext";
import { Chain, Registry, Token } from "../../../types";
import {
  getFlattenedCurrencies,
  getFlattenedNetworks,
} from "../../../utils/utils";
import CustomTokenDialog from "../customToken";

type Props = {
  chain: Chain;
  setChain: (chain: Chain) => void;
  token: Token;
  setToken: (token: Token) => void;
};

const DefaultPaymentForm = ({ chain, setChain, token, setToken }: Props) => {
  const {
    state: { registry },
  } = useGlobal();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const filter = createFilterOptions<Token>();
  return (
    <Box sx={{ display: "flex", my: 1 }}>
      <CustomTokenDialog
        open={isDialogOpen}
        handleClose={() => setIsDialogOpen(false)}
        setToken={setToken}
        chain={chain}
      />
      <Autocomplete
        options={getFlattenedNetworks(registry as Registry)}
        getOptionLabel={(option) => option.name}
        value={chain}
        disableClearable
        onChange={(event, newValue) => {
          setChain(newValue as Chain);
        }}
        fullWidth
        renderInput={(params) => <TextField {...params} size="small" />}
        sx={{ mr: 2 }}
      />
      <Autocomplete
        options={getFlattenedCurrencies(registry as Registry, chain.chainId)}
        getOptionLabel={(option) => option.symbol}
        value={token}
        onChange={(event, newValue) => {
          if (newValue && (newValue as Token).address === "0") {
            setIsDialogOpen(true);
            return;
          }
          setToken(newValue as Token);
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          if (params.inputValue !== "") {
            filtered.push({
              symbol: "Import custom address",
              address: "0",
            });
          }
          return filtered;
        }}
        fullWidth
        disableClearable
        renderInput={(params) => (
          <TextField
            {...params}
            id="filled-hidden-label-normal"
            size="small"
            placeholder="Token"
          />
        )}
      />
    </Box>
  );
};

export default DefaultPaymentForm;
