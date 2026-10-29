import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [ , setMenu] = useState("Home");
  const [wishlistCount, setWishlistCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = localStorage.getItem('user-role');
  const authToken = localStorage.getItem('auth-token');

  useEffect(() => {
    const updateWishlistCount = () => {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlistItems')) || [];
      setWishlistCount(savedWishlist.length);
    };

    updateWishlistCount();
    window.addEventListener('wishlistUpdated', updateWishlistCount);
    window.addEventListener('storage', updateWishlistCount);

    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlistCount);
      window.removeEventListener('storage', updateWishlistCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-role');
    window.location.replace('/');
  };

  return (
    <div className='navbar'>
      <div className='nav-logo'>
        <p id="n1">HEX</p>
        <p id="n2">CART</p>
      </div>

      <ul className='nav-menu'>
        <li onClick={() => setMenu("Home")}>
          <Link style={{ textDecoration: 'none' }} to='/'>Home</Link>
        </li>
        <li onClick={() => setMenu("Products")}>
          <Link style={{ textDecoration: 'none' }} to='/Products'>Products</Link>
        </li>
        <li onClick={() => setMenu("Cart")}>
          <Link style={{ textDecoration: 'none' }} to='/Cart'>Cart</Link>
        </li>
        

        <li>
          <Link to="/orders" className={location.pathname === '/orders' ? 'nav-item active' : 'nav-item'}>
             My Orders
          </Link>
        </li>
        <li onClick={() => setMenu("Wishlist")}>
          <Link 
            to='/wishlist' 
            style={{ textDecoration: 'none' }} 
            className={location.pathname === '/wishlist' ? 'nav-item active' : 'nav-item'}
          >
             Wishlist
            {wishlistCount > 0 && <span className="menu-badge">{wishlistCount}</span>}
          </Link>
        </li>
        {authToken && userRole === 'Admin' && (
          <li onClick={() => setMenu("Admin")}>
            <Link style={{ textDecoration: 'none' }} to='/admin'>Admin</Link>
          </li>
        )}
        {user.role === 'Admin' && (
          <li>
            <Link to="/admin" style={{ color: '#6b21a8', fontWeight: 'bold' }}>
              Admin
            </Link>
          </li>
        )}
      </ul>

      <div className="nav-login-cart">
        <input type="text" placeholder='Search' />
        <Link 
          to="/wishlist" 
          title="Wishlist" 
          style={{ position: 'relative', margin: '0 10px', color: '#fff', fontSize: '20px', display: 'flex', alignItems: 'center' }}
        >
        </Link>

        {authToken ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link style={{ textDecoration: 'none' }} to='/login?mode=login'>
              <button onClick={() => setMenu("")}>Login</button>
            </Link>
            <Link style={{ textDecoration: 'none' }} to='/login?mode=signup'>
              <button onClick={() => setMenu("")}>Signup</button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;