const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Room = require("./models/Room");
const apiRoutes = require("./routes/apiRoutes"); // Import your API routes

const app = express();
// Add middleware to parse JSON bodies
app.use(express.json());
// Add middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'https://couple-call.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));
 
app.use('/api', apiRoutes); // Use the API routes

// Handle 404s for API routes
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!' 
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173/", "https://couple-call.vercel.app/",],
    methods: ["GET", "POST"],
    credentials: true,
  },

  pingTimeout: 60000,
  pingInterval: 25000,
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
});
// Handle connection errors
io.engine.on("connection_timeout", (socket) => {
  console.log("Connection timeout:", socket.id);
  socket.disconnect();
});

io.engine.on("connection_error", (err) => {
  console.log("Connection error:", err);
});

// Store active users with room information
const rooms = new Map(); // For room storage
const userToRoom = new Map(); // For quick user-to-room lookup

// Add logging function
function logRoomState() {
  console.log("Current room state:");
  rooms.forEach((room, roomId) => {
    console.log(`Room ID: ${roomId}, Users:`, Array.from(room.users.entries()));
  });
}

// Helper function to find the target socket and emit an event
function emitToTarget(event, data, roomId, toUserId, fromSocketId) {
  const room = rooms.get(roomId);
  if (!room) return;

  // O(1) lookup for target socket
  const targetSocketId = room.getSocketId(toUserId);
  if (targetSocketId) {
    const fromUserId = room.users.get(fromSocketId);
    io.to(targetSocketId).emit(event, data, fromUserId);
  }
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When a user joins a room
  socket.on("join-room", (roomId, userId) => {
    if (typeof roomId !== "string" || roomId.length > 50) {
      console.log("Invalid room ID!");
      return;
    }
    
    if (userToRoom.has(socket.id)) {
      console.log(`User ${userId} already in room ${userToRoom.get(socket.id)}`);
      return;
    }

    let room = rooms.get(roomId);
    if (!room) {
      room = new Room();
      rooms.set(roomId, room);
    }

    if (room.getUserCount() >= 2) {
      socket.emit("room-full", roomId);
      console.log(`User ${userId} tried to join full room ${roomId}`);
      return;
    }

    socket.join(roomId);
    room.addUser(socket.id, userId);
    userToRoom.set(socket.id, roomId);

    socket.to(roomId).emit("user-connected", userId);
    console.log(`User ${userId} joined room ${roomId}`);
    logRoomState();

    const existingUsers = [];
    room.users.forEach((id, socketId) => {
      if (socketId !== socket.id) {
        existingUsers.push(id);
      }
    });

    if (existingUsers.length > 0) {
      socket.emit("existing-users", existingUsers);
    }
  });

  // WebRTC signaling handlers using the helper function
  socket.on("offer", (offer, roomId, toUserId) => {
    emitToTarget("offer", offer, roomId, toUserId, socket.id);
  });

  socket.on("answer", (answer, roomId, toUserId) => {
    emitToTarget("answer", answer, roomId, toUserId, socket.id);
  });

  socket.on("ice-candidate", (candidate, roomId, toUserId) => {
    emitToTarget("ice-candidate", candidate, roomId, toUserId, socket.id);
  });

  socket.on("disconnect", () => {
    const roomId = userToRoom.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const userId = room.removeUser(socket.id);
    userToRoom.delete(socket.id);

    if (room.getUserCount() === 0) {
      rooms.delete(roomId);
    }

    socket.to(roomId).emit("user-disconnected", userId);
    console.log(`User ${userId} left room ${roomId}`);
    logRoomState();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
