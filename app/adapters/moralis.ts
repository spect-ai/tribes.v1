import { Team, Epoch } from "../types/index";

export function getOrCreateUser(Moralis: any) {
  return Moralis.Cloud.run("getOrCreateUser");
}

export function createTribe(Moralis: any, team: any) {
  const params = {
    name: team.name,
    mission: team.mission,
    treasuryAddress: team.treasuryAddress,
    organization: team.organization,
    openApplications: team.openApplications,
    applicationRequirements: team.applicationRequirements,
    ethAddress: team.ethAddress,
  };
  return Moralis.Cloud.run("createTeam", params);
}

export function updateTribe(Moralis: any, team: Team) {
  const params = {
    name: team.name,
    mission: team.mission,
    treasuryAddress: team.treasuryAddress,
    organization: team.organization,
    openApplications: team.openApplications,
    applicationRequirements: team.applicationRequirements,
    teamId: team.teamId,
  };
  return Moralis.Cloud.run("updateTeam", params);
}

export function startEpoch(Moralis: any, epoch: any) {
  const params = {
    startTime: epoch.startTime,
    duration: epoch.duration,
    members: epoch.members,
    type: epoch.type,
    strategy: epoch.strategy,
    budget: epoch.budget,
    teamId: epoch.teamId,
  };
  return Moralis.Cloud.run("startEpoch", params);
}

export function updateMembers(Moralis: any, updatePayload: any) {
  const params = {
    members: updatePayload.members,
    teamId: updatePayload.teamId,
  };
  return Moralis.Cloud.run("updateMembers", params);
}

export function getTeam(Moralis: any, teamId: number) {
  const params = {
    teamId: teamId,
  };
  return Moralis.Cloud.run("getTeam", params);
}

export function getEpoch(Moralis: any, epochId: string) {
  console.log(epochId);
  const params = {
    epochId: epochId,
  };
  return Moralis.Cloud.run("getEpoch", params);
}

export function getGithubToken(Moralis: any, code: string) {
  const params = {
    code: code,
  };
  return Moralis.Cloud.run("getGithubToken", params);
}

export function getInvitations(Moralis: any, ethAddress: string) {
  const params = {
    ethAddress: ethAddress,
  };
  return Moralis.Cloud.run("getMyInvites", params);
}

export function acceptInvitations(
  Moralis: any,
  ethAddress: string,
  teamId: number
) {
  const params = {
    ethAddress: ethAddress,
    teamId: teamId,
  };
  return Moralis.Cloud.run("acceptInvite", params);
}

export function giftContributors(
  Moralis: any,
  epochId: string,
  votes: object,
  ethAddress: string
) {
  const params = {
    epochId: epochId,
    votes: votes,
    ethAddress: ethAddress,
  };
  return Moralis.Cloud.run("giftContributors", params);
}

export function endEpoch(Moralis: any, epochId: string) {
  const params = {
    epochId: epochId,
  };
  return Moralis.Cloud.run("endEpoch", params);
}

export function createTasks(
  Moralis: any,
  epochId: string,
  newTasks: any,
  taskSource: string
) {
  console.log(`epochId ${epochId}`);
  const params = {
    epochId: epochId,
    newTasks: newTasks,
    taskSource: taskSource,
  };
  return Moralis.Cloud.run("createTasks", params);
}

// Also includes tasks in that epoch
export function getTaskEpoch(Moralis: any, epochId: string) {
  const params = {
    epochId: epochId,
  };
  return Moralis.Cloud.run("getTaskEpoch", params);
}

export function updateTask(
  Moralis: any,
  taskId: string,
  status: number,
  paid: boolean = false
) {
  const params = {
    id: taskId,
    status: status,
    paid: paid,
  };
  return Moralis.Cloud.run("updateTask", params);
}

export function voteOnTasks(
  Moralis: any,
  epochId: string,
  voteAllocation: any
) {
  console.log(epochId, voteAllocation);
  const params = {
    epochId: epochId,
    votes: voteAllocation,
  };
  return Moralis.Cloud.run("voteOnTasks", params);
}
