import React, {useEffect, useState} from 'react'
import io from 'socket.io-client'
import SearchButton from '../SearchButton/SearchButton'

const socket = io('http://localhost:8000')

const Client = () => {

  const [songName, setSongName] = useState<any[]>([])
  const [selectedSong, setSelectedSong] = useState<any>('')
  const [addedSong, setAddedSong] = useState<any[]>([])


  const hostId = window.location.pathname.substring(6)
  const room = hostId;

  useEffect(() => {
        socket.emit('join_room', room)
        console.log(room);
  }, [])

  useEffect(() => {
    if(selectedSong){
    console.log(selectedSong.name, room)
    socket.emit('send_search', {selectedSong, room })
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

  //sending string for a request:

  const sendSearch = async (e: any) => {
    e.preventDefault();
    setSongName([])
    const searchString = e.target.searchString.value

    console.log('searchString', searchString)
    const result = await fetch(`http://localhost:8000/search/${searchString}`, {
      method: "GET",
      headers: {'Content-type' : 'application/json'},
    })

    const data = await result.json();
    console.log('dataaaaaaaaa',data);
    for(const song of data.tracks.items){
      const item = {
        name : song.name,
        artist : song.artists[0].name,
        uri: song.uri,
      }
    setSongName(prev => [...prev,item])
    }
  }


  return (
    <div>
    <div>
      <h3>Partybeat of: {hostId}</h3>
    </div>
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
    {songName && songName.map((song, index) =>
    {return <SearchButton song={song} key={index} setSelectedSong={setSelectedSong}></SearchButton>})}
    </div>
  </div>
  )
}

export default Client