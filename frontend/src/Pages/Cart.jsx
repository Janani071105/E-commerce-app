import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductReviews from './ProductReviews';

function ProductRatingBadge({ productId }) {
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });
  useEffect(() => {
    if (!productId) return;
    axios.get(`http://localhost:4000/api/reviews/${productId}`)
      .then(res => {
        const reviews = Array.isArray(res.data) ? res.data : (res.data.reviews || []);
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
          const avg = (sum / reviews.length).toFixed(1);
          setRatingData({ average: avg, count: reviews.length });
        }
      })
      .catch(() => {});
  }, [productId]);
  if (ratingData.count === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: '#1e293b', margin: '4px 0 8px 0' }}>
      <span style={{ color: '#d97706' }}>★</span>
      <span>{ratingData.average}</span>
      <span style={{ color: '#64748b', fontSize: '12px' }}>({ratingData.count})</span>
    </div>
  );
}

function Cart({ onSelectProduct }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
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
    const fetchCartAndData = async () => {
      try {
        const cartRes = await axios.get(`http://localhost:4000/api/cart/${userId}`);
        if (cartRes.data && cartRes.data.success) {
          setCartItems(cartRes.data.items || []);
        }
      } catch (err) {
        console.error('Error fetching cart from backend:', err);
      }

      try {
        const wishRes = await axios.get(`http://localhost:4000/api/wishlist/${userId}`);
        if (wishRes.data && wishRes.data.success) {
          setWishlistItems(wishRes.data.items || []);
        }
      } catch (err) {
        console.error('Error fetching wishlist from backend:', err);
      }
    };

    fetchCartAndData();
    fetchCatalogProducts();

    window.addEventListener('cartUpdated', fetchCartAndData);
    window.addEventListener('wishlistUpdated', fetchCartAndData);
    return () => {
      window.removeEventListener('cartUpdated', fetchCartAndData);
      window.removeEventListener('wishlistUpdated', fetchCartAndData);
    };
  }, [userId]);

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
      console.error('Error fetching catalog products for cart suggestions:', err);
      setCatalogProducts([]);
    }
  };

  const isProductInWishlist = (product) => {
    const productId = product._id || product.id;
    return wishlistItems.some(item => (item.productId || item._id || item.id) === productId);
  };

  const handleToggleWishlist = async (product, e) => {
    if (e) e.stopPropagation();
    const productId = product._id || product.id;
    const inWish = isProductInWishlist(product);

    try {
      if (inWish) {
        const response = await axios.delete(`http://localhost:4000/api/wishlist/${userId}/${productId}`);
        if (response.data && response.data.success) {
          setWishlistItems(response.data.items);
          window.dispatchEvent(new Event('wishlistUpdated'));
        }
      } else {
        const response = await axios.post('http://localhost:4000/api/wishlist/add', {
          userId,
          product: {
            _id: productId,
            title: product.title || product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image || product.images?.[0],
            keyFeatures: product.keyFeatures || product.features
          }
        });
        if (response.data && response.data.success) {
          setWishlistItems(response.data.items);
          window.dispatchEvent(new Event('wishlistUpdated'));
        }
      }
    } catch (err) {
      console.error('Error updating MongoDB wishlist:', err);
    }
  };

 const updateQuantity = async (item, delta) => {
    const targetId = item.productId || item._id || item.id;
    const currentQty = item.quantity || 1;
    const newQty = Math.max(1, currentQty + delta);

    try {
      const response = await axios.post('http://localhost:4000/api/cart/add', {
        userId,
        product: {
          productId: targetId,
          title: item.title || item.name,
          price: item.price,
          image: item.image,
          quantity: newQty
        }
      });
      if (response.data && response.data.success) {
        setCartItems(response.data.items);
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err) {
      console.error('Error updating cart quantity:', err);
    }
  };

  const handleOpenModal = (item) => {
    setSelectedProduct(item);
    setQuantity(1);
    let firstImg = 'https://via.placeholder.com/200';
    if (item.images && item.images.length > 0) {
      firstImg = item.images[0];
    } else if (item.imageUrl || item.image) {
      firstImg = item.imageUrl || item.image;
    }
    setActiveModalImage(resolveImageSrc(firstImg));
  };

  const removeItem = async (item) => {
    const targetId = item.productId || item._id || item.id;
    try {
      const response = await axios.delete(`http://localhost:4000/api/cart/${userId}/${targetId}`);
      if (response.data && response.data.success) {
        setCartItems(response.data.items);
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err) {
      console.error('Error removing item from cart:', err);
    }
  };

  const handleAddToCartFromSuggestions = async (product, e) => {
    if (e) e.stopPropagation();
    let rawImage = product.images?.[0] || product.imageUrl || product.image;
    const cartItem = {
      _id: product._id || product.id,
      title: product.title || product.name,
      price: parsePrice(product.price),
      image: resolveImageSrc(rawImage),
      category: product.category || 'Suggested',
      quantity: 1,
      description: product.description || '',
      keyFeatures: product.keyFeatures || product.features || product.highlights || []
    };

    try {
      const response = await axios.post('http://localhost:4000/api/cart/add', {
        userId,
        product: cartItem
      });
      if (response.data && response.data.success) {
        setCartItems(response.data.items);
        window.dispatchEvent(new Event('cartUpdated'));
        alert(`${cartItem.title} added to cart!`);
      }
    } catch (err) {
      console.error('Error adding suggestion to cart:', err);
    }
  };

  const newOrder = {
    id: Math.random().toString(36).substring(2, 8).toUpperCase(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' EST',
    status: 'PROCESSING',
    items: cartItems.map(item => ({
      id: item._id || item.id,
      title: item.title || item.name,
      category: item.category || '',
      price: item.price,
      quantity: item.quantity || 1,
      image: item.image || item.img || item.imageUrl || (Array.isArray(item.images) ? item.images[0] : ''),
      description: item.description || ''
    }))
  };

  const existingOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
  const updatedOrders = [newOrder, ...existingOrders];
  localStorage.setItem('userOrders', JSON.stringify(updatedOrders));

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
        setCartItems(response.data.items);
        window.dispatchEvent(new Event('cartUpdated'));
        alert(`${cartItem.title} added to cart!`);
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error('Error adding from modal to cart:', err);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const priceNum = parsePrice(item.price);
    const qty = item.quantity || 1;
    return acc + (priceNum * qty);
  }, 0);

  const handleCheckout = async () => {
  if (cartItems.length === 0) return;

  const orderPayload = {
    customerName: "Janani V", 
    items: cartItems.map(item => ({
      _id: item._id || item.id,
      quantity: item.quantity || 1
    }))
  };

  try {
    const response = await axios.post('http://localhost:4000/api/seller/orders', orderPayload);
    if (response.data.success) {
      console.log("Order saved to MongoDB successfully!");
    }
  } catch (err) {
    console.error("Failed to save order to backend:", err);
  }

  const newOrder = {
    id: Math.random().toString(36).substring(2, 8).toUpperCase(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' EST',
    status: 'PROCESSING',
    items: cartItems.map(item => ({
      id: item._id || item.id,
      title: item.title || item.name,
      category: item.category || '',
      price: item.price,
      quantity: item.quantity || 1,
      image: item.image || item.img || item.imageUrl || (Array.isArray(item.images) ? item.images[0] : ''),
      description: item.description || ''
    }))
  };

  const existingOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
  const updatedOrders = [newOrder, ...existingOrders];
  localStorage.setItem('userOrders', JSON.stringify(updatedOrders));

  try {
    await axios.delete(`http://localhost:4000/api/cart/clear/${userId}`);
  } catch (err) {
    console.error('Error clearing cart on backend:', err);
  }

  setCartItems([]);
  window.dispatchEvent(new Event('cartUpdated'));
  alert('Order placed successfully!');
  navigate('/orders');
};

  const renderSuggestedScrollRow = (title, subtitle, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div style={{ width: '100%', boxSizing: 'border-box', marginTop: '30px', backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{title}</h3>
          {subtitle && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'thin' }}>
          {items.map((prod, idx) => {
            let rawImg = prod.images?.[0] || prod.imageUrl || prod.image;
            let imgSrc = resolveImageSrc(rawImg);
            const priceNum = parsePrice(prod.price);
            const mrpNum = prod.mrp ? parsePrice(prod.mrp) : priceNum * 1.3;
            const prodId = prod._id || prod.id;
            const inWishlist = isProductInWishlist(prod);
            return (
              <div
                key={prodId || idx}
                onClick={() => handleOpenModal(prod)}
                style={{
                  minWidth: '190px',
                  maxWidth: '190px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                  position: 'relative'
                }}
              >
              
                <button
                  onClick={(e) => handleToggleWishlist(prod, e)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <i className={`${inWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`} style={{ color: inWishlist ? '#ef4444' : '#64748b', fontSize: '13px' }}></i>
                </button>

                <div>
                  <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '10px', overflow: 'hidden' }}>
                    <img
                      src={imgSrc}
                      alt={prod.title || prod.name}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/180'; }}
                    />
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#1e293b', fontWeight: '600', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: '1.3' }}>
                    {prod.title || prod.name}
                  </h4>
                  <ProductRatingBadge productId={prodId} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>${priceNum}</span>
                    {mrpNum > priceNum && (
                      <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>${Math.round(mrpNum)}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleAddToCartFromSuggestions(prod, e)}
                  style={{
                    width: '100%',
                    backgroundColor: '#130352',
                    border: '1px solid #130352',
                    borderRadius: '4px',
                    padding: '8px 0',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  Add to cart
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Secure Checkout
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '5px 0 10px 0' }}>
          Shopping Cart
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          You have {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} item(s) in your cart.
        </p>
      </div>
      {cartItems.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            {cartItems.map((item) => {
              const itemPrice = parsePrice(item.price);
              const qty = item.quantity || 1;
              const itemTotal = itemPrice * qty;
              const itemId = item._id || item.id || item.productId;
              const itemImage = item.image || item.img || item.imageUrl || (Array.isArray(item.images) ? item.images[0] : '') || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
              return (
                <div 
                  key={itemId} 
                  onClick={() => handleOpenModal(item)}
                  style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    padding: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '20px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    flexWrap: 'wrap',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'}
                >
                  <img 
                    src={itemImage} 
                    alt={item.title || item.name} 
                    style={{ width: '90px', height: '90px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f8fafc', padding: '5px' }} 
                  />
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    {item.category && (
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                        {item.category}
                      </span>
                    )}
                    <h3 style={{ margin: '4px 0 2px 0', fontSize: '16px', color: '#0f172a', fontWeight: '600' }}>
                      {item.title || item.name}
                    </h3>
                    <ProductRatingBadge productId={itemId} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#130352' }}>
                        ${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {item.originalPrice && item.originalPrice !== '$NaN' && (
                        <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>
                          {item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
                      <button 
                        onClick={() => updateQuantity(item, -1)}
                        style={{ background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', color: '#334155' }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0 10px', fontSize: '14px', fontWeight: '600', color: '#0f172a', minWidth: '20px', textAlign: 'center' }}>
                        {qty}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item, 1)}
                        style={{ background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', color: '#334155' }}
                      >
                        +
                      </button>
                    </div>
                    <button 
                    onClick={() => removeItem(item)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}
                    >
                    Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ 
            backgroundColor: '#fff', 
            borderRadius: '12px', 
            padding: '24px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            position: 'sticky',
            top: '20px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              Order Summary
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px', color: '#475569' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>
                ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px', color: '#475569' }}>
              <span>Estimated Shipping</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '15px', color: '#475569' }}>
              <span>Promo Discount</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>-$0.00</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '15px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
              <span>Total Amount</span>
              <span style={{ color: '#130352' }}>
                ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <button 
              onClick={handleCheckout}
              style={{
                width: '100%',
                backgroundColor: '#130352',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(19, 3, 82, 0.2)'
              }}
            >
              Proceed to Checkout
            </button>
            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#64748b' }}>
                Safe and Secure Payments
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '22px' }}>Your Cart is Empty</h3>
          <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '15px' }}>Looks like you haven't added anything to your cart yet.</p>
          <Link 
            to="/products" 
            style={{ backgroundColor: '#130352', color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}
          >
            Start Shopping
          </Link>
        </div>
      )}
      <div style={{ width: '100%', marginTop: '30px' }}>
        {renderSuggestedScrollRow(
          "Suggested for You",
          "Based on Your Activity",
          catalogProducts
        )}
        {renderSuggestedScrollRow(
          "Items that you may have missed",
          null,
          [...catalogProducts].sort(() => 0.5 - Math.random())
        )}
        {renderSuggestedScrollRow(
          "Recently Viewed",
          null,
          [...catalogProducts].reverse()
        )}
      </div>
    
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
              <div style={{ width: '100%', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={activeModalImage} alt="Product" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
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
                  {selectedProduct.mrp && parsePrice(selectedProduct.mrp) > parsePrice(selectedProduct.price) && (
                    <span style={{ fontSize: '16px', color: '#94a3b8', textDecoration: 'line-through' }}>
                      ${Math.round(parsePrice(selectedProduct.mrp))}
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

export default Cart;