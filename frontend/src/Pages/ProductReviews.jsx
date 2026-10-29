import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductReviews = ({ productId, productTitle }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      try {
        const response = await axios.get(`http://localhost:4000/api/reviews/${productId}`);
        if (Array.isArray(response.data)) {
          setReviews(response.data);
        } else if (response.data && Array.isArray(response.data.reviews)) {
          setReviews(response.data.reviews); 
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '2px solid #e2e8f0', backgroundColor: '#fff', padding: '20px', borderRadius: '12px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
          Customer Reviews & Ratings ({reviews.length})
        </h3>
        {avgRating && (
          <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
            ★ {avgRating} / 5.0
          </span>
        )}
      </div>

      {loading ? (
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
          Loading reviews...
        </p>
      ) : reviews.length === 0 ? (
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
          No reviews submitted yet for this product.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map((rev, idx) => (
            <div key={rev._id || idx} style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
               <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 'bold' }}>
                  {'★'.repeat(Number(rev.rating || 0))}{'☆'.repeat(Math.max(0, 5 - Number(rev.rating || 0)))}
                </span>
                {rev.title && <strong style={{ fontSize: '14px', color: '#0f172a' }}>{rev.title}</strong>}
              </div>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                "{rev.comment || rev.description}"
              </p>
              {rev.image && (
                <img src={rev.image} alt="Review attachment" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', marginTop: '6px' }} />
              )}
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '6px' }}>
                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Buyer'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;