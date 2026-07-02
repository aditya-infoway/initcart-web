// MobileCategorySlider.jsx - Mobile First Design (2 cards per row)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicAxios, axiosInstance } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiEye, FiShoppingCart, FiChevronRight } from 'react-icons/fi';

const formatPrice = (price) => {
  if (price === null || price === undefined) return 0;
  const num = parseFloat(price);
  return isNaN(num) ? 0 : num;
};

// ================= INFINITE HORIZONTAL SLIDER =================
const CLONE_COUNT = 2; // 2 clones each side

function HorizontalSlider({ items, renderItem, autoIntervalMs = 4000 }) {
  const scrollRef = useRef(null);
  const autoTimer = useRef(null);
  const resumeTimer = useRef(null);
  const isUserActive = useRef(false);
  const isTeleporting = useRef(false);
  const total = items.length;

  // Clone list for infinite scroll
  const displayList = total > 0
    ? [...items.slice(-CLONE_COUNT), ...items, ...items.slice(0, CLONE_COUNT)]
    : [];

  const getStep = useCallback(() => {
    const el = scrollRef.current?.children[0];
    if (!el) return 180;
    return el.offsetWidth + 8;
  }, []);

  const jumpToReal = useCallback(() => {
    const el = scrollRef.current;
    if (!el || total === 0) return;
    isTeleporting.current = true;
    el.scrollLeft = CLONE_COUNT * getStep();
    requestAnimationFrame(() => { isTeleporting.current = false; });
  }, [total, getStep]);

  useEffect(() => {
    if (total > 0) {
      const t = setTimeout(jumpToReal, 60);
      return () => clearTimeout(t);
    }
  }, [total, jumpToReal]);

  // Scroll teleport
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || total === 0) return;

    const onScroll = () => {
      if (isTeleporting.current) return;
      const step = getStep();
      const realStart = CLONE_COUNT * step;
      const realEnd = realStart + total * step;

      if (el.scrollLeft >= realEnd) {
        isTeleporting.current = true;
        el.scrollLeft -= total * step;
        requestAnimationFrame(() => { isTeleporting.current = false; });
      } else if (el.scrollLeft < realStart) {
        isTeleporting.current = true;
        el.scrollLeft += total * step;
        requestAnimationFrame(() => { isTeleporting.current = false; });
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [total, getStep]);

  // Auto scroll
  const startAutoScroll = useCallback(() => {
    clearInterval(autoTimer.current);
    if (!scrollRef.current || total <= 1) return;

    autoTimer.current = setInterval(() => {
      if (!isUserActive.current && scrollRef.current) {
        scrollRef.current.scrollBy({ left: getStep(), behavior: 'smooth' });
      }
    }, autoIntervalMs);
  }, [total, getStep, autoIntervalMs]);

  useEffect(() => {
    if (total > 0) {
      const t = setTimeout(startAutoScroll, 250);
      return () => {
        clearTimeout(t);
        clearInterval(autoTimer.current);
      };
    }
  }, [total, startAutoScroll]);

  // Touch handlers
  const onStart = useCallback(() => {
    isUserActive.current = true;
    clearInterval(autoTimer.current);
    autoTimer.current = null;
    clearTimeout(resumeTimer.current);
  }, []);

  const onMove = useCallback(() => {
    if (!isUserActive.current) return;
    clearTimeout(resumeTimer.current);
  }, []);

  const onEnd = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isUserActive.current = false;
      startAutoScroll();
    }, 2000);
  }, [startAutoScroll]);

  if (total === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto flex gap-2 pb-1"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      onMouseDown={onStart}
      onMouseMove={onMove}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
    >
      <div className="flex gap-2">
        {displayList.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex-shrink-0 w-[48%]">
            {renderItem(item, idx)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ================= CATEGORY CARD =================
function CategoryCard({ product, categoryId, onAddToCart, onQuickView }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  
  // ✅ FIXED: Properly parse numbers
  const finalPrice = parseFloat(product.price) || parseFloat(product.newPrice) || 0;
  const oldPrice = parseFloat(product.original_price) || parseFloat(product.oldPrice) || 0;
  const discount = oldPrice > finalPrice ? Math.round(((oldPrice - finalPrice) / oldPrice) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-2 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Product Image */}
      <div 
        className="relative bg-gray-50 rounded-lg p-2 cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {!imgError && product.img ? (
          <img
            src={product.img}
            alt={product.title}
            className="w-full h-24 object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
        
        {discount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        )}
        
        {/* Quick View Button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
          className="absolute bottom-1 right-1 bg-white/80 p-1 rounded-full shadow-sm"
        >
          <FiEye className="w-3 h-3 text-gray-600" />
        </button>
      </div>

      {/* Product Info */}
      <div className="mt-1.5 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
        <h3 className="text-[11px] font-semibold text-gray-800 line-clamp-2 min-h-[28px]">{product.title}</h3>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-sm font-bold text-blue-600">₹{finalPrice.toFixed(0)}</span>
          {oldPrice > finalPrice && (
            <span className="text-[9px] text-gray-400 line-through">₹{oldPrice.toFixed(0)}</span>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product); }}
        className="mt-1.5 w-full py-1.5 bg-blue-50 rounded-lg text-blue-600 text-[9px] font-semibold flex items-center justify-center gap-1 hover:bg-blue-100 transition"
      >
        <FiShoppingCart className="w-2.5 h-2.5" /> Add to Cart
      </button>
    </div>
  );
}

