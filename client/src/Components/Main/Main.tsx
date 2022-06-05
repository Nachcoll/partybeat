import React, {useEffect, useState} from 'react'
// import io from 'socket.io-client'
import socket from '../../Services/socket'
import SearchButton from '../SearchButton/SearchButton'

// const socket = io('http://localhost:8000')

//refractor MAIN and CLIENT into the same page??????
//refractor of every single function into services.
const Main = ({ userInfo }: { userInfo: any }) => {

  const [songName, setSongName] = useState<any[]>([])
  const [selectedSong, setSelectedSong] = useState<any>('')
  const [addedSong, setAddedSong] = useState<any[]>([])

  useEffect(() => {
    if(userInfo.id !== undefined){
    const room = userInfo.id;
        socket.emit('join_room', room)
        console.log(room);
    }
  }, [userInfo])

  useEffect(() => {
    if(selectedSong){
      const room = userInfo.id
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

    socket.on('receive_data', async (data) => {
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== data.name)
        return [...arr, data]
      })
      socket.removeAllListeners()
    })
}, [socket, addedSong])


const setPassword = async (e: any) => {
  e.preventDefault();
  const pass = e.target.password.value
  console.log(JSON.stringify(pass));
  const result = await fetch(`http://localhost:8000/setPass/${userInfo.id}`, {
    method: "POST",
    headers: {'Content-type' : 'application/json'},
    body: JSON.stringify({'pass' : pass})
  })
  const data = await result.json();
  console.log(data);
}


const sendSearch = async (e: any) => {
  e.preventDefault();
  setSongName([])
  const searchString = e.target.searchString.value

  console.log('searchString', searchString)
  const result = await fetch(`http://localhost:8000/search/${userInfo.id}/${searchString}`, {
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
        <input id="urlInput" value={`http://localhost:3000/room/${userInfo.id}`}></input>
        <button onClick={() => {
          navigator.clipboard.writeText(
            `http://localhost:3000/room/${userInfo.id}`
          )
        }}>COPY</button>
        <form onSubmit={setPassword}>
        <input name="password" type="password" placeholder='Password for your playlist'></input>
        <button type='submit'>Set password</button>
        </form>
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
    {return <SearchButton song={song} key={index} userId={userInfo.id} setSelectedSong={setSelectedSong}></SearchButton>})}
    </div>
    </div>
  )
}

export default Main