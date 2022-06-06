import React, { useEffect, useState } from 'react'
// import io from 'socket.io-client'
import socket from '../../Services/socket'
import SearchButton from '../SearchButton/SearchButton'
import {SelectedSong } from '../../Types/Types'

// const socket = io('http://localhost:8000')

const Client = () => {

  const [songName, setSongName] = useState<SelectedSong[]>([])
  const [selectedSong, setSelectedSong] = useState<SelectedSong>({
    name: undefined,
    artist: undefined,
    uri: undefined,
  })
  const [addedSong, setAddedSong] = useState<SelectedSong[]>([])
  const [access, setAccess] = useState<boolean>(false)


  const hostId = window.location.pathname.substring(6)
  //we start it as null just in case a bad person tries a random url
  let userPassword: any = null;

  useEffect(() => {
    socket.emit('join_room', hostId)
    console.log(hostId);

    //we fetch once for getting the Host password.
    const getPass = async () => {
      try {
        const result = await fetch(`http://localhost:8000/checkPass/${hostId}`, {
          method: 'GET',
          headers: {'Content-type': 'application/json'}
        })
        const data = await result.json();
        userPassword = data.pass;
        console.log(userPassword)
      } catch (error) {
        alert('Something happened')
      }

    }
    getPass();


  }, [])

  useEffect(() => {
    if (selectedSong.name !== undefined) {
      console.log(selectedSong.name, hostId)
      socket.emit('send_search', { selectedSong, hostId })
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== selectedSong.name)
        return [...arr, selectedSong]
      })
    }
  }, [selectedSong])

  useEffect(() => {
    //get added song from socket to the list:

    socket.on('receive_data', (data) => {
      console.log(data)
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== data.name)
        return [...arr, data]
      })
      socket.removeAllListeners()
    })
  }, [socket, addedSong, selectedSong])


  const checkPass = async (e: React.MouseEvent<HTMLFormElement>) => {

    e.preventDefault();
    //if host puts no password you should be able to join:
    if(userPassword === undefined && (e.target as any).pass.value === ''){
      setAccess(true);
    }else if
      //with pass:
    ((e.target as any).pass.value === userPassword){
      setAccess(true);
    }
  else {
    alert('Wrong password')
  }
  }


  //sending string for a request:

  const sendSearch = async (e: React.MouseEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setSongName([])
      const searchString = (e.target as any).searchString.value

      console.log('searchString', searchString)
      const result = await fetch(`http://localhost:8000/search/${hostId}/${searchString}`, {
        method: "GET",
        headers: { 'Content-type': 'application/json' },
      })
      const data = await result.json();
      // console.log('dataaaaaaaaa', data);
      for (const song of data.tracks.items) {
        const item = {
          name: song.name,
          artist: song.artists[0].name,
          uri: song.uri,
        }
        setSongName(prev => [...prev, item])
      }
    } catch (error) {
      alert('something happended')
    }
  }


  return (
    <div>
      <div>
        <h3>Partybeat of: {hostId}</h3>
      </div>
      {!access && <div>
        <form onSubmit={checkPass}>
          <input name="pass" placeholder='Password'></input>
          <button type="submit">Join</button>
        </form>
      </div>}
      {access && <div className="clientContainer">
      <div>
        <ul>
          {addedSong.map((song, index) => {
            return <li key={index} >Added <span className="addedSong">{song.name}</span> from
              <span className="addedArtist"> {song.artist}</span> to the playlist</li>
          })}
        </ul>
      </div>
      <div>
        <form onSubmit={sendSearch}>
          <input name='searchString' placeholder="Song / artist name"></input>
          <button type="submit">Search</button>
        </form>
        {songName && songName.map((song, index) => { return <SearchButton song={song} key={index} userId={hostId} setSelectedSong={setSelectedSong}></SearchButton> })}
      </div>
    </div>}
    </div>
  )
}

export default Client