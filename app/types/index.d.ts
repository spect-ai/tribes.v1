import { BigNumber } from 'ethers';
import Moralis from 'moralis/types';

export interface Contracts {
  // eslint-disable-next-line no-undef
  distributorContract?: ethers.Contract;
}

export interface Token {
  address: string;
  symbol: string;
}

export type Block = {
  id: string;
  tag: string;
  type: string | undefined;
  html: string;
  imageUrl: string;
  embedUrl: string;
  ref?: any;
};
export interface Chain {
  chainId: string;
  name: string;
}

export type TokenGate = {
  chain: Chain;
  token: Token;
  tokenLimit: string;
};

export type DefaultPayment = {
  chain: Chain;
  token: Token;
};
export interface User {
  teams: Array<number>;
  ethAddress: string;
  _createdAt: object;
  _id: string;
  _updatedAt: object;
  _created_at: any;
}

export interface SoulboundInfo {
  title: string;
  claimee: string;
  contentUri: string;
  deadline: string;
  description: string;
  issuer: string;
  id: number;
}

export type Member = {
  ethAddress: string;
  objectId: string;
  userId: string; // TODO: Remove after chaing everything to objectId
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

export type MemberDetails = {
  [key: string]: Member;
};

export interface Feedback {
  givenBy: string;
  receivedBy: string;
  content: string;
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
  revisionInstruction: string;
}

export type Channel = {
  id: string;
  name: string;
};

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
  discordChannels?: Channel[];
};
export interface Task {
  issuer: string;
  taskId: string;
  title: string;
  description: any;
  submission: {
    link: string;
    name: string;
  };
  deadline: Date | null;
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
  votes: string[];
  onChainBountyId?: number;
  nftAddress?: string;
  attested?: boolean;
  ipfsUrl?: string;
  claimedBy?: string[];
  issuer?: string;
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
  description: string;
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
  transactionHash: string;
  feedbackReceived: Object<string, string>;
  feedbackGiven: Object<string, string>;
  members: string[];
  _createdAt: object;
  _id: string;
  _updatedAt: object;
  _created_at: any;
}

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
  memberDetails: MemberDetails;
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
  // eslint-disable-next-line no-use-before-define
  team: Team[];
  defaultPayment: DefaultPayment;
  tokenGating: TokenGate;
  description: string;
  private: boolean;
  creatingEpoch: boolean;
  guildId: string;
  discussionChannel: Channel;
  githubRepos: string[];
}
export interface Team {
  teamId: string;
  name: string;
  description: string;
  members: Array<string>;
  memberDetails: MemberDetails;
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
/* TODO: Compress CurrentUser and Profile into a single type after checking impact */
export interface Profile {
  profilePicture: any;
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
  cards: Task[];
  epochs: Epoch[];
  ethAddress: string;
  spaceDetails: object;
  tribeDetails: object;
  memberDetails: MemberDetails;
  github: string;
  twitter: string;
  website: string;
  bio: string;
  linkedin: string;
  skills: string[];
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
  blockExplorer?: string;
  provider: string;
  tokens: { [tokenAddress: string]: TokenInfo };
};

export type Registry = {
  [chainId: string]: NetworkInfo;
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

export type ApprovalInfo = {
  required: boolean;
  uniqueTokenAddresses: Array<string>;
  aggregatedTokenValues: Array<number>;
};

export type DistributionInfo = {
  cardIds: string[];
  epochId?: string;
  type: string;
  contributors: Array<string>;
  tokenAddresses: Array<string>;
  tokenValues: Array<number>;
  contributorToCardIds?: Object<string, string>;
};

export type PaymentInfo = {
  approval: ApprovalInfo;
  tokens: DistributionInfo;
  currency: DistributionInfo;
};
