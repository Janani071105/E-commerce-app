import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

function TopNavbar({ onToggleSidebar }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    return JSON.parse(localStorage.getItem('wishlistItems')) || [];
  });

  useEffect(() => {
    const updateWishlist = () => {
      const saved = JSON.parse(localStorage.getItem('wishlistItems')) || [];
      setWishlistItems(saved);
    };

    window.addEventListener('wishlistUpdated', updateWishlist);
    window.addEventListener('storage', updateWishlist);
    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlist);
      window.removeEventListener('storage', updateWishlist);
    };
  }, []);

  return (
    <div className="amazon-header">
      <div className="top-search-row">
        <div className="nav-lo">
          <Link to="/">HEX<span>CART</span></Link>
        </div>

        <div className="top-nav-search">
          <input type="text" placeholder="Search HEXCART..." />
          <button className="top-search-btn"></button>
        </div>

        <div className="top-nav-actions">
          <Link 
            to="/wishlist" 
            className="top-nav-link" 
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'inherit' }}
          >
            <i className="fa-regular fa-heart" style={{ fontSize: '18px' }}></i>
            <span>Wishlist</span>
            {wishlistItems.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-8px',
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                borderRadius: '50%',
                padding: '1px 5px',
              }}>
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <Link to="/login" className="top-nav-link">
            Hello, sign in <br />
            <span>Account & Lists</span>
          </Link>

          <Link to="/orders" className="top-nav-link">
            Returns <br />
            <span>& Orders</span>
          </Link>

          <Link to="/cart" className="top-cart-link">
             Cart
          </Link>
        </div>
      </div>

      <div className="sub-nav-row">
        <div className="sub-nav-links">
          <button 
            onClick={onToggleSidebar}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '4px',
              color: '#ffffff',
              padding: '4px 10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            <span style={{ fontSize: '16px' }}>☰</span> All
          </button>
          
          <Link to="/" className="sub-nav-item"> Home</Link>
          <Link to="/Products" className="sub-nav-item"> Products</Link>
          <Link to="/about" className="sub-nav-item"> About</Link>
          <Link to="/contact" className="sub-nav-item"> Contact</Link>
          <Link to="/cart" className="sub-nav-item"> Cart</Link>
          <Link to="/orders" className="sub-nav-item"> My Orders</Link>
        </div>
        <div className="sub-nav-promo">
          <span>Great Indian Festival | Shop early deals now </span>
        </div>
      </div>
    </div>
  );
}

export default TopNavbar;