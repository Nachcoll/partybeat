import React, {useState, useEffect} from 'react'
import Main from '../Main/Main'


const Menu = () => {

  const [userInfo, setUserInfo] = useState<any>({})
  const [playLists, setPlayLists] = useState<any[]>([])
  const [playList, setPlayList] = useState({})

  useEffect(()=>{
    onLoad()
  }, [])

  let token!:string

const onLoad: any = async () => {
  if(window.location.search.length > 0){
    const queryString = window.location.search;
    token = queryString.substring(6)

    const result = await fetch('http://localhost:8000/newToken', {
      method: "POST",
      headers: {'Content-type' : 'application/json'},
      body: JSON.stringify({token})
    })
    const data = await result.json();
    setUserInfo(data);
  }
  return null;
}

//show menu after clicking:
const getPlaylists = async () => {

  const playlistOptions = await fetch(`http://localhost:8000/infoPL/${userInfo.id}`, {
    method: "GET",
    headers: {'Content-type' : 'application/json'}
  })
  const playlistData = await playlistOptions.json();
  console.log(playlistData)
  const arr = playlistData.items.filter((el:any) => {return el.owner.id === userInfo.id})
  setPlayLists((prev) => {
    return [...prev, ...arr]
  })
}

const handlePlaylistSubmit = async (e:any) => {
  e.preventDefault();
  const playlistName = e.target.playlist.value

  if(playlistName !== 'New playlist'){
  const playlist = playLists.filter((el) => {return el.name === playlistName})
  setPlayList(playlist)
  console.log(playlist)
  const useExistingPlaylist = await fetch(`http://localhost:8000/useExistingPlaylist/${userInfo.id}`, {
    method: "POST",
    headers: {'Content-type' : 'application/json'},
    body: JSON.stringify({'playlist' : playlist})
  })
  const newPlayListjson = await useExistingPlaylist.json();
  setPlayList(newPlayListjson)

} else {
  //crear nueva playlist
  const newPlayList = await fetch(`http://localhost:8000/createPlaylist/${userInfo.id}`, {
    method: "POST",
    headers: {'Content-type' : 'application/json'}
  })
  const newPlayListjson = await newPlayList.json();
  console.log(newPlayListjson)
  setPlayList(newPlayListjson)
}
}


  return (
    <>
    {(Object.keys(userInfo).length > 0 && playLists.length === 0) && <button onClick={getPlaylists}>Load all the playlists</button>}
    {(Object.keys(userInfo).length > 0 && playLists.length > 0) && <div>Select the playlist:
    <form onSubmit={handlePlaylistSubmit}>
    <select name='playlist'>
      <option>New playlist</option>
      {playLists.map((playlist, index) => {return <option key={index}>{playlist.name}</option>})}
    </select>
    <button type="submit">START sharing</button>
    </form>
    </div>}
    {(Object.keys(userInfo).length > 0 && playLists.length > 0) && <Main userInfo={userInfo}></Main>}
    </>
  )
}

export default Menu