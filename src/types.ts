export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

export interface Position {
  depositedToken0: string;
  depositedToken1: string;
  owner: string;
  tickLower: string;
  tickUpper: string;
  token0: Token;
  token1: Token;
  withdrawnToken0: string;
  withdrawnToken1: string;
}

export interface Token {
  symbol: string;
}
