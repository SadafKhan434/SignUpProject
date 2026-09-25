import React, { useEffect, useState } from 'react';
import { Navbar, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import Sidebar from './Sidebar';
import MailList from './MailList';
import MailDetailView from './MailDetailView';

const FIREBASE_DB_URL = 'https://signupproject-a9e42-default-rtdb.firebaseio.com/json.mail';
const POLL_INTERVAL_MS = 2000;

const countUnreadMails = (mailList) => mailList.filter((mail) => !mail.isRead).length;

const areMailListsEqual = (currentList, nextList) => {
  if (currentList.length !== nextList.length) return false;

  return currentList.every((mail, index) => {
    const nextMail = nextList[index];
    return (
      mail.id === nextMail.id &&
      mail.isRead === nextMail.isRead &&
      mail.subject === nextMail.subject &&
      mail.timestamp === nextMail.timestamp
    );
  });
};

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
  const [mailSourceFolder, setMailSourceFolder] = useState('inbox');

  const token = localStorage.getItem('token');
  const rawEmail = (localStorage.getItem('userEmail') || '').trim();
  const safeUserKey = rawEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const getFolderName = () => (view === 'view-mail' ? mailSourceFolder : view);

  const getMailUrl = (folder, id = '') => {
    const baseUrl = `${FIREBASE_DB_URL}/mails/${safeUserKey}/${folder}`;
    return id ? `${baseUrl}/${id}.json?auth=${token}` : `${baseUrl}.json?auth=${token}`;
  };

  const normalizeMail = (key, item) => ({
    id: key,
    sender: item.sender || item.Sender || item.from || item.From || 'Unknown System',
    receiver: item.receiver || item.Receiver || item.to || item.To || '',
    subject: item.subject || item.Subject || '(No Subject)',
    body: item.body || item.Body || item.content || item.Content || '',
    timestamp: item.timestamp || item.Timestamp || item.date || item.Date || '',
    isRead:
      item.isRead !== undefined ? item.isRead : item.IsRead !== undefined ? item.IsRead : false
  });

  const loadMailboxData = async (folderOverride = getFolderName()) => {
    const targetFolder = folderOverride || getFolderName();

    if (!targetFolder || (targetFolder !== 'inbox' && targetFolder !== 'sent')) return;
    if (mails.length === 0 && (view === 'inbox' || view === 'sent')) setLoading(true);

    try {
      const response = await fetch(getMailUrl(targetFolder));
      const data = await response.json();

      if (!data) {
        if (targetFolder === 'inbox') {
          setUnreadCount(0);
        }

        if (view === targetFolder) {
          setMails([]);
        }
        return;
      }

      const normalizedList = Object.keys(data)
        .map((key) => normalizeMail(key, data[key]))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      if (targetFolder === 'inbox') {
        setUnreadCount(countUnreadMails(normalizedList));
      }

      if (view === targetFolder && !areMailListsEqual(mails, normalizedList)) {
        setMails(normalizedList);
      }
    } catch (error) {
      console.error('Failed to fetch mailbox data:', error);
    } finally {
      if (view === 'inbox' || view === 'sent') setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !safeUserKey) return undefined;

    const syncMailbox = async () => {
      if (view === 'compose' || view === 'view-mail') {
        await loadMailboxData('inbox');
        return;
      }

      await loadMailboxData();
    };

    syncMailbox();
    const intervalId = setInterval(syncMailbox, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [view, token, safeUserKey]);

  const handleOpenEmailRow = async (selectedItem) => {
    setMailSourceFolder(view);
    setSelectedMail(selectedItem);
    setView('view-mail');

    if (view === 'inbox' && !selectedItem.isRead) {
      try {
        await fetch(getMailUrl('inbox', selectedItem.id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true })
        });

        setUnreadCount((prev) => Math.max(0, prev - 1));
        setMails((currentMails) =>
          currentMails.map((mail) =>
            mail.id === selectedItem.id ? { ...mail, isRead: true } : mail
          )
        );
      } catch (error) {
        console.error('Could not update read state:', error);
      }
    }
  };

  const handleDeleteMail = async (mailToDelete) => {
    if (!mailToDelete || !mailToDelete.id) return;

    const folderToDelete = getFolderName();

    try {
      const response = await fetch(getMailUrl(folderToDelete, mailToDelete.id), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Delete operation failed');
      }

      setMails((currentMails) => currentMails.filter((mail) => mail.id !== mailToDelete.id));

      if (selectedMail && selectedMail.id === mailToDelete.id) {
        setSelectedMail(null);
        setView(mailSourceFolder || 'inbox');
      }

      if (folderToDelete === 'inbox' && !mailToDelete.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setAlertMsg({ type: 'success', text: 'Message deleted successfully.' });
    } catch (error) {
      console.error('Delete failed:', error);
      setAlertMsg({ type: 'danger', text: 'Failed to delete message.' });
    }
  };

  const handleSendEmailSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAlertMsg({ type: '', text: '' });

    if (!token || !rawEmail) {
      setAlertMsg({ type: 'danger', text: 'Please log in again before sending mail.' });
      setLoading(false);
      return;
    }

    const cleanReceiverKey = receiver.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const emailPayload = {
      sender: rawEmail.toLowerCase(),
      receiver: receiver.trim().toLowerCase(),
      subject: subject.trim() || '(No Subject)',
      body,
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
      setReceiver('');
      setSubject('');
      setBody('');
      setView('sent');
    } catch (error) {
      console.error('Send email failed:', error);
      setAlertMsg({ type: 'danger', text: 'Delivery failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '20px' }}>
      <Navbar bg="white" className="border shadow-sm mb-4 rounded px-4 py-2 d-flex justify-content-between">
        <Navbar.Brand className="fw-bold text-primary">
          MyWebLink <span className="text-secondary fw-normal fs-6">Mail Dashboard</span>
        </Navbar.Brand>
      </Navbar>

      <Row>
        <Col md={3} className="mb-3">
          <Sidebar
            currentView={view}
            setView={(nextView) => {
              setView(nextView);
              setSelectedMail(null);
            }}
            unreadCount={unreadCount}
          />
        </Col>

        <Col md={9}>
          {alertMsg.text && <Alert variant={alertMsg.type} className="py-2 small">{alertMsg.text}</Alert>}

          {(view === 'inbox' || view === 'sent') &&
            (loading ? (
              <div className="text-center p-5 bg-white rounded border shadow-sm">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <MailList
                view={view}
                mails={mails}
                onMailClick={handleOpenEmailRow}
                onDeleteMail={handleDeleteMail}
              />
            ))}

          {view === 'view-mail' && selectedMail && (
            <MailDetailView
              selectedMail={selectedMail}
              onBackClick={() => setView(mailSourceFolder || 'inbox')}
            />
          )}
             {view === 'compose' && (
  <Card className="border shadow-sm p-4 bg-white rounded-3">
    <h5 className="mb-4 fw-bold text-dark text-uppercase small tracking-wider">New Message</h5>
    <Form onSubmit={handleSendEmailSubmit}>

      <Form.Group className="mb-3">
        <Form.Control type="email" placeholder="To (Recipient Address):" value={receiver} onChange={(e) => setReceiver(e.target.value)} className="py-2 bg-light border-light small text-dark" required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control type="text" placeholder="Subject Heading:" value={subject} onChange={(e) => setSubject(e.target.value)} className="py-2 bg-light border-light small text-dark" required />
      </Form.Group>
      <Form.Group className="mb-4">
        <Form.Label className="text-muted small fw-medium">Message Paragraph Text Body Editor</Form.Label>
        <ReactQuill theme="snow" value={body} onChange={setBody} style={{ height: '220px', marginBottom: '50px' }} />
      </Form.Group>
      <div className="d-flex gap-2">
        <Button variant="secondary" onClick={() => setView('inbox')} className="rounded-pill px-4 small">Cancel</Button>
        <Button variant="primary" type="submit" disabled={loading} className="rounded-pill px-4 fw-bold border-0" style={{ backgroundColor: '#0091ff' }}>
          Send Message
        </Button>
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
