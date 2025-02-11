import React, { useState } from 'react';
import { Button, Progress, message } from 'antd';

const VideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);

    try {
      await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      message.success('Video uploaded successfully');
    } catch (error) {
      message.error('Upload failed');
    }
    setUploading(false);
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleUpload} />
      {uploading && <Progress percent={progress} />}
    </div>
  );
};

export default VideoUpload;
