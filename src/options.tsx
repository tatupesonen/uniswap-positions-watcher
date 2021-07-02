import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { getAddressesStorage, setAddressesStorage } from './storageUtils';

const Options = () => {
  const [input, setInput] = useState<string>('');
  const [addresses, setAddresses] = useState<string[]>([]);
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    // On component load, get the addresses from browser storage.
    getAddressesStorage((addressList) => {
      setAddresses(addressList);
    });
  }, []);

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    setAddressesStorage([input], () => {
      // Update status to let user know options were saved.
      setStatus('Options saved.');
      setAddresses([input]);
      const id = setTimeout(() => {
        setStatus(undefined);
      }, 1000);
      return () => clearTimeout(id);
    });
  };

  return (
    <>
      <div>
        {addresses.length > 0 && (
          <p>
            Current tracked Ethereum addresses: <b>{addresses}</b>
          </p>
        )}
      </div>
      <div>
        Add an Ethereum address to watch:
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
        ></input>
      </div>
      <div>{status}</div>
      <button onClick={saveOptions}>Save</button>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
  document.getElementById('root')
);
