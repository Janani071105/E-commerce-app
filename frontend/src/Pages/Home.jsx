import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductReviews from './ProductReviews';
import './CSS/Home.css';
import Contact from './Contact';

function ProductRatingBadge({ productId }) {
  const [ratingData, setRatingData] = useState({ average: '0.0', count: 0 });
  useEffect(() => {
    if (!productId) return;
    axios.get(`http://localhost:4000/api/reviews/${productId}`)
      .then(res => {
        const reviews = Array.isArray(res.data) ? res.data : (res.data.reviews || []);
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
          const rawAvg = sum / reviews.length;
          const avg = parseFloat(rawAvg.toFixed(1));
          setRatingData({ average: avg, count: reviews.length });
        }
      })
      .catch(() => {});
  }, [productId]);
  if (ratingData.count === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: '#111827', margin: '4px 0 6px 0' }}>
      <span style={{ color: '#eab308' }}>★</span>
      <span>{ratingData.average}</span>
      <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'normal' }}>({ratingData.count})</span>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);
  const scrollRef3 = useRef(null);
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showWishlistDropdown, setShowWishlistDropdown] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState([]);
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
    const fetchWishlist = () => {
      const saved = JSON.parse(localStorage.getItem('wishlistItems')) || [];
      setWishlistItems(saved);
    };
    fetchWishlist();
    fetchCatalogProducts();
    window.addEventListener('wishlistUpdated', fetchWishlist);
    window.addEventListener('storage', fetchWishlist);
    return () => {
      window.removeEventListener('wishlistUpdated', fetchWishlist);
      window.removeEventListener('storage', fetchWishlist);
    };
  }, []);

  const fetchCatalogProducts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/seller/products');
      if (Array.isArray(response.data)) {
        setCatalogProducts(response.data);
      } else if (response.data && Array.isArray(response.data.products)) {
        setCatalogProducts(response.data.products);
      } else {
        setCatalogProducts([]);
      }
    } catch (err) {
      console.error('Error fetching catalog products for home page:', err);
      setCatalogProducts([]);
    }
  };

  const handleToggleWishlist = (product, e) => {
    e.stopPropagation();
    const prodId = product._id || product.id;
    if (!prodId) return;

    setWishlistItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => (item._id || item.id) === prodId);
      let updated;
      if (existingIndex > -1) {
        updated = prevItems.filter(item => (item._id || item.id) !== prodId);
      } else {
        let rawImg = product.images?.[0] || product.imageUrl || product.image;
        const wishItem = {
          _id: prodId,
          title: product.title || product.name,
          price: product.price,
          image: resolveImageSrc(rawImg),
          category: product.category || 'Product',
          description: product.description || '',
          keyFeatures: product.keyFeatures || product.features || product.highlights || []
        };
        updated = [...prevItems, wishItem];
      }
      localStorage.setItem('wishlistItems', JSON.stringify(updated));
      window.dispatchEvent(new Event('wishlistUpdated'));
      return updated;
    });
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    let firstImg = 'https://via.placeholder.com/200';
    if (product.images && product.images.length > 0) {
      firstImg = product.images[0];
    } else if (product.imageUrl || product.image) {
      firstImg = product.imageUrl || product.image;
    }
    setActiveModalImage(resolveImageSrc(firstImg));
  };

  const handleAddToCartFromModal = async () => {
    if (!selectedProduct) return;
    let rawImage = selectedProduct.images?.[0] || selectedProduct.imageUrl || selectedProduct.image;
    
    const cartItem = {
      _id: selectedProduct._id || selectedProduct.id,
      title: selectedProduct.title || selectedProduct.name,
      price: parsePrice(selectedProduct.price),
      image: resolveImageSrc(rawImage),
      category: selectedProduct.category || 'Product',
      quantity: quantity,
      description: selectedProduct.description || '',
      keyFeatures: selectedProduct.keyFeatures || selectedProduct.features || selectedProduct.highlights || []
    };

    try {
      const response = await axios.post('http://localhost:4000/api/cart/add', {
        userId,
        product: cartItem
      });

      if (response.data && response.data.success) {
        window.dispatchEvent(new Event('cartUpdated'));
        alert(`${cartItem.title} added to cart!`);
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error('Error adding item to MongoDB cart from home:', err);
      alert('Failed to add item to cart.');
    }
  };

  const handleRemoveFromWishlist = (id, e) => {
    e.stopPropagation();
    const updated = wishlistItems.filter(item => (item._id || item.id) !== id);
    setWishlistItems(updated);
    localStorage.setItem('wishlistItems', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const topPicks = catalogProducts.slice(0, 8);
  const browsingHistory = [...catalogProducts].reverse().slice(0, 7);
  const relatedItems = [...catalogProducts].sort(() => 0.5 - Math.random()).slice(0, 7);

  const renderProductRow = (title, items, ref, pageInfo, darkTheme = false) => {
    if (!items || items.length === 0) return null;
    return (
      <div className={`product-row-wrapper ${darkTheme ? 'dark-theme' : 'light-theme'}`}>
        <div className="product-row-header">
          <div className="product-header-left">
            <h2 className={`product-row-title ${darkTheme ? 'dark-title' : 'light-title'}`}>{title}</h2>
            <Link to="/products" className="explore-link">Explore more deals</Link>
          </div>
          {pageInfo && <span className="page-info-text">{pageInfo}</span>}
        </div>
        <div ref={ref} className="products-scroll-box">
          {items.map((product) => {
            let rawImg = product.images?.[0] || product.imageUrl || product.image;
            let imgSrc = resolveImageSrc(rawImg);
            const priceNum = parsePrice(product.price);
            const prodId = product._id || product.id;
            const isWishlisted = wishlistItems.some(item => (item._id || item.id) === prodId);
            return (
              <div 
                key={prodId} 
                className="product-card-item"
                onClick={() => handleOpenModal(product)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
              >
                <button
                  onClick={(e) => handleToggleWishlist(product, e)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    zIndex: 2,
                    color: isWishlisted ? '#ef4444' : '#64748b'
                  }}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                </button>
                <div>
                  <div className="product-image-box">
                    <img src={imgSrc} alt={product.title || product.name} className="product-img" />
                  </div>
                  {product.category && (
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', display: 'block', marginTop: '8px' }}>
                      {product.category}
                    </span>
                  )}
                  <p className="product-card-title" style={{ margin: '4px 0', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                    {product.title || product.name}
                  </p>
                  <ProductRatingBadge productId={prodId} />
                  <div className="product-price-container" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span className="product-price-current" style={{ fontSize: '18px', fontWeight: 'bold', color: '#130352' }}>${priceNum}</span>
                    {product.originalPrice && <span className="product-price-original" style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>{product.originalPrice}</span>}
                  </div>
                </div>
                <p className="product-delivery-text" style={{ fontSize: '12px', color: '#475569', marginTop: '10px' }}>FREE delivery</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="home-page-container" style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '25px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ position: 'relative' }}>
          {showWishlistDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '52px',
              width: '320px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
              zIndex: 1000,
              padding: '16px',
              color: '#0f172a'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>My Wishlist ({wishlistItems.length})</h4>
                <button 
                  onClick={() => setShowWishlistDropdown(false)}
                  style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}
                >
                  &times;
                </button>
              </div>
              {wishlistItems.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', margin: '20px 0' }}>Your wishlist is empty.</p>
              ) : (
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {wishlistItems.map((item) => (
                    <div 
                      key={item._id || item.id} 
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px', borderRadius: '8px', background: '#f8fafc' }}
                    >
                      <img 
                        src={resolveImageSrc(item.image || item.images?.[0])} 
                        alt={item.title || item.name} 
                        style={{ width: '45px', height: '45px', objectFit: 'contain', borderRadius: '6px', background: '#fff' }} 
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title || item.name}
                        </p>
                        <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 'bold' }}>{item.price}</span>
                      </div>
                      <button 
                        onClick={(e) => handleRemoveFromWishlist(item._id || item.id, e)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
                        title="Remove"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button 
                onClick={() => {
                  setShowWishlistDropdown(false);
                  navigate('/wishlist');
                }}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  backgroundColor: '#130352',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                View Full Wishlist Page
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="home-hero-banner-box">
        <div className="hero-banner-content">
          <span className="hero-badge-tag">Sale is live</span>
          <h1 className="hero-main-title">Starting $49</h1>
          <h2 className="hero-sub-title">Home, kitchen, toys & outdoors</h2>
          <Link to="/products" className="hero-return-btn">
            Return to all deals
          </Link>
        </div>
        <div className="hero-banner-img-box">
          <img 
            src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600" 
            alt="Promotion Banner" 
            className="hero-banner-img"
          />
        </div>
      </div>
      {renderProductRow("Top picks", topPicks, scrollRef1, null, true)}
      {renderProductRow("Inspired by your browsing history", browsingHistory, scrollRef2, false)}
      <div className="middle-promo-banner">
        <div>
          <span className="promo-badge">Limited Time Deal</span>
          <h2 className="promo-title">Up to 60% off | Electronics & Accessories</h2>
          <p className="promo-description">Explore top brands with no cost EMI and exchange offers.</p>
        </div>
        <Link to="/products" className="promo-shop-btn">
          Shop Now
        </Link>
      </div>
      {renderProductRow("Related to items you viewed", relatedItems, scrollRef3, "Page 1 of 6", false)}
      <Contact />
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
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px', textAlign: 'left' }}>
                    {selectedProduct.category}
                  </div>
                )}
                <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3', textAlign: 'left' }}>
                  {selectedProduct.name || selectedProduct.title}
                </h2>
                <ProductRatingBadge productId={selectedProduct._id || selectedProduct.id} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px', textAlign: 'left' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#130352' }}>
                    ${parsePrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span style={{ fontSize: '16px', color: '#94a3b8', textDecoration: 'line-through' }}>
                      {selectedProduct.originalPrice}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', textAlign: 'left' }}>
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
                    onClick={handleAddToCartFromModal}
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
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a', textAlign: 'left' }}>
                  Product Description
                </h4>
                <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', textAlign: 'left' }}>
                  {selectedProduct.description || 'No description available for this item.'}
                </p>
                {((selectedProduct.keyFeatures && selectedProduct.keyFeatures.length > 0) || (selectedProduct.features && selectedProduct.features.length > 0) || (selectedProduct.highlights && selectedProduct.highlights.length > 0)) && (
                  <>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a', textAlign: 'left' }}>
                      Key Features
                    </h4>
                    <ul style={{ paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px', textAlign: 'left' }}>
                      {(selectedProduct.keyFeatures || selectedProduct.features || selectedProduct.highlights).map((feature, idx) => (
                        <li key={idx} style={{ marginBottom: '6px', textAlign: 'left' }}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'left' }}>
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

export default Home;