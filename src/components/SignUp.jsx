
import React, { useState } from 'react';
import { Navbar, Nav, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './SignUp.css';

const Signup = () => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const isFormFilled = email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '';

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      setLoading(true);
      

      await createUserWithEmailAndPassword(auth, email, password);
      
      
      console.log('User has successfully signed up.');
      
      setSuccess(true);
      
      
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">

      <div className="background-accent-shape"></div>

    
      <Navbar bg="white" variant="light" className="custom-navbar">
        <Navbar.Brand href="#home">
          <span className="text-primary brand-title">MyWebLink</span>
        </Navbar.Brand>
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
              <h2 className="text-center mb-4 fw-normal text-dark" style={{ fontSize: '26px' }}>SignUp</h2>
              
    
              {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
              {success && <Alert variant="success" className="py-2 small">Sign up success!</Alert>}
              
              <Form onSubmit={handleRegisterUser}>
                <Form.Group className="mb-3" controlId="userEmail">
                  <Form.Control 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-2 bg-light border-light text-muted small"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="userPassword">
                  <Form.Control 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-2 bg-light border-light text-muted small"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="userConfirmPassword">
                  <Form.Control 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="py-2 bg-light border-light text-muted small"
                    required
                  />
                </Form.Group>

    
                <Button 
                  className="w-100 rounded-pill py-2 shadow-none" 
                  variant="primary" 
                  type="submit"
                  disabled={!isFormFilled || loading}
                  style={{ backgroundColor: '#0091ff', border: 'none' }}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Sign up'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

        
          <div className="login-redirect-card">
            <span className="text-muted">Have an account? </span>
            <a href="#login" className="login-link-action">Login</a>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Signup;
