import React from 'react';
import VideoUpload from '../components/VideoUpload';
import VideoQueue from '../components/VideoQueue';
import { Card } from 'antd';

const StreamManagement = () => {
  return (
    <div>
      <Card title="Upload Video">
        <VideoUpload />
      </Card>
      
      <Card title="Video Queue">
        <VideoQueue />
      </Card>
    </div>
  );
};

export default StreamManagement;
