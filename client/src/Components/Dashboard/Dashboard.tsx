
import logo from '../../images/logo.png'



const Dashboard = () => {


  const handleClick =  () => {
    window.location.replace("http://localhost:8000/login");
  }
//creating a room in socket.io

  return (
    <div>
      <img src={logo}></img>
      <p>In order to use Partybeat you will have to login on Spotify</p>
      <button onClick={handleClick}>Login</button>
    </div>
  )
}

export default Dashboard