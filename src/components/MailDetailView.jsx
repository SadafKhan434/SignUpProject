import React from 'react';
import { Card, Button } from 'react-bootstrap';

const MailDetailView = ({ selectedMail, onBackClick }) => {
  if (!selectedMail) return null;

  
  const initial = selectedMail.sender ? selectedMail.sender.charAt(0).toUpperCase() : 'M';

  return (
    <Card className="border shadow-sm rounded-3 p-4 bg-white">
      <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" className="border px-3 rounded shadow-none small" onClick={onBackClick}>
            ← Back
          </Button>
          <Button variant="light" size="sm" className="border text-danger shadow-none small">🗑️ Delete</Button>
          <Button variant="light" size="sm" className="border shadow-none small">Spam</Button>
        </div>
        <span className="text-muted small fw-medium" style={{ fontSize: '12px' }}>Workspace Viewer</span>
      </div>


      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-3" style={{ fontSize: '20px', letterSpacing: '-0.3px' }}>
          {selectedMail.subject}
        </h4>
        
        <div className="d-flex align-items-center gap-3">
          
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" 
            style={{ 
              width: '42px', 
              height: '42px', 
              fontSize: '15px', 
              backgroundColor: '#6c757d',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {initial}
          </div>
          
          <div className="overflow-hidden">
            <div className="small fw-bold text-dark text-truncate">{selectedMail.sender}</div>
            <div className="text-muted text-truncate" style={{ fontSize: '11px', marginTop: '2px' }}>
              To: {selectedMail.receiver || 'me'} • {new Date(selectedMail.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>


      <div 
        className="p-3 bg-light rounded text-dark lh-base border-0 message-body-frame"
        style={{ 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-word', 
          minHeight: '200px', 
          fontSize: '14px',
          color: '#333333'
        }}
        dangerouslySetInnerHTML={{ __html: selectedMail.body }}
      />
    </Card>
  );
};

export default MailDetailView;
