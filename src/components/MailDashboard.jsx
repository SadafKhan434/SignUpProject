import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, Row, Col, ListGroup, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const FIREBASE_DB_URL = 'https://signupproject-a9e42-default-rtdb.firebaseio.com';

const MailDashboard = () => {
  const currentEmail = (localStorage.getItem('userEmail') || 'student@sharpener.tech').trim().toLowerCase();

  const [view, setView] = useState('inbox');
  const [selectedMail, setSelectedMail] = useState(null);
  const [receiver, setReceiver] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const sanitizeEmail = (email) => (email || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  const stripHtml = (value = '') => (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const hasMailContent = (value = '') => stripHtml(value).length > 0;

  const fetchMailFolder = useCallback(async (folderName, hideSpinner = false) => {
    if (!hideSpinner) setLoading(true);

    try {
      const cleanUser = sanitizeEmail(currentEmail);
      const token = localStorage.getItem('token');
      const response = await fetch(`${FIREBASE_DB_URL}/mails/${cleanUser}/${folderName}.json${token ? `?auth=${token}` : ''}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data) {
        const processedMails = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setMails(processedMails);
      } else {
        setMails([]);
      }
    } catch (err) {
      console.error('Read API error:', err);
      setStatus({ type: 'danger', text: 'Failed to synchronize mail database.' });
    } finally {
      if (!hideSpinner) setLoading(false);
    }
  }, [currentEmail]);

  useEffect(() => {
    if (view === 'compose' || view === 'view-mail') return;

    fetchMailFolder(view);

    const trackingInterval = setInterval(() => {
      fetchMailFolder(view, true);
    }, 5000);

    return () => clearInterval(trackingInterval);
  }, [view, fetchMailFolder]);

  const handleSendMail = async (e) => {
    e.preventDefault();

    const normalizedReceiver = receiver.trim();
    if (!normalizedReceiver || !hasMailContent(body)) {
      setStatus({ type: 'warning', text: 'Please fill out all email contents.' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setStatus({ type: 'danger', text: 'Your session expired. Please log in again.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', text: '' });

    const emailPayload = {
      sender: currentEmail,
      receiver: normalizedReceiver.toLowerCase(),
      subject: subject.trim() || '(No Subject)',
      body,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    try {
      const cleanSender = sanitizeEmail(currentEmail);
      const cleanReceiver = sanitizeEmail(emailPayload.receiver);

      await fetch(`${FIREBASE_DB_URL}/mails/${cleanSender}/sent.json?auth=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emailPayload, isRead: true }),
      });

      await fetch(`${FIREBASE_DB_URL}/mails/${cleanReceiver}/inbox.json?auth=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });

      setStatus({ type: 'success', text: 'Message successfully delivered!' });
      setReceiver('');
      setSubject('');
      setBody('');
      setView('sent');
    } catch (err) {
      console.error('Send mail error:', err);
      setStatus({ type: 'danger', text: 'Database server network communication error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMail = async (mail) => {
    setSelectedMail(mail);
    setView('view-mail');

    if (view === 'inbox' && (mail.isRead === false || mail.isRead === undefined)) {
      try {
        const cleanUser = sanitizeEmail(currentEmail);
        const token = localStorage.getItem('token');

        if (token) {
          await fetch(`${FIREBASE_DB_URL}/mails/${cleanUser}/inbox/${mail.id}.json?auth=${token}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: true }),
          });
        }

        setMails((prev) => prev.map((item) => (item.id === mail.id ? { ...item, isRead: true } : item)));
      } catch (err) {
        console.error('Failed to update read state:', err);
      }
    }
  };

  const unreadCount = mails.filter((mail) => mail.isRead === false || mail.isRead === undefined).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fa', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px' }}>
        <Navbar bg="white" className="border shadow-sm mb-4 rounded-3 px-4 py-2">
          <Navbar.Brand className="fw-bold text-primary fs-5" style={{ letterSpacing: '-0.5px' }}>
            MyWebLink <span className="text-secondary fw-normal fs-6">Mail</span>
          </Navbar.Brand>
          <div className="ms-auto">
            <span className="badge bg-light text-dark border px-3 py-2 fw-normal" style={{ fontSize: '12.5px' }}>
              {currentEmail}
            </span>
          </div>
        </Navbar>

        <Row className="g-4">
          <Col lg={3}>
            <div className="bg-white rounded-3 border p-3 shadow-sm">
              <Button
                className="w-100 rounded-pill mb-4 border-0 fw-bold py-2.5 shadow-none"
                style={{ background: '#0091ff', fontSize: '14px' }}
                onClick={() => {
                  setView('compose');
                  setSelectedMail(null);
                }}
              >
                Compose
              </Button>

              <ListGroup variant="flush">
                <ListGroup.Item
                  action
                  active={view === 'inbox'}
                  onClick={() => {
                    setView('inbox');
                    setSelectedMail(null);
                  }}
                  className="border-0 rounded-2 mb-1 px-3 py-2.5 fw-semibold d-flex align-items-center justify-content-between"
                  style={{ fontSize: '14px' }}
                >
                  <span>📥 Inbox</span>
                  {unreadCount > 0 && <span className="badge bg-primary rounded-pill">{unreadCount}</span>}
                </ListGroup.Item>

                <ListGroup.Item
                  action
                  active={view === 'sent'}
                  onClick={() => {
                    setView('sent');
                    setSelectedMail(null);
                  }}
                  className="border-0 rounded-2 mb-1 px-3 py-2.5 fw-semibold"
                  style={{ fontSize: '14px' }}
                >
                  📤 Sent
                </ListGroup.Item>
              </ListGroup>
            </div>
          </Col>

          <Col lg={9}>
            {status.text && (
              <Alert variant={status.type} dismissible onClose={() => setStatus({ type: '', text: '' })} className="py-2.5 small mb-3">
                {status.text}
              </Alert>
            )}

            {(view === 'inbox' || view === 'sent') && (
              <Card className="border shadow-sm rounded-3 overflow-hidden bg-white">
                <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold text-capitalize text-dark" style={{ fontSize: '16px' }}>{view}</h5>
                  {loading && <Spinner animation="border" size="sm" className="text-primary" />}
                </Card.Header>

                <ListGroup variant="flush">
                  {mails.length === 0 ? (
                    <div className="text-center p-5 text-muted small">No conversations inside this folder.</div>
                  ) : (
                    mails.map((mail) => {
                      const isUnread = view === 'inbox' && (mail.isRead === false || mail.isRead === undefined);
                      const plainSnippet = stripHtml(mail.body || '').substring(0, 90);

                      return (
                        <ListGroup.Item
                          key={mail.id}
                          action
                          onClick={() => handleOpenMail(mail)}
                          className="px-3 py-2 border-bottom"
                          style={{ fontSize: '13px', background: isUnread ? '#f4f8ff' : '#fff' }}
                        >
                          <div className="d-flex align-items-center justify-content-between gap-3">
                            <div className="d-flex align-items-center flex-grow-1 text-truncate">
                              <Form.Check type="checkbox" className="me-2 shadow-none" onClick={(e) => e.stopPropagation()} />
                              {isUnread && <span className="rounded-circle bg-primary me-2" style={{ width: '6px', height: '6px', display: 'inline-block' }} />}
                              <div className="text-truncate flex-grow-1">
                                <div className={isUnread ? 'fw-bold text-dark' : 'text-secondary'}>
                                  {view === 'inbox' ? mail.sender : mail.receiver}
                                </div>
                                <div className="text-truncate text-dark">
                                  <span className={isUnread ? 'fw-bold' : ''}>{mail.subject || '(No Subject)'}</span>
                                  <span className="text-muted"> — {plainSnippet}{plainSnippet.length >= 90 ? '...' : ''}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-end text-muted text-nowrap" style={{ width: '90px', fontSize: '11px' }}>
                              <span className={isUnread ? 'fw-bold text-dark' : ''}>
                                {mail.timestamp ? new Date(mail.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                              </span>
                            </div>
                          </div>
                        </ListGroup.Item>
                      );
                    })
                  )}
                </ListGroup>
              </Card>
            )}

            {view === 'compose' && (
              <Card className="border shadow-sm rounded-3 bg-white">
                <Card.Header className="bg-white border-bottom py-3 px-4">
                  <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '16px' }}>Compose Message</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form onSubmit={handleSendMail}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">To</Form.Label>
                      <Form.Control
                        type="email"
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        placeholder="receiver@example.com"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Subject</Form.Label>
                      <Form.Control
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Message</Form.Label>
                      <div className="border rounded">
                        <ReactQuill
                          value={body}
                          onChange={setBody}
                          theme="snow"
                          modules={{
                            toolbar: [
                              [{ header: [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline'],
                              [{ list: 'ordered' }, { list: 'bullet' }],
                              ['link', 'clean'],
                            ],
                          }}
                        />
                      </div>
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button type="submit" variant="primary" disabled={loading} style={{ backgroundColor: '#0091ff', border: 'none' }}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Send'}
                      </Button>
                      <Button type="button" variant="outline-secondary" onClick={() => setView('inbox')}>
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {view === 'view-mail' && selectedMail && (
              <Card className="border shadow-sm rounded-3 bg-white">
                <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold text-dark">{selectedMail.subject || '(No Subject)'}</h5>
                  <Button variant="outline-secondary" size="sm" onClick={() => setView('inbox')}>
                    Back
                  </Button>
                </Card.Header>
                <Card.Body className="p-4">
                  <p className="mb-2 small text-muted">
                    <strong>From:</strong> {selectedMail.sender || selectedMail.receiver}
                  </p>
                  <p className="mb-3 small text-muted">
                    <strong>To:</strong> {selectedMail.receiver || selectedMail.sender}
                  </p>
                  <div className="border rounded p-3 bg-light" dangerouslySetInnerHTML={{ __html: selectedMail.body || '<p>No message content.</p>' }} />
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