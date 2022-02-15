import Moralis from "moralis/types";
import { Contracts } from "../../types";

export interface State {
  loading: boolean;
  error?: Error;
  contracts?: Contracts;
}

export const initialState: State = {
  loading: false,
};
