Moralis.Cloud.define('archiveEpoch', async (request) => {
  try {
    var epoch = await getEpochParseObjByObjectId(request.params.epochId);
    epoch.set('archived', true);
    await Moralis.Object.saveAll([epoch], { useMasterKey: true });
    return await getEpochs(request.params.spaceId, request.user.id);
  } catch (err) {
    logger.error(
      `Error while archiving epoch ${request.params.epochId}: ${err}`
    );
    throw `Error while archiving epoch ${err}`;
  }
});
