import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const Options = () => {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    // On component load, get the addresses from browser storage.
    chrome.storage.sync.get(
      {
        addresses: [],
      },
      (fetchedOptions) => {
        setAddresses(fetchedOptions.addresses)
      }
    );
  }, []);

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        addresses
      },
      () => {
        // Update status to let user know options were saved.
        setStatus("Options saved.");
        const id = setTimeout(() => {
          setStatus(undefined);
        }, 1000);
        return () => clearTimeout(id);
      }
    );
  };

  return (
    <>
      <div>
        Current tracked Ethereum address:
        <input
          value={addresses[0]}
          onChange={(event) => setAddresses([event.target.value])}
        >
        </input>
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
  document.getElementById("root")
);
