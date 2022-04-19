import React, { createContext, useContext, useReducer } from 'react';
import { initializeMumbaiContracts } from '../../adapters/contract';
import getRegistry from '../../adapters/moralis';
import { Registry } from '../../types';
import { initialState, State } from './initalstate';
import { Action, reducer } from './reducer';

declare global {
  interface Window {
    ethereum: any;
  }
}

const GlobalContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

const initContracts = async (dispatch: React.Dispatch<Action>) => {
  // dispatch({ type: "START_ASYNC" });
  try {
    // if (process.env.NETWORK_CHAIN === "polygon") {
    //   const { } = initializePolygonContracts();

    // } else {
    //   const { distributorContract } = initializeMumbaiContracts();

    // }
    const { distributorContract } = initializeMumbaiContracts();
    dispatch({
      type: 'SET_DISTRIBUTOR_CONTRACT',
      contract: distributorContract,
    });
    // dispatch({ type: "END_ASYNC" });
  } catch (error: any) {
    dispatch({ type: 'SET_ERROR', error });
  }
};

const initRegistry = async (dispatch: React.Dispatch<Action>, Moralis: any) => {
  getRegistry(Moralis).then((res: Registry) => {
    try {
      dispatch({
        type: 'SET_REGISTRY',
        registry: res,
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error });
    }
  });
};

const updateUser = async (dispatch: React.Dispatch<Action>, user: any) => {
  try {
    dispatch({
      type: 'SET_USER',
      user,
    });
  } catch (error: any) {
    dispatch({ type: 'SET_ERROR', error });
  }
};

const updateLoading = async (
  dispatch: React.Dispatch<Action>,
  loading: boolean
) => {
  if (loading) {
    dispatch({
      type: 'START_ASYNC',
    });
  } else {
    dispatch({
      type: 'END_ASYNC',
    });
  }
};

function GlobalContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = { state, dispatch };
  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

const useGlobal = () => useContext(GlobalContext);

export default GlobalContextProvider;
export { useGlobal, initContracts, initRegistry, updateUser, updateLoading };
