import React, {useLayoutEffect, useState} from 'react';
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
    const data = JSON.parse(event.data);

    if (data.event === 'profileDataUpdate') {
      setProfileData(data);
    }
  }

  useLayoutEffect(() => {
    if (ws) {
      window.addEventListener('message', updateData);
      return () => {
        window.removeEventListener('message', updateData);
      };
    }
  }, []);

  return <Viewer data={profileData}/>;
}
