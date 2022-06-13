import { deleteProps } from '../../Types/Types'
import { deletingSong } from '../../Services/clientServices'
import './DeleteButton.css'

const DeleteButton = ({userId, song, setDeleteSong}: deleteProps) => {


const handleDelete = () => {
  if(userId !== undefined){
    deletingSong(userId, song)
    setDeleteSong(song);
  }
}


  return (
    <button className="deleteButton" onClick={handleDelete}>X</button>
  )
}

export default DeleteButton