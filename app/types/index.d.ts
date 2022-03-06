import { BigNumber } from "ethers";
import Moralis from "moralis/types";
import { Delta } from "quill";

declare module "react-github-login";

export interface Contracts {
  distributorContract?: ethers.Contract;
}

export interface User {
  teams: List<number>;
  ethAddress: string;
  _createdAt: object;
  _id: string;
  _updatedAt: object;
  _created_at: any;
}

export type Member = {
  ethAddress: string;
  objectId: string;
  userId: string; //TODO: Remove after chaing everything to objectId
  profilePicture: any;
  username: string;
  role: string;
  votesAllocated: number;
  votesRemaining: number;
  votesGiven: Object<string, number>;
  votesReceived: number;
  value: number;
};

export type MemberStats = {
  votesAllocated: number;
  votesRemaining: number;
  votesGiven: Object<string, number>;
};

export interface Team {
  teamId: number;
  name: string;
  description: string;
  members: Array<string>;
  memberDetails: Object<string, Member>;
  roles: Object<string, string>;
  isPublic: boolean;
  discord: string;
  twitter: string;
  github: string;
  _createdAt: object;
  _id: string;
  _updatedAt: object;
  _created_at: any;
  logo: string;
  boards: BoardData[];
}

export interface Epoch {
  startTime: Date;
  duration: number;
  endTime: Date;
  choices: [];
  taskDetails: Object<string, Task>;
  memberStats: Object<string, MemberStats>;
  values: Object<string, number>;
  votes: Object<string, number>;
  type: string;
  strategy: string;
  teamId: number;
  spaceId: string;
  epochNumber: number;
  active: boolean;
  name: string;
  votesGivenByCaller: Object<string, number>;
  votesRemaining: number;
  votesAllocated: number;
  votesReceived: number;
  chain: Chain;
  token: Token;
  budget: number;
  objectId: string;
  _createdAt: object;
  _id: string;
  _updatedAt: object;
  _created_at: any;
}

export interface Token {
  address?: string;
  symbol: string;
}

export interface Chain {
  chainId: string;
  name: string;
}

export interface Task {
  taskId: string;
  title: string;
  description: any;
  submission: {
    link: string;
    name: string;
  };
  deadline: Date;
  tags: string[];
  assignee: Array<string>;
  reviewer: Array<string>;
  creator: string;
  chain: Object<string, string>;
  value: number;
  token: Object<string, string>;
  activity: [
    {
      actor: string;
      action: number;
      timestamp: Date;
      username: string;
      profilePicture: any;
    }
  ];
  status: number;
  members: Member[];
  access: {
    creator: boolean;
    reviewer: boolean;
    assignee: boolean;
  };
  issueLink?: string;
  boardId: string;
  createdAt: string;
}

export interface Contracts {
  distributorContract?: ethers.Contract;
}

export type Column = {
  id: string;
  title: string;
  taskIds: string[];
  status: string;
  color: string;
};

export interface BoardData {
  objectId: string;
  name: string;
  tasks: {
    [key: string]: Task;
  };
  columns: {
    [key: string]: Column;
  };
  columnOrder: string[];
  teamId: number;
  createdAt: string;
  updatedAt: string;
  statusList: string[];
  members: string[];
  memberDetails: Object<string, Member>;
  access: string;
  roles: Object<string, string>;
  epochs: Epoch[];
  _id: string;
  _createdAt: string;
  team: Team[];
}

export type TokenInfo = {
  address: string;
  symbol: string;
  name: string;
  pictureUrl: string;
};

export type NetworkInfo = {
  tokenAddresses: string[];
  distributorAddress?: string;
  name: string;
  mainnet: boolean;
  chainId: string;
  nativeCurrency: string;
  pictureUrl: string;
  tokens: { [tokenAddress: string]: TokenInfo };
};

export type Registry = {
  [chainId: string]: NetworkInfo;
};
