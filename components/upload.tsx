'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const CHUNK_SIZE = 10 * 1024;

const socket = io('http://localhost:3000/');

export default function Upload() {
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [receivedChunks, setReceivedChunks] = useState<ArrayBuffer[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [isTransferComplete, setIsTransferComplete] = useState<boolean>(false);

    useEffect(() => {
        socket.on('receive-file-chunk', (chunk: ArrayBuffer) => {
            console.log('Chunk received from another user');
            setReceivedChunks((prevChunks) => [...prevChunks, chunk]);
        });

        socket.on('file-transfer-complete', () => {
            console.log('File transfer complete');
            setIsTransferComplete(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });

        return () => {
            socket.off('disconnect');
            socket.off('receive-file-chunk');
            socket.off('file-transfer-complete');
        };
    }, []);

    useEffect(() => {
        if (isTransferComplete && receivedChunks.length > 0) {
            console.log(receivedChunks);
            const fileBlob = new Blob(receivedChunks);
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(fileBlob);
            downloadLink.download = fileName;
            downloadLink.click();
            setReceivedChunks([]);
        }
    }, [isTransferComplete, receivedChunks]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploadFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
            setIsTransferComplete(false);
        }
    };

    const handleFileSend = () => {
        if (uploadFile) {
            sendNextChunk();
        }
    };

    const sendNextChunk = () => {
        if (uploadFile) {
            const totalChunks = Math.ceil(uploadFile.size / CHUNK_SIZE);
            let start = 0;

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const chunk = uploadFile.slice(start, start + CHUNK_SIZE);
                start += CHUNK_SIZE;
                console.log('Uploading chunk of size ', CHUNK_SIZE);
                socket.emit('send-file-chunk', chunk);
            }
            socket.emit('file-transfer-complete');
        }
    };


    return (
        <div>
            <input type="file" onChange={handleChange} />
            {uploadFile && <button onClick={handleFileSend}>Send File</button>}
            {fileName && (
                <p>
                    {isTransferComplete ? 'File transfer complete.' : `Receiving file: ${fileName}`}
                </p>
            )}
        </div>
    );
}
