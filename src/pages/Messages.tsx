import React from 'react';
import { Send, Search } from 'lucide-react';

const Messages = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>Messages</h1>
        <p style={{ color: '#666', marginTop: '8px' }}>Communicate with your supervisors or students directly.</p>
      </div>

      <div className="messaging-container">
        <div className="chat-sidebar">
          <div className="chat-header">
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#999' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search..." 
                style={{ paddingLeft: '36px', borderRadius: '20px' }} 
              />
            </div>
          </div>
          <div className="chat-list">
            <div className="chat-item active">
              <div className="chat-name">Dr. Sarah Johnson (Academic Sup.)</div>
              <div className="chat-preview">Please make sure to include the methodology section in your next report.</div>
            </div>
            <div className="chat-item">
              <div className="chat-name">Mr. David Smith (Field Sup.)</div>
              <div className="chat-preview">Great job on the project today!</div>
            </div>
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-main-header">
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-beige)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-navy)', fontWeight: 'bold' }}>
              SJ
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Dr. Sarah Johnson</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Academic Supervisor</div>
            </div>
          </div>
          
          <div className="chat-messages">
            <div className="message received">
              Hello! How is your training at Tech Solutions going so far?
            </div>
            <div className="message sent">
              Hi Dr. Sarah, it's going very well! I am currently working with the frontend team.
            </div>
            <div className="message received">
              That's excellent to hear. Please make sure to include the methodology section in your next report.
            </div>
            <div className="message sent">
              Will do. I plan to submit the report by Thursday evening.
            </div>
          </div>

          <div className="chat-input">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Type your message here..." 
              style={{ flex: 1 }} 
            />
            <button className="btn btn-primary" style={{ padding: '0 24px' }}>
              <Send size={18} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
