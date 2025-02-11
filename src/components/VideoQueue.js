import React, { useState } from 'react';
import { List, Button } from 'antd';

const VideoQueue = () => {
  const [queue, setQueue] = useState([]);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);

  const startLiveStream = () => {
    setIsLiveStreamActive(true);
  };

  const endLiveStream = () => {
    setIsLiveStreamActive(false);
  };

  return (
    <div>
      <Button onClick={startLiveStream} disabled={isLiveStreamActive}>
        Start Live Stream
      </Button>
      <Button onClick={endLiveStream} disabled={!isLiveStreamActive}>
        End Live Stream
      </Button>
      
      <List
        dataSource={queue}
        renderItem={(item) => (
          <List.Item>
            <div>{item.title}</div>
            <div>{item.status}</div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default VideoQueue;
