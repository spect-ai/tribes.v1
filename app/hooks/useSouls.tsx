import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { ethers } from 'ethers';
import { Member, Profile } from '../types';
import CredsHub from '../contracts/local/CredsHub.json';
import ClaimModule from '../contracts/local/ClaimModule.json';
import addrs from '../contracts/local/addresses.json';

export default function useSouls() {
  //   const [addrs, setAddrs] = useState({} as any);

  //   function getAddrs(): any {
  //     return JSON.parse(Addresses);
  //   }

  //   useEffect(() => {
  //     setAddrs(getAddrs());
  //   }, []);

  function getCredsHub() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(
      addrs.credHub,
      CredsHub.abi,
      provider.getSigner()
    );
  }

  function getClaimModule() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(
      addrs.claimModule,
      ClaimModule.abi,
      provider.getSigner()
    );
  }

  async function createBounty(whitelistAddresses: string[], ipfsLink: string) {
    const credsHub = getCredsHub();
    const inputStruct = {
      claimModule: addrs.claimModule,
      claimModuleInitData: ethers.utils.defaultAbiCoder.encode(
        ['address[]'],
        [whitelistAddresses]
      ),
      contentUri: ipfsLink,
    };

    const tx = await credsHub.createBounty(inputStruct);
    console.log(tx);
    tx.wait();
    // eslint-disable-next-line no-return-await
    return await credsHub.getNumBounties();
  }

  async function getBounty(bountyid: number) {
    const credsHub = getCredsHub();
    // eslint-disable-next-line no-return-await
    return await credsHub.getBounty(bountyid);
  }

  async function claim(bountyid: number) {
    const credsHub = getCredsHub();
    const tx = await credsHub.claimBounty(bountyid);
    tx.wait();
    // eslint-disable-next-line no-return-await
    return await credsHub.getBounty(bountyid);
  }

  return {
    createBounty,
    getBounty,
    claim,
  };
}
