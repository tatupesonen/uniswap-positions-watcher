//@ts-nocheck
import { Contract } from '@ethersproject/contracts';
import { useWeb3React } from '@web3-react/core';
import { uniswapV3PositionManagerAbi } from './abi/uniswapV3PositionManagerAbi';

const { account, library } = useWeb3React();
function getUniswapV3PositionManager(library: any) {
  return new Contract(
    process.env.REACT_APP_UNISWAP_V3_POSITION_MANAGER_CONTRACT_ADDRESS,
    uniswapV3PositionManagerAbi,
    library
  );
}

function getMulticall(library: any) {
  return new Contract(
    process.env.REACT_APP_MULTICALL_CONTRACT_ADDRESS,
    multicallAbi,
    library
  );
}
