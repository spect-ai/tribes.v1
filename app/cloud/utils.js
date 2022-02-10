async function calcReward(epoch) {
  const logger = Moralis.Cloud.getLogger();
  var totalVotesAllocated = 0;
  var updatedMemberStats = epoch.get("memberStats");
  if (epoch.get("type") === "Contribution") {
    for (var member of updatedMemberStats) {
      totalVotesAllocated += member["votesReceived"];
    }
    for (var member of updatedMemberStats) {
      member["reward"] = (member["votesReceived"] * epoch.get("budget")) / totalVotesAllocated;
    }
    epoch.set("memberStats", updatedMemberStats);
  }
  if (epoch.get("type") === "Task") {
    const taskQuery = new Moralis.Query("Task");
    taskQuery.equalTo("epochId", epoch.id);
    const tasks = await taskQuery.find();
    var totalVotesAllocated = 0;
    for (var task of tasks) {
      totalVotesAllocated += task.get("votes");
    }
    logger.info(JSON.stringify(tasks));
    for (var task of tasks) {
      var value = (task.get("votes") * epoch.get("budget")) / totalVotesAllocated;
      logger.info(value);
      task.set("value", value);
    }
    await Moralis.Object.saveAll(tasks, { useMasterKey: true });
  }

  return epoch;
}

async function calcEffectiveVotes(votes, members, voterAddress) {
  /* votes: {"0x232324": 10,
                '0x232324': 19)
        members: [{"ethAddress":"0x232324", "votesGiven": 10, "votesReceived":9, "votesRemaining":90},
                {"ethAddress':'0x232324', 'votes': 19, "votesReceived":9, "votesRemaining":90}]
      */
  var totalEffectiveVote = 0;
  logger.info("members");
  logger.info(JSON.stringify(members));
  logger.info(JSON.stringify(voterAddress));
  var voterStats = members.filter((a) => a.ethAddress === voterAddress);
  logger.info(JSON.stringify(voterStats));
  var idx = 0;
  var voterIdx;
  for (var member of members) {
    if (member["ethAddress"] !== voterAddress) {
      var numVotes = votes[member["ethAddress"]];
      member["votesReceived"] += numVotes;
      totalEffectiveVote += Math.pow(numVotes, 2);
      if (voterStats["votesRemaining"] < totalEffectiveVote) {
        throw "Not enough votes remaining";
      }
      idx++;
    } else {
      voterIdx = idx;
    }
  }
  logger.info(`${voterIdx} voteridx`);
  members[voterIdx]["votesRemaining"] -= totalEffectiveVote;
  members[voterIdx]["votesGiven"] += totalEffectiveVote;
  members[voterIdx]["votesAllocated"] = votes;

  return members;
}
