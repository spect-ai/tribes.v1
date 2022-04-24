import { Contracts, CurrentUser, Registry } from '../../types';

export interface State {
  loading: boolean;
  error?: Error;
  contracts?: Contracts;
  currentUser?: CurrentUser;
  registry: Registry;
}

export const initialState: State = {
  loading: false,
  registry: {},
};
