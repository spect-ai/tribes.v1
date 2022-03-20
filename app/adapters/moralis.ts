import {
  Team,
  Epoch,
  Member,
  Chain,
  Token,
  TokenGate,
  DefaultPayment,
} from "../types/index";

export function getOrCreateUser(Moralis: any) {
  return Moralis.Cloud.run("getOrCreateUser");
}

export function createTribe(Moralis: any, name: string) {
  const params = {
    name: name,
  };
  return Moralis.Cloud.run("createTeam", params);
}

export function updateTribe(Moralis: any, team: Team, teamId: string) {
  const params = {
    teamId: teamId,
    name: team.name,
    description: team.description,
    isPublic: team.isPublic,
    discord: team.discord,
    twitter: team.twitter,
    github: team.github,
    logo: team.logo,
  };
  return Moralis.Cloud.run("updateTeam", params);
}

export function initBoard(
  Moralis: any,
  name: string,
  members: Array<string>,
  roles: object,
  teamId: string,
  tokenGating: {
    chain: Chain;
    token: Token;
    tokenLimit: number;
  },
  isPrivate: boolean
) {
  console.log(members);
  const params = {
    name: name,
    teamId: teamId,
    members: members,
    roles: roles,
    tokenGating: tokenGating,
    isPrivate: isPrivate,
  };
  return Moralis.Cloud.run("initBoard", params);
}

export function getEssentialBoardsInfo(Moralis: any, teamId: string) {
  const params = {
    teamId: teamId,
  };
  return Moralis.Cloud.run("getEssentialBoardsInfo", params);
}

export function getSpace(Moralis: any, boardId: string) {
  const params = {
    boardId: boardId,
  };
  return Moralis.Cloud.run("getBoard", params);
}

export function updateColumnName(
  Moralis: any,
  boardId: string,
  columnId: string,
  newName: string
) {
  const params = {
    boardId: boardId,
    columnId: columnId,
    newName: newName,
  };
  return Moralis.Cloud.run("updateColumnName", params);
}

