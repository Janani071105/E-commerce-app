import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CSS/SellerDashboard.css';
import './CSS/AddProductPage.css';


export default function AddProductPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: 'Electronics',
    price: '',
    mrp: '',
    stock: '',
    description: '',
    features: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages((prevImages) => {
      const combined = [...prevImages, ...files];
      if (combined.length > 10) {
        alert("You can upload a maximum of 10 images in total.");
        return combined.slice(0, 10);
      }
      return combined;
    });
  };
  const handleRemoveImage = (indexToRemove) => {
    setSelectedImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('brand', formData.brand);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('mrp', formData.mrp);
    data.append('stock', formData.stock);
    data.append('description', formData.description);
    
    const featureArray = formData.features.split('\n').filter(f => f.trim() !== '');
    featureArray.forEach(feature => data.append('features', feature));

    selectedImages.forEach(file => {
      data.append('images', file);
    });

    try {
      await axios.post('http://localhost:4000/api/seller/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Product published successfully!');
      navigate('/products'); 
    } catch (err) {
      console.error('Failed to publish product:', err);
      alert('Failed to publish product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-dashboard-container add-product-page-wrapper">
      <div className="dashboard-content-card add-product-card-box">
        <div className="add-product-page-header">
          <div>
            <h2>Add New Product</h2>
            <p>Create a professional description of your product.</p>
          </div>
          <button type="button" onClick={() => navigate('/seller')} className="btn-back-dashboard">
             Back to Dashboard
          </button>
        </div>
        <form onSubmit={handleSubmit} className="add-product-form-layout">
          
          <div className="form-field-group">
            <label>Product Title </label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required  />
          </div>

          <div className="form-row-grid-2">
            <div className="form-field-group">
              <label>Brand / Store Name</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="eg. HexCart Tech" />
            </div>
            <div className="form-field-group">
              <label>Category </label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Furnitures">Furnitures</option>
              </select>
            </div>
          </div>

          <div className="form-row-grid-3">
            <div className="form-field-group">
              <label>Selling Price ($) </label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-field-group">
              <label>M.R.P ($)</label>
              <input type="number" name="mrp" value={formData.mrp} onChange={handleChange}  />
            </div>
            <div className="form-field-group">
              <label>Available Stock </label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required  />
            </div>
          </div>

          <div className="form-field-group">
            <label>Product Description</label>
            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} placeholder="Detailed product description." />
          </div>

          <div className="form-field-group">
            <label>Key Features / Bullet Points (One line per feature)</label>
            <textarea name="features" rows="4" value={formData.features} onChange={handleChange} placeholder="eg 256GB Storage&#10;OLED Display&#10;5G Compatible" />
          </div>

          <div className="image-dropzone-box">
            <label>Product Images (Select image files)</label>
            <input 
              type="file" 
              name="images" 
              multiple 
              accept="image/*" 
              onChange={handleImageChange} 
              className="file-input-control" 
            />
            <div className="image-counter-text">
              ✓ <b>{selectedImages.length}</b> image(s) selected (Maximum 10 allowed)
            </div>
            {selectedImages.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '15px'
              }}>
                {selectedImages.map((file, index) => (
                  <div key={index} style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #ddd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index}`} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: 'rgba(255, 0, 0, 0.85)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        lineHeight: 1
                      }}
                      title="Remove Image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-action-buttons">
            <button type="button" className="btn-cancel-action" onClick={() => navigate('/seller')}>Cancel</button>
            <button type="submit" className="btn-submit-action" disabled={loading}>
              {loading ? 'Publishing...' : 'Save and Publish Product'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}