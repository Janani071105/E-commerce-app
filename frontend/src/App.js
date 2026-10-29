import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Hero from './Components/Hero/Hero'; 
import Footer from './Components/Footer/Footer';
import Home from './Pages/Home';
import LoginSignup from './Pages/LoginSignup';
import Products from './Pages/Products';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Cart from './Pages/Cart';
import AdminDashboard from './Pages/AdminDashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import SellerDashboard from './Pages/SellerDashboard';
import AddProductPage from './Pages/AddProductPage';
import Orders from './Pages/Orders';
import Wishlist from './Pages/Wishlist';
import OrderDetails from './Pages/OrderDetails';

function StoreLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setActiveImage(product.image || (Array.isArray(product.images) ? product.images[0] : '') || '');
    setQuantity(1);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setActiveImage('');
    setQuantity(1);
  };
  const renderFeatures = (product) => {
    if (!product) return null;
    
    const raw = product.keyFeatures || 
                product.features || 
                product.highlights || 
                product.key_features || 
                product.keyFeature || 
                product.bulletPoints;
    
    if (!raw) return null;

    let parsedList = raw;

    if (typeof raw === 'string') {
      try {
        const jsonParsed = JSON.parse(raw);
        if (Array.isArray(jsonParsed)) {
          parsedList = jsonParsed;
        }
      } catch (e) {
      }
    }

    if (Array.isArray(parsedList)) {
      return (
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
          {parsedList.map((feat, idx) => (
            <li key={idx} style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', marginBottom: '8px', fontWeight: '400' }}>
              {feat}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p style={{ margin: '8px 0 0 0', fontSize: '15px', color: '#334155', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
        {String(parsedList)}
      </p>
    );
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', margin: 0, padding: 0, backgroundColor: '#f8f9fc', position: 'relative' }}>
      <style>{`
        body, html {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
        }
      `}</style>
      <div style={{ 
        width: '250px', 
        minWidth: '250px', 
        height: '100vh', 
        position: 'sticky', 
        top: '0', 
        left: '0',
        display: isSidebarOpen ? 'block' : 'none',
        zIndex: 1000,
        backgroundColor: '#0f172a',
        flexShrink: 0
      }}>
        <Navbar />
      </div>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1, 
        minHeight: '100vh', 
        width: '100%',
        overflowX: 'hidden'
      }}>
        
        <Hero onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main style={{ 
          flex: 1, 
          padding: '0px', 
          boxSizing: 'border-box', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems:'stretch'
        }}>
          
          <div style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Routes>
              <Route path='/' element={<Home onSelectProduct={handleSelectProduct} />} />
              <Route path='/products' element={<Products onSelectProduct={handleSelectProduct} />} />
              <Route path='/about' element={<About />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/login' element={<LoginSignup />} />
              <Route path='/cart' element={<Cart onSelectProduct={handleSelectProduct} />} />
              <Route path='/orders' element={<Orders onSelectProduct={handleSelectProduct} />} />
              <Route path="/orders/details/:orderId" element={<OrderDetails />} />
              <Route path='/Wishlist' element={<Wishlist onSelectProduct={handleSelectProduct} />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>

      {selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            maxWidth: '850px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <button 
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '22px',
                cursor: 'pointer',
                color: '#64748b',
                zIndex: 10
              }}
            >
              &times;
            </button>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', position: 'sticky', top: 0 }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', backgroundColor: '#fff' }}>
                  <img 
                    src={activeImage || selectedProduct.image || (Array.isArray(selectedProduct.images) ? selectedProduct.images[0] : '')} 
                    alt={selectedProduct.title || selectedProduct.name} 
                    style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain' }} 
                  />
                </div>

                {Array.isArray(selectedProduct.images) && selectedProduct.images.length > 1 && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {selectedProduct.images.map((imgUrl, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setActiveImage(imgUrl)}
                        style={{
                          width: '60px',
                          height: '60px',
                          border: `2px solid ${(activeImage === imgUrl || (!activeImage && idx === 0)) ? '#130352' : '#e2e8f0'}`,
                          borderRadius: '6px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          backgroundColor: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px'
                        }}
                      >
                        <img src={imgUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {selectedProduct.category && (
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {selectedProduct.category}
                  </span>
                )}
                
                <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a', lineHeight: '1.3' }}>
                  {selectedProduct.title || selectedProduct.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#130352' }}>{selectedProduct.price}</span>
                  {selectedProduct.originalPrice && (
                    <span style={{ fontSize: '16px', color: '#94a3b8', textDecoration: 'line-through' }}>{selectedProduct.originalPrice}</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      style={{ background: 'none', border: 'none', padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: '#334155' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 10px', fontSize: '15px', fontWeight: '600', color: '#0f172a', minWidth: '20px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(prev => prev + 1)}
                      style={{ background: 'none', border: 'none', padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: '#334155' }}
                    >
                      +
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
                      const idx = cartItems.findIndex(i => (i._id || i.id) === (selectedProduct._id || selectedProduct.id));
                      if (idx > -1) {
                        cartItems[idx].quantity = (cartItems[idx].quantity || 1) + quantity;
                      } else {
                        cartItems.push({ ...selectedProduct, quantity: quantity });
                      }
                      localStorage.setItem('cartItems', JSON.stringify(cartItems));
                      alert('Item added to cart successfully!');
                      handleCloseModal();
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#130352',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '15px',
                      textAlign: 'center'
                    }}
                  >
                    Add to Cart
                  </button>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '5px 0' }} />

                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#1e293b', fontWeight: '700' }}>Product Description</h4>
                  <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: '1.6' }}>
                    {selectedProduct.description || 'Explore high quality features and seamless compatibility with this reliable item.'}
                  </p>
                </div>
                
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#1e293b', fontWeight: '700' }}>Key Features</h4>
                  {renderFeatures(selectedProduct) || (
                    <p style={{ margin: 0, fontSize: '15px', color: '#94a3b8', fontStyle: 'italic' }}>No key features specified.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/seller/*" element={<SellerDashboard />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/add-product" element={<AddProductPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/*" element={<StoreLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;