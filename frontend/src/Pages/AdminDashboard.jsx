import React, { useState, useEffect } from 'react';
import './CSS/AdminDashboard.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ContactMessages from './ContactMessages';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalBuyers: 0, totalSellers: 0, totalAmount: 0 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [settingsTab, setSettingsTab] = useState('general');
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'HEXCART',
    supportEmail: 'support@hexcart.com',
    currency: 'USD ($)',
    maintenanceMode: false,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    ipWhitelisting: false,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    userRegistrationAlerts: true,
    sellerPayoutAlerts: true,
    systemLogsAlerts: false,
  });
  

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await axios.get('http://localhost:4000/api/admin/stats');
        setStats(statsRes.data);

        const logsRes = await axios.get('http://localhost:4000/api/admin/audit-logs');
        setAuditLogs(logsRes.data);

        const usersRes = await axios.get('http://localhost:4000/api/admin/users');
        if (usersRes.data && usersRes.data.length > 0) {
          const dynamicUsers = usersRes.data.map(user => {
            const matchedLogs = logsRes.data
              .filter(log => log.entityName === user.name || log.entityName === user.storeName)
              .map(log => ({
                date: new Date(log.timestamp).toLocaleString(),
                action: log.actionDetail
              }));
            return {
              ...user,
              activities: matchedLogs.length > 0 ? matchedLogs : [{ date: 'N/A', action: 'No recent activity recorded' }]
            };
          });
          setUsers(dynamicUsers);
        }
      } catch (err) {
        console.error("Error fetching backend admin data:", err);
      }
    };

    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u));
  };
  const toggleUserActivity = (user) => {
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
  };
  const handleSaveSettings = (e) => {
    e.preventDefault();
    alert('Settings updated successfully!');
  };

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    const matchesName = user.name ? user.name.toLowerCase().includes(term) : false;
    const matchesEmail = user.email ? user.email.toLowerCase().includes(term) : false;
    const matchesStore = user.storeName ? user.storeName.toLowerCase().includes(term) : false;
    return matchesName || matchesEmail || matchesStore;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-panel fade-in">
            <div className="kpi-grid">
              <div className="kpi-card hover-lift">
                <div className="kpi-content">
                  <div className="kpi-header">
                    <span className="kpi-title">Total Buyers</span>
                    <span className="kpi-trend positive">+12%</span>
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-number">{stats.totalBuyers}</span>
                  </div>
                </div>
                <div className="kpi-side-bar bg-blue"></div>
              </div>

              <div className="kpi-card hover-lift">
                <div className="kpi-content">
                  <div className="kpi-header">
                    <span className="kpi-title">Verified Sellers</span>
                    <span className="kpi-trend positive">+8%</span>
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-number">{stats.totalSellers}</span>
                  </div>
                </div>
                <div className="kpi-side-bar bg-purple"></div>
              </div>

              <div className="kpi-card hover-lift">
                <div className="kpi-content">
                  <div className="kpi-header">
                    <span className="kpi-title">System Status</span>
                    <span className="kpi-trend active-status">{stats.systemStatus || "Optimal"}</span>
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-number">
                      {users.filter(u => u.status === 'Active').length} <small className="kpi-subtext">/ {users.length} Active</small>
                    </span>
                  </div>
                </div>
                <div className="kpi-side-bar bg-green"></div>
              </div>

              <div className="kpi-card kpi-primary hover-lift">
                <div className="kpi-content">
                  <div className="kpi-header">
                    <span className="kpi-title text-light">Total Amount</span>
                    <span className="kpi-pill-light"></span>
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-number text-light">${stats.totalAmount?.toLocaleString()}</span>
                    <span className="kpi-subtext text-light-70">Gross Revenue </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboard-split-layout">
              <div className="split-main-card">
                <div className="card-header-flex">
                  <div>
                    <h3>Live Engagement Feed</h3>
                    <p className="card-subtitle">Real-time buyer activity updates across platform</p>
                  </div>
                  <button className="btn-outline-sm" onClick={() => setActiveTab('users')}>View All Buyers</button>
                </div>
                <div className="table-responsive">
                  <table className="enhanced-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Account Tier</th>
                        <th>Status</th>
                        <th>Latest Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.role === 'User').map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-initial">{user.name?.charAt(0)}</div>
                              <div>
                                <strong className="user-name">{user.name}</strong>
                                <span className="user-subtext">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td><span className="badge-pill tier">{user.tier}</span></td>
                          <td>
                            <span className={`badge-pill status-${user.status?.toLowerCase()}`}>
                              <span className="status-indicator-dot"></span>
                              {user.status}
                            </span>
                          </td>
                          <td className="text-secondary">{user.activities?.[0]?.action || 'No recent activity'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="split-side-card">
                <div className="card-header-flex">
                  <div>
                    <h3>Top Vendors</h3>
                    <p className="card-subtitle">Active merchant stores</p>
                  </div>
                  <button className="btn-outline-sm" onClick={() => setActiveTab('seller-info')}>View All Sellers</button>
                </div>
                <div className="side-vendor-list">
                  {users.filter(u => u.role === 'Seller').map(seller => (
                    <div key={seller.id} className="vendor-card-item">
                      <div className="store-avatar-box">{seller.storeName?.charAt(0)}</div>
                      <div className="vendor-details">
                        <strong>{seller.storeName}</strong>
                        <span className="vendor-meta">{seller.name} &bull; {seller.category}</span>
                        <span className="vendor-revenue">{seller.totalRevenue}</span>
                      </div>
                      <span className={`badge-pill status-${seller.status?.toLowerCase()}`}>{seller.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

        case 'messages':
           return <ContactMessages />;

      case 'user-info':
        return (
          <div className="tab-panel fade-in">
            <div className="split-main-card full-width">
              <div className="card-header-flex">
                <div>
                  <h3>User Directory</h3>
                  <p className="card-subtitle">Detailed profiles and transaction summaries for customer accounts</p>
                </div>
              </div>
              <div className="table-responsive">
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>User Details</th>
                      <th>Contact Info</th>
                      <th>Location</th>
                      <th>Tier</th>
                      <th>Total Spend</th>
                      <th>Status</th>
                      <th>Access Control</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.filter(u => u.role === 'User').map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-initial">{user.name?.charAt(0)}</div>
                            <div>
                              <strong className="user-name">{user.name}</strong>
                              <span className="user-subtext">{user.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>{user.email}</div>
                          <small className="text-secondary">{user.phone}</small>
                        </td>
                        <td>{user.location}</td>
                        <td><span className="badge-pill tier">{user.tier}</span></td>
                        <td><strong className="text-dark">{user.totalSpent}</strong></td>
                        <td>
                          <span className={`badge-pill status-${user.status?.toLowerCase()}`}>
                            <span className="status-indicator-dot"></span>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className={`btn-control-toggle ${user.status === 'Active' ? 'danger' : 'success'}`}
                            onClick={() => toggleStatus(user.id)}
                          >
                            {user.status === 'Active' ? 'Block Access' : 'Grant Access'}
                          </button>
                        </td>
                        <td>
                          <button className="btn-table-action" onClick={() => setDetailModalItem(user)}>
                            Full Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'seller-info':
        return (
          <div className="tab-panel fade-in">
            <div className="split-main-card full-width">
              <div className="card-header-flex">
                <div>
                  <h3>Seller Directory</h3>
                  <p className="card-subtitle">Comprehensive store data, vendor revenue, and category performance</p>
                </div>
              </div>
              <div className="table-responsive">
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>Store Details</th>
                      <th>Owner Name</th>
                      <th>Contact Info</th>
                      <th>Category</th>
                      <th>Gross Revenue</th>
                      <th>Status</th>
                      <th>Store Control</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.filter(u => u.role === 'Seller').map(seller => (
                      <tr key={seller.id}>
                        <td>
                          <div className="user-cell">
                            <div className="store-avatar-box">{seller.storeName?.charAt(0)}</div>
                            <div>
                              <strong className="user-name">{seller.storeName}</strong>
                              <span className="user-subtext">{seller.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>{seller.name}</td>
                        <td>
                          <div>{seller.email}</div>
                          <small className="text-secondary">{seller.phone}</small>
                        </td>
                        <td>{seller.category}</td>
                        <td><strong className="text-dark">{seller.totalRevenue}</strong></td>
                        <td>
                          <span className={`badge-pill status-${seller.status?.toLowerCase()}`}>
                            <span className="status-indicator-dot"></span>
                            {seller.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className={`btn-control-toggle ${seller.status === 'Active' ? 'danger' : 'success'}`}
                            onClick={() => toggleStatus(seller.id)}
                          >
                            {seller.status === 'Active' ? 'Block Store' : 'Approve Store'}
                          </button>
                        </td>
                        <td>
                          <button className="btn-table-action" onClick={() => setDetailModalItem(seller)}>
                            Full Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="tab-panel fade-in">
            <div className="split-main-card full-width">
              <div className="card-header-flex">
                <div>
                  <h3>Buyer Management & Control</h3>
                  <p className="card-subtitle">Review buyer activity trails</p>
                </div>
              </div>
              <div className="table-responsive">
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Activity Trail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.filter(u => u.role === 'User').map(user => (
                      <React.Fragment key={user.id}>
                        <tr>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-initial">{user.name?.charAt(0)}</div>
                              <div>
                                <strong className="user-name">{user.name}</strong>
                                <span className="user-subtext">{user.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="text-secondary">{user.email}</td>
                          <td>
                            <span className={`badge-pill status-${user.status?.toLowerCase()}`}>
                              <span className="status-indicator-dot"></span>
                              {user.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn-table-action" onClick={() => toggleUserActivity(user)}>
                              {selectedUser?.id === user.id ? 'Hide Activity' : 'View Activity'}
                            </button>
                          </td>
                        </tr>
                        {selectedUser?.id === user.id && (
                          <tr className="expanded-activity-row">
                            <td colSpan="4">
                              <div className="expanded-activity-panel">
                                <h4>Activity History - {user.name} ({user.id})</h4>
                                <ul className="activity-timeline">
                                  {user.activities?.map((act, idx) => (
                                    <li key={idx}>
                                      <span className="activity-timestamp">{act.date}</span>
                                      <span className="activity-desc">{act.action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'sellers':
        return (
          <div className="tab-panel fade-in">
            <div className="split-main-card full-width">
              <div className="card-header-flex">
                <div>
                  <h3>Seller Verification & Controls</h3>
                  <p className="card-subtitle">Inspect vendor operational logs</p>
                </div>
              </div>
              <div className="table-responsive">
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>Store Details</th>
                      <th>Owner</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Activity Trail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.filter(u => u.role === 'Seller').map(seller => (
                      <React.Fragment key={seller.id}>
                        <tr>
                          <td>
                            <div className="user-cell">
                              <div className="store-avatar-box">{seller.storeName?.charAt(0)}</div>
                              <div>
                                <strong className="user-name">{seller.storeName}</strong>
                                <span className="user-subtext">{seller.id}</span>
                              </div>
                            </div>
                          </td>
                          <td>{seller.name}</td>
                          <td className="text-secondary">{seller.email}</td>
                          <td>
                            <span className={`badge-pill status-${seller.status?.toLowerCase()}`}>
                              <span className="status-indicator-dot"></span>
                              {seller.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn-table-action" onClick={() => toggleUserActivity(seller)}>
                              {selectedUser?.id === seller.id ? 'Hide Activity' : 'View Activity'}
                            </button>
                          </td>
                        </tr>
                        {selectedUser?.id === seller.id && (
                          <tr className="expanded-activity-row">
                            <td colSpan="5">
                              <div className="expanded-activity-panel">
                                <h4>Activity History - {seller.storeName} ({seller.id})</h4>
                                <ul className="activity-timeline">
                                  {seller.activities?.map((act, idx) => (
                                    <li key={idx}>
                                      <span className="activity-timestamp">{act.date}</span>
                                      <span className="activity-desc">{act.action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'logs': {
        return (
          <div className="tab-panel fade-in">
            <div className="split-main-card full-width">
              <div className="card-header-flex">
                <div>
                  <h3>Audit Logs & Governance</h3>
                  <p className="card-subtitle">Comprehensive platform event history pulled live from backend</p>
                </div>
              </div>
              <div className="table-responsive">
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>Account Type</th>
                      <th>Entity</th>
                      <th>Action Detail</th>
                      <th className="text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td><span className={`badge-pill role-${log.accountType?.toLowerCase()}`}>{log.accountType}</span></td>
                        <td>
                          <strong>{log.entityName}</strong>
                        </td>
                        <td>{log.actionDetail}</td>
                        <td className="text-right text-secondary">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      case 'settings':
        return (
          <div className="tab-panel fade-in">
            <div className="split-main-card full-width">
              <div className="card-header-flex">
                <div>
                  <h3>Platform Settings</h3>
                  <p className="card-subtitle">Configure system preferences, security policies, and notifications</p>
                </div>
              </div>
              <div className="settings-nav-tabs">
                <button 
                  className={settingsTab === 'general' ? 'active-subtab' : ''} 
                  onClick={() => setSettingsTab('general')}
                >
                  General
                </button>
                <button 
                  className={settingsTab === 'security' ? 'active-subtab' : ''} 
                  onClick={() => setSettingsTab('security')}
                >
                  Security
                </button>
                <button 
                  className={settingsTab === 'notifications' ? 'active-subtab' : ''} 
                  onClick={() => setSettingsTab('notifications')}
                >
                  Notifications
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="settings-form">
                {settingsTab === 'general' && (
                  <div className="settings-section">
                    <div className="setting-field">
                      <label>Platform Title</label>
                      <input 
                        type="text" 
                        value={generalSettings.siteName} 
                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })} 
                      />
                    </div>
                    <div className="setting-field">
                      <label>System Support Email</label>
                      <input 
                        type="email" 
                        value={generalSettings.supportEmail} 
                        onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })} 
                      />
                    </div>
                    <div className="setting-field">
                      <label>Default Platform Currency</label>
                      <select 
                        value={generalSettings.currency} 
                        onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                      >
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                        <option value="INR ($)">INR ($)</option>
                      </select>
                    </div>
                    <div className="setting-field checkbox-field">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={generalSettings.maintenanceMode} 
                          onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })} 
                        />
                        Enable Platform Maintenance Mode
                      </label>
                    </div>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="settings-section">
                    <div className="setting-field checkbox-field">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={securitySettings.twoFactorAuth} 
                          onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })} 
                        />
                        Enforce Two-Factor Authentication (2FA) for Admins
                      </label>
                    </div>
                    <div className="setting-field">
                      <label>Session Inactivity Timeout (Minutes)</label>
                      <input 
                        type="number" 
                        value={securitySettings.sessionTimeout} 
                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })} 
                      />
                    </div>
                    <div className="setting-field checkbox-field">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={securitySettings.ipWhitelisting} 
                          onChange={(e) => setSecuritySettings({ ...securitySettings, ipWhitelisting: e.target.checked })} 
                        />
                        Restrict Admin Access to Whitelisted IPs
                      </label>
                    </div>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="settings-section">
                    <div className="setting-field checkbox-field">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.emailAlerts} 
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailAlerts: e.target.checked })} 
                        />
                        System Email Notifications
                      </label>
                    </div>
                    <div className="setting-field checkbox-field">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.userRegistrationAlerts} 
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, userRegistrationAlerts: e.target.checked })} 
                        />
                        New User Registration Alerts
                      </label>
                    </div>
                    <div className="setting-field checkbox-field">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.sellerPayoutAlerts} 
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, sellerPayoutAlerts: e.target.checked })} 
                        />
                        Seller Payout & Commission Notifications
                      </label>
                    </div>
                    <div className="setting-field checkbox-field">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.systemLogsAlerts} 
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, systemLogsAlerts: e.target.checked })} 
                        />
                        Critical Audit Log Alerts
                      </label>
                    </div>
                  </div>
                )}

                <div className="settings-actions">
                  <button type="submit" className="btn-save-settings">Save Configurations</button>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>HEX<span>CART</span></h2>
          <span className="brand-subtitle">Control Center</span>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => { setActiveTab('overview'); setSelectedUser(null); }}>
            Dashboard
          </button>
          <button className={activeTab === 'user-info' ? 'active' : ''} onClick={() => { setActiveTab('user-info'); setSelectedUser(null); }}>
            User Info
          </button>
          <button className={activeTab === 'seller-info' ? 'active' : ''} onClick={() => { setActiveTab('seller-info'); setSelectedUser(null); }}>
            Seller Info
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => { setActiveTab('users'); setSelectedUser(null); }}>
            User Activity
          </button>
          <button className={activeTab === 'sellers' ? 'active' : ''} onClick={() => { setActiveTab('sellers'); setSelectedUser(null); }}>
            Seller Activity
          </button>
          <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => { setActiveTab('logs'); setSelectedUser(null); }}>
            Audit Logs
          </button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => { setActiveTab('settings'); setSelectedUser(null); }}>
            Settings
          </button>
          <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}
  style={{ 
    textAlign: 'left', 
    padding: '12px', 
    background: activeTab === 'messages' ? '#2563eb ' : 'transparent', 
    color: '#94a3b8', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    width: '100%',
    marginBottom: '8px'
  }}
