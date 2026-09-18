import React, { useState } from 'react';
import { Navbar, Container, Row, Col, ListGroup, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const FIREBASE_DB_URL = "https://signupproject-a9e42-default-rtdb.firebaseio.com";

const MailDashboard = () => {
  const currentEmail = (localStorage.getItem('userEmail') || 'student@sharpener.tech').trim().toLowerCase();

  const sanitizeEmail = (email) => (email || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  const hasMailContent = (value) => (value || '').replace(/<[^>]*>/g, '').trim().length > 0;

  
  const [view, setView] = useState('compose'); 
  
  // Form Field Hooks
  const [receiver, setReceiver] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState(''); 

  
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  };

  
  const handleSendMail = async (e) => {
    e.preventDefault();

    const normalizedReceiver = receiver.trim();
    if (!normalizedReceiver || !hasMailContent(body)) {
      setStatus({ type: 'warning', text: 'Please enter a recipient and a message before sending.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', text: '' });

    const emailPayload = {
      sender: currentEmail,
      receiver: normalizedReceiver.toLowerCase(),
      subject: subject.trim() || '(No Subject)',
      body: body,
      timestamp: new Date().toISOString()
    };

    try {
      const cleanSender = sanitizeEmail(currentEmail);
      const cleanReceiver = sanitizeEmail(emailPayload.receiver);

      const senderResponse = await fetch(`${FIREBASE_DB_URL}/mails/${cleanSender}/sent.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });

      if (!senderResponse.ok) {
        throw new Error('Failed to save the sent mail.');
      }

      const receiverResponse = await fetch(`${FIREBASE_DB_URL}/mails/${cleanReceiver}/inbox.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });

      if (!receiverResponse.ok) {
        throw new Error('Failed to save the incoming mail.');
      }

      setStatus({ type: 'success', text: 'Email successfully delivered!' });
      setReceiver('');
      setSubject('');
      setBody('');
    } catch (err) {
      setStatus({ type: 'danger', text: 'Failed to communicate with database server.' });
    } finally {
      setLoading(false);
    }
  };

  
  const fetchMailFolder = async (folderName) => {
    setView(folderName);
    setLoading(true);
    setMails([]);
    
    try {
      const cleanUser = sanitizeEmail(currentEmail);
      const response = await fetch(`${FIREBASE_DB_URL}/mails/${cleanUser}/${folderName}.json`);
      const data = await response.json();

      if (data) {
        const processedMails = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setMails(processedMails);
      }
    } catch (err) {
      console.error('Read operation failed:', err);
      setStatus({ type: 'danger', text: 'Unable to load messages from this mailbox.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f6fb', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 18px' }}>
        <Navbar bg="white" className="border-0 shadow-sm mb-4 rounded-4 px-3 py-2">
          <Navbar.Brand className="fw-bold text-primary fs-4">Mail</Navbar.Brand>
          <div className="ms-auto d-flex align-items-center gap-3">
            <span className="text-secondary small">{currentEmail}</span>
          </div>
        </Navbar>

        <Row className="g-4">
          <Col lg={3}>
            <div className="bg-white rounded-4 shadow-sm p-3 h-100">
              <Button
                className="w-100 rounded-pill mb-4 border-0 fw-semibold"
                style={{ background: '#0d6efd', padding: '12px 18px' }}
                onClick={() => setView('compose')}
              >
                Compose
              </Button>

              <ListGroup variant="flush" className="border-0">
                <ListGroup.Item
                  action
                  active={view === 'inbox'}
                  onClick={() => fetchMailFolder('inbox')}
                  className="border-0 rounded-3 mb-2 px-3 py-3 fw-semibold"
                >
                  Inbox
                </ListGroup.Item>
                <ListGroup.Item
                  action
                  active={view === 'sent'}
                  onClick={() => fetchMailFolder('sent')}
                  className="border-0 rounded-3 mb-2 px-3 py-3 fw-semibold"
                >
                  Sent
                </ListGroup.Item>
              </ListGroup>
            </div>
          </Col>

          <Col lg={9}>
            {status.text && (
              <Alert variant={status.type || 'info'} dismissible onClose={() => setStatus({ type: '', text: '' })} className="rounded-3 mb-3">
                {status.text}
              </Alert>
            )}

            {view === 'compose' ? (
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="border-0 bg-white px-4 py-3">
                  <h4 className="mb-0 fw-semibold text-dark">Compose</h4>
                </Card.Header>
                <Card.Body className="p-4 pt-3">
                  <Form onSubmit={handleSendMail}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-secondary small mb-2">To</Form.Label>
                      <Form.Control
                        type="email"
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        placeholder="recipient@example.com"
                        className="border-0 bg-light rounded-3 py-2.5"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="text-secondary small mb-2">Subject</Form.Label>
                      <Form.Control
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject"
                        className="border-0 bg-light rounded-3 py-2.5"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="text-secondary small mb-2">Message</Form.Label>
                      <div className="bg-light rounded-3 p-2" style={{ minHeight: '290px' }}>
                        <ReactQuill
                          theme="snow"
                          value={body}
                          onChange={setBody}
                          modules={quillModules}
                          style={{ minHeight: '240px', background: '#fff' }}
                          placeholder="Write your email here..."
                        />
                      </div>
                    </Form.Group>

                    <div className="d-flex justify-content-end pt-2">
                      <Button type="submit" variant="primary" disabled={loading} className="rounded-pill px-4 py-2 fw-semibold border-0" style={{ background: '#0d6efd' }}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Send'}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="border-0 bg-white px-4 py-3 d-flex justify-content-between align-items-center">
                  <h4 className="mb-0 fw-semibold text-dark">{view === 'inbox' ? 'Inbox' : 'Sent'}</h4>
                </Card.Header>

                <Card.Body className="p-4">
                  {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                  ) : mails.length === 0 ? (
                    <p className="text-muted text-center py-5 mb-0">No mail entries in this folder.</p>
                  ) : (
                    mails.map((mail) => (
                      <Card key={mail.id} className="mb-3 border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                            <div>
                              <h5 className="mb-1 fw-semibold text-dark">{mail.subject}</h5>
                              <small className="text-secondary">
                                {view === 'inbox' ? `From: ${mail.sender}` : `To: ${mail.receiver}`}
                              </small>
                            </div>
                            <small className="text-muted text-end">{new Date(mail.timestamp).toLocaleString()}</small>
                          </div>

                          <div
                            className="text-dark"
                            dangerouslySetInnerHTML={{ __html: mail.body }}
                          />
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MailDashboard;
