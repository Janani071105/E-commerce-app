import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CSS/Products.css';
import ProductReviews from './ProductReviews';
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [wishlistItems, setWishlistItems] = useState([]);
  const categoryScrollRef = useRef(null);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/products'); 
        if (response.data) {
          setProducts(response.data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    fetchProducts();
    fetchWishlist();
    window.addEventListener('wishlistUpdated', fetchWishlist);
    window.addEventListener('storage', fetchWishlist);
    return () => {
      window.removeEventListener('wishlistUpdated', fetchWishlist);
      window.removeEventListener('storage', fetchWishlist);
    };
  }, []);
  
  const fetchWishlist = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const userId = user.id || user._id || 'guest_user';
      const response = await axios.get(`http://localhost:4000/api/wishlist/${userId}`);
      if (response.data && response.data.success) {
        setWishlistItems(response.data.items);
      }
    } catch (err) {
      console.error('Error fetching wishlist from backend:', err);
      const saved = JSON.parse(localStorage.getItem('wishlistItems')) || [];
      setWishlistItems(saved);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/seller/products');
      
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const { scrollLeft, clientWidth } = categoryScrollRef.current;
      const scrollAmount = clientWidth * 0.5;
      categoryScrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  const categories = ['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Furnitures'];
  const electronicsSubCategories = [
    { 
      id: 1, 
      name: 'All', 
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      id: 2, 
      name: 'Smartphone', 
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="2" width="14" height="20" rx="3" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
          <line x1="10" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="18" r="1" fill="currentColor"/>
        </svg>
      )
    },
    { 
      id: 3, 
      name: 'Laptop', 
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="13" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 19H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 15H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        </svg>
      )
    },
    { 
      id: 4, 
      name: 'Earpods', 
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 15V13C4 8.58172 7.58172 5 12 5C16.4183 5 20 8.58172 20 13V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <rect x="2" y="14" width="4" height="6" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2"/>
          <rect x="18" y="14" width="4" height="6" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      id: 5, 
      name: 'Smartwatch', 
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="6" width="8" height="12" rx="3" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M15 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M9 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M15 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      id: 6, 
      name: 'Tablets', 
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="2" width="16" height="20" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="18" r="1" fill="currentColor"/>
        </svg>
      )
    },
    { 
      id: 7, 
      name: 'PC accessories', 
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="7" width="20" height="11" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 11H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M11 11H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 11H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      id: 8, 
      name: 'Desktop', 
      svg: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="20" height="13" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 16V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    }
  ];
  const smartphoneSubSections = [
    { id: 's1', name: 'Trending Smartphones', keywords: ['trending', 'hot', 'latest', 'new', 'bestseller'] },
    { id: 's2', name: 'Flagship Phones', keywords: ['flagship', 'pro', 'ultra', 'iphone', 'galaxy s', 'pixel pro'] },
    { id: 's3', name: 'Budget & Mid-Range', keywords: ['budget', 'mid-range', 'nord', 'a54', 'redmi', 'pixel a', 'lite'] },
    { 
      id: 's4', 
      name: 'Budget iPhones', 
      isIphoneOnly: true, 
      keywords: ['iphone se', 'iphone 11', 'iphone 12', 'iphone 13', 'iphone 14', 'iphone 15', 'iphone'] 
    }
  ];
  const synonymMap = {
    'smartphone': ['smartphone', 'phone', 'mobile', 'cellphone', 'iphone', 'galaxy', 'pixel', 'redmi', 'oneplus'],
    'laptop': ['laptop', 'notebook', 'macbook', 'thinkpad'],
    'earpods': ['earpod', 'earphone', 'earbud', 'airpod', 'headphone', 'headset'],
    'smartwatch': ['smartwatch', 'watch', 'band', 'wearable'],
    'tablets': ['tablet', 'ipad', 'tab'],
    'pc accessories': ['accessory', 'accessories', 'keyboard', 'mouse', 'mousepad', 'hub', 'adapter'],
    'desktop': ['desktop', 'pc', 'cpu', 'imac', 'tower', 'workstation'],
    'furnitures': ['furniture', 'chair', 'table', 'sofa', 'desk', 'bed', 'cabinet']
  };
  const filteredProducts = products.filter((product) => {
    const matchesMain = selectedCategory === 'All' || product.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    let matchesSub = true;
    if (selectedCategory.toLowerCase() === 'electronics' && selectedSubCategory !== 'All' && selectedSubCategory !== 'Smartphone') {
      const subCatTarget = selectedSubCategory.toLowerCase();
      const pTitle = (product.title || product.name || '').toLowerCase();
      const pSubCat = (product.subCategory || '').toLowerCase();
      const keywords = synonymMap[subCatTarget] || [subCatTarget];
      matchesSub = keywords.some(keyword => 
        pSubCat.includes(keyword) || pTitle.includes(keyword)
      );
    }
    return matchesMain && matchesSub;
  });
  const handleMainCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory('All');
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

  const handleToggleWishlist = async (product, e) => {
    if (e) e.stopPropagation();
    const productId = product._id || product.id;
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user.id || user._id || 'guest_user';
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

  const isProductInWishlist = (product) => {
    const productId = product._id || product.id;
    return wishlistItems.some(item => (item.productId || item._id || item.id) === productId);
  };
  const handleAddToCart = async (product, itemQty = 1, e) => {
    if (e) e.stopPropagation();
    
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user.id || user._id || 'guest_user';

    const cartItem = {
      _id: product._id || product.id,
      title: product.title || product.name,
      price: Number(product.price),
      image: resolveImageSrc(product.images?.[0] || product.imageUrl || product.image),
      category: product.category,
      quantity: itemQty
    };

    try {
      const response = await axios.post('http://localhost:4000/api/cart/add', {
        userId,
        product: cartItem
      });

      if (response.data && response.data.success) {
        window.dispatchEvent(new Event('cartUpdated'));
        alert(`${cartItem.title} added to cart!`);
      }
    } catch (err) {
      console.error('Error adding item to MongoDB cart:', err);
      alert('Failed to add item to cart.');
    }
    
    if (selectedProduct) {
      setSelectedProduct(null);
    }
  };
    
  const resolveImagesSrc = (rawImage) => {
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
  const handleOpenModal = (item) => {
    setSelectedProduct(item);
    setQuantity(1);
    let firstImg = 'https://via.placeholder.com/200';
    if (item.images && item.images.length > 0) {
      firstImg = item.images[0];
    } else if (item.imageUrl || item.image) {
      firstImg = item.imageUrl || item.image;
    }
    setActiveModalImage(resolveImagesSrc(firstImg));
  };
  const renderProductCard = (item, customStyle = {}) => {
    const currentRating = item.rating !== undefined && item.rating !== null 
      ? item.rating 
      : (item.averageRating || 0);
    const totalRevCount = item.totalReviews || 0;
    let rawImage = item.images && item.images.length > 0 ? item.images[0] : item.imageUrl || item.image;
    let imageSrc = resolveImageSrc(rawImage);
    const inWishlist = isProductInWishlist(item);
    return (
      <div 
        key={item._id || item.id} 
        className="product-card"
        onClick={() => handleOpenModal(item)}
        style={{ cursor: 'pointer', position: 'relative', ...customStyle }}
      >
        <button
          onClick={(e) => handleToggleWishlist(item, e)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
          title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <i className={`${inWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`} style={{ color: inWishlist ? '#ef4444' : '#64748b', fontSize: '15px' }}></i>
        </button>
        <div className="image-box" style={{ height: customStyle.minWidth ? '180px' : undefined }}>
          <img 
            src={imageSrc} 
            alt={item.title || item.name} 
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200'; }}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div className="card-details">
          <span className="card-category">{item.category}</span>
          <h3 className="card-title" style={customStyle.minWidth ? { fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : {}}>
            {item.title || item.name}
          </h3>
          <div className="card-footer">
            <span style={{fontWeight: '700', fontSize: '13px', color: currentRating > 0 ? '#111827' : '#9ca3af' }}> 
              <span style={{ color: '#eab308' }}>★</span> {currentRating > 0 ? currentRating : '0'} 
              {totalRevCount > 0 && (
                <small style={{ marginLeft: '4px', color: '#64748b', fontWeight: 'normal' }}>
                  ({totalRevCount})
                </small>
              )}
            </span>
          </div>
          <button
            onClick={(e) => handleAddToCart(item, 1, e)}
            className="add-to-cart-btn"
            style={{ width: '100%', marginTop: '10px', position: customStyle.minWidth ? 'static' : undefined, transform: customStyle.minWidth ? 'none' : undefined }}
          >
            Add to Cart
          </button> 
        </div>
      </div>
    );
  };
  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Explore All Products</h1>
        <p>Discover top-tier mobile devices, wearables, and high-performance tech accessories.</p>
      </div>
      <div className="products-filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleMainCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      {selectedCategory.toLowerCase() === 'electronics' && (
        <div className="category-section-container">
          <h2 className="category-section-heading">Shop by category</h2>
          
          <button className="cat-scroll-btn cat-left-btn" onClick={() => scrollCategories('left')}>
            &#10094;
          </button>
          <div ref={categoryScrollRef} className="category-scroll-container">
            {electronicsSubCategories.map((subCat) => (
              <div 
                key={subCat.id} 
                className={`category-soft-card ${selectedSubCategory === subCat.name ? 'active' : ''}`}
                onClick={() => setSelectedSubCategory(subCat.name)}
              >
                <div className="soft-card-img-wrapper" style={{ color: selectedSubCategory === subCat.name ? '#6366f1' : '#334155' }}>
                  {subCat.svg}
                </div>
                <span className="soft-card-title">{subCat.name}</span>
                <div className="soft-card-indicator"></div>
              </div>
            ))}
          </div>
          <button className="cat-scroll-btn cat-right-btn" onClick={() => scrollCategories('right')}>
            &#10095;
          </button>
        </div>
      )}
      {selectedCategory.toLowerCase() === 'electronics' && selectedSubCategory === 'All' ? (
        <div className="electronics-stacked-sections" style={{ width: '100%', marginTop: '20px' }}>
          {loading ? (
            <p>Loading products from database...</p>
          ) : (
            electronicsSubCategories
              .filter((sub) => sub.name !== 'All')
              .map((subCat) => {
                const subCatTarget = subCat.name.toLowerCase();
                const keywords = synonymMap[subCatTarget] || [subCatTarget];
                const rowProducts = products.filter((product) => {
                  const matchesMain = product.category?.toLowerCase() === 'electronics';
                  const pTitle = (product.title || product.name || '').toLowerCase();
                  const pSubCat = (product.subCategory || '').toLowerCase();
                  const matchesSub = keywords.some(keyword => 
                    pSubCat.includes(keyword) || pTitle.includes(keyword)
                  );
                  return matchesMain && matchesSub;
                });
                if (rowProducts.length === 0) return null;
                return (
                  <div key={subCat.id} className="category-row-section" style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {subCat.name}
                      </h3>
                      <button 
                        onClick={() => setSelectedSubCategory(subCat.name)}
                        style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                      >
                        See All →
                      </button>
                    </div>
                    <div className="category-horizontal-row">
                      {rowProducts.map((item) => renderProductCard(item, { minWidth: '220px', maxWidth: '220px', flexShrink: 0 }))}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      ) : selectedCategory.toLowerCase() === 'electronics' && selectedSubCategory === 'Smartphone' ? (
        <div className="smartphone-stacked-sections" style={{ width: '100%', marginTop: '20px' }}>
          {loading ? (
            <p>Loading smartphone and electronic collections...</p>
          ) : (
            <>
              {smartphoneSubSections.map((section) => {
                const rowProducts = products.filter((product) => {
                  const matchesMain = product.category?.toLowerCase() === 'electronics';
                  const pTitle = (product.title || product.name || '').toLowerCase();
                  const pSubCat = (product.subCategory || '').toLowerCase();
                  const pDesc = (product.description || '').toLowerCase();
                  const isPhone = synonymMap['smartphone'].some(kw => pSubCat.includes(kw) || pTitle.includes(kw));
                  if (!matchesMain || !isPhone) return false;
                  if (section.isIphoneOnly) {
                    const isIphone = pTitle.includes('iphone') || pSubCat.includes('iphone');
                    const isProOrUltra = pTitle.includes('pro') || pTitle.includes('ultra') || pSubCat.includes('pro') || pSubCat.includes('ultra');
                    return isIphone && !isProOrUltra;
                  }
                  const matchesGroup = section.keywords.some(kw => 
                    pSubCat.includes(kw) || pTitle.includes(kw) || pDesc.includes(kw)
                  );
                  return matchesGroup;
                });
                if (rowProducts.length === 0) return null;
                return (
                  <React.Fragment key={section.id}>
                    {section.id === 's2' && (
                      <div 
                        className="promo-banner-container"
                        style={{
                          width: '100%',
                          height: '240px',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          marginBottom: '40px',
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 40px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ maxWidth: '50%', color: '#ffffff' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#818cf8', display: 'block', marginBottom: '8px' }}>
                            New Release
                          </span>
                          <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0', lineHeight: '1.2' }}>
                            Experience the Ultimate iPhone Flagship
                          </h2>
                          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                            Unmatched titanium durability, groundbreaking camera system, and the lightning-fast A-series chip.
                          </p>
                        </div>
                        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img 
                            src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop" 
                            alt="iPhone Flagship Banner" 
                            style={{ maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200'; }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="category-row-section" style={{ marginBottom: '40px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                          {section.name}
                        </h3>
                      </div>
                      <div className="products-grid">
                        {rowProducts.map((item) => renderProductCard(item))}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              {electronicsSubCategories
                .filter((sub) => sub.name !== 'All' && sub.name !== 'Smartphone')
                .map((subCat) => {
                  const subCatTarget = subCat.name.toLowerCase();
                  const keywords = synonymMap[subCatTarget] || [subCatTarget];
                  const rowProducts = products.filter((product) => {
                    const matchesMain = product.category?.toLowerCase() === 'electronics';
                    const pTitle = (product.title || product.name || '').toLowerCase();
                    const pSubCat = (product.subCategory || '').toLowerCase();
                    const matchesSub = keywords.some(keyword => 
                      pSubCat.includes(keyword) || pTitle.includes(keyword)
                    );
                    return matchesMain && matchesSub;
                  });
                  if (rowProducts.length === 0) return null;
                  return (
                    <div key={`below-phone-${subCat.id}`} className="category-row-section" style={{ marginBottom: '40px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                          {subCat.name}
                        </h3>
                        <button 
                          onClick={() => setSelectedSubCategory(subCat.name)}
                          style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                        >
                          See All →
                        </button>
                      </div>
                      <div className="category-horizontal-row">
                        {rowProducts.map((item) => renderProductCard(item, { minWidth: '220px', maxWidth: '220px', flexShrink: 0 }))}
                      </div>
                    </div>
                  );
                })}
            </>
          )}
        </div>
      ) : selectedCategory.toLowerCase() === 'electronics' && selectedSubCategory !== 'All' ? (
        <div className="specific-subcat-stacked-sections" style={{ width: '100%', marginTop: '20px' }}>
          {loading ? (
            <p>Loading collections...</p>
          ) : (
            <>
              {(() => {
                const subCatTarget = selectedSubCategory.toLowerCase();
                const keywords = synonymMap[subCatTarget] || [subCatTarget];
                const mainRowProducts = products.filter((product) => {
                  const matchesMain = product.category?.toLowerCase() === 'electronics';
                  const pTitle = (product.title || product.name || '').toLowerCase();
                  const pSubCat = (product.subCategory || '').toLowerCase();
                  return matchesMain && keywords.some(keyword => pSubCat.includes(keyword) || pTitle.includes(keyword));
                });
                if (mainRowProducts.length === 0) return <p>No products found for {selectedSubCategory}.</p>;
                return (
                  <div className="category-row-section" style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {selectedSubCategory} Collection
                      </h3>
                    </div>
                    <div className="products-grid">
                      {mainRowProducts.map((item) => renderProductCard(item))}
                    </div>
                  </div>
                );
              })()}
              {electronicsSubCategories
                .filter((sub) => sub.name !== 'All' && sub.name.toLowerCase() !== selectedSubCategory.toLowerCase())
                .map((subCat) => {
                  const subCatTarget = subCat.name.toLowerCase();
                  const keywords = synonymMap[subCatTarget] || [subCatTarget];
                  const rowProducts = products.filter((product) => {
                    const matchesMain = product.category?.toLowerCase() === 'electronics';
                    const pTitle = (product.title || product.name || '').toLowerCase();
                    const pSubCat = (product.subCategory || '').toLowerCase();
                    const matchesSub = keywords.some(keyword => 
                      pSubCat.includes(keyword) || pTitle.includes(keyword)
                    );
                    return matchesMain && matchesSub;
                  });
                  if (rowProducts.length === 0) return null;
                  return (
                    <div key={`remaining-${subCat.id}`} className="category-row-section" style={{ marginBottom: '40px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                          {subCat.name}
                        </h3>
                        <button 
                          onClick={() => setSelectedSubCategory(subCat.name)}
                          style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                        >
                          See All →
                        </button>
                      </div>
                      <div className="category-horizontal-row">
                        {rowProducts.map((item) => renderProductCard(item, { minWidth: '220px', maxWidth: '220px', flexShrink: 0 }))}
                      </div>
                    </div>
                  );
                })}
            </>
          )}
        </div>
      ) : (
        <div className="products-grid-wrapper" style={{ width: '100%' }}>
          {loading ? (
            <p>Loading products from database...</p>
          ) : filteredProducts.length === 0 ? (
            <p>No products available in this category selection.</p>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((item) => renderProductCard(item))}
            </div>
          )}
        </div>
      )}
      {selectedProduct && (
        <div 
          className="product-modal-backdrop"
          onClick={() => setSelectedProduct(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="product-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <button 
              onClick={() => setSelectedProduct(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '20px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: '#374151'
              }}
            >
              &times;
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '10px' }}>
              <div>
                <div style={{
                  width: '100%',
                  height: '280px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  marginBottom: '12px'
                }}>
                  <img 
                    src={activeModalImage} 
                    alt={selectedProduct.title || selectedProduct.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200'; }}
                  />
                </div>
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {selectedProduct.images.map((img, idx) => {
                      const fullSrc = resolveImageSrc(img);
                      return (
                        <img 
                          key={idx}
                          src={fullSrc}
                          alt={`Thumbnail ${idx}`}
                          onClick={() => setActiveModalImage(fullSrc)}
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: activeModalImage === fullSrc ? '2px solid #130352' : '1px solid #e5e7eb'
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold' }}>
                    {selectedProduct.category} {selectedProduct.brand ? `• ${selectedProduct.brand}` : ''}
                  </span>
                  <h2 style={{ fontSize: '22px', color: '#111827', margin: '4px 0' }}>
                    {selectedProduct.title || selectedProduct.name}
                  </h2>
                  {(() => {
                    const currentRating = selectedProduct.rating !== undefined && selectedProduct.rating !== null ? selectedProduct.rating : (selectedProduct.averageRating || 0);
                    const totalRevCount = selectedProduct.totalReviews || 0;
                    return (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: '#f1f5f9',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        gap: '6px',
                        width: 'fit-content',
                        margin: '6px 0 2px 0'
                      }}>
                        <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                          {currentRating > 0 ? currentRating : '0'}
                        </span>
                        <span style={{ color: '#16a34a', fontSize: '12px' }}>★</span>
                        {totalRevCount > 0 && (
                          <>
                            <span style={{ color: '#cbd5e1', fontSize: '12px' }}>|</span>
                            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>
                              {totalRevCount}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#130352' }}>
                    ${selectedProduct.price}
                  </span>
                  {selectedProduct.mrp && (
                    <span style={{ fontSize: '16px', color: '#9ca3af', textDecoration: 'line-through' }}>
                      ${selectedProduct.mrp}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      style={{ padding: '6px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 10px', fontWeight: 'bold' }}>{quantity}</span>
                    <button 
                      onClick={() => setQuantity(prev => prev + 1)}
                      style={{ padding: '6px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(selectedProduct, quantity)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#130352',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
                
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                    Product Description
                  </h4>
                  <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5', margin: 0 }}>
                    {selectedProduct.description || 'No detailed description available.'}
                  </p>
                </div>
                {selectedProduct.features && (
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' }}>
                      Key Features
                    </h4>
                    <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: '1.6' }}>
                      {(Array.isArray(selectedProduct.features) 
                        ? selectedProduct.features 
                        : String(selectedProduct.features).split('\n')
                      )
                      .filter(feat => feat.trim() !== '')
                      .map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                    <ProductReviews 
                      productId={selectedProduct.productId?._id || selectedProduct.productId || selectedProduct._id || selectedProduct.id} 
                      productTitle={selectedProduct.name || selectedProduct.title || selectedProduct.productId?.title} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Products;