import React from 'react';
import { Card, Button, ListGroup } from 'react-bootstrap';

const Sidebar = ({ currentView, setView, unreadCount }) => {
  return (
    <Card className="border shadow-sm p-3 bg-white rounded-3">
      
      <Button 
        className="w-100 rounded-pill mb-3 fw-bold py-2 border-0 text-white shadow-none" 
        style={{ backgroundColor: '#0091ff' }}
        onClick={() => setView('compose')}
      >
        📝 Compose
      </Button>
      
      
      <ListGroup variant="flush">
        <ListGroup.Item 
          action 
          active={currentView === 'inbox' || currentView === 'view-mail'}
          onClick={() => setView('inbox')}
          className="border-0 rounded d-flex justify-content-between align-items-center py-2 px-3 fw-semibold"
        >
          <span>📥 Inbox</span>
          
          {unreadCount > 0 && <span className="fw-bold text-danger">{unreadCount}</span>}
        </ListGroup.Item>

        <ListGroup.Item 
          action 
          active={currentView === 'sent'}
          onClick={() => setView('sent')}
          className="border-0 rounded py-2 px-3 fw-semibold mt-1"
        >
          📤 Sent Messages
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
};

export default Sidebar;
