import React, {Dispatch, SetStateAction} from 'react'

interface propsType {
  userId: any,
  song: any,
  setSelectedSong: Dispatch<SetStateAction<any>>,
}


const SearchButton = ({userId, song, setSelectedSong}: propsType) => {

  const handleClick = async (e:any) =>{
    e.preventDefault();

    const result = await fetch(`http://localhost:8000/addSong/${userId}`, {
      method: "POST",
    headers: {'Content-type' : 'application/json'},
    body: JSON.stringify({'song' : song})
  })
    const json = await result.json();
    console.log(json);
    setSelectedSong(song);
  }


  return (
    <button onClick={handleClick}>{song.name} from {song.artist}</button>
  )
}

export default SearchButton