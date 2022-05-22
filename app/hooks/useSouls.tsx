import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { ethers } from 'ethers';
import fs from 'fs';
import { Member, Profile } from '../types';
import CredsHub from '../contracts/local/CredsHub.json';
import ClaimModule from '../contracts/local/ClaimModule.json';

export default function useProfileInfo() {
  const [addrs, setAddrs] = useState({} as any);

  function getAddrs(): any {
    const json = fs.readFileSync('../contracts/local/addreses.json', 'utf8');
    return JSON.parse(json);
  }

  useEffect(() => {
    setAddrs(getAddrs());
  }, []);

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

  function createBounty() {}

  function getBounty() {}

  function claim() {}

  return {
    createBounty,
    getBounty,
    claim,
  };
}
