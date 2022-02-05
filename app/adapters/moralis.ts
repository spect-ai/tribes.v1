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

export function startEpoch(Moralis: any, epoch: Epoch) {
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
