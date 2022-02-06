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

export interface Team {
  teamId: number;
  name: string;
  mission: string;
  treasuryAddress: string;
  onchain: boolean;
  members: List<Object<string, string>>;
  organization: string;
  organizationVerified: boolean;
  openApplications: boolean;
  applicationRequirements: boolean;
  latestContributionEpoch: string;
  latestTaskEpoch: string;
  _createdAt: object;
  _id: string;
  _updatedAt: object;
  _created_at: any;
}

export interface Epoch {
  startTime: object;
  duration: number;
  endTime: Date;
  members: List<string>;
  memberStats: List<Object<string, any>>;
  type: string;
  strategy: string;
  budget: number;
  teamId: number;
  epochNumber: number;
  active: boolean;
  tasks: Task[];
  _createdAt: object;
  _id: string;
  _updatedAt: object;
  _created_at: any;
}

export interface Task {
  epochId: number;
  title: string;
  // id: string;
  issueNumber: number;
  issueLink: string;
  onchain: boolean;
  source: string;
  value: number;
  votes: number;
  status: number;
  _createdAt: object;
  _id: string;
  _updatedAt: object;
  _created_at: any;
}
