import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicAxios, axiosInstance } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const GroceryDeals = () => {
  const [start, setStart] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Modal States and Constants ---
  const [modalProduct, setModalProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const TRANSITION_DURATION = 300;

  // Add to cart related
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // Fetch grocery products from API
  useEffect(() => {
    const fetchGroceryProducts = async () => {
      try {
        setLoading(true);
        const categoriesResponse = await publicAxios.get("/ecommerce/public/categories/");
        const categories = categoriesResponse.data;

        const groceryCategory = categories.find(cat =>
          cat.name.toLowerCase().includes("electronic")
        );

        if (groceryCategory) {
          const productsResponse = await publicAxios.get("/ecommerce/public/category-products/", {
            params: {
              category: groceryCategory.id,
              status: "approved"
            }
          });

          if (productsResponse.data && productsResponse.data.results) {
            setProducts(productsResponse.data.results);
          } else {
            setProducts(productsResponse.data || []);
          }
        } else {
          const response = await publicAxios.get("/ecommerce/public/products/", {
            params: {
              status: "approved",
              limit: 10
            }
          });

          if (response.data && response.data.results) {
            setProducts(response.data.results);
          } else {
            setProducts(response.data || []);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroceryProducts();
  }, []);

  // Format price with discount calculation
  const formatProductData = (product) => {
    let minPrice = null;
    let maxPrice = null;

    if (product.stocks && product.stocks.length > 0) {
      const prices = product.stocks.map(stock => {
        const sellingPrice = parseFloat(stock.selling_price) || 0;
        const mrp = parseFloat(stock.mrp) || sellingPrice;

        return {
          sellingPrice,
          mrp
        };
      });

      minPrice = Math.min(...prices.map(p => p.sellingPrice));
      maxPrice = Math.max(...prices.map(p => p.sellingPrice));
    } else {
      minPrice = 0;
      maxPrice = 0;
    }

    return {
      id: product.id,
      title: product.product_name,
      oldPrice: maxPrice,
      newPrice: minPrice,
      img: product.main_image || product.thumbnail_image || "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80",
      productData: product
    };
  };

  // Format all products
  const formattedProducts = useMemo(() => {
    return products.map(formatProductData);
  }, [products]);

  // Responsive item count
  useEffect(() => {
    const updateItemsPerView = () => {
      const w = window.innerWidth;
      if (w >= 1280) setItemsPerView(4);
      else if (w >= 1024) setItemsPerView(3);
      else if (w >= 640) setItemsPerView(2);
      else setItemsPerView(1);
    };
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // Auto scroll - sirf agar products hain
  useEffect(() => {
    if (formattedProducts.length === 0) return;

    const id = setInterval(
      () => setStart((s) => (s + 1) % formattedProducts.length),
      7000
    );
    return () => clearInterval(id);
  }, [formattedProducts.length]);

  // Visible products
  const visible = useMemo(() => {
    if (formattedProducts.length === 0) return [];

    const out = [];
    for (let i = 0; i < Math.min(itemsPerView, formattedProducts.length); i++) {
      out.push(formattedProducts[(start + i) % formattedProducts.length]);
    }
    return out;
  }, [start, itemsPerView, formattedProducts]);

  const prev = () => {
    if (formattedProducts.length === 0) return;
    setStart((s) => (s - 1 + formattedProducts.length) % formattedProducts.length);
  };

  const next = () => {
    if (formattedProducts.length === 0) return;
    setStart((s) => (s + 1) % formattedProducts.length);
  };

  // --- ADD TO CART FUNCTION ---
  const addToCart = async (productStockId, quantity = 1) => {
    try {
      if (!isAuthenticated()) {
        addToast('Please login to add items to cart', 'warning');
        sessionStorage.setItem('pendingCartProduct', JSON.stringify({
          productStockId: productStockId,
          quantity: quantity
        }));
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        setShowLoginModal(true);
        return;
      }

      const response = await axiosInstance.post('api/public/cart/', {
        product_stock: productStockId,
        quantity: quantity
      });

      if (response.data.success) {
        addToast('Added to cart successfully!', 'success');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          addToast('Session expired. Please login again.', 'error');
          navigate('/customer/login');
        } else if (status === 400) {
          addToast(data.message || 'Invalid request', 'error');
        } else if (status === 404) {
          addToast('Product not found or out of stock', 'error');
        } else {
          addToast('Failed to add to cart. Please try again.', 'error');
        }
      } else {
        addToast('Network error. Please check your connection.', 'error');
      }

      throw error;
    }
  };

  // ✅ BUY NOW FUNCTION (Product Detail page जैसा)
  const handleBuyNow = async (productStockId, quantity = 1) => {
    try {
      if (!isAuthenticated()) {
        addToast('Please login to proceed with purchase', 'warning');
        sessionStorage.setItem('pendingCartProduct', JSON.stringify({
          productStockId: productStockId,
          quantity: quantity
        }));
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        setShowLoginModal(true);
        return;
      }

      // First add to cart
      await addToCart(productStockId, quantity);
      
      // Then navigate to checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Buy now error:', error);
    }
  };

  // --- HANDLE ADD TO CART CLICK ---
  const handleAddToCartClick = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const productStockId = product.productData.stocks && product.productData.stocks.length > 0
        ? product.productData.stocks[0].id
        : null;

      if (!productStockId) {
        addToast('Product stock not available', 'error');
        return;
      }

      await addToCart(productStockId, 1);
    } catch (error) {
      console.error('❌ Add to cart error:', error);
    }
  };

  // ✅ HANDLE BUY NOW CLICK (Product Detail page जैसा)
  const handleBuyNowClick = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const productStockId = product.productData.stocks && product.productData.stocks.length > 0
        ? product.productData.stocks[0].id
        : null;

      if (!productStockId) {
        addToast('Product stock not available', 'error');
        return;
      }

      await handleBuyNow(productStockId, 1);
    } catch (error) {
      console.error('❌ Buy now error:', error);
    }
  };

  // --- MODAL LOGIC ---
  const openModal = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalProduct(product);
    setTimeout(() => setIsModalOpen(true), 10);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalProduct(null), TRANSITION_DURATION);
  };

  // Login Modal Component
  const LoginModal = ({ isOpen, onClose, onLogin, onRegister }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⚠</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              ✗
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            You need to login to add items to cart. Please login or create an account.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onLogin}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login Now
            </button>

            <button
              onClick={onRegister}
              className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Create New Account
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 text-gray-500 hover:text-gray-700 transition"
            >
              Continue browsing
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ Login modal handlers
  const handleLoginClick = () => {
    setShowLoginModal(false);
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/customer/login', {
      state: { from: window.location.pathname }
    });
  };

  const handleRegisterClick = () => {
    setShowLoginModal(false);
    navigate('/customer/registration', {
      state: { from: window.location.pathname }
    });
  };

  // Quick View Modal Component
  const QuickViewModal = () => {
    if (!modalProduct) return null;

    const price = modalProduct.newPrice.toFixed(2);
    const oldPrice = modalProduct.oldPrice.toFixed(2);
    const productData = modalProduct.productData;
    const [quantity, setQuantity] = useState(1);

    const backdropClass = `fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0'} ${isModalOpen ? 'bg-black/40' : 'bg-black/0'}`;
    const modalContentClass = `w-11/12 max-w-2xl rounded-lg bg-white p-6 shadow-2xl transition-all duration-300 transform ${isModalOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'}`;

    const handleDecrease = () => {
      setQuantity(prev => Math.max(1, prev - 1));
    };

    const handleIncrease = () => {
      const maxQuantity = productData.stocks && productData.stocks.length > 0
        ? productData.stocks[0].maximum_order_quantity || 10
        : 10;
      setQuantity(prev => Math.min(maxQuantity, prev + 1));
    };

    const handleModalAddToCartClick = async () => {
      const productStockId = productData.stocks && productData.stocks.length > 0
        ? productData.stocks[0].id
        : null;

      if (productStockId) {
        try {
          await addToCart(productStockId, quantity);
          closeModal();
        } catch (error) {
          console.error('Modal add to cart error:', error);
        }
      }
    };

    // ✅ MODAL BUY NOW FUNCTION
    const handleModalBuyNowClick = async () => {
      const productStockId = productData.stocks && productData.stocks.length > 0
        ? productData.stocks[0].id
        : null;

      if (productStockId) {
        try {
          await handleBuyNow(productStockId, quantity);
          closeModal();
        } catch (error) {
          console.error('Modal buy now error:', error);
        }
      }
    };

    return (
      <div
        className={backdropClass}
        onClick={closeModal}
      >
        <div
          className={modalContentClass}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Quick View: {modalProduct.title}</h3>
            <button
              onClick={closeModal}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-6">
            <div className="w-1/2 flex flex-col items-center">
              <img
                src={modalProduct.img}
                alt={modalProduct.title}
                className="w-full h-56 object-contain rounded-lg border border-gray-200"
              />
            </div>

            <div className="w-1/2">
              <p className="text-sm text-gray-500">
                Vendor: {productData.vendor_details?.business_name || 'N/A'}
              </p>
              <div className="flex items-center mt-2">
                <p className="text-3xl font-semibold text-blue-600">${price}</p>
                {modalProduct.oldPrice > modalProduct.newPrice && (
                  <p className="ml-2 text-sm text-gray-500 line-through">${oldPrice}</p>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-2">
                {productData.short_description || 'No description available'}
              </p>

              <div className="flex items-center mt-4 border border-gray-300 w-28 rounded-md">
                <button
                  onClick={handleDecrease}
                  className="p-1.5 cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-full text-center border-l border-r border-gray-300 py-1.5 text-sm font-medium"
                />
                <button
                  onClick={handleIncrease}
                  className="p-1.5 cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Total Price: <strong>${(modalProduct.newPrice * quantity).toFixed(2)}</strong>
              </p>

              <div className="flex gap-2 mt-6">
                {/*  MODAL BUY NOW BUTTON - WORKING */}
                <button
                  onClick={handleModalBuyNowClick}
                  className="flex-1 rounded-md bg-orange-500 py-2 text-white font-medium hover:bg-orange-600 transition text-sm"
                >
                  Buy now
                </button>
                
                <button
                  onClick={handleModalAddToCartClick}
                  className="flex-1 rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 transition text-sm"
                >
                  Add to cart
                </button>
                
                <button className="p-3 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition" aria-label="Add to wishlist">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="bg-white rounded-lg p-6 mt-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">electronic</h2>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg p-4 h-64"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-lg p-6 mt-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">electronic</h2>
        </div>
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      </section>
    );
  }

  if (formattedProducts.length === 0) {
    return (
      <section className="bg-white rounded-lg p-6 mt-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">electronic</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          No electronic products available at the moment.
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg p-6 mt-8 shadow-lg group">
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginClick}
        onRegister={handleRegisterClick}
      />

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">electronic</h2>
          <p className="text-sm text-gray-600">
            {formattedProducts.length} products available
          </p>
        </div>
        <Link
          to="/category-products?category=1"
          className="text-sm text-blue-700 hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Slider Container */}
      <div className="relative flex-1 overflow-hidden group/slider">
        <div
          className="grid transition-all duration-300"
          style={{
            gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
            gap: "1.5rem",
          }}
        >
          {visible.map((product) => (
            <div
              key={product.id}
              className="relative bg-white border border-blue-400 rounded-lg shadow-sm p-4 flex flex-col hover:shadow-lg hover:border-blue-500 transition-all duration-300 group/card"
              style={{
                minHeight: "320px",
                borderWidth: "1px",
              }}
            >
              {/* Top Left Curved Triangle */}
              <svg
                className="absolute top-0 left-0 z-10"
                width="40"
                height="40"
                viewBox="0 0 40 40"
              >
                <path
                  d="M0 0 H40 Q5 1 0 40 "
                  fill="#2563eb"
                />
              </svg>
              
              {/* Blue Overlay on hover */}
              <div className="absolute inset-0 rounded-lg bg-blue-50/30 opacity-0 group-hover/card:opacity-100 transition duration-300 pointer-events-none z-10"></div>

              {/* Product Image Container */}
              <div className="h-48 w-full mb-4 relative z-20 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                <Link to={`/productdetail/${product.id}`} className="w-full h-full flex items-center justify-center">
                  <img
                    src={product.img}
                    alt={product.title}
                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover/card:scale-105"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                    }}
                  />
                </Link>

                {/* Quick View Eye Icon */}
                <button
                  onClick={(e) => openModal(product, e)}
                  aria-label="Quick View"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/card:opacity-100 transition duration-300 p-3 rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-lg cursor-pointer z-30 border border-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.009 9.96 7.173.18.529.18.977 0 1.506C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.009-9.96-7.173z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-grow">
                <Link to={`/productdetail/${product.id}`} className="group-hover/card:text-blue-600 transition">
                  <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 relative z-20 min-h-[2.5rem]">
                    {product.title}
                  </h4>
                </Link>
                
                <div className="mt-auto relative z-20">
                  <div className="text-sm">
                    {product.oldPrice > product.newPrice ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">
                          ${product.oldPrice.toFixed(2)}
                        </span>
                        <span className="font-bold text-gray-800">
                          ${product.newPrice.toFixed(2)}
                        </span>
                        <span className="ml-2 text-xs text-green-600 font-medium">
                          {Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100)}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-800">
                        ${product.newPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons - Hidden by default, visible on hover */}
                  <div className="flex gap-2 mt-3 opacity-0 group-hover/card:opacity-100 transition duration-300">
                    {/*  BUY NOW BUTTON - WORKING */}
                    <button
                      onClick={(e) => handleBuyNowClick(product, e)}
                      className="flex-1 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition"
                    >
                      Buy Now
                    </button>
                    
                    {/*  ADD TO CART BUTTON - WORKING */}
                    <button
                      onClick={(e) => handleAddToCartClick(product, e)}
                      className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {formattedProducts.length > itemsPerView && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-blue-600 rounded-full p-3 shadow-lg hover:bg-blue-600 hover:text-white opacity-0 group-hover/slider:opacity-100 transition duration-300 z-40 border border-gray-200"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-blue-600 rounded-full p-3 shadow-lg hover:bg-blue-600 hover:text-white opacity-0 group-hover/slider:opacity-100 transition duration-300 z-40 border border-gray-200"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Quick View Modal */}
      {modalProduct && <QuickViewModal />}
    </section>
  );
};

export default GroceryDeals;