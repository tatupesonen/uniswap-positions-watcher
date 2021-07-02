function getUniswapV3PositionManager(library) {
  return new Contract(
    process.env.REACT_APP_UNISWAP_V3_POSITION_MANAGER_CONTRACT_ADDRESS,
    uniswapV3PositionManagerAbi,
    library
  )
}
function getMulticall(library) {
  return new Contract(
    process.env.REACT_APP_MULTICALL_CONTRACT_ADDRESS,
    multicallAbi,
    library
  )
}
