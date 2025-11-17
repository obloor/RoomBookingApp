import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthProvider from './contexts/AuthProvider';
import NavigationBar from './components/Navbar';
import AllRooms from './components/AllRooms';
import Login from './components/Login';
import Register from './components/Register';
import Logout from './components/Logout';
import RoomDetail from './components/RoomDetail';
import MyReservations from './components/MyReservations';
import MakeReservation from './components/MakeReservation';
import EditReservation from './components/EditReservation';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<AllRooms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/my-reservations" element={<MyReservations />} />
            <Route path="/make-reservation" element={<MakeReservation />} />

            <Route path="/reservations/:id/edit" element={<EditReservation />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
