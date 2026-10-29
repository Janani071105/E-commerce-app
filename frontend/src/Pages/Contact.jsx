import React, { useState } from 'react';
import axios from 'axios';
import './CSS/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

    try {
      const response = await axios.post('http://localhost:4000/api/contact', formData);
      if (response.data.success) {
        setIsSuccess(true);
        setStatusMessage('Thank you! Your message has been sent successfully.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      setIsSuccess(false);
      setStatusMessage('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  return (
    <div className='contact' id="contact">
      <div className='contact-header'>
        <span className='contact-tag'>GET IN TOUCH</span>
        <p>Have questions about a product, order status, or technical support? Reach out to our team.</p>
      </div>

      <div className='contact-container'>
        <div className='contact-info'>
          <h2>Contact Information</h2>
          <p className='info-sub'>Fill out the form or contact us directly via email or phone.</p>

          <div className='info-details'>
            <div className='info-item'>
              <div>
                <strong>Address</strong>
                <p>123 Tech Avenue, Silicon Valley, CA 94025</p>
              </div>
            </div>

            <div className='info-item'>
              <div>
                <strong>Email Us</strong>
                <p>support@hexcart.com</p>
              </div>
            </div>

            <div className='info-item'>
              <div>
                <strong>Call Us</strong>
                <p>+1 (800) 555-4392</p>
              </div>
            </div>

            <div className='info-item'>
              <div>
                <strong>Working Hours</strong>
                <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className='contact-form-wrapper'>
          <form className='contact-form' onSubmit={handleSubmit}>
            {statusMessage && (
              <div style={{
                padding: '12px',
                marginBottom: '15px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
                backgroundColor: isSuccess ? '#dcfce7' : '#fee2e2',
                color: isSuccess ? '#166534' : '#991b1b',
                textAlign: 'center'
              }}>
                {statusMessage}
              </div>
            )}

            <div className='form-row'>
              <div className='form-group'>
                <label>Your Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Your Name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className='form-group'>
                <label>Your Email</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Id" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className='form-group'>
              <label>Subject</label>
              <input 
                type="text" 
                name="subject"
                placeholder="Order Inquiry" 
                value={formData.subject}
                  onChange={handleChange}
                required 
              />
            </div>

            <div className='form-group'>
              <label>Message</label>
              <textarea 
                name="message"
                rows="5" 
                placeholder="Write your message here..." 
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className='contact-btn' disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;