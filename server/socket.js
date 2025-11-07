const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(
  cors({
    origin: ['https://i-patronus.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['https://i-patronus.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    if (roomId) {
      socket.join(roomId);
    }
  });

  socket.on('REQUEST_CALL', (payload) => {
    io.emit('INCOMING_REQUEST', payload);
  });

  socket.on('CALL_ACCEPTED', (payload) => {
    io.emit('CALL_ACCEPTED', payload);
  });

  socket.on('USER_STATUS_CHANGE', (payload) => {
    io.emit('USER_STATUS_UPDATE', payload);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.get('/', (_req, res) => {
  res.send('Socket server is running');
});

httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});


