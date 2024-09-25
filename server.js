const express = require('express');
const Socket = require("socket.io");
const PORT = process.env.PORT || 3000;

const app = express();
const server = require("http").createServer(app);
// const path = require('path');

const io = Socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users = [];

io.on("connection", socket => {
  socket.on("adduser", username => {
    socket.user = username;
    users.push(username);
    io.sockets.emit("users", users);

    io.to(socket.id).emit("private", {
      id: socket.id,
      name: socket.user,
      msg: "secret message",
    });
  });

  socket.on("message", message => {
    io.sockets.emit("message", {
      message,
      user: socket.user,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log(`user ${socket.user} is disconnected`);
    if (socket.user) {
      users.splice(users.indexOf(socket.user), 1);
      io.sockets.emit("user", users);
      console.log("remaining users:", users);
    }
  });
});

server.listen(PORT, () => {
  console.log("listening on PORT: ", PORT);
});

// ********************************************//

// // Servir les fichiers statiques
// app.use(express.static(path.join(__dirname, 'public')));

// // Route principale
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
