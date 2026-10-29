import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; 

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const [activeReviewItem, setActiveReviewItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDescription, setReviewDescription] = useState('');
  const [reviewImage, setReviewImage] = useState(null);
  const [submittedReviews, setSubmittedReviews] = useState({});

  const resolveImageSrc = (rawImage) => {
    if (!rawImage) return 'https://via.placeholder.com/150';
    const cleanPath = String(rawImage).replace(/\\/g, '/');

    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanPath;
    } else if (cleanPath.startsWith('/uploads')) {
      return `http://localhost:4000${cleanPath}`;
    } else if (cleanPath.startsWith('uploads')) {
      return `http://localhost:4000/${cleanPath}`;
    } else {
      return `http://localhost:4000/uploads/${cleanPath}`;
    }
  };

  useEffect(() => {
    const fetchOrderDetails = () => {
      const savedOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
      const foundOrder = savedOrders.find(
        (o) => String(o.id).toUpperCase() === String(orderId).toUpperCase() ||
               String(o.id).replace('#', '').toUpperCase() === String(orderId).replace('#', '').toUpperCase()
      );
      if (foundOrder) {
        setOrder(foundOrder);
      }
    };

    fetchOrderDetails();

    window.addEventListener('storage', fetchOrderDetails);
    return () => window.removeEventListener('storage', fetchOrderDetails);
  }, [orderId]);

  const handleReviewSubmit = async (itemId) => {
    if (rating === 0) {
      alert('Please select a star rating!');
      return;
    }
    if (!reviewDescription.trim()) {
      alert('Please enter a review description!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/reviews', {
        productId: itemId,
        orderId: String(order.id),
        rating: Number(rating),
        title: reviewTitle,
        description: reviewDescription,
        image: reviewImage
      });

      if (response.data.success) {
        const reviewData = {
          productId: itemId,
          orderId: order.id,
          rating,
          title: reviewTitle,
          description: reviewDescription,
          image: reviewImage,
          date: new Date().toLocaleDateString()
        };
        setSubmittedReviews((prev) => ({ ...prev, [itemId]: reviewData }));

        alert('Thank you! Your product review has been submitted successfully and product rating updated.');
        setActiveReviewItem(null);
        setRating(0);
        setReviewTitle('');
        setReviewDescription('');
        setReviewImage(null);
      }
    } catch (error) {
      console.error('Error submitting review to backend:', error.response?.data || error.message);
      alert('Failed to submit review. Please check console for details.');
    }
  };

  if (!order) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h2>Order Not Found</h2>
        <p style={{ color: '#64748b' }}>We couldn't find an order matching ID #{orderId}.</p>
        <button
          onClick={() => navigate('/orders')}
          style={{
            backgroundColor: '#130352',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '15px'
          }}
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  const orderTotal = order.items.reduce((acc, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const isDelivered = String(order.status).toLowerCase() === 'delivered';

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate('/orders')}
          style={{
            background: 'none',
            border: 'none',
            color: '#6366f1',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Orders
        </button>
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>
          HEXCART SECURE ORDER
        </span>
      </div>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '24px 30px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Order Overview
            </span>
            <h1 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '800' }}>
              Order ID: #{order.id}
            </h1>
          </div>
          <span style={{
            backgroundColor: isDelivered ? '#dcfce7' : '#fef3c7', 
            color: isDelivered ? '#166534' : '#92400e', 
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '800',
            letterSpacing: '0.5px'
          }}>
            {order.status || 'PROCESSING'}
          </span>
        </div>
        <div style={{ backgroundColor: '#f8fafc', padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>Date Placed</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{order.date || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>Time Placed</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>
              {order.time && order.time !== 'N/A' 
                ? order.time 
                : (order.createdAt ? new Date(order.createdAt).toLocaleTimeString([],{ hour: '2-digit', minute: '2-digit' }) : '14:32:05 EST')
              }
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>Tracking ID</span>
            <strong style={{ fontSize: '14px', color: '#130352', fontFamily: 'monospace' }}>{order.trackingId || 'Pending'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>Estimated Delivery</span>
            <strong style={{ fontSize: '14px', color: '#16a34a' }}>{order.deliveryDate || 'TBD'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block' }}>Payment Method</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>Credit Card / Online</strong>
          </div>
        </div>

        <div style={{ padding: '30px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
            Purchased Items ({order.items?.length || 0})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {order.items?.map((item, idx) => {
              const itemId = item._id || item.id || idx;
              const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
              const itemImg = resolveImageSrc(item.image || item.imageUrl || item.img);
              const existingReview = submittedReviews[itemId];

              return (
                <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <img
                      src={itemImg}
                      alt={item.title || item.name}
                      style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f8fafc', padding: '4px' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                        {item.category || 'ELECTRONICS'}
                      </span>
                      <h4 style={{ margin: '2px 0 6px 0', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
                        {item.title || item.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        Quantity: <strong style={{ color: '#0f172a' }}>{item.quantity || 1}</strong>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#130352' }}>
                        ${(itemPrice * (item.quantity || 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {isDelivered && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
                      {existingReview ? (
                        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px 18px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#166534', display: 'block' }}>
                            ✓ Rating & Review Submitted ({existingReview.rating} ★)
                          </span>
                          {existingReview.title && (
                            <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginTop: '4px' }}>
                              {existingReview.title}
                            </strong>
                          )}
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#15803d' }}>
                            "{existingReview.description}"
                          </p>
                        </div>
                      ) : activeReviewItem === itemId ? (
                        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginTop: '10px' }}>
                          
                          <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>
                              Rate this product
                            </h4>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  onClick={() => setRating(star)}
                                  style={{
                                    fontSize: '26px',
                                    cursor: 'pointer',
                                    color: star <= rating ? '#f59e0b' : '#e2e8f0',
                                    transition: 'color 0.15s'
                                  }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>
                              Review this product
                            </h4>

                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '10px 12px', backgroundColor: '#fff', marginBottom: '14px' }}>
                              <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Description</label>
                              <textarea
                                rows="3"
                                placeholder="Description..."
                                value={reviewDescription}
                                onChange={(e) => setReviewDescription(e.target.value)}
                                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', resize: 'none', fontFamily: 'inherit' }}
                              />
                            </div>

                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px 12px', backgroundColor: '#fff', marginBottom: '16px' }}>
                              <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Title (optional)</label>
                              <input
                                type="text"
                                placeholder="Review title..."
                                value={reviewTitle}
                                onChange={(e) => setReviewTitle(e.target.value)}
                                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit' }}
                              />
                            </div>
                            
                            <div style={{ marginTop: '14px', marginBottom: '14px' }}>
                              <label 
                                htmlFor={`photo-upload-${itemId}`} 
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 14px',
                                  backgroundColor: '#f1f5f9',
                                  border: '1px dashed #94a3b8',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: '#334155'
                                }}
                              >
                                Attach Product Photo
                              </label>
                              
                              <input 
                                id={`photo-upload-${itemId}`}
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                              />

                              {reviewImage && (
                                <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                                  <img 
                                    src={reviewImage} 
                                    alt="Review Preview" 
                                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => setReviewImage(null)}
                                    style={{
                                      position: 'absolute', top: '-6px', right: '-6px',
                                      background: '#ef4444', color: '#fff', border: 'none',
                                      borderRadius: '50%', width: '20px', height: '20px',
                                      fontSize: '11px', cursor: 'pointer', display: 'flex',
                                      alignItems: 'center', justifyContent: 'center'
                                    }}
                                    title="Remove image"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => setActiveReviewItem(null)}
                              style={{
                                backgroundColor: '#fff',
                                border: '1px solid #cbd5e1',
                                padding: '10px 20px',
                                borderRadius: '2px',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#475569',
                                cursor: 'pointer' 
                              }}
                            >
                              CANCEL
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewSubmit(itemId)}
                              style={{
                                backgroundColor: '#fb641b',
                                border: 'none',
                                padding: '10px 30px',
                                borderRadius: '2px',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#ffffff',
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                              }}
                            >
                              SUBMIT
                            </button>
                          </div>

                        </div>

                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReviewItem(itemId);
                              setRating(0);
                              setReviewTitle('');
                              setReviewDescription('');
                            }}
                            style={{
                              backgroundColor: '#fb641b',
                              color: '#ffffff',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '2px',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                          >
                            Write a Review
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', fontSize: '14px', color: '#64748b' }}>
              <span>Subtotal:</span>
              <strong style={{ color: '#0f172a' }}>${orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', fontSize: '14px', color: '#64748b' }}>
              <span>Shipping:</span>
              <strong style={{ color: '#16a34a' }}>Free</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
              <span>Total Paid:</span>
              <span style={{ color: '#130352' }}>${orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetails;