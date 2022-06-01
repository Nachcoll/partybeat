import React, { useEffect, useState } from 'react'
import logo from '../../images/logo.png'
import io from 'socket.io-client'


const socket = io('http://localhost:8000')

const Dashboard = () => {

  const [message, setMessage] = useState('');
  const [messageReceived, setMessageReceived] = useState('');
//room socket io
  const [room, setRoom] = useState('')


  const handleClick =  () => {
    window.location.replace("http://localhost:8000/login");
  }
//creating a room in socket.io

const joinRoom = () =>{
  if(room !== ''){
    socket.emit('join_room', room)
    console.log(room);
  }
}


  //function for sending something in socket.io
  //we add room to the object in order to only show the message on the correct room
  const sendMessage = () => {
    socket.emit('send_message', {message, room })

  }
//cant put socket as dependencies
  useEffect(() => {
    socket.on('receive_message', (data) => {
      console.log(data);
      setMessageReceived(data.message)
    })
  }, [])


  return (
    <div>
      <img src={logo}></img>
      <p>In order to use Partybeat you will have to login on Spotify</p>
      <button onClick={handleClick}>Login</button>

      <input placeholder="message" onChange={(event)=> {
        setMessage(event.target.value)
      }}></input>
      <button onClick={sendMessage}>Send message</button>
      <h1>message:</h1>
      <p>{messageReceived}</p>
      <input placeholder="room" onChange={(event)=> {
        setRoom(event.target.value)
      }}></input>
      <button onClick={joinRoom}>Join room</button>
    </div>
  )
}

export default Dashboard