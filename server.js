const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const userBot = "DemaBot";

// Run connections
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(userBot, "Welcome to DemaChat"));

    // Broadcast when user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(username, `${user.username} has joined to chat`)
      );

    // Send users and rooms info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen chat messages
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.emit("message", formatMessage(user.username, msg));
  });

  // Run when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(userBot, `${user.username} has left the chat`)
      );
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running in port ${PORT}`));
