import React, { useLayoutEffect, useState } from 'react';
import Viewer from './viewer';

let ws;
try {
  if (window.enableWebSocket) {
    ws = new WebSocket(`ws://${location.host}`);
  }
} catch (e) {
  console.warn('Couldn\'t connect to analyzer websocket server so you\'ll have to reload page manually');
}

export default function App() {
  const [profileData, setProfileData] = useState(window.profileData);

  function updateData(event) {
    if (typeof event.data !== 'string') {
      return;
    }
    try {
      const data = JSON.parse(event.data);
      if (data.event === 'profileDataUpdate') {
        setProfileData(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useLayoutEffect(() => {
    if (ws) {
      ws.addEventListener('message', updateData);
      return () => {
        ws.removeEventListener('message', updateData);
      };
    }
  }, []);

  return <Viewer data={profileData}/>;
}
