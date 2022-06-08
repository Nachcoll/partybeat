
import './App.css';
import Dashboard from './Components/Dashboard/Dashboard';
import Menu from './Components/Menu/Menu';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Client from './Components/Client/Client';

function App() {
  return (

      <BrowserRouter>
      <Routes>
        <Route path= '/' element={<Dashboard/>}/>
        <Route path= '/menu' element={<Menu/>}/>
        <Route path= '/room/:id' element={<Client/>}/>
      </Routes>
      </BrowserRouter>

  );
}

export default App;
