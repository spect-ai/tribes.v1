import Moralis from "moralis/types";
import { Contracts, Registry } from "../../types";

export interface State {
  loading: boolean;
  error?: Error;
  contracts?: Contracts;
  logo?: string;
  registry?: Registry;
  title?: string;
}

export const initialState: State = {
  loading: false,
};
