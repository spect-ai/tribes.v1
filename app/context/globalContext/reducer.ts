import { Contracts } from "../../types";
import { State } from "./initalstate";

export type Action =
  | {
      type: "START_ASYNC";
    }
  | {
      type: "SET_ERROR";
      error: State["error"];
    }
  | {
      type: "SET_DISTRIBUTOR_CONTRACT";
      contract: Contracts["distributorContract"];
    }
  | {
      type: "END_ASYNC";
    };

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "START_ASYNC": {
      return {
        ...state,
        loading: true,
      };
    }
    case "END_ASYNC": {
      return {
        ...state,
        loading: false,
      };
    }
    case "SET_ERROR": {
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    }
    case "SET_DISTRIBUTOR_CONTRACT": {
      return {
        ...state,
        contracts: {
          ...state.contracts,
          distributorContract: action.contract,
        },
      };
    }
    default:
      throw new Error("Bad action type");
  }
};
