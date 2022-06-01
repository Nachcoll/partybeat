import React from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:8000')


const Main = ({ userInfo }: { userInfo: any }) => {



  return (
    <div>
      <div>
        <input id="urlInput" value={`http://localhost:3000/room/${userInfo.id}`}></input>
        <button onClick={() => {
          navigator.clipboard.writeText(
            `http://localhost:3000/room/${userInfo.id}`
          )
        }}>COPY</button>
      </div>
      <div>
        <span>CHAT</span>
      </div>
      <div>
        <input placeholder="Song name"></input>
        <button>SONG NAME REQUESTED</button>
        <button>SONG NAME REQUESTED</button>
        <button>SONG NAME REQUESTED</button>
      </div>
      <button>Start playlist</button>
    </div>
  )
}

export default Main