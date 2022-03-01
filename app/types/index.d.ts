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
  allocation: number;
  votesRemaining: number;
  votesGiven: Object<string, number>;
  votesReceived: number;
  value: number;
};

export type MemberStats = {
  allocation: number;
  votesRemaining: number;
  votesGiven: Object<string, number>;
};

export interface Team {
  teamId: number;
  name: string;
  description: string;
  // treasuryAddress: string;
  // onchain: boolean;
  members: Member[];
  // organization: string;
  // organizationVerified: boolean;
  // openApplications: boolean;
  // applicationRequirements: boolean;
  // latestContributionEpoch: string;
  // latestTaskEpoch: string;
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
  value: Object<string, number>;
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

// export interface Task {
//   epochId: number;
//   title: string;
//   // id: string;
//   paid: boolean;
//   issueNumber: number;
//   issueLink: string;
//   onchain: boolean;
//   source: string;
//   value: number;
//   votes: number;
//   status: number;
//   assignee: string;
//   _createdAt: object;
//   _id: string;
//   _updatedAt: object;
//   _created_at: any;
// }

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
  assignee: Member[];
  reviewer: Member[];
  creator: string;
  chain: Chain;
  value: number;
  token: Token;
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
  members: Member[];
  memberDetails: Object<string, Member>;
  access: string;
  _id: string;
  _createdAt: string;
}

export type TokenInfo = {
  address: string;
  symbol: string;
  name: string;
};

export type NetworkInfo = {
  tokenAddresses: string[];
  distributorAddress?: string;
  name: string;
  mainnet: boolean;
  chainId: string;
  nativeCurrency: string;
  tokens: { [tokenAddress: string]: TokenInfo };
};

export type Registry = {
  [chainId: string]: NetworkInfo;
};
