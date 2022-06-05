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
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

//io connection + send info back
let number = 0;
io.on('connection', (socket) => {
  console.log(socket.id)
  number++
  console.log(number, 'user just connected to the room')

  //io room (joining and leaving the previous one)
  let currentRoom;
  socket.once('join_room', (data) => {
    if (currentRoom) socket.leave(currentRoom)
    currentRoom = data;
    socket.join(data)
    console.log(socket.rooms)

  })

  socket.on('disconnect', () => {
    number--
    console.log('disconnected')
  })

  socket.on('send_search', (data) => {
    console.log(data)
    //sending to everybody =
    // socket.broadcast.emit('receive_data', data)
    socket.to(data.room).emit('receive_data', data.selectedSong)
  })

})




server.listen(PORT, () => {
  console.log(`connected to http://localhost:${PORT}`)
})








