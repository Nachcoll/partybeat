
import logo from '../../images/logo.png'



const Dashboard = () => {

  //we don't fetch here because we are actually just redirecting to Spotify Authorization site.
  const handleClick =  () => {
    window.location.replace("https://f186-139-47-32-93.eu.ngrok.io/login");
  }


  return (
    <div className="dashboardContainer">
      <img src={logo} className="logo"></img>
      <p>In order to use Partybeat you will have to login on Spotify.</p>
      <button onClick={handleClick}>Login</button>
    </div>
  )
}

export default Dashboard