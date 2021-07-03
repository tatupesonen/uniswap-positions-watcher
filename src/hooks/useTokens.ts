import useSWR from 'swr';
import { Token } from '../types';

export function useTokens(): any {
  const endpoint = 'https://tokens.coingecko.com/uniswap/all.json';
  const fetcher = (url: string) => fetch(url).then((res: any) => res.json());
  const { data, error } = useSWR(
    'https://tokens.coingecko.com/uniswap/all.json',
    fetcher
  );

  return { data, error };
}
