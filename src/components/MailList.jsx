import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const MailList = ({ view, mails, onMailClick }) => {
  
  // Helper to remove HTML markup tags for the single-line feed row snippet
  const cleanSnippetText = (htmlText = '') => {
    if (!htmlText) return 'No content';
    return htmlText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  
  const formatMailDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Recent' : date.toLocaleDateString();
  };

  if (mails.length === 0) {
    return <div className="text-center p-5 text-muted bg-white rounded border shadow-sm small">Your {view} list folder is empty.</div>;
  }

  return (
    <Card className="border shadow-sm rounded-3 overflow-hidden bg-white">
      <Card.Header className="bg-white text-center py-3 border-bottom">
        <h6 className="m-0 fw-bold text-dark text-uppercase small tracking-wider">{view} message lists</h6>
      </Card.Header>
      <ListGroup variant="flush">
        {mails.map((mail) => (
          <ListGroup.Item
            key={mail.id}
            action
            onClick={() => onMailClick(mail)}
            className="p-3 border-bottom d-flex align-items-center gap-3"
            style={{ background: view === 'inbox' && !mail.isRead ? '#f4f9ff' : '#ffffff' }}
          >
            
            {view === 'inbox' && !mail.isRead && (
              <div 
                className="bg-primary rounded-circle flex-shrink-0" 
                style={{ width: '10px', height: '10px', boxShadow: '0 0 0 3px rgba(0, 145, 255, 0.2)' }}
              ></div>
            )}

            
            <div className="w-100 overflow-hidden" style={{ paddingLeft: (view === 'inbox' && !mail.isRead) ? '0px' : '14px' }}>
              <div className="d-flex justify-content-between mb-1 small text-secondary">
                <span className={view === 'inbox' && !mail.isRead ? 'fw-bold text-dark' : ''}>
                  {view === 'inbox' ? `From: ${mail.sender}` : `To: ${mail.receiver}`}
                </span>
                <span style={{ fontSize: '11px' }}>{formatMailDate(mail.timestamp)}</span>
              </div>
              
              <div className={`small text-truncate ${view === 'inbox' && !mail.isRead ? 'fw-bold text-dark' : 'text-muted'}`}>
                {mail.subject}
              </div>
              
            
              <div className="text-muted small text-truncate mt-0.5 opacity-75" style={{ maxWidth: '100%' }}>
                {cleanSnippetText(mail.body)}
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default MailList;
