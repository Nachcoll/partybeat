import React from 'react'

const Client = () => {

  const hostId = window.location.pathname.substring(6)



  return (
    <div>
    <div>
      <h3>Partybeat of: {hostId}</h3>
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
  </div>
  )
}

export default Client