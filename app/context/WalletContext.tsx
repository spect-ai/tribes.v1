import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletContextType {
  networkVersion: string;
  setNetworkVersion: (networkVersion: string) => void;
  chainIdHex: string;
  setChainIdHex: (chainIdHex: string) => void;
}

const useProviderWallet = () => {
  const [networkVersion, setNetworkVersion] = useState('');
  const [chainIdHex, setChainIdHex] = useState('');
  const [account, setAccount] = useState();

  useEffect(() => {
    if (window.ethereum) {
      setNetworkVersion(window.ethereum.networkVersion);
      setChainIdHex(window.ethereum.chainId);
      window.ethereum.on('chainChanged', () => {
        window.ethereum.request({ method: 'net_version' }).then((res: any) => {
          setNetworkVersion(res);
        });
        window.ethereum.request({ method: 'eth_chainId' }).then((res: any) => {
          setChainIdHex(res);
        });
      });
    }
  }, []);

  return {
    networkVersion,
    setNetworkVersion,
    chainIdHex,
    setChainIdHex,
  };
};

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export const useWalletContext = () => useContext(WalletContext);

function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const context = useProviderWallet();

  return (
    <WalletContext.Provider value={context}>{children}</WalletContext.Provider>
  );
}

export default WalletContextProvider;
export { useProviderWallet };
