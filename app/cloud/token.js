const getRegistry = async () => {
  const chainQuery = new Moralis.Query('Network');
  const pipeline = [
    {
      lookup: {
        from: 'Addresses',
        localField: 'chainId',
        foreignField: 'chainId',
        as: 'addresses',
      },
    },
  ];
  const networks = await chainQuery.aggregate(pipeline);
  logger.info(`networks: ${JSON.stringify(networks)}`);

  var registry = {};
  for (var network of networks) {
    registry[network.chainId] = {
      name: network.name,
      mainnet: network.mainnet,
      chainId: network.chainId,
      nativeCurrency: network.nativeCurrency,
      pictureUrl: network.pictureUrl,
      blockExplorer: network.blockExplorer,
      provider: network.provider,
      tokenAddresses: [],
      tokens: {},
    };
    for (var addr of network.addresses) {
      if (addr.type === 'distributor') {
        registry[network.chainId].distributorAddress = addr.address;
      } else if (addr.type === 'erc20') {
        registry[network.chainId].tokens[addr.address] = {
          address: addr.address,
          name: addr.name,
          symbol: addr.symbol,
          pictureUrl: addr.pictureUrl,
        };
        registry[network.chainId].tokenAddresses.push(addr.address);
      }
    }
  }
  return registry;
};

Moralis.Cloud.define('addERC20Token', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const token = new Moralis.Object('Addresses');
    token.set('type', 'erc20');
    token.set('address', request.params.address);
    token.set('chainId', request.params.chainId);
    token.set('symbol', request.params.symbol);
    token.set('name', request.params.name);
    await Moralis.Object.saveAll([token], { useMasterKey: true });
    const registry = await getRegistry();
    return registry;
  } catch (err) {
    logger.error(
      `Error while adding erc20 token with address ${request.params.address}: ${err}`
    );
    throw `Error while adding erc20 token ${err}`;
  }
});

Moralis.Cloud.define('getRegistry', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const registry = await getRegistry();
    logger.info(`registry: ${JSON.stringify(registry)}`);
    return registry;
  } catch (err) {
    logger.error(`Error while getting registry ${err}`);
    throw `Error while getting registry ${err}`;
  }
});
