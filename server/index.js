"use strict";

import http from "http";
import Express from "express";
import cors from "cors";
import router from "./router/router.js";
import { Server } from "socket.io";

const PORT = 8000;
const app = new Express();

app.use(cors());
app.use(Express.json());
app.use(router);

//this is just a test for deployment:
app.get("/", (req, res) => {
  res.status(200).send("Hello server is running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//io connection + send info back
let number = 0;
io.on("connection", (socket) => {
  console.log(socket.id);
  number++;
  console.log(number, "user just connected to the room");

  //io room (joining and leaving the previous one)
  let currentRoom;
  socket.once("join_room", (data) => {
    if (currentRoom) socket.leave(currentRoom);
    currentRoom = data;
    socket.join(data);
    console.log(socket.rooms);
  });

  socket.on("disconnect", () => {
    number--;
    console.log("disconnected");
  });

  socket.on("send_search", (data) => {
    socket.to(data.room).emit("receive_data", data.selectedSong);
  });
  socket.on("send_delete", (data) => {
    console.log(data);
    socket.to(data.room).emit("deleted_data", data.deleteSong);
  });
});

server.listen(PORT, () => {
  console.log(`connected to http://localhost:${PORT}`);
});
