import SafeServiceClient from "@gnosis.pm/safe-service-client";
import Safe, { SafeFactory } from "@gnosis.pm/safe-core-sdk";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import { SafeTransactionDataPartial } from "@gnosis.pm/safe-core-sdk-types";
import { ethers } from "ethers";

export async function getUserSafes(address: string) {
  const transactionServiceUrl = "https://safe-transaction.polygon.gnosis.io/";
  const safeService = new SafeServiceClient(transactionServiceUrl);

  // const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  // const safeOwner = provider.getSigner(0);

  // console.log(safeOwner);

  // const ethAdapter = new EthersAdapter({
  //   ethers,
  //   signer: safeOwner,
  // });

  // const safeFactory = await SafeFactory.create({ ethAdapter });
  // const safeSdk = await Safe.create({
  //   ethAdapter,
  //   safeAddress: "0xCE02ab993338c9a977e6f93fcFdB0e39090E0Df2",
  // });
  // const transaction: SafeTransactionDataPartial = {
  //   to: "0xCE02ab993338c9a977e6f93fcFdB0e39090E0Df2",
  //   data: "0x",
  //   value: "10000",
  // };

  // console.log(transaction);

  //   const safeTransaction = await safeSdk.createTransaction(transaction);
  //   console.log(safeTransaction);
  //   await safeSdk.signTransaction(safeTransaction);
  //   const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
  //   console.log(safeTxHash);
  console.log(ethers.utils.getAddress(address));
  const safes = await safeService.getSafesByOwner(
    ethers.utils.getAddress(address)
  );
  return safes;
  // await safeService.proposeTransaction({
  //   safeAddress: "0xCE02ab993338c9a977e6f93fcFdB0e39090E0Df2",
  //   safeTransaction,
  //   safeTxHash,
  //   senderAddress: "0x6304CE63F2EBf8C0Cc76b60d34Cc52a84aBB6057",
  //   origin: "Spect network op",
  // });
}

export async function massPayment(safeAddress: string, senderAddress: string) {
  console.log(safeAddress);
  const transactionServiceUrl = "https://safe-transaction.polygon.gnosis.io/";
  const safeService = new SafeServiceClient(transactionServiceUrl);

  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  // let userContract = new ethers.Contract(
  //   "0x6304CE63F2EBf8C0Cc76b60d34Cc52a84aBB6057",
  //   {"_abiCoder": new ethers.utils.AbiCoder(), "_signer": provider.getSigner(0)},
  //   provider.getSigner()
  // );
  // const data = await userContract.populateTransaction.myFunction(value);

  const safeOwner = provider.getSigner(0);

  console.log(safeOwner);

  const ethAdapter = new EthersAdapter({
    ethers,
    signer: safeOwner,
  });

  const safeFactory = await SafeFactory.create({ ethAdapter });
  const safeSdk = await Safe.create({
    ethAdapter,
    safeAddress: safeAddress,
  });
  const transaction: SafeTransactionDataPartial = {
    to: safeAddress,
    data: "0x",
    value: "10000",
  };

  console.log(transaction);

  const safeTransaction = await safeSdk.createTransaction(transaction);
  console.log(safeTransaction);
  await safeSdk.signTransaction(safeTransaction);
  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
  console.log(safeTxHash);

  await safeService.proposeTransaction({
    safeAddress: safeAddress,
    safeTransaction,
    safeTxHash,
    senderAddress: senderAddress,
    origin: "Spect tribes",
  });
}