export function updateColumnOrder(
  Moralis: any,
  boardId: string,
  newColumnOrder: any
) {
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

export function updateMembers(Moralis: any, updatePayload: any) {
  const params = {
    members: updatePayload.members,
    teamId: updatePayload.teamId,
  };
  return Moralis.Cloud.run("updateMembers", params);
}

export function getTeam(Moralis: any, teamId: string) {
  const params = {
    teamId: teamId,
  };
  return Moralis.Cloud.run("getTeam", params);
}

export function getPublicTeams(Moralis: any) {
  return Moralis.Cloud.run("getPublicTeams");
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

export function acceptInvitations(
  Moralis: any,
  ethAddress: string,
  teamId: string
) {
  const params = {
    ethAddress: ethAddress,
    teamId: teamId,
  };
  return Moralis.Cloud.run("acceptInvite", params);
}

export function sendInvitations(
  Moralis: any,
  ethAddress: string,
  teamId: string,
  userId: string
) {
  const params = {
    ethAddress: ethAddress,
    teamId: teamId,
    invitedBy: userId,
  };
  return Moralis.Cloud.run("sendInvite", params);
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

export function createTasks(
  Moralis: any,
  epochId: string,
  newTasks: any,
  taskSource: string
) {
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

export function updateTask(Moralis: any, task: any, columnId: string) {
  const params = {
    task: task,
    columnId: columnId,
  };
  return Moralis.Cloud.run("updateTask", params);
}

export function updateTaskDeadline(
  Moralis: any,
  deadline: string,
  taskId: string
) {
  const params = {
    deadline: deadline,
    taskId: taskId,
  };
  return Moralis.Cloud.run("updateTaskDeadline", params);
}

export function updateTaskLabels(Moralis: any, tags: string[], taskId: string) {
  const params = {
    tags: tags,
    taskId: taskId,
  };
  return Moralis.Cloud.run("updateTaskLabels", params);
}

export function updateTaskMember(
  Moralis: any,
  member: string,
  type: string,
  taskId: string
) {
  const params = {
    member: member,
    type: type,
    taskId: taskId,
  };
  return Moralis.Cloud.run("updateTaskMember", params);
}

export function updateTaskReward(
  Moralis: any,
  chain: Chain,
  token: Token,
  value: number,
  taskId: string
) {
  if (token.hasOwnProperty("address")) var nativeCurrencyPayment = false;
  else var nativeCurrencyPayment = true;

  const params = {
    chain: chain,
    token: token,
    value: value,
    taskId: taskId,
    nativeCurrencyPayment: nativeCurrencyPayment,
  };
  return Moralis.Cloud.run("updateTaskReward", params);
}

export function updateTaskSubmission(
  Moralis: any,
  link: string,
  name: string,
  taskId: string
) {
  const params = {
    submissionLink: link,
    submissionName: name,
    taskId: taskId,
  };
  return Moralis.Cloud.run("updateTaskSubmission", params);
}

export function updateTaskDescription(
  Moralis: any,
  description: string,
  taskId: string
) {
  const params = {
    description: description,
    taskId: taskId,
  };
  return Moralis.Cloud.run("updateTaskDescription", params);
}

export function updateTaskTitle(Moralis: any, title: string, taskId: string) {
  const params = {
    title: title,
    taskId: taskId,
  };
  return Moralis.Cloud.run("updateTaskTitle", params);
}

export function updateTaskColumn(
  Moralis: any,
  boardId: string,
  taskId: string,
  sourceId: string,
  destinationId: string
) {
  const params = {
    boardId: boardId,
    taskId: taskId,
    sourceId: sourceId,
    destinationId: destinationId,
  };
  return Moralis.Cloud.run("updateTaskColumn", params);
}

export function updateTaskStatus(Moralis: any, taskId: string, status: number) {
  const params = {
    taskId: taskId,
    status: status,
  };
  return Moralis.Cloud.run("updateTaskStatus", params);
}

export function assignToMe(Moralis: any, taskId: string) {
  const params = {
    taskId: taskId,
  };
  return Moralis.Cloud.run("assignToMe", params);
}

export function closeTask(Moralis: any, taskId: string) {
  const params = {
    taskId: taskId,
  };
  return Moralis.Cloud.run("closeTask", params);
}

export function voteOnTasks(
  Moralis: any,
  epochId: string,
  voteAllocation: any
) {
  const params = {
    epochId: epochId,
    votes: voteAllocation,
  };
  return Moralis.Cloud.run("voteOnTasks", params);
}

export function checkMemberInTeam(
  Moralis: any,
  teamId: string,
  userId: string | undefined
) {
  const params = {
    teamId: teamId,
    userId: userId,
  };

  return Moralis.Cloud.run("checkMemberInTeam", params);
}
export function updateBoard(
  Moralis: any,
  boardId: string,
  name: string,
  defaultPayment: DefaultPayment,
  tokenGating: TokenGate
) {
  const params = {
    boardId: boardId,
    name: name,
    defaultPayment: defaultPayment,
    tokenGating: tokenGating,
  };
  return Moralis.Cloud.run("updateBoard", params);
}

export function deleteBoard(Moralis: any, boardId: string) {
  const params = {
    boardId: boardId,
  };
  return Moralis.Cloud.run("deleteBoard", params);
}

export function addMemberToTribe(
  Moralis: any,
  teamId: string,
  userId: string,
  userType: string,
  adminId: string
) {
  const params = {
    teamId: teamId,
    userId: userId,
    userType: userType,
    adminId: adminId,
  };
  return Moralis.Cloud.run("addMemberToTribe", params);
}
export function getBatchPayAmount(
  Moralis: any,
  boardId: string,
  chainId: string
) {
  const params = {
    boardId: boardId,
    chainId: chainId,
  };
  return Moralis.Cloud.run("getBatchPayAmount", params);
}

export function getRegistry(Moralis: any) {
  return Moralis.Cloud.run("getRegistry");
}

export function startEpoch(
  Moralis: any,
  teamId: string,
  spaceId: string,
  name: string,
  type: string,
  duration: number,
  strategy: string,
  members: Member[],
  choices: string[],
  budget: number,
  token: Token,
  chain: Chain,
  passThreshold: number
) {
  const durationInMilliseconds = duration * 86400000; // day => milliseconds
  if (token.hasOwnProperty("address")) var nativeCurrencyPayment = false;
  else var nativeCurrencyPayment = true;

  const params = {
    teamId: teamId,
    spaceId: spaceId,
    name: name,
    type: type,
    startTime: Date.now(),
    duration: durationInMilliseconds,
    strategy: strategy,
    members: members,
    choices: choices,
    budget: budget,
    token: token,
    chain: chain,
    nativeCurrencyPayment: nativeCurrencyPayment,
    passThreshold: passThreshold,
  };
  return Moralis.Cloud.run("startEpoch", params);
}

export function getEpochs(Moralis: any, spaceId: string) {
  const params = {
    spaceId: spaceId,
  };
  return Moralis.Cloud.run("getEpochs", params);
}

export function saveVotes(Moralis: any, epochId: string, votesGiven: object) {
  const params = {
    epochId: epochId,
    votesGiven: votesGiven,
  };
  return Moralis.Cloud.run("saveVotes", params);
}

export function endEpoch(Moralis: any, epochId: string) {
  const params = {
    epochId: epochId,
  };
  return Moralis.Cloud.run("endEpoch", params);
}

export function getMyTeams(Moralis: any) {
  return Moralis.Cloud.run("getMyTeams");
}

export function joinTribe(Moralis: any, teamId: string) {
  const params = {
    teamId: teamId,
  };
  return Moralis.Cloud.run("joinTribe", params);
}

export function completePayment(Moralis: any, taskIds: string[]) {
  const params = {
    taskIds: taskIds,
  };
  console.log(taskIds);
  return Moralis.Cloud.run("completePayment", params);
}

export function completeEpochPayment(Moralis: any, epochId: string) {
  const params = {
    epochId: epochId,
  };
  return Moralis.Cloud.run("completeEpochPayment", params);
}

export function updateBoardMembers(
  Moralis: any,
  boardId: string,
  members: string[],
  roles: { [key: string]: string }
) {
  const params = {
    boardId: boardId,
    members: members,
    roles: roles,
  };
  return Moralis.Cloud.run("updateBoardMembers", params);
}

export function archiveTask(Moralis: any, taskId: string) {
  const params = {
    taskId: taskId,
  };
  return Moralis.Cloud.run("archiveTask", params);
}

export function joinSpace(Moralis: any, boardId: string) {
  const params = {
    boardId: boardId,
  };
  return Moralis.Cloud.run("joinSpace", params);
}

export function moveCards(
  Moralis: any,
  epochId: string,
  passColumnId: string,
  noPassColumnId: string
) {
  const params = {
    epochId: epochId,
    passColumnId: passColumnId,
    noPassColumnId: noPassColumnId,
  };
  return Moralis.Cloud.run("moveCardsAfterEpoch", params);
}

export function updateThemeFromSpace(
  Moralis: any,
  boardId: string,
  teamId: string,
  theme: number
) {
  const params = {
    boardId: boardId,
    teamId: teamId,
    theme: theme,
  };
  return Moralis.Cloud.run("updateThemeFromSpace", params);
}

export function addERC20Token(
  address: string,
  chainId: string,
  symbol: string,
  name: string,
  Moralis: any
) {
  const params = {
    address: address,
    chainId: chainId,
    symbol: symbol,
    name: name,
  };
  return Moralis.Cloud.run("addERC20Token", params);
}

export function getBatchPayInfo(
  Moralis: any,
  taskIds: Array<string>,
  distributor: string
) {
  const params = {
    taskIds: taskIds,
    distributor: distributor,
  };
  return Moralis.Cloud.run("getBatchPayInfo", params);
}
