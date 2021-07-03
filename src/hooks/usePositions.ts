import useSWR from 'swr';
import { request, gql, rawRequest } from 'graphql-request';
import { Position } from '../types';

export interface TheGraphPositionsResponse {
  positions: Position[];
}

type UsePositionsResponse = {
  data: TheGraphPositionsResponse | undefined;
  error: string | undefined;
};

export function usePositions(addresses: any): UsePositionsResponse {
  const query = gql`
    query getPositions($addresses: [Bytes!]) {
      positions(where: { owner_in: $addresses }) {
        tickLower
        tickUpper
        owner
        token0 {
          symbol
        }
        token1 {
          symbol
        }
        depositedToken0
        depositedToken1
        withdrawnToken0
        withdrawnToken1
      }
    }
  `;

  const variables = {
    addresses,
  };

  const endpoint = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
  const fetcher = () =>
    request(endpoint, query, variables).then(
      (data: TheGraphPositionsResponse) => data
    );
  const { data, error } = useSWR(endpoint, fetcher);
  return { data, error };
}
