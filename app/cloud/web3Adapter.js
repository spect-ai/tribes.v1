async function getAllowance(
  chainId,
  tokenAddress,
  callerAddress,
  spenderAddress
) {
  const web3 = Moralis.web3ByChain(chainId);
  const abi = Moralis.Web3.abis.erc20;
  var contract = new web3.eth.Contract(abi, tokenAddress);
  return await contract.methods
    .allowance(callerAddress.toLowerCase(), spenderAddress.toLowerCase())
    .call()
    .catch((err) => logger.info(err));
}

async function getNativeCurrencyBalance(chain, callerAddress) {
  return await Moralis.Web3API.account.getNativeBalance({
    chain: chain,
    address: callerAddress,
  });
}

async function getTokenBalances(chain, callerAddress) {
  return await Moralis.Web3API.account.getTokenBalances({
    chain: chain,
    address: callerAddress,
  });
}
