import React, { useState, useEffect } from 'react';
import { Navbar, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';


import Sidebar from './Sidebar';
import MailList from './MailList';
import MailDetailView from './MailDetailView';

const FIREBASE_DB_URL = 'https://signupproject-a9e42-default-rtdb.firebaseio.com/mail.json';

const MailDashboard = () => {
  const [view, setView] = useState('inbox'); 
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
  const [receiver, setReceiver] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const token = localStorage.getItem('token');
  const rawEmail = localStorage.getItem('userEmail') || 'riya23@gmail.com';
  const safeUserKey = rawEmail.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

  
  const loadMailboxData = async () => {
    if (mails.length === 0) setLoading(true);
    try {
      const targetFolder = (view === 'view-mail') ? 'inbox' : view;
      const response = await fetch(`${FIREBASE_DB_URL}/mails/${safeUserKey}/${targetFolder}.json?auth=${token}`);
      const data = await response.json();

      if (data) {
        
        const standardizedList = Object.keys(data).map((key) => {
          const item = data[key];
          return {
            id: key,
            sender: item.sender || item.Sender || item.from || item.From || 'Unknown System',
            receiver: item.receiver || item.Receiver || item.to || item.To || '',
            subject: item.subject || item.Subject || '(No Subject)',
            body: item.body || item.Body || item.content || item.Content || '',
            timestamp: item.timestamp || item.Timestamp || item.date || item.Date || '',
            isRead: item.isRead !== undefined ? item.isRead : (item.IsRead !== undefined ? item.IsRead : false)
          };
        });

        standardizedList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setMails(standardizedList);

        if (targetFolder === 'inbox') {
          const count = standardizedList.filter((m) => m.isRead === false).length;
          setUnreadCount(count);
        }
      } else {
        setMails([]);
        if (targetFolder === 'inbox') setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (view === 'compose') return;
    loadMailboxData();
    const liveTimer = setInterval(() => { loadMailboxData(); }, 3000);
    return () => clearInterval(liveTimer);
  }, [view]);

  
  const handleOpenEmailRow = async (selectedItem) => {
    setSelectedMail(selectedItem);
    setView('view-mail');

    if (view === 'inbox' && !selectedItem.isRead) {
      try {
        await fetch(`${FIREBASE_DB_URL}/mails/${safeUserKey}/inbox/${selectedItem.id}.json?auth=${token}`, {
          method: 'PATCH',
          body: JSON.stringify({ isRead: true })
        });
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMsg({ type: '', text: '' });

    const cleanReceiverKey = receiver.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const emailPayload = {
      sender: rawEmail.trim().toLowerCase(),
      receiver: receiver.trim().toLowerCase(),
      subject: subject.trim() || '(No Subject)',
      body: body,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    try {
      await fetch(`${FIREBASE_DB_URL}/mails/${safeUserKey}/sent.json?auth=${token}`, {
        method: 'POST',
        body: JSON.stringify({ ...emailPayload, isRead: true })
      });
      await fetch(`${FIREBASE_DB_URL}/mails/${cleanReceiverKey}/inbox.json?auth=${token}`, {
        method: 'POST',
        body: JSON.stringify(emailPayload)
      });

      setAlertMsg({ type: 'success', text: 'Message delivered successfully!' });
      setReceiver(''); setSubject(''); setBody('');
      setView('sent');
    } catch (err) {
      setAlertMsg({ type: 'danger', text: 'Delivery failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '20px' }}>
      <Navbar bg="white" className="border shadow-sm mb-4 rounded px-4 py-2 d-flex justify-content-between">
        <Navbar.Brand className="fw-bold text-primary">MyWebLink <span className="text-secondary fw-normal fs-6">Mail Dashboard</span></Navbar.Brand>
        <span className="badge bg-light text-dark border px-3 py-2 fw-normal">👤 {rawEmail}</span>
      </Navbar>

      <Row>
        <Col md={3} className="mb-3">
          <Sidebar currentView={view} setView={setView} unreadCount={unreadCount} />
        </Col>

        <Col md={9}>
          {alertMsg.text && <Alert variant={alertMsg.type} className="py-2 small">{alertMsg.text}</Alert>}

          
          {(view === 'inbox' || view === 'sent') && (
            loading ? (
              <div className="text-center p-5 bg-white rounded border shadow-sm"><Spinner animation="border" variant="primary" /></div>
            ) : (
              <MailList view={view} mails={mails} onMailClick={handleOpenEmailRow} />
            )
          )}

          
          {view === 'view-mail' && selectedMail && (
            <MailDetailView selectedMail={selectedMail} onBackClick={() => setView('inbox')} />
          )}

          
          {view === 'compose' && (
            <Card className="border shadow-sm rounded-3 p-4 bg-white">
              <Form onSubmit={handleSendEmailSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">To (Recipient Address)</Form.Label>
                  <Form.Control type="email" placeholder="name@example.com" value={receiver} onChange={(e) => setReceiver(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Subject Heading</Form.Label>
                  <Form.Control type="text" placeholder="Subject Title..." value={subject} onChange={(e) => setSubject(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted">Message Paragraph Text Body Editor</Form.Label>
                  <ReactQuill theme="snow" value={body} onChange={setBody} style={{ height: '200px', background: '#fff' }} />
                </Form.Group>
                <div className="d-flex justify-content-end gap-2 mt-5">
                  <Button variant="light" size="sm" className="border px-3 rounded-pill" onClick={() => setView('inbox')}>Cancel</Button>
                  <Button type="submit" size="sm" variant="primary" className="px-4 rounded-pill fw-bold border-0" style={{ backgroundColor: '#0091ff' }}>Send Message</Button>
                </div>
              </Form>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default MailDashboard;
