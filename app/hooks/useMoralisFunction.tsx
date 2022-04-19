import { useEffect } from 'react';
import { useMoralis } from 'react-moralis';

export function useMoralisFunction() {
  const { Moralis } = useMoralis();

  const runMoralisFunction = (functionName: string, params: any) => {
    return Moralis.Cloud.run(functionName, params);
  };

  return {
    runMoralisFunction,
  };
}
