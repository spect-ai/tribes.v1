Moralis.Cloud.define("addERC20Token", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const token = new Moralis.Object("Addresses");
    token.set("type", "erc20");
    token.set("address", request.params.address);
    token.set("chainId", request.params.chainId);
    token.set("symbol", "symbol");
    token.set("name", "name");
  } catch (err) {
    logger.error(`Error while adding erc20 token ${err}`);
    return false;
  }
});

Moralis.Cloud.define("getRegistry", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    const chainQuery = new Moralis.Query("Network");
    const pipeline = [
      {
        lookup: {
          from: "Addresses",
          localField: "chainId",
          foreignField: "chainId",
          as: "addresses",
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
        tokenAddresses: [],
        tokens: {},
      };
      for (var addr of network.addresses) {
        if (addr.type === "distributor") {
          registry[network.chainId].distributorAddress = addr.address;
        } else if (addr.type === "erc20") {
          registry[network.chainId].tokens[addr.address] = {
            address: addr.address,
            name: addr.name,
            symbol: addr.symbol,
          };
          registry[network.chainId].tokenAddresses.push(addr.address);
        }
      }
    }
    logger.info(`registry: ${JSON.stringify(registry)}`);

    return registry;
  } catch (err) {
    logger.error(`Error while get chain token map ${err}`);
    return false;
  }
});
