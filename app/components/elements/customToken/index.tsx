import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useGlobal } from '../../../context/globalContext';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { Chain, Token } from '../../../types';
import useERC20 from '../../../hooks/useERC20';
// import { addERC20Token } from '../../../adapters/moralis';

type Props = {
  open: boolean;
  handleClose: () => void;
  setToken: (token: Token) => void;
  chain: Chain;
};

function CustomTokenDialog({ open, handleClose, setToken, chain }: Props) {
  const [address, setAddress] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenName, setTokenName] = useState('');
  const { Moralis } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();
  const { dispatch } = useGlobal();
  const { symbol, name } = useERC20();

  useEffect(() => {
    setAddress('');
    setTokenName('');
    setTokenSymbol('');
  }, []);

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
            setAddress(event.target.value);
            if (event.target.value.length === 42) {
              const symbolOfToken = await symbol(
                event.target.value,
                chain.chainId
              );
              const nameOfToken = await name(event.target.value, chain.chainId);

              setTokenSymbol(symbolOfToken || 'Token Not Found');
              setTokenName(nameOfToken || 'Token Not Found');
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
          value={tokenSymbol}
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
            runMoralisFunction('addERC20Token', {
              address,
              chainId: chain.chainId,
              symbol: tokenSymbol,
              name: tokenName,
            })
              .then((res) => {
                console.log(res);
                dispatch({
                  type: 'SET_REGISTRY',
                  registry: res,
                });
                setToken({
                  symbol: tokenSymbol,
                  address,
                });
              })
              .catch((err) => {
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
}

export default CustomTokenDialog;
