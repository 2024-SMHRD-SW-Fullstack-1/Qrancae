import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Navigate 추가
import Qr from './component/Qr';
import Home from './component/Home';
import './App.css';
import Maintenance from './component/Maintenance';
import Log from './component/Log';
import User from './component/User';
import Form from './component/Form';
import Login from './component/Login';
import Addqr from './component/Addqr';
import Repair from './component/Repair';
import Register from './component/Register';
import UserDetail from './component/UserDetail';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/repair" element={<Repair />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/qr" element={<Qr />} />
      <Route path="/addQr" element={<Addqr />} />
      <Route path="/log" element={<Log />} />
      <Route path="/maint" element={<Maintenance />} />
      <Route path="/user" element={<User />} />
      <Route path="/user/:userId" element={<UserDetail />} />
      <Route path="/form" element={<Form />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
