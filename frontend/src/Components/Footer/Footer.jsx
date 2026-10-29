import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className='footer'>
      <div className='footer-content'>
        <div className='footer-brand'>
          <h2 className='footer-logo'>HEX<span>CART</span></h2>
          <p>Your ultimate destination for Electronics, Fashion, Home & kitchen essentials, and Home Furnitures.</p>
          <div className='footer-socials'>
          </div>
        </div>

        <div className='footer-column'>
          <h4>Shop Gadgets</h4>
          <ul>
            <li><a href="/products">Electronics</a></li>
            <li><a href="/products">Fashion</a></li>
            <li><a href="/products">Home & Kitchen</a></li>
            <li><a href="/products">Furnitures</a></li>
            <li><a href="/products">Daily Essentials</a></li>
          </ul>
        </div>

        <div className='footer-column'>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="Products">Products</a></li>
            <li><a href="/contact">Contact Us</a></li>
            
          </ul>
        </div>

        <div className='footer-column'>
          <h4>Customer Care</h4>
          <ul>
            <li><a href="#help">Help & Support</a></li>
            <li><a href="#shipping">Shipping & Delivery</a></li>
            <li><a href="#returns">Returns & Refunds</a></li>
            <li><a href="#warranty">Brand Warranty</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className='footer-bottom'>
        <p> 2026 HEXCART. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;