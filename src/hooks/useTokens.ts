import useSWR from 'swr';

export function useTokens() {
  const endpoint = 'https://tokens.coingecko.com/uniswap/all.json';
  const getData = async () => {
    const response = await fetch(endpoint);
    return await response.json();
  };

  const { data: tokens } = useSWR(
    'https://tokens.coingecko.com/uniswap/all.json',
    getData
  );

  return tokens;
}
