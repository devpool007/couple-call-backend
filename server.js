const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },

    pingTimeout: 60000,
    pingInterval: 25000,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000
});
// Handle connection errors
io.engine.on('connection_timeout', (socket) => {
  console.log('Connection timeout:', socket.id);
  socket.disconnect();
});

io.engine.on('connection_error', (err) => {
  console.log('Connection error:', err);
});

// Store active users with room information
const rooms = {};

// Add logging function
function logRoomState() {
  console.log('Current room state:', JSON.stringify(rooms, null, 2));
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // When a user joins a room
  socket.on('join-room', (roomId, userId) => {
    // Check if user is already in any room
    for (const existingRoomId in rooms) {
      if (rooms[existingRoomId].users[socket.id]) {
        console.log(`User ${userId} already in room ${existingRoomId}`);
        return;
      }
    }
    // Create room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = { users: {} };
    }

    // Check if room is full (has 2 users already)
    if (Object.keys(rooms[roomId].users).length >= 2) {
      socket.emit('room-full', roomId);
      console.log(`User ${userId} tried to join full room ${roomId}`);
      return;
    }
    
    // Add user to room
    socket.join(roomId);
    rooms[roomId].users[socket.id] = userId;
    
    // Inform others in the room about the new user
    socket.to(roomId).emit('user-connected', userId);
    
    console.log(`User ${userId} joined room ${roomId}`);
    logRoomState(); // Log the current state of rooms
    
    // Send list of existing users to the new participant
    const existingUsers = [];
    for (const [socketId, id] of Object.entries(rooms[roomId].users)) {
      if (socketId !== socket.id) {
        existingUsers.push(id);
      }
    }
    
    if (existingUsers.length > 0) {
      socket.emit('existing-users', existingUsers);
    }
  });
  
  // Handle WebRTC signaling - more robust handling
  socket.on('offer', (offer, roomId, toUserId) => {
    if (rooms[roomId]) {
      // Find the socket ID for the target user
      let targetSocketId = null;
      for (const [socketId, userId] of Object.entries(rooms[roomId].users)) {
        if (userId === toUserId) {
          targetSocketId = socketId;
          break;
        }
      }
      
      if (targetSocketId) {
        const fromUserId = rooms[roomId].users[socket.id];
        // Send offer directly to the specific socket
        io.to(targetSocketId).emit('offer', offer, fromUserId);
      }
    }
  });
  
  socket.on('answer', (answer, roomId, toUserId) => {
    if (rooms[roomId]) {
      // Find the socket ID for the target user
      let targetSocketId = null;
      for (const [socketId, userId] of Object.entries(rooms[roomId].users)) {
        if (userId === toUserId) {
          targetSocketId = socketId;
          break;
        }
      }
      
      if (targetSocketId) {
        const fromUserId = rooms[roomId].users[socket.id];
        // Send answer directly to the specific socket
        io.to(targetSocketId).emit('answer', answer, fromUserId);
      }
    }
  });
  
  socket.on('ice-candidate', (candidate, roomId, toUserId) => {
    if (rooms[roomId]) {
      // Find the socket ID for the target user
      let targetSocketId = null;
      for (const [socketId, userId] of Object.entries(rooms[roomId].users)) {
        if (userId === toUserId) {
          targetSocketId = socketId;
          break;
        }
      }
      
      if (targetSocketId) {
        const fromUserId = rooms[roomId].users[socket.id];
        // Send ICE candidate directly to the specific socket
        io.to(targetSocketId).emit('ice-candidate', candidate, fromUserId);
      }
    }
  });
  
  // When user disconnects
  socket.on('disconnect', () => {
    // Find which room the socket was in
    for (const roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        const userId = rooms[roomId].users[socket.id];
        
        // Notify others in the room
        socket.to(roomId).emit('user-disconnected', userId);
        
        // Remove user from room
        delete rooms[roomId].users[socket.id];
        
        // Remove room if empty
        if (Object.keys(rooms[roomId].users).length === 0) {
          delete rooms[roomId];
        }
        
        console.log(`User ${userId} left room ${roomId}`);
        logRoomState(); // Log the current state of rooms
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});