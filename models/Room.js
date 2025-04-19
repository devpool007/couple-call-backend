class Room {
  constructor() {
    this.users = new Map(); // socketId -> userId
    this.userIdToSocketId = new Map(); // userId -> socketId
    this.userNames = new Map(); // userId -> userName
  }

  addUser(socketId, userId, userName) {
    this.users.set(socketId, userId);
    this.userIdToSocketId.set(userId, socketId);
    if (userName) {
      this.userNames.set(userId, userName);
    }
  }

  removeUser(socketId) {
    const userId = this.users.get(socketId);
    this.users.delete(socketId);
    this.userIdToSocketId.delete(userId);
    this.userNames.delete(userId);
    return userId;
  }

  getSocketId(userId) {
    return this.userIdToSocketId.get(userId);
  }

  getUserName(userId) {
    return this.userNames.get(userId);
  }

  getUserCount() {
    return this.users.size;
  }
}

module.exports = Room;