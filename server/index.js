'use strict'

import http from 'http'
import Express from 'express'
import cors from 'cors'
import router from './router/router.js'
import { Server } from 'socket.io'

const PORT = 8000



const app = new Express();

app.use(cors())
app.use(Express.json())
app.use(router)


const server = http.createServer(app);

const io = new Server(server, {
  cors:{
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

//io connection + send info back

io.on('connection', (socket)=> {
  console.log('user just connected to the room')

//io room (joining and leaving the previous one)
let currentRoom;
socket.on('join_room', (data) => {
  if(currentRoom)   socket.leave(currentRoom)
  currentRoom = data;
  socket.join(data)
  console.log(socket.rooms)
})



  socket.on('send_message', (data) => {
    console.log(data)
    //sending to everybody =
    // socket.broadcast.emit('receive_message', data)
    socket.to(data.room).emit('receive_message', data)
  })
})




server.listen(PORT, () => {
  console.log(`connected to http://localhost:${PORT}`)
})








