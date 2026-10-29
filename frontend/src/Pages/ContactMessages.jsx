import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/admin/contacts');
      if (response.data.success) {
        const enrichedMessages = response.data.contacts.map(msg => ({
          ...msg,
          status: msg.status || 'Unread'
        }));
        setMessages(enrichedMessages);
      } else {
        setError('Failed to fetch messages.');
      }
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      setError('Server error while loading messages.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesFilter = filter === 'All' || msg.status === filter;
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const response = await axios.put(`http://localhost:4000/api/admin/contacts/${selectedMessage._id}/reply`, {
        replyMessage: replyText
      });

      if (response.data.success) {
        alert("Reply email successfully sent to the customer!");
        fetchMessages();
        setSelectedMessage(null);
        setReplyText('');
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
      alert("Error sending reply email. Check console for details.");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`http://localhost:4000/api/admin/contacts/${selectedMessage._id}/status`, { 
        status: newStatus 
      });

      setMessages(messages.map(m => m._id === selectedMessage._id ? { ...m, status: newStatus } : m));
      setSelectedMessage({ ...selectedMessage, status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Error updating status.");
    }
  };

  const getCount = (statusTab) => {
    if (statusTab === 'All') return messages.length;
    return messages.filter(m => m.status === statusTab).length;
  };

  return (
    <div className="admin-messages-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Customer Messages & Support</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Manage customer inquiries and respond directly.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '240px', outline: 'none', fontSize: '14px' }}
          />
          <button 
            onClick={fetchMessages} 
            style={{ padding: '8px 16px', backgroundColor: '#130352', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['All', 'Unread', 'Pending', 'Replied', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: filter === tab ? '1px solid #130352' : '1px solid #e2e8f0',
              backgroundColor: filter === tab ? '#130352' : '#ffffff',
              color: filter === tab ? '#ffffff' : '#475569',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {tab}
            <span style={{ backgroundColor: filter === tab ? 'rgba(255,255,255,0.2)' : '#f1f5f9', padding: '1px 6px', borderRadius: '10px', fontSize: '11px' }}>
              {getCount(tab)}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading customer inquiries...</p>
      ) : error ? (
        <p style={{ color: '#ef4444' }}>{error}</p>
      ) : filteredMessages.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No messages match your criteria.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '24px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredMessages.map((msg) => {
              const isSelected = selectedMessage?._id === msg._id;
              
              const getBadgeStyle = (status) => {
                switch(status) {
                  case 'Unread': return { bg: '#fee2e2', color: '#991b1b' };
                  case 'Pending': return { bg: '#fef3c7', color: '#92400e' };
                  case 'Replied': return { bg: '#e0e7ff', color: '#3730a3' };
                  case 'Completed': return { bg: '#d1fae5', color: '#065f46' };
                  default: return { bg: '#f1f5f9', color: '#334155' };
                }
              };
              const badge = getBadgeStyle(msg.status);

              return (
                <div 
                  key={msg._id} 
                  onClick={() => setSelectedMessage(msg)}
                  style={{
                    backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
                    border: isSelected ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14px', color: '#1e293b' }}>{msg.name}</strong>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', backgroundColor: badge.bg, color: badge.color }}>
                      {msg.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>{msg.subject}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>
                    {msg.message}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(msg.createdAt).toLocaleString()}</div>
                </div>
              );
            })}
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            {selectedMessage ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#0f172a' }}>{selectedMessage.subject}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                      From: <strong>{selectedMessage.name}</strong> &lt;{selectedMessage.email}&gt;
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Status:</span>
                    <select 
                      value={selectedMessage.status} 
                      onChange={(e) => handleStatusChange(e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '9px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                    >
                      <option value="Unread">Unread</option>
                      <option value="Pending">Pending</option>
                      <option value="Replied">Replied</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                  {selectedMessage.message}
                </div>

                <form onSubmit={handleSendReply}>
                  <h4 style={{ fontSize: '14px', color: '#1e293b', marginBottom: '10px' }}>Respond to Customer</h4>
                  
                  <textarea
                    rows="4"
                    placeholder="Type your reply message here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical', outline: 'none', marginBottom: '14px', boxSizing: 'border-box' }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => setSelectedMessage(null)}
                      style={{ padding: '8px 14px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: '500' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      style={{ padding: '8px 16px', backgroundColor: '#130352', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Send Reply Email
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <h3 style={{ color: '#475569', margin: '0 0 6px 0' }}>Select an inquiry</h3>
                <p style={{ fontSize: '13px', margin: 0 }}>Click any customer message on the left to read details and reply.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ContactMessages;