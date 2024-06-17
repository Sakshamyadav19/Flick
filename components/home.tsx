'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Home = () => {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  function generateRandomString() {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var charactersLength = characters.length;
    for (var i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const handleJoinRoom = () => {
    if (roomId) {
      router.push(`/send?id=${roomId}`);
    } else {
      alert('Please enter a Room ID');
    }
  };

  const handleCreateRoom = () => {
    const roomId=generateRandomString();
    router.push(`/send?id=${roomId}`);
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
        onClick={handleJoinRoom}
      >
        Join Room
      </button>
      <br />
      <button
        type="button"
        className="m-4 p-2 border border-black rounded-md"
        onClick={handleCreateRoom}
      >
        Create Room
      </button>
    </div>
  );
};

export default Home;
