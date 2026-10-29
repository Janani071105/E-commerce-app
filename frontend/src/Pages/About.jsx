import React from 'react';
import './CSS/About.css';

const About = () => {
  return (
    <div className='about'>
      <div className='about-hero'>
        <span className='about-tag'>ABOUT HEXCART</span>
        <h1>Powering Your Lifestyle</h1>
        <p>
          Discover a diverse collection of products across categories, carefully selected to deliver value, quality, and a hassle-free shopping experience.
        </p>
      </div>
      <div className='about-stats'>
        <div className='stat-card'>
          <h2>100%</h2>
          <p>Genuine Products</p>
        </div>
        <div className='stat-card'>
          <h2>50k+</h2>
          <p>Happy Customers</p>
        </div>
        <div className='stat-card'>
          <h2>24/7</h2>
          <p>Expert Support</p>
        </div>
        <div className='stat-card'>
          <h2>Fast</h2>
          <p>Nationwide Delivery</p>
        </div>
      </div>
      <div className='about-values'>
        <h2>Why Choose HEXCART?</h2>
        <div className='values-grid'>
          <div className='value-card'>
            <h3>Wide Selection</h3>
            <p>Every product on our platform is carefully chosen to ensure quality, value, and customer satisfaction.</p>
          </div>

          <div className='value-card'>
            <h3>Express Shipping</h3>
            <p>Fast, secure packaging and rapid delivery right to your doorstep on every order.</p>
          </div>

          <div className='value-card'>
            <h3>Verified Warranty</h3>
            <p>Enjoy complete peace of mind with official brand warranties and easy return policies.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;