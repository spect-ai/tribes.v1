import { BigNumber } from "ethers";
import Moralis from "moralis/types";
import { Delta } from "quill";

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
  discordId: string;
  avatar: string;
};

export type MemberStats = {
  votesAllocated: number;
  votesRemaining: number;
  votesGiven: Object<string, number>;
};

export interface Team {
  teamId: string;
  name: string;
  description: string;
  members: Array<string>;
  memberDetails: Object<string, Member>;
  roles: Object<string, number>;
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
  theme: number;
  guildId: string;
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
  teamId: string;
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
  nativeCurrencyPayment: boolean;
  paid: boolean;
  votesFor: Object<string, number>;
  votesAgainst: Object<string, number>;
  _createdAt: object;
  _id: string;
  _updatedAt: object;
  _created_at: any;
}

export interface Token {
  address: string;
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
    applicant: boolean;
    canApply: boolean;
  };
  issueLink?: string;
  boardId: string;
  createdAt: string;
  type: string;
  submissions: Array<SubmissionData>;
  proposals: Array<Proposal>;
  numProposals: number;
  selectedProposals: Array<string>;
  updates: Array<object>;
  columnId: string;
  comments: Array<Comment>;
}

export interface Submission {
  userId: string;
  submissionId: string;
  link: string;
  name: string;
}

export interface Proposal {
  userId: string;
  id: string;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  edited: boolean;
}

export interface Comment {
  userId: string;
  id: string;
  content: Block[];
  createdAt: Date;
  updatedAt: Date;
  edited: boolean;
}

export interface SubmissionData {
  userId: string;
  id: string;
  content: Block[];
  createdAt?: Date;
  updatedAt?: Date;
  edited: boolean;
}

export interface Contracts {
  distributorContract?: ethers.Contract;
}

export type Column = {
  id: string;
  title: string;
  taskIds: string[];
  cardType: number;
  createCard: {
    [key: number]: boolean;
  };
  moveCard: {
    [key: number]: boolean;
  };
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
  teamId: string;
  createdAt: string;
  updatedAt: string;
  statusList: string[];
  members: string[];
  memberDetails: {
    [key: string]: Member;
  };
  taskDetails: Object<string, Task>;
  access: string;
  roles: {
    [key: string]: number;
  };
  roleMapping: {
    [key: string]: number;
  };
  userRole: number;
  epochs: Epoch[];
  _id: string;
  _createdAt: string;
  team: Team[];
  defaultPayment: DefaultPayment;
  tokenGating: TokenGate;
  private: boolean;
  creatingEpoch: boolean;
  guildId: string;
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

export type TokenGate = {
  chain: Chain;
  token: Token;
  tokenLimit: string;
};

export type DefaultPayment = {
  chain: Chain;
  token: Token;
};

export type DiscordResult = {
  accent_color: string;
  avatar: string;
  banner: string;
  banner_color: string;
  discriminator: string;
  flags: number;
  id: string;
  locale: string;
  mfa_enabled: boolean;
  public_flags: number;
  username: string;
  email: string;
  verified: boolean;
};

export type CurrentUser = {
  avatar: string;
  createdAt: string;
  is_discord_linked: boolean;
  objectId: string;
  tribes: string[];
  updatedAt: string;
  userId: string;
  username: string;
  userId: string;
  email: string;
  discordId: string;
};

export type Block = {
  id: string;
  tag: string;
  type: string;
  html: string;
  imageUrl: string;
  embedUrl: string;
};
