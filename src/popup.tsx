import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTokens } from './hooks/useTokens';
import { Token } from './types';

const PositionWarningPopup = () => {
  // Load ERC-20 token data from CoinGecko
  const { data: result, error } = useTokens();
  const [count, setCount] = useState(0);

  if (error) return <h1>Could not load token data</h1>;
  if (!result) return <h1>Loading...</h1>;

  return (
    <>
      {result.tokens.map((t: Token, i: number) => (
        <p key={i}>{t.name}</p>
      ))}
      <ul style={{ minWidth: '700px' }}>
        <li>Current Time test: {new Date().toLocaleTimeString()}</li>
      </ul>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <PositionWarningPopup />
  </React.StrictMode>,
  document.getElementById('root')
);
