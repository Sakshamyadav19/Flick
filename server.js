const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const port = 3000;

const app = next({ dev });
const handler = app.getRequestHandler();

const Room = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);


  io.on('connection', (socket) => {
    console.log('user connected', socket.id);

    socket.on('send-file-chunk', (data) => {
      console.log('Chunk received on server:');
      socket.broadcast.emit('receive-file-chunk', data); // Broadcast to all except the sender
    });

    socket.on('file-transfer-complete', () => {
      console.log('File transfer complete');
      socket.broadcast.emit('file-transfer-complete'); // Broadcast to all except the sender
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('joinRoom',(roomId)=>{
      if (!Room.has(roomId)) {
        Room.set(roomId, []);
      }
      Room.get(roomId)?.push(socket.id);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      console.log(Room.get(roomId));
    })

  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
