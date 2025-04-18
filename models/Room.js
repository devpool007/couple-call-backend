class Room {
  constructor() {
    this.users = new Map(); // socketId -> userId
    this.userIdToSocketId = new Map(); // userId -> socketId
  }

  addUser(socketId, userId) {
    this.users.set(socketId, userId);
    this.userIdToSocketId.set(userId, socketId);
  }

  removeUser(socketId) {
    const userId = this.users.get(socketId);
    this.users.delete(socketId);
    this.userIdToSocketId.delete(userId);
    return userId;
  }

  getSocketId(userId) {
    return this.userIdToSocketId.get(userId);
  }

  getUserCount() {
    return this.users.size;
  }
}

module.exports = Room;