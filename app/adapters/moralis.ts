import { Team, Epoch } from "../types/index";

export function getOrCreateUser(Moralis: any) {
  return Moralis.Cloud.run("getOrCreateUser");
}

export function createTribe(Moralis: any, team: any) {
  console.log(team);
  const params = {
    name: team.name,
    description: team.description,
    treasuryAddress: team.treasuryAddress,
    organization: team.organization,
    openApplications: team.openApplications,
    applicationRequirements: team.applicationRequirements,
    preferredChain: team.preferredChain,
    preferredToken: team.preferredToken,
  };
  return Moralis.Cloud.run("createTeam", params);
}

export function updateTribe(Moralis: any, team: Team) {
  const params = {
    name: team.name,
    description: team.description,
    treasuryAddress: team.treasuryAddress,
    organization: team.organization,
    openApplications: team.openApplications,
    applicationRequirements: team.applicationRequirements,
    teamId: team.teamId,
  };
  return Moralis.Cloud.run("updateTeam", params);
}

export function initBoard(Moralis: any, name: string, teamId: number) {
  const params = {
    name: name,
    teamId: teamId,
  };
  return Moralis.Cloud.run("initBoard", params);
}

export function getBoards(Moralis: any, teamId: number) {
  const params = {
    teamId: teamId,
  };
  return Moralis.Cloud.run("getBoards", params);
}

export function getBoard(Moralis: any, boardId: string) {
  const params = {
    boardId: boardId,
  };
  return Moralis.Cloud.run("getBoard", params);
}

export function updateColumnName(Moralis: any, boardId: string, columnId: string, newName: string) {
  const params = {
    boardId: boardId,
    columnId: columnId,
    newName: newName,
  };
  return Moralis.Cloud.run("updateColumnName", params);
}

export function updateColumnOrder(Moralis: any, boardId: string, newColumnOrder: any) {
  const params = {
    boardId: boardId,
    newColumnOrder: newColumnOrder,
  };
  return Moralis.Cloud.run("updateColumnOrder", params);
}

export function updateColumnTasks(
  Moralis: any,
  boardId: string,
  sourceId: string,
  destinationId: string,
  source: any,
  destination: any
) {
  const params = {
    boardId: boardId,
    sourceId: sourceId,
    destinationId: destinationId,
    source: source,
    destination: destination,
  };
  return Moralis.Cloud.run("updateColumnTasks", params);
}
export function addColumn(Moralis: any, boardId: string) {
  const params = {
    boardId: boardId,
  };
  return Moralis.Cloud.run("addColumn", params);
}

export function removeColumn(Moralis: any, boardId: string, columnId: string) {
  const params = {
    boardId: boardId,
    columnId: columnId,
  };
  return Moralis.Cloud.run("removeColumn", params);
}

export function addTask(
  Moralis: any,
  boardId: string,
  columnId: string,
  title: string,
  value: number,
  description: string,
  issueLink: string
) {
  const params = {
    boardId: boardId,
    columnId: columnId,
    title: title,
    value: value,
    description: description,
    issueLink: issueLink,
  };
  return Moralis.Cloud.run("addTask", params);
}

export function getTask(Moralis: any, taskId: string) {
  const params = {
    taskId: taskId,
  };
  return Moralis.Cloud.run("getTask", params);
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

export function acceptInvitations(Moralis: any, ethAddress: string, teamId: number) {
  const params = {
    ethAddress: ethAddress,
    teamId: teamId,
  };
  return Moralis.Cloud.run("acceptInvite", params);
}

export function giftContributors(Moralis: any, epochId: string, votes: object, ethAddress: string) {
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

export function createTasks(Moralis: any, epochId: string, newTasks: any, taskSource: string) {
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

export function updateTask(Moralis: any, task: any) {
  console.log(task);
  const params = {
    task: task,
  };
  return Moralis.Cloud.run("updateTask", params);
}

export function voteOnTasks(Moralis: any, epochId: string, voteAllocation: any) {
  const params = {
    epochId: epochId,
    votes: voteAllocation,
  };
  return Moralis.Cloud.run("voteOnTasks", params);
}

export function checkMemberInTeam(Moralis: any, teamId: number, userId: string) {
  const params = {
    teamId: teamId,
    userId: userId,
  };

  return Moralis.Cloud.run("checkMemberInTeam", params);
}
export function updateBoard(Moralis: any, boardId: string, name: string) {
  const params = {
    boardId: boardId,
    name: name,
  };
  return Moralis.Cloud.run("updateBoard", params);
}

export function deleteBoard(Moralis: any, boardId: string) {
  const params = {
    boardId: boardId,
  };
  return Moralis.Cloud.run("deleteBoard", params);
}

export function getBatchPayAmount(Moralis: any, boardId: string) {
  const params = {
    boardId: boardId,
  };
  return Moralis.Cloud.run("getBatchPayAmount", params);
}
