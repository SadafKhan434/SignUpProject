import React, { useState } from 'react';
import { Navbar, Nav, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FIREBASE_API_KEY } from '../firebase';
import './SignUp.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const isFormFilled = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true
        })
      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.error?.message || 'Invalid email or password.');
      }

      
      localStorage.setItem('token', data.idToken);
      
      
      navigate('/welcome');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="background-accent-shape"></div>
      
      <Navbar bg="white" variant="light" className="custom-navbar">
        <Navbar.Brand href="#home"><span className="text-primary brand-title">MyWebLink</span></Navbar.Brand>
        <Nav className="me-auto ms-3">
          <Nav.Link href="#home" className="px-3 text-secondary small">Home</Nav.Link>
          <Nav.Link href="#products" className="px-3 text-secondary small">Products</Nav.Link>
          <Nav.Link href="#about" className="px-3 text-secondary small">About Us</Nav.Link>
        </Nav>
      </Navbar>

      <div className="form-content-area">
        <div className="signup-card-wrapper">
          <Card className="custom-form-card shadow-none mb-3">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4 fw-normal text-dark" style={{ fontSize: '26px' }}>Login</h2>
              
              {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
              
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="userEmail">
                  <Form.Control type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="py-2 bg-light border-light text-muted small" required />
                </Form.Group>

                <Form.Group className="mb-4" controlId="userPassword">
                  <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="py-2 bg-light border-light text-muted small" required />
                </Form.Group>

                <Button className="w-100 rounded-pill py-2 shadow-none" variant="primary" type="submit" disabled={!isFormFilled || loading} style={{ backgroundColor: '#0091ff', border: 'none' }}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <div className="login-redirect-card text-center">
            <span className="text-muted">Don't have an account? </span>
            <Button variant="link" onClick={() => navigate('/signup')} className="p-0 text-decoration-none small fw-bold" style={{ color: '#0091ff' }}>SignUp</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
