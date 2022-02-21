import React, { createContext, useReducer, useContext } from "react";
import { State, initialState } from "./initalstate";
import { Action, reducer } from "./reducer";
import Moralis from "moralis/types";
import { initializeMumbaiContracts } from "../../adapters/contract";

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
  dispatch({ type: "START_ASYNC" });
  try {
    // if (process.env.NETWORK_CHAIN === "polygon") {
    //   const { } = initializePolygonContracts();

    // } else {
    //   const { distributorContract } = initializeMumbaiContracts();

    // }
    const { distributorContract } = initializeMumbaiContracts();
    console.log(distributorContract);
    dispatch({
      type: "SET_DISTRIBUTOR_CONTRACT",
      contract: distributorContract,
    });
    dispatch({ type: "END_ASYNC" });
  } catch (error: any) {
    console.log(error);
    dispatch({ type: "SET_ERROR", error });
  }
};

const setNavbarLogo = async (
  dispatch: React.Dispatch<Action>,
  logo: string
) => {
  try {
    dispatch({
      type: "SET_LOGO",
      logo: logo,
    });
  } catch (error: any) {
    dispatch({ type: "SET_ERROR", error });
  }
};

const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

const useGlobal = () => useContext(GlobalContext);

export default GlobalContextProvider;
export { useGlobal, initContracts, setNavbarLogo };