>
  Customer Messages
</button>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="header-search">
            <input 
              type="text" 
              placeholder="Search users, sellers, or emails..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="header-right">
            <Link to="/" className="btn-storefront">Back to Home</Link>
            <div className="admin-profile-pill">
              <div className="profile-avatar">A</div>
              <div className="profile-meta">
                <span className="profile-name">Administrator</span>
                <span className="profile-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-body">
          {renderContent()}
        </main>
      </div>

      {detailModalItem && (
        <div className="modal-backdrop" onClick={() => setDetailModalItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{detailModalItem.role} Profile Record</h3>
                <span className="modal-subtitle">System Registry ID: {detailModalItem.id}</span>
              </div>
              <button className="btn-modal-close" onClick={() => setDetailModalItem(null)}>&times;</button>
            </div>
            <div className="modal-grid">
              {detailModalItem.storeName && (
                <div className="modal-field">
                  <label>Store Name</label>
                  <span>{detailModalItem.storeName}</span>
                </div>
              )}
              <div className="modal-field">
                <label>{detailModalItem.role === 'Seller' ? 'Owner Name' : 'Full Name'}</label>
                <span>{detailModalItem.name}</span>
              </div>
              <div className="modal-field">
                <label>Email Address</label>
                <span>{detailModalItem.email}</span>
              </div>
              <div className="modal-field">
                <label>Phone Contact</label>
                <span>{detailModalItem.phone}</span>
              </div>
              <div className="modal-field">
                <label>Location</label>
                <span>{detailModalItem.location}</span>
              </div>
              <div className="modal-field">
                <label>Date Registered</label>
                <span>{detailModalItem.joined}</span>
              </div>
              <div className="modal-field">
                <label>Account Status</label>
                <span className={`badge-pill status-${detailModalItem.status?.toLowerCase()}`}>{detailModalItem.status}</span>
              </div>
              {detailModalItem.role === 'User' ? (
                <>
                  <div className="modal-field">
                    <label>Membership Tier</label>
                    <span>{detailModalItem.tier}</span>
                  </div>
                  <div className="modal-field">
                    <label>Lifetime Spend</label>
                    <span>{detailModalItem.totalSpent}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="modal-field">
                    <label>Primary Category</label>
                    <span>{detailModalItem.category}</span>
                  </div>
                  <div className="modal-field">
                    <label>Gross Revenue</label>
                    <span>{detailModalItem.totalRevenue}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

