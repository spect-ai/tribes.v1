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
  _createdAt: object;
  _id: string;
  _updatedAt: object;
  _created_at: any;
}

export interface Epoch {
  startTime: object;
  duration: number;
  endTime: number;
  members: List<string>;
  memberStats: List<Object<string, any>>;
  type: string;
  strategy: string;
  budget: number;
  teamId: number;
  epochNumber: number;
  _createdAt: object;
  _id: string;
  _updatedAt: object;
  _created_at: any;
}
