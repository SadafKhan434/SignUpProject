import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/SignUp';
import Welcome from './components/Welcome';
import MailDashboard from './components/MailDashboard';

const isAuthenticated = () => Boolean(localStorage.getItem('token'));

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated() ? '/welcome' : '/login'} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/welcome" element={isAuthenticated() ? <Welcome /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={isAuthenticated() ? <MailDashboard /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
