'use client'
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const CHUNK_SIZE = 10 * 1024;
const socket: Socket = io('http://localhost:3000/');

export default function Upload() {
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [receivedChunks, setReceivedChunks] = useState<ArrayBuffer[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [isTransferComplete, setIsTransferComplete] = useState<boolean>(false);
    const searchParams = useSearchParams();
    let roomId = searchParams.get("id") || 'default-room';

    useEffect(() => {
        socket.emit('joinRoom', roomId);

        const socketEventListeners = {
            'receive-file-chunk': handleReceiveFileChunk,
            'file-transfer-complete': handleFileTransferComplete,
            'disconnect': handleDisconnect
        };

        Object.entries(socketEventListeners).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            Object.keys(socketEventListeners).forEach(event => {
                socket.off(event);
            });
        };
    }, []);

    const handleReceiveFileChunk = (chunk: ArrayBuffer) => {
        console.log('Chunk received on client');
        setReceivedChunks(prevChunks => [...prevChunks, chunk]);
    };

    const handleFileTransferComplete = () => {
        console.log('File transfer complete on client');
        setIsTransferComplete(true);
    };

    const handleDisconnect = () => {
        console.log('Disconnected from Socket.IO server');
    };

    useEffect(() => {
        if (isTransferComplete && receivedChunks.length > 0) {
            handleDownload();
        }
    }, [isTransferComplete, receivedChunks]);

    const handleDownload = () => {
        const fileBlob = new Blob(receivedChunks);
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(fileBlob);
        downloadLink.download = fileName;
        downloadLink.click();
        setReceivedChunks([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setUploadFile(file);
            setFileName(file.name);
            setIsTransferComplete(false);
        }
    };

    const handleFileSend = () => {
        if (uploadFile) {
            sendFile(uploadFile);
        }
    };

    const sendFile = (file: File) => {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let start = 0;

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const chunk = file.slice(start, start + CHUNK_SIZE);
            start += CHUNK_SIZE;
            console.log('Uploading chunk of size ', CHUNK_SIZE);
            socket.emit('send-file-chunk', { chunk, roomId });
        }
        socket.emit('file-transfer-complete', { roomId });
    };

    return (
        <div className='flex flex-col items-center justify-center bg-white p-4 px-4 rounded-md shadow-lg'>
            <input type="file" onChange={handleChange} />
            <br></br>
            {uploadFile && <button className=' border border-black p-2 rounded-md' onClick={handleFileSend}>Send File</button>}
        </div>
    );
}
