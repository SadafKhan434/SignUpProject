import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/SignUp';
import Login from './components/Login';
import Welcome from './components/Welcome';
import MailDashboard from './components/MailDashboard';
import 'bootstrap/dist/css/bootstrap.min.css'; 

function App() {
  
  const isAuthenticated = () => !!localStorage.getItem('token');

  return (
    <Router>
      <div className="App" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Routes>
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          
          <Route 
            path="/welcome" 
            element={isAuthenticated() ? <Welcome /> : <Navigate to="/login" replace />} 
          />
          
          <Route 
            path="/dashboard" 
            element={isAuthenticated() ? <MailDashboard /> : <Navigate to="/login" replace />} 
          />
          
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
