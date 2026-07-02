import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, ShoppingBag, User, Menu, ChevronRight, Filter, Star } from 'lucide-react';
import { publicAxios } from '../api/axios';

const IntegratedCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    categories: true,
    subcategories: false,
    subsubcategories: false,
    products: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // API URLs
  const API_ENDPOINTS = {
    CATEGORIES: 'ecommerce/public/categories/',
    SUBCATEGORIES: 'ecommerce/public/subcategories/',
    SUBSUBCATEGORIES: 'ecommerce/public/subsubcategories/',
    PRODUCTS: 'ecommerce/public/products/'
  };

  // Fetch all main categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      setError(null);

      const response = await publicAxios.get(API_ENDPOINTS.CATEGORIES);
      console.log('Categories API Response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        const formattedCategories = response.data.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          icon_url: cat.icon_url,
          product_count: cat.product_count || 0,
          description: cat.description || '',
          status: cat.status,
          sub_categories: []
        }));

        setCategories(formattedCategories);

        // Auto-select first category if available
        if (formattedCategories.length > 0 && !selectedCategory) {
          handleCategorySelect(formattedCategories[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
      loadFallbackCategories();
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const loadFallbackCategories = () => {
    const fallbackCategories = [
      {
        id: 1,
        name: "Electronics",
        icon: null,
        icon_url: null,
        product_count: 50,
        sub_categories: []
      },
      {
        id: 2,
        name: "Fashion",
        icon: null,
        icon_url: null,
        product_count: 100,
        sub_categories: []
      }
    ];
    setCategories(fallbackCategories);
    if (fallbackCategories.length > 0) {
      handleCategorySelect(fallbackCategories[0]);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setSelectedSubSubCategory(null);
    setProducts([]);
    
    // Fetch subcategories for selected category
    await fetchSubCategories(category.id);
    
    // Fetch products for this category
    fetchProductsByCategory(category.id);
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      setLoading(prev => ({ ...prev, subcategories: true }));
      
      const response = await publicAxios.get(API_ENDPOINTS.SUBCATEGORIES, {
        params: { category: categoryId }
      });

      console.log('SubCategories API Response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        const formattedSubCategories = response.data.map(subCat => ({
          id: subCat.id,
          name: subCat.name,
          icon: subCat.icon,
          icon_url: subCat.icon_url,
          product_count: subCat.product_count || 0,
          category_id: subCat.category || categoryId,
          sub_sub_categories: []
        }));

        // Update categories with subcategories
        setCategories(prev => prev.map(cat => {
          if (cat.id === categoryId) {
            return { ...cat, sub_categories: formattedSubCategories };
          }
          return cat;
        }));

        // Auto-select first subcategory
        if (formattedSubCategories.length > 0) {
          handleSubCategorySelect(formattedSubCategories[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    } finally {
      setLoading(prev => ({ ...prev, subcategories: false }));
    }
  };

  const handleSubCategorySelect = async (subCategory) => {
    setSelectedSubCategory(subCategory);
    setSelectedSubSubCategory(null);
    
    // Fetch sub-subcategories for selected subcategory
    await fetchSubSubCategories(subCategory.id);
    
    // Fetch products for this subcategory
    fetchProductsBySubCategory(subCategory.id);
  };

  const fetchSubSubCategories = async (subCategoryId) => {
    try {
      setLoading(prev => ({ ...prev, subsubcategories: true }));
      
      const response = await publicAxios.get(API_ENDPOINTS.SUBSUBCATEGORIES, {
        params: { subcategory: subCategoryId }
      });

      console.log('SubSubCategories API Response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        const formattedSubSubCategories = response.data.map(subSubCat => ({
          id: subSubCat.id,
          name: subSubCat.name,
          icon: subSubCat.icon,
          icon_url: subSubCat.icon_url,
          product_count: subSubCat.product_count || 0,
          subcategory_id: subSubCat.subcategory || subCategoryId
        }));

        // Update categories with child categories
        setCategories(prev => prev.map(cat => {
          if (selectedCategory && cat.id === selectedCategory.id && cat.sub_categories) {
            return {
              ...cat,
              sub_categories: cat.sub_categories.map(subCat => {
                if (subCat.id === subCategoryId) {
                  return { ...subCat, sub_sub_categories: formattedSubSubCategories };
                }
                return subCat;
              })
            };
          }
          return cat;
        }));

        // Auto-select first sub-subcategory
        if (formattedSubSubCategories.length > 0) {
          handleSubSubCategorySelect(formattedSubSubCategories[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching sub-subcategories:', err);
    } finally {
      setLoading(prev => ({ ...prev, subsubcategories: false }));
    }
  };

  const handleSubSubCategorySelect = (subSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
    fetchProductsBySubSubCategory(subSubCategory.id);
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      
      const response = await publicAxios.get(API_ENDPOINTS.PRODUCTS, {
        params: { category: categoryId, status: 'approved' }
      });

      console.log('Products by Category API Response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Error fetching products by category:', err);
      loadFallbackProducts();
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchProductsBySubCategory = async (subCategoryId) => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      
      const response = await publicAxios.get(API_ENDPOINTS.PRODUCTS, {
        params: { subcategory: subCategoryId, status: 'approved' }
      });

      console.log('Products by SubCategory API Response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Error fetching products by subcategory:', err);
      loadFallbackProducts();
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchProductsBySubSubCategory = async (subSubCategoryId) => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      
      const response = await publicAxios.get(API_ENDPOINTS.PRODUCTS, {
        params: { subsubcategory: subSubCategoryId, status: 'approved' }
      });

      console.log('Products by SubSubCategory API Response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Error fetching products by sub-subcategory:', err);
      loadFallbackProducts();
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const loadFallbackProducts = () => {
    const fallbackProducts = [
      {
        id: 1,
        product_name: "Sample Product 1",
        selling_price: 999,
        mrp: 1299,
        final_price: 999,
        thumbnail_image: null,
        main_image: null,
        brand: { brand_name: "Sample Brand" },
        vendor: { business_name: "Sample Vendor" },
        rating: 4.2,
        status: 'approved'
      }
    ];
    setProducts(fallbackProducts);
  };

  const getIconUrl = (item) => {
    if (item && item.icon_url) {
      return item.icon_url;
    }
    if (item && item.icon && typeof item.icon === 'string') {
      return `https://api.initcart.in${item.icon}`;
    }
    return null;
  };

  const getFallbackIcon = (name) => {
    if (!name) return "📦";
    
    const iconMap = {
      "electronics": "📱",
      "fashion": "👗",
      "home": "🏠",
      "kitchen": "🍳",
      "beauty": "💄",
      "sports": "⚽",
      "books": "📚",
      "grocery": "🛒",
      "mobile": "📱",
      "laptop": "💻",
      "furniture": "🛋️",
      "clothing": "👕",
      "shoes": "👟",
      "watches": "⌚",
      "jewellery": "💎",
    };

    const nameLower = name.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (nameLower.includes(key)) {
        return icon;
      }
    }
    return "📦";
  };

  const renderRating = (rating) => {
    if (!rating) return null;
    
    const roundedRating = Math.round(rating * 10) / 10;
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        marginBottom: '6px'
      }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={12} 
            fill={star <= Math.round(rating) ? "#FFD700" : "#E5E7EB"} 
            color={star <= Math.round(rating) ? "#FFD700" : "#E5E7EB"}
          />
        ))}
        <span style={{ fontSize: '12px', color: '#666', marginLeft: '4px' }}>
          ({roundedRating})
        </span>
      </div>
    );
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  const isCategorySelected = (category) => {
    return selectedCategory && selectedCategory.id === category.id;
  };

  const isSubCategorySelected = (subCategory) => {
    return selectedSubCategory && selectedSubCategory.id === subCategory.id;
  };

  const isSubSubCategorySelected = (subSubCategory) => {
    return selectedSubSubCategory && selectedSubSubCategory.id === subSubCategory.id;
  };

  if (loading.categories) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: '"Poppins", sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>⏳</div>
          <p style={{ marginTop: '20px', color: '#666' }}>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: '"Poppins", sans-serif',
      paddingBottom: '60px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#131921',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <Home size={22} />
          </button>
          <div>
            <div style={{ fontSize: '12px', color: '#CCCCCC' }}>Browse</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Categories</div>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/cart')}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          <ShoppingBag size={22} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#FEF3F2',
          border: '1px solid #FDA29B',
          borderRadius: '8px',
          padding: '12px 16px',
          margin: '12px',
          color: '#B42318'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '18px' }}>⚠️</div>
            <div>
              <div style={{ fontWeight: '500' }}>{error}</div>
              <button 
                onClick={fetchCategories}
                style={{
                  marginTop: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#B42318',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{
        backgroundColor: '#232F3E',
        padding: '10px 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '0 12px' }}>
            <Search size={18} color="#666" />
          </div>
          <input
            type="text"
            placeholder="Search in categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              padding: '12px 0',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 130px)' }}>
        {/* Left Sidebar - Main Categories */}
        <div style={{
          width: '30%',
          maxWidth: '200px',
          backgroundColor: '#f8f8f8',
          borderRight: '1px solid #e0e0e0',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '10px 0' }}>
            <div style={{ padding: '0 16px 12px', borderBottom: '1px solid #e0e0e0' }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#333',
                margin: 0
              }}>
                All Categories
              </h3>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {categories.length} categories
              </div>
            </div>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: isCategorySelected(category) ? '#ffffff' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderLeft: isCategorySelected(category) ? '4px solid #FF9900' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  fontSize: '20px', 
                  marginRight: '12px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  {getIconUrl(category) ? (
                    <img 
                      src={getIconUrl(category)} 
                      alt={category.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '18px' }}>
                      {getFallbackIcon(category.name)}
                    </span>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: isCategorySelected(category) ? '600' : '500',
                    color: isCategorySelected(category) ? '#000000' : '#333333',
                    textAlign: 'left'
                  }}>
                    {category.name}
                  </div>
                  {category.product_count > 0 && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#666666',
                      marginTop: '2px'
                    }}>
                      {category.product_count} products
                    </div>
                  )}
                </div>
                
                {loading.subcategories && isCategorySelected(category) && (
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #FF9900',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ 
          flex: 1, 
          padding: '16px',
          overflowY: 'auto',
          backgroundColor: '#ffffff'
        }}>
          {selectedCategory && (
            <>
              {/* Category Header */}
              <div style={{ 
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    backgroundColor: '#e3f2fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {getIconUrl(selectedCategory) ? (
                      <img 
                        src={getIconUrl(selectedCategory)} 
                        alt={selectedCategory.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span style={{ fontSize: '24px', display: getIconUrl(selectedCategory) ? 'none' : 'block' }}>
                      {getFallbackIcon(selectedCategory.name)}
                    </span>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h1 style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold',
                      margin: 0,
                      color: '#1a1a1a'
                    }}>
                      {selectedCategory.name}
                    </h1>
                    {selectedCategory.description && (
                      <p style={{ 
                        fontSize: '13px', 
                        color: '#666',
                        marginTop: '4px',
                        marginBottom: 0
                      }}>
                        {selectedCategory.description}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => fetchProductsByCategory(selectedCategory.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#FF9900',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Filter size={16} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Sub-Categories Section */}
              {selectedCategory.sub_categories && selectedCategory.sub_categories.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h2 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600',
                      margin: 0,
                      color: '#333'
                    }}>
                      Sub-Categories
                    </h2>
                    <span style={{ fontSize: '13px', color: '#666' }}>
                      {selectedCategory.sub_categories.length} sub-categories
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '12px'
                  }}>
                    {selectedCategory.sub_categories.map((subCat) => (
                      <button
                        key={subCat.id}
                        onClick={() => handleSubCategorySelect(subCat)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '16px 12px',
                          backgroundColor: isSubCategorySelected(subCat) ? '#e8f4ff' : '#f8f9fa',
                          border: isSubCategorySelected(subCat) ? '2px solid #007bff' : '1px solid #e0e0e0',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ 
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: isSubCategorySelected(subCat) ? '#d1e7ff' : '#e9ecef',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '10px',
                          overflow: 'hidden'
                        }}>
                          {getIconUrl(subCat) ? (
                            <img 
                              src={getIconUrl(subCat)} 
                              alt={subCat.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <span style={{ 
                            fontSize: '20px',
                            display: getIconUrl(subCat) ? 'none' : 'block'
                          }}>
                            {getFallbackIcon(subCat.name)}
                          </span>
                        </div>
                        
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: '500',
                          color: isSubCategorySelected(subCat) ? '#007bff' : '#333',
                          textAlign: 'center',
                          marginBottom: '6px'
                        }}>
                          {subCat.name}
                        </div>
                        
                        {subCat.product_count > 0 && (
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#666',
                            backgroundColor: isSubCategorySelected(subCat) ? '#d1e7ff' : '#e9ecef',
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}>
                            {subCat.product_count} products
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Sub-Categories Section */}
              {selectedSubCategory && selectedSubCategory.sub_sub_categories && selectedSubCategory.sub_sub_categories.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h2 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600',
                      margin: 0,
                      color: '#333'
                    }}>
                      {selectedSubCategory.name} - Sub Categories
                    </h2>
                    <span style={{ fontSize: '13px', color: '#666' }}>
                      {selectedSubCategory.sub_sub_categories.length} categories
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    {selectedSubCategory.sub_sub_categories.map((subSubCat) => (
                      <button
                        key={subSubCat.id}
                        onClick={() => handleSubSubCategorySelect(subSubCat)}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: isSubSubCategorySelected(subSubCat) ? '#007bff' : '#f8f9fa',
                          color: isSubSubCategorySelected(subSubCat) ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {getIconUrl(subSubCat) ? (
                          <img 
                            src={getIconUrl(subSubCat)} 
                            alt={subSubCat.name}
                            style={{ 
                              width: '16px', 
                              height: '16px',
                              borderRadius: '4px',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <span style={{ display: getIconUrl(subSubCat) ? 'none' : 'block' }}>
                          {getFallbackIcon(subSubCat.name)}
                        </span>
                        {subSubCat.name}
                        {subSubCat.product_count > 0 && (
                          <span style={{ 
                            fontSize: '11px',
                            marginLeft: '4px',
                            opacity: 0.8
                          }}>
                            ({subSubCat.product_count})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Section */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600',
                    margin: 0,
                    color: '#333'
                  }}>
                    {selectedSubSubCategory 
                      ? `${selectedSubSubCategory.name} Products`
                      : selectedSubCategory
                      ? `${selectedSubCategory.name} Products`
                      : `${selectedCategory.name} Products`
                    }
                  </h2>
                  
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {loading.products ? (
                      <span>Loading products...</span>
                    ) : (
                      <span>{products.length} products found</span>
                    )}
                  </div>
                </div>

                {loading.products ? (
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '16px'
                  }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div 
                        key={i}
                        style={{
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          height: '280px',
                          animation: 'pulse 1.5s infinite'
                        }}
                      ></div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '16px'
                  }}>
                    {products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e0e0e0',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* Product Image */}
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          height: '160px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          {product.thumbnail_image || product.main_image ? (
                            <img 
                              src={product.thumbnail_image || product.main_image} 
                              alt={product.product_name}
                              style={{ 
                                width: '100%', 
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: (product.thumbnail_image || product.main_image) ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '48px',
                            backgroundColor: '#e9ecef'
                          }}>
                            {getFallbackIcon(product.product_name)}
                          </div>
                          
                          {/* Status Badge */}
                          {product.status === 'approved' && (
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: '600',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              Approved
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div style={{ padding: '12px' }}>
                          <h3 style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#333333',
                            margin: 0,
                            marginBottom: '8px',
                            height: '36px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {product.product_name}
                          </h3>
                          
                          {/* Brand */}
                          {product.brand && product.brand.brand_name && (
                            <div style={{
                              fontSize: '11px',
                              color: '#666',
                              marginBottom: '6px'
                            }}>
                              {product.brand.brand_name}
                            </div>
                          )}
                          
                          {/* Rating */}
                          {product.rating && renderRating(product.rating)}
                          
                          {/* Price */}
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: 'bold',
                              color: '#B12704'
                            }}>
                              {formatPrice(product.final_price || product.selling_price)}
                            </div>
                            {product.mrp && product.mrp > (product.final_price || product.selling_price) && (
                              <div style={{
                                fontSize: '12px',
                                color: '#666',
                                textDecoration: 'line-through',
                                marginTop: '2px'
                              }}>
                                {formatPrice(product.mrp)}
                              </div>
                            )}
                          </div>
                          
                          {/* Vendor */}
                          {product.vendor && product.vendor.business_name && (
                            <div style={{
                              fontSize: '11px',
                              color: '#666',
                              marginBottom: '10px'
                            }}>
                              By {product.vendor.business_name}
                            </div>
                          )}
                          
                          {/* Add to Cart Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Added ${product.product_name} to cart`);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px',
                              backgroundColor: '#FFD814',
                              border: '1px solid #FCD200',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              color: '#0F1111'
                            }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px dashed #dee2e6'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '8px'
                    }}>
                      No Products Found
                    </h3>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#666',
                      marginBottom: '20px'
                    }}>
                      {selectedSubSubCategory 
                        ? `No products available in "${selectedSubSubCategory.name}"`
                        : selectedSubCategory
                        ? `No products available in "${selectedSubCategory.name}"`
                        : `No products available in "${selectedCategory.name}"`
                      }
                    </p>
                    <button
                      onClick={() => {
                        if (selectedSubSubCategory) {
                          fetchProductsBySubSubCategory(selectedSubSubCategory.id);
                        } else if (selectedSubCategory) {
                          fetchProductsBySubCategory(selectedSubCategory.id);
                        } else {
                          fetchProductsByCategory(selectedCategory.id);
                        }
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Refresh Products
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

  

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default IntegratedCategoryPage;