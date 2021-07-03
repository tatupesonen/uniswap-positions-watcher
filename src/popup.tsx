import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { usePositions } from './hooks/usePositions';
import { useTokens } from './hooks/useTokens';
import { Token } from './types';

function unpack(str: string) {
  var bytes = [];
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    bytes.push(char >>> 8);
    bytes.push(char & 0xff);
  }
  return bytes;
}

const PositionWarningPopup = () => {
  // Load ERC-20 token data from CoinGecko
  const { data: tokens, error: tokenError } = useTokens();
  //load data from thegraph for positions
  const { data: positions, error: positionsError } = usePositions([]);

  if (tokenError) return <h1>Could not load token data</h1>;
  if (!tokens) return <h1>Loading...</h1>;
  if (positionsError)
    return <h1>Could not load positions data for this address.</h1>;
  if (!positions) return <h1>Loading...</h1>;

  const positionsWithTokenData = positions.positions.map((p) => {
    const token0Data = tokens.tokens.find(
      (t: Token) => t.symbol === p.token0.symbol
    );
    const token1Data = tokens.tokens.find(
      (t: Token) => t.symbol === p.token1.symbol
    );

    return {
      ...p,
      token0LogoURI: token0Data?.logoURI ?? 'empty',
      token1LogoURI: token1Data?.logoURI ?? 'empty',
    };
  });

  console.error(JSON.stringify(positionsWithTokenData));
  console.error(JSON.stringify(positions));
  return (
    <>
      <div style={{ minWidth: '700px' }}>
        {positionsWithTokenData
          .filter(
            (p) => Number(p.depositedToken0) - Number(p.withdrawnToken0) > 0.01
          )
          .map((p, i: number) => (
            <p>
              <img src={p.token0LogoURI} alt="" />
              {p.token0.symbol}{' '}
              {Number(p.depositedToken0) - Number(p.withdrawnToken0)} ---{' '}
              {p.token1.symbol}{' '}
              {Number(p.depositedToken1) - Number(p.withdrawnToken1)}{' '}
              <img src={p.token1LogoURI} alt="" />
            </p>
          ))}
      </div>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <PositionWarningPopup />
  </React.StrictMode>,
  document.getElementById('root')
);