// ================= MAIN COMPONENT =================
const MobileCategorySlider = ({ category, products: initialProducts, totalProducts }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState(initialProducts || []);
  const [modalProduct, setModalProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const TRANSITION_DURATION = 300;

  // ✅ FIXED: Format products with proper number parsing
  const formattedProducts = products.map(product => {
    // Get price from campaign or stock
    let price = 0;
    let originalPrice = 0;
    
    if (product.campaign_price) {
      price = parseFloat(product.campaign_price);
      originalPrice = parseFloat(product.campaign_details?.original_price) || 0;
    } else if (product.stocks && product.stocks.length > 0) {
      price = parseFloat(product.stocks[0].selling_price) || 0;
      originalPrice = parseFloat(product.stocks[0].mrp) || 0;
    } else {
      price = parseFloat(product.price) || 0;
      originalPrice = parseFloat(product.original_price) || 0;
    }
    
    return {
      id: product.id,
      title: product.product_name,
      price: price,
      original_price: originalPrice,
      newPrice: price,  // For compatibility
      oldPrice: originalPrice,  // For compatibility
      img: product.main_image || product.thumbnail_image,
      productData: product,
    };
  });

  const addToCart = async (productStockId, quantity = 1) => {
    if (!isAuthenticated()) {
      addToast('Please login to add items to cart', 'warning');
      setShowLoginModal(true);
      return;
    }
    try {
      const response = await axiosInstance.post('api/public/cart/', { product_stock: productStockId, quantity });
      if (response.data.success) addToast('Added to cart!', 'success');
    } catch {
      addToast('Failed to add to cart', 'error');
    }
  };

  const handleAddToCart = (product) => {
    const stockId = product.productData?.stocks?.[0]?.id || product.id;
    addToCart(stockId, 1);
  };

  const openQuickView = (product) => {
    setModalProduct(product);
    setTimeout(() => setIsModalOpen(true), 10);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalProduct(null), TRANSITION_DURATION);
  };

  const LoginModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-5 w-full max-w-sm mx-4">
          <h3 className="text-base font-bold mb-2">Login Required</h3>
          <p className="text-xs text-gray-500 mb-4">Please login to add items to cart</p>
          <div className="flex gap-2">
            <button onClick={() => { onClose(); navigate('/customer/login'); }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm">Login</button>
            <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  const QuickViewModal = () => {
    if (!modalProduct) return null;
    const [quantity, setQuantity] = useState(1);
    const price = modalProduct.price || 0;
    
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} bg-black/40`} onClick={closeModal}>
        <div className={`w-11/12 max-w-md bg-white rounded-xl p-5 transition-all duration-300 transform ${isModalOpen ? 'scale-100' : 'scale-90'}`} onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold">Quick View</h3>
            <button onClick={closeModal} className="text-gray-400">✗</button>
          </div>
          <img src={modalProduct.img} alt={modalProduct.title} className="w-full h-32 object-contain rounded-lg bg-gray-50" />
          <h4 className="text-xs font-semibold mt-2">{modalProduct.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-blue-600">₹{price.toFixed(0)}</span>
            {modalProduct.original_price > price && <span className="text-[9px] text-gray-400 line-through">₹{modalProduct.original_price}</span>}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 border rounded">-</button>
            <span className="w-8 text-center">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 border rounded">+</button>
          </div>
          <button onClick={() => { handleAddToCart(modalProduct); closeModal(); }} className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">Add to Cart</button>
        </div>
      </div>
    );
  };

  if (products.length === 0) return null;

  return (
    <section className="px-3 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <h2 className="text-sm font-bold text-gray-800">{category.name}</h2>
        </div>
        <Link to={`/category-products?category=${category.id}`} className="text-[10px] text-blue-500 font-medium flex items-center gap-0.5">
          View All <FiChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Products Slider - 2 cards per row */}
      <HorizontalSlider
        items={formattedProducts}
        renderItem={(product) => (
          <CategoryCard
            product={product}
            categoryId={category.id}
            onAddToCart={handleAddToCart}
            onQuickView={openQuickView}
          />
        )}
        autoIntervalMs={4000}
      />

      {/* Modals */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <QuickViewModal />
    </section>
  );
};

export default MobileCategorySlider;