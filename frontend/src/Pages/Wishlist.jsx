import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './CSS/Wishlist.css';
import ProductReviews from './ProductReviews';

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user.id || user._id || 'guest_user';

  const parsePrice = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr || priceStr === 'NaN' || priceStr.toString().includes('NaN')) return 0;
    const numericVal = parseFloat(priceStr.toString().replace(/[^0-9.]/g, ''));
    return isNaN(numericVal) ? 0 : numericVal;
  };

  const resolveImageSrc = (rawImage) => {
    if (!rawImage) return 'https://via.placeholder.com/200';
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
    const fetchWishlist = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/wishlist/${userId}`);
        if (response.data.success) {
          setWishlistItems(response.data.items);
        }
      } catch (err) {
        console.error('Error fetching wishlist from backend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  const handleRemove = async (productId, e) => {
    e.stopPropagation();
    try {
      const response = await axios.delete(`http://localhost:4000/api/wishlist/${userId}/${productId}`);
      if (response.data.success) {
        setWishlistItems(response.data.items);
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
    } catch (err) {
      console.error('Error removing item from wishlist:', err);
    }
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const prodId = product._id || product.id || product.productId;
    const existingIndex = cartItems.findIndex(item => (item._id || item.id || item.productId) === prodId);

    const cartItem = {
      _id: prodId,
      title: product.title || product.name,
      price: parsePrice(product.price),
      image: resolveImageSrc(product.image || product.images?.[0]),
      category: product.category || 'Product',
      quantity: quantity || 1,
      description: product.description || '',
      keyFeatures: product.keyFeatures || product.features || product.highlights || []
    };

    if (existingIndex > -1) {
      cartItems[existingIndex].quantity = (cartItems[existingIndex].quantity || 1) + (quantity || 1);
    } else {
      cartItems.push(cartItem);
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
    alert('Item added to cart successfully!');
    setSelectedProduct(null);
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    let firstImg = product.image || product.images?.[0] || 'https://via.placeholder.com/200';
    setActiveModalImage(resolveImageSrc(firstImg));
  };

  const renderFeaturesPreview = (product) => {
    const rawFeatures = product.keyFeatures || product.features || product.highlights;
    if (!rawFeatures) return null;
    if (Array.isArray(rawFeatures)) {
      return (
        <ul style={{ margin: '5px 0 0 0', paddingLeft: '15px', fontSize: '11px', color: '#64748b' }}>
          {rawFeatures.slice(0, 2).map((feat, idx) => (
            <li key={idx} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
              {feat}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {rawFeatures}
      </p>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading your wishlist...</div>;
  }

  return (
    <div className="wishlist-page-container">
      <div className="wishlist-header">
        <h1>My Wishlist ({wishlistItems.length})</h1>
        <p>Manage your saved favorite items all in one place</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <i className="fa-regular fa-heart empty-heart-icon"></i>
          <h2>Your Wishlist is Empty</h2>
          <p>Explore our products and save your favorite items to your wishlist!</p>
          <Link to="/products" className="shop-now-btn">Explore Products</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map((product) => {
            const productId = product.productId || product._id || product.id;
            return (
              <div 
                key={productId} 
                className="wishlist-card"
                onClick={() => handleOpenModal(product)}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                <button 
                  className="remove-wishlist-btn" 
                  onClick={(e) => handleRemove(productId, e)}
                  title="Remove from Wishlist"
                >
                  ✕
                </button>

                <div className="wishlist-img-box">
                  <img src={resolveImageSrc(product.image || product.images?.[0])} alt={product.title || product.name} />
                </div>

                <div className="wishlist-info">
                  <h3>{product.title || product.name}</h3>
                  <div className="wishlist-price-box">
                    <span className="wishlist-current-price">{product.price}</span>
                    {product.originalPrice && (
                      <span className="wishlist-original-price">{product.originalPrice}</span>
                    )}
                  </div>
                  {renderFeaturesPreview(product)}
                  <div className="wishlist-actions" style={{ marginTop: '10px' }}>
                    <button 
                      className="move-to-cart-btn"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {selectedProduct && (
        <div className="product-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="product-modal-content" style={{
            backgroundColor: '#fff', padding: '35px', borderRadius: '16px', maxWidth: '950px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'left'
          }}>
            <button 
              onClick={() => setSelectedProduct(null)} 
              style={{ float: 'right', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}
            >
              ✕
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '35px', alignItems: 'start', textAlign: 'left' }}>
              <div>
                <div style={{ width: '100%', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                  <img src={activeModalImage} alt="Product" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {selectedProduct.images.map((img, idx) => {
                      const thumbSrc = resolveImageSrc(img);
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setActiveModalImage(thumbSrc)}
                          style={{ width: '65px', height: '65px', border: activeModalImage === thumbSrc ? '2px solid #130352' : '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                          <img src={thumbSrc} alt={`Thumb ${idx}`} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'left' }}>
                {selectedProduct.category && (
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                    {selectedProduct.category}
                  </div>
                )}
                <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
                  {selectedProduct.name || selectedProduct.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#130352' }}>
                    ${parsePrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span style={{ fontSize: '16px', color: '#94a3b8', textDecoration: 'line-through' }}>
                      {selectedProduct.originalPrice}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ background: 'none', border: 'none', padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: '#334155' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 12px', fontSize: '15px', fontWeight: '600', color: '#0f172a', minWidth: '24px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ background: 'none', border: 'none', padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: '#334155' }}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(selectedProduct)}
                    style={{
                      flex: 1,
                      backgroundColor: '#130352',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(19, 3, 82, 0.2)'
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                  Product Description
                </h4>
                <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                  {selectedProduct.description || 'No description available for this item.'}
                </p>
                {((selectedProduct.keyFeatures && selectedProduct.keyFeatures.length > 0) || (selectedProduct.features && selectedProduct.features.length > 0) || (selectedProduct.highlights && selectedProduct.highlights.length > 0)) && (
                  <>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                      Key Features
                    </h4>
                    <ul style={{ paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
                      {(selectedProduct.keyFeatures || selectedProduct.features || selectedProduct.highlights).map((feature, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                  <ProductReviews 
                    productId={selectedProduct.productId?._id || selectedProduct.productId || selectedProduct._id || selectedProduct.id} 
                    productTitle={selectedProduct.name || selectedProduct.title || selectedProduct.productId?.title} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wishlist;