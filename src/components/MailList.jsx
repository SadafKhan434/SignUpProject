import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const cleanSnippetText = (htmlText = '') => {
  if (!htmlText) return 'No content';
  return htmlText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const formatMailDate = (dateString) => {
  if (!dateString) return 'Recent';

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Recent' : date.toLocaleDateString();
};

const MailList = ({ view, mails, onMailClick, onDeleteMail }) => {
  if (mails.length === 0) {
    return (
      <div className="text-center p-5 text-muted bg-white rounded border shadow-sm small">
        Your {view} list folder is empty.
      </div>
    );
  }

  return (
    <Card className="border shadow-sm rounded-3 overflow-hidden bg-white">
      <Card.Header className="bg-white text-center py-3 border-bottom">
        <h6 className="m-0 fw-bold text-dark text-uppercase small tracking-wider">
          {view} message lists
        </h6>
      </Card.Header>

      <ListGroup variant="flush">
        {mails.map((mail) => {
          const isUnreadInboxMail = view === 'inbox' && !mail.isRead;

          return (
            <ListGroup.Item
              key={mail.id}
              as="div"
              onClick={() => onMailClick(mail)}
              className="p-3 border-bottom d-flex align-items-center gap-3"
              style={{
                background: isUnreadInboxMail ? '#f4f9ff' : '#ffffff',
                cursor: 'pointer'
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onMailClick(mail);
                }
              }}
            >
              {isUnreadInboxMail && (
                <div
                  className="bg-primary rounded-circle flex-shrink-0"
                  style={{
                    width: '10px',
                    height: '10px',
                    boxShadow: '0 0 0 3px rgba(0, 145, 255, 0.2)'
                  }}
                />
              )}

              <div
                className="w-100 overflow-hidden"
                style={{ paddingLeft: isUnreadInboxMail ? '0px' : '14px' }}
              >
                <div className="d-flex justify-content-between mb-1 small text-secondary gap-3">
                  <span className={isUnreadInboxMail ? 'fw-bold text-dark' : ''}>
                    {view === 'inbox' ? `From: ${mail.sender}` : `To: ${mail.receiver}`}
                  </span>

                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '11px' }}>{formatMailDate(mail.timestamp)}</span>

                    <span
                      role="button"
                      tabIndex={0}
                      className="btn btn-sm btn-outline-danger px-2 py-1 rounded-pill"
                      style={{ fontSize: '11px', lineHeight: 1.2 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (onDeleteMail) onDeleteMail(mail);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          if (onDeleteMail) onDeleteMail(mail);
                        }
                      }}
                    >
                      Delete
                    </span>
                  </div>
                </div>

                <div className={`small text-truncate ${isUnreadInboxMail ? 'fw-bold text-dark' : 'text-muted'}`}>
                  {mail.subject}
                </div>

                <div
                  className="text-muted small text-truncate mt-0.5 opacity-75"
                  style={{ maxWidth: '100%' }}
                >
                  {cleanSnippetText(mail.body)}
                </div>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </Card>
  );
};

export default MailList;
