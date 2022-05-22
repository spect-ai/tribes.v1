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
    return tx.wait();
  }

  async function getBounty(bountyid: number) {
    const credsHub = getCredsHub();
    const tx = await credsHub.getBounty(bountyid);
    return tx.wait();
  }

  async function claim(bountyid: number) {
    const credsHub = getCredsHub();
    const tx = await credsHub.claimBounty(bountyid);
    return tx.wait();
  }

  return {
    createBounty,
    getBounty,
    claim,
  };
}
