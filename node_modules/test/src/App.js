import { Routes, Route } from 'react-router-dom';
import Qr from './component/Qr';
import Home from './component/Home';
import './App.css';
import Maintenance from './component/Maintenance';
import Log from './component/Log';
import User from './component/User';
import Form from './component/Form';
import Login from './component/Login';
import Charts from './component/Charts';
import Addqr from './component/Addqr';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/qr" element={<Qr />} />
      <Route path="/addQr" element={<Addqr />} />
      <Route path="/log" element={<Log />} />
      <Route path="/maint" element={<Maintenance />} />
      <Route path="/user" element={<User />} />
      <Route path="/charts" element={<Charts />} />
      <Route path="/form" element={<Form />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
