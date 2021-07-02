import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

const PositionWarningPopup = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    chrome.browserAction.setBadgeText({ text: count.toString() })
  }, [count])

  const changeBackground = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0]
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            color: '#555555',
          },
          (msg) => {
            console.log('result message:', msg)
          }
        )
      }
    })
  }

  return (
    <>
      <ul style={{ minWidth: '700px' }}>
        <li>Current Time test: {new Date().toLocaleTimeString()}</li>
      </ul>
      <button
        onClick={() => setCount(count + 1)}
        style={{ marginRight: '5px' }}
      >
        count up
      </button>
      <button onClick={changeBackground}>change background</button>
    </>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <PositionWarningPopup />
  </React.StrictMode>,
  document.getElementById('root')
)
