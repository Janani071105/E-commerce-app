import React, { useState, useEffect, useCallback } from 'react';
import './CSS/SellerDashboard.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import ProductReviews from './ProductReviews';
import AddProductPage from './AddProductPage'; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL = 'http://localhost:4000/api/seller';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory'); 
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [productOrders, setProductOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [, setProductStatuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingProduct, setEditingProduct] = useState(null);

  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    unitsSold: 0,
    avgOrderValue: 0,
    monthlyRevenue: [1200, 1900, 3000, 5000, 2400, 4800, 7200],
    categorySales: { Fashions: 45, Electronics: 25, Homekitchen: 15 },
  });

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics`);
      if (response.data.success) {
        setAnalyticsData((prev) => ({ ...prev, ...response.data.data }));
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  }, []);

  const fetchProductStatuses = useCallback(async () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
      let flattenedItems = [];
      
      savedOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            flattenedItems.push({
              id: item._id || item.id || order.id,
              orderId: order.id,
              title: item.title || item.name,
              stock: item.quantity || 1,
              status: order.status || 'Processing',
              trackingNo: order.trackingId || 'Pending',
              estimatedDelivery: order.deliveryDate || 'TBD'
            });
          });
        }
      });
      setCustomerOrders(flattenedItems);
      const response = await axios.get(`${API_BASE_URL}/product-statuses`);
      if (response.data.success) {
        setProductStatuses(response.data.statuses);
      }
    } catch (err) {
      console.error('Error loading product statuses:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchAnalytics();
    fetchProductStatuses();
  }, [fetchProducts, fetchAnalytics, fetchProductStatuses]);

  

  const handleProductClick = async (product) => {
    setSelectedProduct(product);
    setActiveTab('product-detail');
    try {
      const productId = product._id || product.id;
      const response = await axios.get(`${API_BASE_URL}/products/${productId}/orders`);
      if (response.data.success) {
        setProductOrders(response.data.orders);
      } else {
        setProductOrders([]);
      }
    } catch (err) {
      console.error('Error fetching product specific orders:', err);
      setProductOrders([
        { id: 'ORD-901', buyer: 'Anisha', quantityOrdered: 2, status: 'In Transit', trackingNo: 'TRK-8839201', estimatedDelivery: '2026-06-12' },
        { id: 'ORD-904', buyer: 'Bharath', quantityOrdered: 1, status: 'Processing', trackingNo: 'TRK-9923145', estimatedDelivery: '2026-06-15' },
      ]);
    }
  };

  const handleUpdateStatus = async (statusId, newStatus, newTrackingNo, newDeliveryDate, orderId) => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
      const updatedOrders = savedOrders.map(order => {
        if (order.id === orderId || String(order.id) === String(statusId)) {
          return {
            ...order,
            status: newStatus,
            trackingId: newTrackingNo,
            deliveryDate: newDeliveryDate
          };
        }
        return order;
      });
      localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event('storage'));
      await axios.put(`${API_BASE_URL}/product-statuses/${statusId}`, {
        status: newStatus,
        trackingNo: newTrackingNo,
        estimatedDelivery: newDeliveryDate,
      }).catch(() => {});
      alert('Product tracking updated successfully!');
      fetchProductStatuses(); 
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update tracking details');
    }
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: analyticsData.monthlyRevenue || [1200, 1900, 3000, 5000, 2400, 4800, 7200],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4f46e5',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      x: { grid: { display: false } },
    },
  };

  const doughnutChartData = {
    labels: Object.keys(analyticsData.categorySales),
    datasets: [
      {
        data: Object.values(analyticsData.categorySales),
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/products/${editingProduct._id || editingProduct.id}`, {
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock, 10),
      });
      if (response.data.success) {
        alert('Product updated successfully!');
        setEditingProduct(null);
        fetchProducts();
        fetchProductStatuses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/products/${id}`);
        if (response.data.success) {
          fetchProducts();
          fetchProductStatuses();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter((item) => {
    const productId = item._id || item.id || '';
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (productId && productId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }); 

  const totalItems = products.length;
  const lowStockItems = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockItems = products.filter((p) => p.stock === 0).length;
  const inventoryValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>HEX<span>STORE</span></h2>
          <span className="brand-subtitle">Seller Portal</span>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>
            Inventory & Products
          </button>
          <button className={activeTab === 'add-product' ? 'active' : ''} onClick={() => setActiveTab('add-product')}>
            + Add New Product
          </button>
          <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
            Sales Analytics
          </button>
          <button className={activeTab === 'status' ? 'active' : ''} onClick={() => setActiveTab('status')}>
            Product Status & Tracking
          </button>
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-search">
            <input
              type="text"
              placeholder="Search products by title or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="header-right">
            <Link to="/" className="btn-storefront">Back to store</Link>
            <div className="admin-profile-pill">
              <div className="profile-avatar bg-purple">S</div>
              <div className="profile-meta">
                <span className="profile-name">TechHub Electronics</span>
                <span className="profile-role">Verified Seller</span>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-body">
          {activeTab === 'inventory' && (
            <div className="tab-panel fade-in">
              <div className="kpi-grid">
                <div className="kpi-card hover-lift">
                  <div className="kpi-content">
                    <div className="kpi-header"><span className="kpi-title">Total Listings</span></div>
                    <div className="kpi-body"><span className="kpi-number">{totalItems}</span></div>
                  </div>
                  <div className="kpi-side-bar bg-blue"></div>
                </div>
                <div className="kpi-card hover-lift">
                  <div className="kpi-content">
                    <div className="kpi-header"><span className="kpi-title">Low Stock Alerts</span></div>
                    <div className="kpi-body"><span className="kpi-number text-warning">{lowStockItems}</span></div>
                  </div>
                  <div className="kpi-side-bar bg-purple"></div>
                </div>
                <div className="kpi-card hover-lift">
                  <div className="kpi-content">
                    <div className="kpi-header"><span className="kpi-title">Out of Stock</span></div>
                    <div className="kpi-body"><span className="kpi-number text-danger">{outOfStockItems}</span></div>
                  </div>
                  <div className="kpi-side-bar bg-green"></div>
                </div>
                <div className="kpi-card kpi-primary hover-lift">
                  <div className="kpi-content">
                    <div className="kpi-header"><span className="kpi-title text-light">Total Inventory Value</span></div>
                    <div className="kpi-body"><span className="kpi-number text-light">${inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                  </div>
                </div>
              </div>
              <div className="split-main-card full-width">
                <div className="card-header-flex">
                  <div>
                    <h3>Product Inventory</h3>
                    <p className="card-subtitle">Click on any product name to view its orders, tracking IDs, and fulfillment statuses</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                      className="category-filter-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                      <option value="Furnitures">Furnitures</option>
                    </select>
                    <button onClick={() => setActiveTab('add-product')} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      + Add New Product
                    </button>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="enhanced-table">
                    <thead>
                      <tr>
                        <th>Product Info</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Available Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const productId = product._id || product.id;
                        return (
                          <tr key={productId}>
                            <td>
                              <div className="user-cell" style={{ cursor: 'pointer' }} onClick={() => handleProductClick(product)}>
                                <div className="store-avatar-box">
                                  {(() => {
                                    const rawImage = (product.images && product.images.length > 0)
                                      ? product.images[0]
                                      : product.imageUrl || product.image;
                                    if (!rawImage) {
                                      return <span>{product.title ? product.title.charAt(0).toUpperCase() : 'P'}</span>;
                                    }
                                    const cleanPath = String(rawImage).replace(/\\/g, '/');
                                    let imageSrc = cleanPath;
                                    if (!cleanPath.startsWith('http://') && !cleanPath.startsWith('https://')) {
                                      const pathWithLeadingSlash = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
                                      imageSrc = `http://localhost:4000${pathWithLeadingSlash}`;
                                    }
                                    return (
                                      <img
                                        src={imageSrc}
                                        alt={product.title || 'Product'}
                                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    );
                                  })()}
                                </div>
                                <div>
                                  <strong className="user-name" style={{ color: '#4f46e5', textDecoration: 'underline' }}>{product.title}</strong>
                                  <span className="user-subtext">ID: {productId}</span>
                                </div>
                              </div>
                            </td>
                            <td>{product.category}</td>
                            <td><strong className="text-dark">${Number(product.price).toFixed(2)}</strong></td>
                            <td>
                              <span className={product.stock <= 5 ? 'text-danger fw-bold' : ''}>
                                {product.stock} units
                              </span>
                            </td>
                            <td>
                              <span className={`badge-pill status-${product.stock > 0 ? 'active' : 'blocked'}`}>
                                <span className="status-indicator-dot"></span>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-table-action" onClick={() => setEditingProduct({ ...product })}>
                                  Edit Price/Stock
                                </button>
                                <button className="btn-control-toggle danger" onClick={() => handleDeleteProduct(productId)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'add-product' && (
            <AddProductPage />
          )}

          {activeTab === 'product-detail' && selectedProduct && (
            <div className="tab-panel fade-in">
              <div style={{ marginBottom: '16px' }}>
                <button 
                  className="btn-outline-sm" 
                  onClick={() => { setActiveTab('inventory'); setSelectedProduct(null); }}
                >
                  &larr; Back to Inventory
                </button>
              </div>
              <div className="split-main-card full-width" style={{ padding: '24px', background: '#fff', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
                  <div className="store-avatar-box" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
                    {selectedProduct.imageUrl ? (
                      <img src={selectedProduct.imageUrl} alt={selectedProduct.title} style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }} />
                    ) : (
                      selectedProduct.title.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2>Orders & Tracking Breakdown: <span style={{ color: '#4f46e5' }}>{selectedProduct.title}</span></h2>
                    <p className="card-subtitle">Product ID: {selectedProduct._id || selectedProduct.id} | Unit Price: ${selectedProduct.price} | Stock Left: {selectedProduct.stock}</p>
                  </div>
                </div>
                <h3>Ordered Items Breakdown</h3>
                <div className="table-responsive">
                  <table className="enhanced-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Quantity Ordered</th>
                        <th>Fulfillment Status</th>
                        <th>Tracking ID</th>
                        <th>Estimated Delivery Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productOrders.map((ord, index) => (
                        <tr key={ord.id || index}>
                          <td><strong>{ord.id}</strong></td>
                          <td>{ord.buyer}</td>
                          <td><strong>{ord.quantityOrdered} units</strong></td>
                          <td>
                            <span className="badge-pill status-active" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                              {ord.status}
                            </span>
                          </td>
                          <td><code>{ord.trackingNo}</code></td>
                          <td>{ord.estimatedDelivery}</td> 
                        </tr>
                      ))}
                      {productOrders.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#777' }}>
                            No active orders found for this product.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #f1f5f9' }}>
                  <ProductReviews 
                    productId={selectedProduct._id || selectedProduct.id} 
                    productTitle={selectedProduct.title} 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="tab-panel fade-in">
              <div className="kpi-grid">
                <div className="kpi-card hover-lift">
                  <div className="kpi-content">
                    <div className="kpi-header"><span className="kpi-title">Total Revenue</span></div>
                    <div className="kpi-body"><span className="kpi-number text-success">${analyticsData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                  </div>
                  <div className="kpi-side-bar bg-green"></div>
                </div>
                <div className="kpi-card hover-lift">
                  <div className="kpi-content">
                    <div className="kpi-header"><span className="kpi-title">Total Orders</span></div>
                    <div className="kpi-body"><span className="kpi-number">{analyticsData.totalOrders}</span></div>
                  </div>
                  <div className="kpi-side-bar bg-blue"></div>
                </div>
                <div className="kpi-card hover-lift">
                  <div className="kpi-content">
                    <div className="kpi-header"><span className="kpi-title">Units Sold</span></div>
                    <div className="kpi-body"><span className="kpi-number">{analyticsData.unitsSold}</span></div>
                  </div>
                  <div className="kpi-side-bar bg-purple"></div>
                </div>
                <div className="kpi-card hover-lift">
                  <div className="kpi-content">
                    <div className="kpi-header"><span className="kpi-title">Avg Order Value</span></div>
                    <div className="kpi-body"><span className="kpi-number text-dark">${analyticsData.avgOrderValue ? analyticsData.avgOrderValue.toFixed(2) : '0.00'}</span></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
                <div className="split-main-card" style={{ background: '#fff', borderRadius: '12px', padding: '20px' }}>
                  <h3>Revenue Performance Overview</h3>
                  <div style={{ height: '300px', marginTop: '16px' }}>
                    <Line data={lineChartData} options={lineChartOptions} />
                  </div>
                </div>
                <div className="split-main-card" style={{ background: '#fff', borderRadius: '12px', padding: '20px' }}>
                  <h3>Sales by Category</h3>
                  <div style={{ height: '260px', marginTop: '16px' }}>
                    <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="tab-panel fade-in">
              <div className="split-main-card full-width">
                <div className="card-header-flex">
                  <div>
                    <h3>Product Order Status & Tracking</h3>
                    <p className="card-subtitle">Global tracking matrix for all fulfillment actions</p>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="enhanced-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Quantity Ordered</th>
                        <th>Status</th>
                        <th>Tracking ID</th>
                        <th>Delivery Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(customerOrders.length > 0 ? customerOrders : products).map((item) => {
                        const itemId = item.id || item._id;
                        const statusVal = item.status || 'Processing';
                        const trackingVal = item.trackingNo || 'Pending';
                        const deliveryVal = item.estimatedDelivery || 'TBD';
                        return (
                          <tr key={itemId + (item.orderId || '')}>
                            <td>
                              <strong>{item.title || item.name}</strong>
                              <br />
                              <small className="user-subtext">Order ID: #{item.orderId || itemId}</small>
                            </td>
                            <td>{item.stock || item.quantity || 1} units</td>
                            <td>
                              <select
                                className="category-filter-select"
                                value={statusVal}
                                onChange={(e) => handleUpdateStatus(itemId, e.target.value, trackingVal, deliveryVal, item.orderId)}
                              >
                                <option value="Processing">Processing</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Out of Stock">Out of Stock</option>
                              </select>
                            </td>
                            <td><code>{trackingVal}</code></td>
                            <td>{deliveryVal}</td>
                            <td>
                              <button
                                className="btn-table-action"
                                onClick={() => {
                                  const track = prompt('Enter new Tracking ID:', trackingVal === 'Pending' ? 'TRK' + Math.floor(100000000 + Math.random() * 900000000) : trackingVal);
                                  const date = prompt('Enter Estimated Delivery Date (YYYY-MM-DD):', deliveryVal === 'TBD' ? '2026-10-25' : deliveryVal);
                                  if (track !== null && date !== null) {
                                    handleUpdateStatus(itemId, statusVal, track, date, item.orderId);
                                  }
                                }}
                              >
                                Update Tracking
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {editingProduct && (
        <div className="modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Update Product: {editingProduct.title}</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setEditingProduct(null)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateProductSubmit} className="settings-form" style={{ marginTop: '16px' }}>
              <div className="setting-field">
                <label>Unit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                />
              </div>
              <div className="setting-field">
                <label>Available Stock</label>
                <input
                  type="number"
                  required
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn-outline-sm" onClick={() => setEditingProduct(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;