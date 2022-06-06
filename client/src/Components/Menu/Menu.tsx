import React, { useState, useEffect } from 'react'
import Main from '../Main/Main'


const Menu = () => {

  const [userInfo, setUserInfo] = useState<any>({})
  const [playLists, setPlayLists] = useState<any[]>([])
  const [playListSelected, setPlayListSelected] = useState(false)

  useEffect(() => {
    onLoad()
  }, [])

  let token!: string

  const onLoad: any = async () => {
    if (window.location.search.length > 0) {
      const completeUrl = window.location.search;
      token = completeUrl.substring(6)
      //we should hide the url after saving the token. We don't want to show the query from Spotify
      window.history.pushState("","", 'http://localhost:3000/menu')

      const result = await fetch('http://localhost:8000/newToken', {
        method: "POST",
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ token })
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
      headers: { 'Content-type': 'application/json' }
    })
    const playlistData = await playlistOptions.json();
    console.log(playlistData)
    const arr = playlistData.items.filter((el: any) => { return el.owner.id === userInfo.id })
    setPlayLists((prev) => {
      return [...prev, ...arr]
    })
  }

  const handlePlaylistSubmit = async (e: any) => {
    e.preventDefault();
    const playlistName = e.target.playlist.value

    if (playlistName !== 'New playlist') {
      const playlist = playLists.filter((el) => { return el.name === playlistName })
      const useExistingPlaylist = await fetch(`http://localhost:8000/useExistingPlaylist/${userInfo.id}`, {
        method: "POST",
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ 'playlist': playlist })
      })
      const newPlayListjson = await useExistingPlaylist.json();
      // setPlayListSelected(true);
      // console.log(playListSelected)
    } else {
      //crear nueva playlist
      const newPlayList = await fetch(`http://localhost:8000/createPlaylist/${userInfo.id}`, {
        method: "POST",
        headers: { 'Content-type': 'application/json' }
      })
      const newPlayListjson = await newPlayList.json();
      console.log(newPlayListjson)
      // setPlayListSelected(true);

    }
    setPlayListSelected(true);
    console.log(playListSelected)
  }


  return (
    <>
      {playLists.length === 0 && <button onClick={getPlaylists}>Load all the playlists</button>}
      {(playLists.length > 0 && playListSelected === false )&& <div>Select the playlist:
        <form onSubmit={handlePlaylistSubmit}>
          <select name='playlist'>
            <option>New playlist</option>
            {playLists.map((playlist, index) => { return <option key={index}>{playlist.name}</option> })}
          </select>
          <button type="submit">START sharing</button>
        </form>
      </div>}
      {playLists.length > 0 && <Main userInfo={userInfo}></Main>}
    </>
  )
}

export default Menu