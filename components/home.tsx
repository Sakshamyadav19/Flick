'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Home = () => {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  const handleSendFileClick = () => {
    if (roomId) {
      router.push(`/send?id=${roomId}`);
    } else {
      alert('Please enter a Room ID');
    }
  };

  const handleReceiveFileClick = () => {
    router.push('/receive');
  };

  return (
    <div className="p-4">
      <input
        placeholder="Room ID"
        className="mx-4 p-1 border border-black rounded-md"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button
        type="button"
        className="m-4 p-2 border border-black rounded-md"
        onClick={handleSendFileClick}
      >
        Send File
      </button>
      <br />
      <button
        type="button"
        className="m-4 p-2 border border-black rounded-md"
        onClick={handleReceiveFileClick}
      >
        Receive File
      </button>
    </div>
  );
};

export default Home;
