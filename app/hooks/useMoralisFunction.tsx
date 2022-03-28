import { useEffect } from "react";
import {
  MoralisCloudFunctionParameters,
  useMoralis,
  useMoralisCloudFunction,
} from "react-moralis";

export function useMoralisFunction() {
  const { Moralis } = useMoralis();

  const runMoralisFunction = (functionName: string, params: any) => {
    return Moralis.Cloud.run(functionName, params);
  };

  return {
    runMoralisFunction,
  };
}
