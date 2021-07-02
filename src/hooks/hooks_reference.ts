//@ts-nocheck
// Partial source code of Stakewise dAPP (from tsudmi)
import { useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'
import { Contract } from '@ethersproject/contracts'
import useSWR from 'swr'

const uniswapV3PositionManagerAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'positions',
    outputs: [
      {
        internalType: 'uint96',
        name: 'nonce',
        type: 'uint96',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'token0',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'token1',
        type: 'address',
      },
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
      {
        internalType: 'int24',
        name: 'tickLower',
        type: 'int24',
      },
      {
        internalType: 'int24',
        name: 'tickUpper',
        type: 'int24',
      },
      {
        internalType: 'uint128',
        name: 'liquidity',
        type: 'uint128',
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside0LastX128',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'feeGrowthInside1LastX128',
        type: 'uint256',
      },
      {
        internalType: 'uint128',
        name: 'tokensOwed0',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: 'tokensOwed1',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address',
          },
          {
            internalType: 'uint128',
            name: 'amount0Max',
            type: 'uint128',
          },
          {
            internalType: 'uint128',
            name: 'amount1Max',
            type: 'uint128',
          },
        ],
        internalType: 'struct INonfungiblePositionManager.CollectParams',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'collect',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount0',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount1',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
]

function getUniswapV3PositionManager(library) {
  return new Contract(
    process.env.REACT_APP_UNISWAP_V3_POSITION_MANAGER_CONTRACT_ADDRESS,
    uniswapV3PositionManagerAbi,
    library
  )
}

const multicallAbi = [
  {
    inputs: [
      {
        components: [
          {
            name: 'target',
            type: 'address',
          },
          {
            name: 'callData',
            type: 'bytes',
          },
        ],
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate',
    outputs: [
      {
        name: 'blockNumber',
        type: 'uint256',
      },
      {
        name: 'returnData',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

function getMulticall(library) {
  return new Contract(
    process.env.REACT_APP_MULTICALL_CONTRACT_ADDRESS,
    multicallAbi,
    library
  )
}

/** Hook for calling function of the smart contracts. */
function useContractRequest({
  contract,
  methodName,
  callInputs = [],
  callback = null,
  performRequest = true,
  swrConfig = {},
}) {
  const callContract = useMemo(
    () => performRequest && contract && methodName,
    [contract, methodName, performRequest]
  )

  const { data } = useSWR(
    callContract
      ? [contract?.address, methodName, JSON.stringify(callInputs)]
      : null,
    () => contract[methodName](...callInputs).then(callback),
    swrConfig
  )

  return data
}

/** Hook for calling multiple functions of the smart contracts in a single call. */
function useMulticallContractRequest({
  contracts,
  methodNames,
  callInputs,
  callback = null,
  performRequest = true,
  swrConfig = {},
}) {
  const { library } = useWeb3React()
  const multicallContract = getMulticall(library)
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
  )

  const fragments = useMemo(
    () =>
      contracts?.map((contract, i) =>
        contract?.interface?.getFunction(methodNames[i])
      ),
    [contracts, methodNames]
  )

  const calls = useMemo(() => {
    if (!multicallChangeKeys) {
      return null
    }

    return contracts?.map((contract, i) => ({
      target: contract.address,
      callData: contract.interface.encodeFunctionData(
        fragments[i],
        callInputs[i]
      ),
    }))
  }, [callInputs, contracts, fragments, multicallChangeKeys])

  const { data } = useSWR(
    multicallChangeKeys,
    () =>
      multicallContract
        .aggregate(calls)
        .then((result) =>
          result?.returnData?.map((data, i) =>
            contracts[i].interface.decodeFunctionResult(fragments[i], data)
          )
        )
        .then(callback),
    swrConfig
  )
  return data
}

export default function useUniswapV3Positions() {
  const { account, library } = useWeb3React()
  const uniswapV3PositionManagerContract = getUniswapV3PositionManager(library)

  const numberOfNFTs = useContractRequest({
    contract: uniswapV3PositionManagerContract,
    methodName: 'balanceOf',
    callInputs: [account],
    performRequest: !!account,
    // we don't expect any account balance to ever exceed the bounds of max safe int
    callback: (balance) => balance?.toNumber(),
  })

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
      let parsedTokenIds = tokenIds?.map((tokenId) => tokenId?.toString())
      if (parsedTokenIds?.every((tokenId) => !!tokenId)) {
        return parsedTokenIds
      }
      return null
    },
  })

  const positions = useMulticallContractRequest({
    contracts: Array.from(
      { length: tokenIds?.length || 0 },
      () => uniswapV3PositionManagerContract
    ),
    methodNames: Array.from(
      { length: tokenIds?.length || 0 },
      () => 'positions'
    ),
    callInputs: tokenIds?.map((tokenId) => [BigNumber.from(tokenId)]),
    performRequest: !!(account && tokenIds?.length),
  })

  return useMemo(
    () =>
      positions?.map((position, i) => ({
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
  )
}
