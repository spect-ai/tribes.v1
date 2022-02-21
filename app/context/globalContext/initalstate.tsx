import Moralis from "moralis/types";
import { Contracts } from "../../types";

export interface State {
  loading: boolean;
  error?: Error;
  contracts?: Contracts;
  logo?: string;
}

export const initialState: State = {
  loading: false,
};
