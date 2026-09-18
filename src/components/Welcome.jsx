import React from 'react';
import { Container, Button, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('userEmail'); 
    navigate('/login'); 
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="text-center p-5 shadow-sm rounded bg-white border" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 className="fw-normal text-dark mb-3" style={{ fontSize: '32px' }}>Welcome to your mail box</h1>
        <p className="text-muted mb-4">You have successfully authenticated using the Firebase REST API endpoints.</p>
        
        <Stack gap={3} className="col-md-10 mx-auto">
        
          <Button 
            variant="primary" 
            className="rounded-pill py-2 shadow-none fw-bold" 
            style={{ backgroundColor: '#0091ff', border: 'none' }}
            onClick={() => navigate('/dashboard')}
          >
            Open Mail Dashboard
          </Button>

          <Button variant="outline-danger" className="rounded-pill py-2" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </div>
    </Container>
  );
};

export default Welcome;
