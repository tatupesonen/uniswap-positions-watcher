// Partial source code of Stakewise dAPP (from tsudmi)
//@ts-nocheck
import { useMemo } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { useWeb3React } from '@web3-react/core';
import { Contract } from '@ethersproject/contracts';
import useSWR, { SWRConfiguration } from 'swr';

type useContractRequestProps = {
  contract: Contract;
  methodName: string;
  callInputs: any[];
  callback: null | ((params: any) => any);
  performRequest: boolean;
  swrConfig?: SWRConfiguration;
};
/** Hook for calling function of the smart contracts. */
function useContractRequest({
  contract,
  methodName,
  callInputs = [],
  callback = null,
  performRequest = true,
  swrConfig = {},
}: useContractRequestProps) {
  const callContract = useMemo(
    () => performRequest && contract && methodName,
    [contract, methodName, performRequest]
  );

  const { data } = useSWR(
    callContract
      ? [contract?.address, methodName, JSON.stringify(callInputs)]
      : null,
    () => contract[methodName](...callInputs).then(callback),
    swrConfig
  );

  return data;
}

type useMulticallContractRequestProps = {
  contracts: Contract[];
  methodNames: string[];
  callInputs: any[];
  callback?: null | ((params: any) => any);
  performRequest: boolean;
  swrConfig?: SWRConfiguration;
};

/** Hook for calling multiple functions of the smart contracts in a single call. */
function useMulticallContractRequest({
  contracts,
  methodNames,
  callInputs,
  callback = null,
  performRequest = true,
  swrConfig = {},
}: useMulticallContractRequestProps) {
  const { library } = useWeb3React();
  const multicallContract = getMulticall(library);
  const multicallChangeKeys = useMemo(
    () =>
      performRequest &&
      contracts?.length &&
      contracts?.every((contract) => !!contract) &&
      methodNames?.length &&
      methodNames?.every((methodName) => !!methodName) &&
      callInputs?.length &&
      callInputs?.every((callInput) => !!callInput) &&
      contracts?.length === methodNames?.length &&
      contracts?.length === callInputs?.length,
    [callInputs, contracts, methodNames, performRequest]
  );

  const fragments = useMemo(
    () =>
      contracts?.map((contract, i) =>
        contract?.interface?.getFunction(methodNames[i])
      ),
    [contracts, methodNames]
  );

  const calls = useMemo(() => {
    if (!multicallChangeKeys) {
      return null;
    }

    return contracts?.map((contract, i) => ({
      target: contract.address,
      callData: contract.interface.encodeFunctionData(
        fragments[i],
        callInputs[i]
      ),
    }));
  }, [callInputs, contracts, fragments, multicallChangeKeys]);

  const { data } = useSWR(
    calls,
    () =>
      multicallContract
        .aggregate(calls)
        .then((result: any) =>
          result?.returnData?.map((data: any, i: number) =>
            contracts[i].interface.decodeFunctionResult(fragments[i], data)
          )
        )
        .then(callback),
    swrConfig
  );
  return data;
}

export default function useUniswapV3Positions() {
  const { account, library } = useWeb3React();
  const uniswapV3PositionManagerContract = getUniswapV3PositionManager(library);

  const numberOfNFTs = useContractRequest({
    contract: uniswapV3PositionManagerContract,
    methodName: 'balanceOf',
    callInputs: [account],
    performRequest: !!account,
    // we don't expect any account balance to ever exceed the bounds of max safe int
    callback: (balance) => balance?.toNumber(),
  });

  const tokenIds = useMulticallContractRequest({
    contracts: Array.from(
      { length: numberOfNFTs || 0 },
      () => uniswapV3PositionManagerContract
    ),
    methodNames: Array.from(
      { length: numberOfNFTs || 0 },
      () => 'tokenOfOwnerByIndex'
    ),
    callInputs: Array.from({ length: numberOfNFTs }, (_, i) => [account, i]),
    performRequest: !!(account && numberOfNFTs),
    callback: (tokenIds) => {
      let parsedTokenIds = tokenIds?.map((tokenId: number) =>
        tokenId?.toString()
      );
      if (parsedTokenIds?.every((tokenId: number) => !!tokenId)) {
        return parsedTokenIds;
      }
      return null;
    },
  });

  const positions = useMulticallContractRequest({
    contracts: Array.from(
      { length: tokenIds?.length || 0 },
      () => uniswapV3PositionManagerContract
    ),
    methodNames: Array.from(
      { length: tokenIds?.length || 0 },
      () => 'positions'
    ),
    callInputs: tokenIds?.map((tokenId: number) => [BigNumber.from(tokenId)]),
    performRequest: !!(account && tokenIds?.length),
  });

  return useMemo(
    () =>
      positions?.map((position: any, i: number) => ({
        tokenId: tokenIds[i],
        owner: account,
        fee: position.fee,
        feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
        feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
        liquidity: position.liquidity,
        nonce: position.nonce,
        operator: position.operator,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        token0: position.token0,
        token1: position.token1,
        tokensOwed0: position.tokensOwed0,
        tokensOwed1: position.tokensOwed1,
      })),
    [account, positions, tokenIds]
  );
}
