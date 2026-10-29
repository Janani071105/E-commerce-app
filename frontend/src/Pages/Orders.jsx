import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Orders({ onSelectProduct }) {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = () => {
      const savedOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
      setOrders(savedOrders);
    };
    fetchOrders();
    window.addEventListener('storage', fetchOrders);
    return () => window.removeEventListener('storage', fetchOrders);
  }, []);

  const parsePrice = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    const val = parseFloat(priceStr.toString().replace(/[^0-9.]/g, ''));
    return isNaN(val) ? 0 : val;
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Purchase History
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '5px 0 10px 0' }}>
          My Orders
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          Track, manage, and view the status of your past orders.
        </p>
      </div>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>No Orders Found</h3>
          <p style={{ color: '#64748b', marginBottom: '25px' }}>You haven't placed any orders yet.</p>
          <Link 
            to="/products" 
            style={{ backgroundColor: '#130352', color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {orders.map((order) => {
            const orderTotal = order.items.reduce((acc, item) => {
              return acc + (parsePrice(item.price) * (item.quantity || 1));
            }, 0);

            return (
              <div 
                key={order.id} 
                style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  backgroundColor: '#f8fafc', 
                  padding: '15px 20px', 
                  borderBottom: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Order ID: {order.id}</span>
                    <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '12px' }}>Placed on {order.date}</span>
                  </div>
                  <span style={{ 
                    backgroundColor: '#fef3c7', 
                    color: '#92400e', 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    padding: '4px 10px', 
                    borderRadius: '4px',
                    letterSpacing: '0.5px'
                  }}>
                    {order.status}
                  </span>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {order.items.map((item, idx) => {
                    const itemImg = item.image || item.img || (Array.isArray(item.images) ? item.images[0] : '') || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
                    const unitPrice = parsePrice(item.price);
                    const qty = item.quantity || 1;
                    const itemTotal = unitPrice * qty;

                    return (
                      <div 
                        key={idx} 
                        onClick={() => onSelectProduct && onSelectProduct(item)}
                        style={{ 
                          display: 'flex', 
                          gap: '20px', 
                          alignItems: 'flex-start', 
                          paddingBottom: idx < order.items.length - 1 ? '20px' : '0',
                          borderBottom: idx < order.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                          flexWrap: 'wrap',
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '8px',
                          transition: 'background-color 0.1s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <img 
                          src={itemImg} 
                          alt={item.title} 
                          style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '5px', backgroundColor: '#fff' }} 
                        />
                        
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          {item.category && (
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                              {item.category}
                            </span>
                          )}
                          <h4 style={{ margin: '4px 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                            {item.title} <span style={{ color: '#64748b', fontWeight: 'normal' }}>(x{qty})</span>
                          </h4>
                          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                            {item.description || 'Quality item purchased securely.'}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '100px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#130352' }}>
                            ${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '15px 20px', 
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #e2e8f0' 
                }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Total Amount: </span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#130352' }}>
                      ${orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button 
                    onClick={() => navigate(`/orders/details/${order.id}`)}
                    className="view-details-btn"
                    style={{
                    backgroundColor: '#130352',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                    }}
                  >
                  View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;