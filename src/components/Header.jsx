import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiX,
  FiHeart,
  FiChevronRight,
  FiChevronDown,
  FiLogOut,
  FiUserCheck,
  FiPackage,
  FiHome,
  FiShoppingBag,
  FiTag,
  FiTruck,
  FiGrid,
  FiServer,
  FiMoreHorizontal,
  FiBox,
  FiStar,
  FiTrash2,
  FiLoader,
  FiFilter
} from "react-icons/fi";
import logo from "/logo.png";
import { axiosInstance, publicAxios } from "../api/axios";

// Service icons
import realEstateIcon from "../assets/service-icon/realestate.png";
import gymIcon from "../assets/service-icon/gym.png";
import saloonIcon from "../assets/service-icon/saloon.png";
import travelIcon from "../assets/service-icon/travel-agency.png";
import financeIcon from "../assets/service-icon/finance.png";
import techIcon from "../assets/service-icon/tech-industry.png";
import hotelIcon from "../assets/service-icon/hotel-resturant.png";
import healthcareIcon from "../assets/service-icon/healthcare.png";
import educationIcon from "../assets/service-icon/education.png";
import professionalIcon from "../assets/service-icon/professional.png";
import workplaceIcon from "../assets/service-icon/workplace.png";
import axios from "axios";

const allServices = [
  { id: 1, title: "Real Estate", keyword: "real estate,house", path: "/realestatehome", img: realEstateIcon },
  { id: 2, title: "Gym", keyword: "gym,fitness", path: "/gymhome", img: gymIcon },
  { id: 3, title: "Saloon", keyword: "salon,beauty", path: "/saloonhome", img: saloonIcon },
  { id: 4, title: "Travel Agency", keyword: "travel,holiday", path: "/travelhome", img: travelIcon },
  { id: 5, title: "Finance", keyword: "finance,money", path: "/financehome", img: financeIcon },
  { id: 6, title: "Tech Industry", keyword: "technology,startup", path: "/techindustryhome", img: techIcon },
  { id: 7, title: "Hotel & Restaurant", keyword: "hotel,restaurant", path: "/hotelhome", img: hotelIcon },
  { id: 8, title: "Healthcare", keyword: "healthcare,hospital", path: "/helthcarehome", img: healthcareIcon },
  { id: 9, title: "Education", keyword: "education,school", path: "/educationhome", img: educationIcon },
  { id: 10, title: "Professional", keyword: "professional,office", path: "/professionalhome", img: professionalIcon },
  { id: 11, title: "Work Place", keyword: "coworking,office", path: "/workplacehome", img: workplaceIcon },
];

const API_BASE_URL = 'https://api.initcart.in';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, '');
  if (cleanPath.startsWith('media/')) return `${API_BASE_URL}/${cleanPath}`;
  return `${API_BASE_URL}/media/${cleanPath}`;
};

// ✅ Helper — open services menu, always close more-menu
const openServicesMenu = (setShowServicesMenu, setMenuOpen, setActiveMobileTab) => {
  setMenuOpen(false);          // close More menu first
  setShowServicesMenu(true);   // then open Services
  setActiveMobileTab("service");
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("home");

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesData, setCategoriesData] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);

  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const fixedRef = useRef(null);
  const dropdownRef = useRef(null);
  const servicesMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [showConditionMenu, setShowConditionMenu] = useState(false);
  const [vendorSuggestions, setVendorSuggestions] = useState([]);

  const handleConditionSearch = (condition) => {
    navigate(`/searchlist?keywords=${encodeURIComponent(condition)}`);
  };

  // ── Search debounce ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchText.trim() || searchText.trim().length < 2 || selected) {
      setSuggestions([]);
      setVendorSuggestions([]);
      setShowSug(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await publicAxios.get("ecommerce/public/search/", { params: { query: searchText } });
        const productData = Array.isArray(res.data) ? res.data : [];
        setSuggestions(productData);
        setShowSug(productData.length > 0);
      } catch {
        setSuggestions([]);
        setShowSug(false);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, selected]);

  // ── Vendor search debounce ───────────────────────────────────────────────
  useEffect(() => {
    if (!searchText.trim() || searchText.trim().length < 2 || selected) {
      setVendorSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await publicAxios.get(`ecommerce/public/vendors/search/?query=${searchText}`);
        const vendorData = Array.isArray(res.data) ? res.data : [];
        setVendorSuggestions(vendorData);
        if (vendorData.length > 0) setShowSug(true);
      } catch {
        setVendorSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, selected]);

  // close suggestion on outside click
  useEffect(() => {
    const close = () => setShowSug(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const goSearch = () => {
    const v = searchText.trim();
    if (!v) return;
    setShowSug(false);
    setSelected(false);
    navigate(`/searchlist?keywords=${encodeURIComponent(v)}`);
  };

  const onSearchKey = (e) => { if (e.key === "Enter") goSearch(); };

  const selectSuggestion = (item) => {
    setShowSug(false);
    setSearchText(item.productName);
    setSelected(true);
    navigate(`/product/${item.id}`);
  };

  // ── Cart ─────────────────────────────────────────────────────────────────
  const fetchCart = async () => {
    const token = localStorage.getItem('customer_token');
    if (!token) { setCartItems([]); setCartCount(0); setCartSubtotal(0); return; }
    try {
      setCartLoading(true);
      const response = await axiosInstance.get('/api/public/cart/');
      let items = [];
      if (Array.isArray(response.data)) items = response.data;
      else if (response.data?.data && Array.isArray(response.data.data)) items = response.data.data;
      setCartItems(items);
      setCartCount(items.length);
      setCartSubtotal(items.reduce((s, i) => s + Number(i.item_total || 0), 0));
    } catch (err) {
      setCartItems([]); setCartCount(0); setCartSubtotal(0);
    } finally {
      setCartLoading(false);
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    const token = localStorage.getItem('customer_token');
    if (!token) { alert('Please login to modify cart'); navigate('/customer/login'); return false; }
    try {
      const response = await axiosInstance.delete(`/api/public/cart/${cartItemId}/`);
      if (response.data.success) {
        await fetchCart();
        window.dispatchEvent(new Event('cartUpdated'));
        alert('Item removed from cart successfully!');
        return true;
      }
      alert('Failed to remove item'); return false;
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        setIsLoggedIn(false); setUserData(null);
        navigate('/customer/login');
      } else { alert('Failed to remove item. Please try again.'); }
      return false;
    }
  };

  const getCartImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/100x100/f0f4f8/94a3b8?text=No+Image";
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `https://api.initcart.in${imagePath}`;
  };

  // ── Cart hover panel ─────────────────────────────────────────────────────
  const renderCartHover = () => {
    if (!isLoggedIn) {
      return (
        <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <p className="text-sm text-gray-600 mb-3">Please login to view cart</p>
          <button onClick={() => { setShowCart(false); navigate('/customer/login'); }}
            className="w-full text-sm bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
        </div>
      );
    }
    return (
      <div className="absolute right-0 top-10 w-[380px] bg-white border border-gray-200 rounded-lg shadow-2xl z-50">
        <div className="flex justify-between items-center border-b px-5 py-3 bg-gray-50 rounded-t-lg">
          <h4 className="text-sm font-semibold text-gray-700">Shopping Cart {cartCount > 0 ? `(${cartCount} items)` : ''}</h4>
          <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700"><FiX className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {cartLoading ? (
            <div className="py-8 text-center"><FiLoader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" /><p className="text-gray-500 text-sm">Loading cart...</p></div>
          ) : cartCount === 0 ? (
            <div className="py-8 text-center">
              <FiShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Your cart is empty</p>
              <Link to="/productlist" className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-800" onClick={() => setShowCart(false)}>Start Shopping →</Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3 border-b last:border-none hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <img src={getCartImageUrl(item.product_details?.main_image || item.product_details?.thumbnail)}
                    alt={item.product_details?.product_name || "Product"}
                    className="w-16 h-16 rounded object-cover border"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/f0f4f8/94a3b8?text=No+Image"; }} />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{item.product_details?.product_name || "Unknown Product"}</h5>
                    <p className="text-xs text-gray-500 mt-0.5">₹{Number(item.product_details?.unit_price || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    {item.product_details?.vendor_name && <p className="text-xs text-gray-400 mt-1">Vendor: {item.product_details.vendor_name}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-semibold text-gray-900 text-sm">₹{Number(item.item_total || 0).toFixed(2)}</p>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveFromCart(item.id); }}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"><FiTrash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
        {cartCount > 0 && (
          <div className="px-5 py-4 border-t bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-600">Subtotal :</span>
              <span className="font-semibold text-gray-900">₹{Number(cartSubtotal || 0).toFixed(2)}</span>
            </div>
            <Link to="/cart" className="block w-full text-sm bg-blue-600 text-white font-medium rounded-md py-2.5 text-center hover:bg-blue-700 transition" onClick={() => setShowCart(false)}>View Cart</Link>
            <Link to="/checkout" className="block w-full text-sm bg-green-600 text-white font-medium rounded-md py-2.5 text-center hover:bg-green-700 transition mt-2" onClick={() => setShowCart(false)}>Proceed to Checkout</Link>
          </div>
        )}
      </div>
    );
  };

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => { fetchCategoriesFromAPI(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesMenuRef.current && !servicesMenuRef.current.contains(event.target)) setShowServicesMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCart();
    const handleCartUpdate = () => fetchCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    const cartInterval = setInterval(fetchCart, 30000);
    return () => { window.removeEventListener('cartUpdated', handleCartUpdate); clearInterval(cartInterval); };
  }, []);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('customer_token');
      const userStr = localStorage.getItem('customer_user');
      if (token && userStr) { setIsLoggedIn(true); setUserData(JSON.parse(userStr)); }
      else { setIsLoggedIn(false); setUserData(null); }
      setAuthChecked(true);
    };
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('authChanged', checkLoginStatus);
    return () => { window.removeEventListener('storage', checkLoginStatus); window.removeEventListener('authChanged', checkLoginStatus); };
  }, []);

  useEffect(() => {
    if (isLoggedIn && location.pathname === '/customer/login') {
      setShowLoginMessage(true);
      const timer = setTimeout(() => { navigate('/'); setShowLoginMessage(false); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, location.pathname, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Category fetching ────────────────────────────────────────────────────
  const fetchCategoriesFromAPI = async () => {
    setLoadingCategories(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/ecommerce/public/categories/`);
      const categories = response.data || [];
      setCategoriesData(categories);
      if (categories.length > 0) { setHoveredCategory(categories[0]); fetchSubCategories(categories[0].id); }
    } catch { setCategoriesData([]); } finally { setLoadingCategories(false); }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/ecommerce/public/subcategories/`, { params: { category: categoryId } });
      setSubCategories(res.data || []);
      if (res.data?.length > 0) { setHoveredSubCategory(res.data[0]); fetchSubSubCategories(res.data[0].id); }
      else { setHoveredSubCategory(null); setChildCategories([]); }
    } catch {}
  };

  const fetchSubSubCategories = async (subcategoryId) => {
    if (!subcategoryId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/ecommerce/public/subsubcategories/`, { params: { subcategory: subcategoryId } });
      setChildCategories(res.data || []);
    } catch {}
  };

  const handleCategoryHover = (category) => {
    setHoveredCategory(category); setHoveredSubCategory(null); setSubCategories([]); setChildCategories([]);
    fetchSubCategories(category.id);
  };
  const handleSubcategoryHover = (subcategory) => { setHoveredSubCategory(subcategory); setChildCategories([]); fetchSubSubCategories(subcategory.id); };

  const handleCategoryClick = (category) => { navigate(`/category-products?category=${category.id}`); setShowCategories(false); setMenuOpen(false); };
  const handleSubCategoryClick = (sub) => { navigate(`/category-products?subcategory=${sub.id}`); setShowCategories(false); setMenuOpen(false); };
  const handleChildCategoryClick = (child) => { navigate(`/category-products?subsubcategory=${child.id}`); setShowCategories(false); setMenuOpen(false); };
  const handleNavigate = (path) => { navigate(path); setUserMenuOpen(false); };

  const handleLogout = () => {
    localStorage.removeItem('customer_token'); localStorage.removeItem('customer_user'); localStorage.removeItem('remember_me');
    window.dispatchEvent(new Event("authChanged"));
    setIsLoggedIn(false); setUserData(null); setUserMenuOpen(false);
    alert("You have been logged out successfully!"); navigate('/');
  };

  const handleMobileNavClick = (tab, path) => {
    setActiveMobileTab(tab); navigate(path);
    setMenuOpen(false);
    setShowServicesMenu(false); // ✅ close everything on nav
  };

  const handleServiceNavigate = (path) => {
    navigate(path);
    setShowServicesMenu(false);
    setMenuOpen(false);
    setActiveMobileTab("service");
  };

  const handleCategoriesPage = () => {
    setActiveMobileTab("category");
    navigate("/categories");
    setMenuOpen(false);
    setShowServicesMenu(false);
  };

  if (!authChecked) return <div className="h-20 bg-white shadow-sm" />;

  return (
    <header className="w-full">
      {/* Already Logged In Message */}
      {showLoginMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <FiUserCheck className="h-5 w-5" />
            <span className="font-medium">You are already logged in! Redirecting to home...</span>
          </div>
        </div>
      )}

      {/* Top Bar - Desktop only */}
      <div className="hidden md:block bg-gray-100 text-xs text-gray-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4"><span>USD $</span><span>English</span></div>
          <div className="flex items-center gap-4">
            {isLoggedIn && userData && <span className="text-green-600 font-medium">Welcome back, {userData.username}!</span>}
            <a href="#" className="hover:text-gray-900">Help</a>
            <a href="#" className="hover:text-gray-900">Track Order</a>
          </div>
        </div>
      </div>

      {/* Main Header - Desktop */}
      <div ref={fixedRef} className={`hidden md:block fixed top-0 inset-x-0 z-40 bg-white w-full transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="hidden md:flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="h-15 w-15" />
                <span className="font-semibold text-gray-900">InitCart</span>
              </Link>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-3xl mx-4 hidden md:flex relative">
              <div className="flex w-full ring-1 ring-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={onSearchKey}
                  onFocus={() => { if (Array.isArray(suggestions) && suggestions.length > 0) setShowSug(true); }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-4 py-2.5 text-sm outline-none"
                  placeholder="Search for products, brands and more..." />
                <button type="submit" onClick={goSearch} className="px-6 bg-blue-600 text-white text-sm hover:bg-blue-700 inline-flex items-center gap-2 transition-colors">
                  <FiSearch className="h-4 w-4" /><span className="hidden sm:inline">Search</span>
                </button>
              </div>
              {showSug && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
                  {loading && (<div className="p-6 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div><p className="text-sm text-gray-500 mt-2">Searching...</p></div>)}
                  {!loading && Array.isArray(suggestions) && suggestions.length > 0 && (
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                      <div className="px-4 py-2 bg-gray-50"><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Products ({suggestions.length})</p></div>
                      {suggestions.map((item, index) => (
                        <div key={item.id || index} onClick={() => selectSuggestion(item)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-all duration-200 group">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                              {item.image || item.thumbnail ? (
                                <img src={getImageUrl(item.image || item.thumbnail)} alt={item.productName}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/f0f4f8/94a3b8?text=No+Image"; }} />
                              ) : (<div className="w-full h-full flex items-center justify-center bg-gray-100"><FiBox className="h-6 w-6 text-gray-400" /></div>)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate">{item.productName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {item.category && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>}
                                {item.price && <span className="text-xs font-semibold text-green-600">₹{item.price}</span>}
                              </div>
                              {item.brand && <p className="text-xs text-gray-400 mt-1">Brand: {item.brand}</p>}
                            </div>
                            <FiChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))}
                      {!loading && Array.isArray(vendorSuggestions) && vendorSuggestions.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-gray-50 border-t"><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vendors ({vendorSuggestions.length})</p></div>
                          {vendorSuggestions.map(vendor => (
                            <div key={vendor.id} onClick={() => { setShowSug(false); setSearchText(vendor.business_name); setSelected(true); navigate(`/vendor/${vendor.id}`); }}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-all duration-200 group border-b last:border-b-0">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center">
                                  {vendor.store_logo ? (<img src={getImageUrl(vendor.store_logo)} alt={vendor.business_name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-2xl">🏪</span>'; }} />) : (<span className="text-2xl">🏪</span>)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate">{vendor.business_name}</p>
                                  <p className="text-xs text-gray-500 mt-1">Click to visit store</p>
                                </div>
                                <FiChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <button onClick={goSearch} className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2 py-2 hover:bg-blue-100 rounded-lg transition-colors">
                          <FiSearch className="h-4 w-4" />View all results for "{searchText}"
                        </button>
                      </div>
                    </div>
                  )}
                  {!loading && Array.isArray(suggestions) && suggestions.length === 0 && Array.isArray(vendorSuggestions) && vendorSuggestions.length === 0 && searchText.trim().length >= 2 && (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><FiSearch className="h-6 w-6 text-gray-400" /></div>
                      <p className="text-gray-600 font-medium">No results found</p>
                      <p className="text-sm text-gray-500 mt-1">Try searching with different keywords</p>
                      <button onClick={goSearch} className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">Search for "{searchText}" anyway →</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Icons */}
            <div className="hidden md:flex items-center gap-2 md:gap-3 relative">
              <button className="hidden md:inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm ring-1 ring-gray-300 hover:bg-gray-50">
                <FiHeart className="h-4 w-4" /><span className="text-xs">0</span>
              </button>
              <div className="relative hidden md:inline-flex"
                onMouseEnter={() => { if (isLoggedIn) { setShowCart(true); fetchCart(); } }}
                onMouseLeave={() => setShowCart(false)}>
                <Link to={isLoggedIn ? "/cart" : "/customer/login"}
                  className="h-9 flex items-center gap-2 rounded-md px-3 text-sm ring-1 ring-gray-300 hover:bg-gray-50 relative"
                  onClick={(e) => { if (!isLoggedIn) { e.preventDefault(); navigate('/customer/login'); } }}>
                  <FiShoppingCart className="h-4 w-4" />
                  {isLoggedIn && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount > 99 ? '99+' : cartCount}</span>
                  )}
                  <span className="text-xs">{isLoggedIn ? (cartCount > 99 ? '99+' : cartCount) : '0'}</span>
                </Link>
                {showCart && renderCartHover()}
              </div>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-gray-300 hover:bg-gray-50" aria-label="Account">
                  <FiUser className="h-5 w-5" />
                  {isLoggedIn && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                    <div className="p-3 border-b bg-gray-50">
                      {isLoggedIn && userData ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-blue-600 font-bold text-sm">{userData.username?.charAt(0).toUpperCase()}</span></div>
                          <div><p className="text-sm font-medium text-gray-800">{userData.username}</p><p className="text-xs text-gray-500">{userData.email}</p></div>
                        </div>
                      ) : (<p className="text-sm text-gray-600">Welcome! Please login to continue.</p>)}
                    </div>
                    <ul className="py-1 text-sm text-gray-700">
                      {isLoggedIn ? (
                        <>
                          <li><Link to="/customerProfile" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}><FiUser className="h-4 w-4" />My Dashboard</Link></li>
                          <li><Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}><FiPackage className="h-4 w-4" />My Orders</Link></li>
                          <li><button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-100 text-red-600"><FiLogOut className="h-4 w-4" />Logout</button></li>
                        </>
                      ) : (
                        <>
                          <li><button onClick={() => handleNavigate("/customer/login")} className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-100"><FiUser className="h-4 w-4" />User Login</button></li>
                          <li><button onClick={() => handleNavigate("/customer/registration")} className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-100"><FiUser className="h-4 w-4" />User Registration</button></li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Spacer */}
      <div className="hidden md:block" style={{ height: 35 }} />

      {/* Bottom Nav Bar - Desktop */}
      <div className="hidden md:block bg-blue-800 text-white relative z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="h-12 flex items-center gap-6">
            <div className="h-full z-50" onMouseEnter={() => setShowCategories(true)} onMouseLeave={() => setShowCategories(false)}>
              <button className="inline-flex items-center gap-2 rounded-md bg-blue-700 hover:bg-blue-600 px-3 py-2 text-sm h-full">
                <FiMenu className="h-4 w-4" /><span>Categories</span>
                {loadingCategories && <span className="ml-1 animate-pulse">...</span>}
              </button>
            </div>

            {/* Mega Menu */}
            {showCategories && (
              <div className="absolute top-full left-0 right-0 flex bg-white border border-gray-200 shadow-xl h-[480px] overflow-hidden text-gray-800 z-40"
                onMouseEnter={() => setShowCategories(true)} onMouseLeave={() => setShowCategories(false)}>
                {loadingCategories ? (
                  <div className="w-full flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-2 text-gray-600">Loading categories...</p></div></div>
                ) : categoriesData.length === 0 ? (
                  <div className="w-full flex flex-col items-center justify-center"><div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"><FiMenu className="h-10 w-10 text-gray-400" /></div><h3 className="text-xl font-semibold text-gray-800 mb-2">No Categories Available</h3></div>
                ) : (
                  <>
                    {/* Left - Main Categories */}
                    <div className="w-64 border-r border-gray-200 overflow-y-auto py-4 bg-gray-50">
                      <div className="px-4 mb-4"><h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Categories</h3></div>
                      {categoriesData.map((category) => (
                        <div key={category.id} onMouseEnter={() => handleCategoryHover(category)}
                          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all ${hoveredCategory?.id === category.id ? "bg-white border-l-4 border-blue-600 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}>
                          <div className="flex items-center gap-3">
                            {category.icon && category.icon !== "" ? (<img src={category.icon} alt={category.name} className="w-7 h-7 object-cover rounded" onError={(e) => { e.currentTarget.style.display = "none"; }} />) : (<span className="text-lg">📦</span>)}
                            <div><span className="text-sm">{category.name}</span>{category.product_count > 0 && <span className="ml-2 text-xs text-gray-500">({category.product_count})</span>}</div>
                          </div>
                          <FiChevronRight size={16} className={hoveredCategory?.id === category.id ? "text-blue-600" : "text-gray-400"} />
                        </div>
                      ))}
                    </div>
                    {/* Middle - Subcategories */}
                    <div className="w-64 border-r border-gray-200 overflow-y-auto py-4">
                      {hoveredCategory ? (
                        <>
                          <div className="px-4 mb-4"><h3 className="text-sm font-semibold text-gray-700">{hoveredCategory.name} Categories</h3></div>
                          {subCategories.length > 0 ? subCategories.map((sub) => (
                            <div key={sub.id} onMouseEnter={() => handleSubcategoryHover(sub)}
                              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all ${hoveredSubCategory?.id === sub.id ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                              <div className="flex items-center gap-3">
                                {sub.icon && sub.icon !== "" ? (<img src={sub.icon} alt={sub.name} className="w-6 h-6 object-cover rounded" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />) : (<span className="text-base">📦</span>)}
                                <div><span className="text-sm">{sub.name}</span>{sub.product_count > 0 && <span className="ml-2 text-xs text-gray-500">({sub.product_count})</span>}</div>
                              </div>
                              <FiChevronRight size={16} className={hoveredSubCategory?.id === sub.id ? "text-blue-600" : "text-gray-400"} />
                            </div>
                          )) : (
                            <div className="px-4 py-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div><p className="text-gray-500 text-sm">Loading...</p></div>
                          )}
                        </>
                      ) : (<div className="h-full flex items-center justify-center"><p className="text-gray-500">Select a category</p></div>)}
                    </div>
                    {/* Right - Child categories */}
                    <div className="flex-1 bg-white p-6 overflow-y-auto">
                      {hoveredCategory ? (
                        <>
                          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center overflow-hidden">
                                {hoveredCategory.icon && hoveredCategory.icon !== "" ? (<img src={hoveredCategory.icon} alt={hoveredCategory.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />) : (<span className="text-3xl">📦</span>)}
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-gray-900">{hoveredCategory.name}</h2>
                                {hoveredCategory.product_count > 0 && <p className="text-gray-600 mt-1">{hoveredCategory.product_count} products available</p>}
                                <button onClick={() => handleCategoryClick(hoveredCategory)} className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Shop All {hoveredCategory.name}</button>
                              </div>
                            </div>
                          </div>
                          {hoveredSubCategory ? (
                            <div>
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                  {hoveredSubCategory.icon ? (<img src={hoveredSubCategory.icon} alt={hoveredSubCategory.name} className="w-10 h-10 rounded-lg object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />) : (<span className="text-xl">📦</span>)}
                                  <div><h3 className="text-xl font-bold text-gray-900">{hoveredSubCategory.name}</h3>{hoveredSubCategory.product_count > 0 && <p className="text-base font-normal text-gray-600">({hoveredSubCategory.product_count} products)</p>}</div>
                                </div>
                                <button onClick={() => handleSubCategoryClick(hoveredSubCategory)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">View All →</button>
                              </div>
                              {childCategories.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4">
                                  {childCategories.map((child) => (
                                    <div key={child.id} onClick={() => handleChildCategoryClick(child)} className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition cursor-pointer">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-50 rounded-lg flex items-center justify-center transition overflow-hidden">
                                          {child.icon ? (<img src={child.icon} alt={child.name} className="w-7 h-7 object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />) : (<span className="text-gray-600 group-hover:text-blue-600 text-lg">📦</span>)}
                                        </div>
                                        <div><h4 className="font-medium text-gray-800 group-hover:text-blue-600">{child.name}</h4>{child.product_count > 0 && <p className="text-xs text-gray-500 mt-1">{child.product_count} products</p>}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                  <p className="text-gray-600 mb-4">No child categories available</p>
                                  <button onClick={() => handleSubCategoryClick(hoveredSubCategory)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">View Products</button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-64 flex flex-col items-center justify-center">
                              <p className="text-gray-600 text-center mb-6">Hover over a subcategory to view child categories</p>
                              {subCategories.length === 0 && (<button onClick={() => handleCategoryClick(hoveredCategory)} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Explore {hoveredCategory.name}</button>)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"><FiMenu className="h-10 w-10 text-gray-400" /></div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Browse Categories</h3>
                          <p className="text-gray-600 text-center max-w-md">Select a category from the left menu to view its subcategories and products</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Nav Links */}
            <nav className="flex items-center gap-6 text-sm">
              <Link to="/" className="hover:text-blue-200">Home</Link>
              <Link to="/productlist" className="hover:text-blue-200">All Products</Link>
              <div className="relative group">
                <button className="inline-flex items-center gap-1 hover:text-blue-200">Condition<FiChevronDown className="group-hover:rotate-180 transition-transform" /></button>
                <ul className="absolute top-full left-0 mt-2 bg-white text-gray-700 shadow-lg rounded-md w-48 py-2 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {["new","like new","refurbished","used"].map(c => (
                    <li key={c} className="px-4 py-2 hover:bg-gray-100 cursor-pointer capitalize" onClick={() => handleConditionSearch(c)}>{c.charAt(0).toUpperCase() + c.slice(1)}</li>
                  ))}
                </ul>
              </div>
              <Link to="/brandlist" className="hover:text-blue-200">Brand</Link>
              <Link to="/Offer" className="hover:text-blue-200">Offers</Link>
              <Link to="/sellerlist" className="hover:text-blue-200">All Vendors</Link>
              <div className="relative group">
                <button className="inline-flex items-center gap-1 hover:text-blue-200">Login<FiChevronDown className="group-hover:rotate-180 transition-transform" /></button>
                <div className="absolute top-full left-0 mt-2 bg-white text-gray-700 shadow-lg rounded-md w-48 py-2 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button onClick={() => navigate("/customer/login")} className="block w-full text-left px-4 py-2 hover:bg-gray-100">User Login</button>
                  <button onClick={() => { window.location.href = "https://initcart.in/productvendor/"; }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Product Vendor Login</button>
                  <button onClick={() => { window.location.href = "https://initcart.in/servicevendor/"; }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Service Vendor Login</button>
                  <button onClick={() => { window.location.href = "https://initcart.in/mlm/"; }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Agent Login</button>
                  <button onClick={() => { window.location.href = "https://initcart.in/pos/"; }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Franchise Login</button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION BAR
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100]">
        <div className="bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.1)] rounded-t-3xl">
          <div className="flex items-center justify-between px-1 py-3">

            {/* Category */}
            <button
              onClick={() => {
                setShowServicesMenu(false);
                setMenuOpen(false);
                handleCategoriesPage();
              }}
              className="flex flex-col items-center justify-center w-1/6 py-1"
            >
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${activeMobileTab === "category" ? "bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-300 shadow-lg scale-110" : "bg-gray-100"}`}>
                <FiGrid className={`h-6 w-6 ${activeMobileTab === "category" ? "text-blue-600 scale-125" : "text-blue-600"}`} />
                {activeMobileTab === "category" && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-ping" />}
              </div>
              <span className={`text-xs font-medium text-blue-600 ${activeMobileTab === "category" ? "font-bold" : ""}`}>Category</span>
            </button>

            {/* ✅ Service — closes More menu before opening Services */}
            <button
              onClick={() => {
                setMenuOpen(false);          // ← KEY FIX: close More menu
                setShowServicesMenu(true);
                setActiveMobileTab("service");
              }}
              className="flex flex-col items-center justify-center w-1/6 py-1"
            >
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${activeMobileTab === "service" ? "bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-300 shadow-lg scale-110" : "bg-gray-100"}`}>
                <FiServer className={`h-6 w-6 ${activeMobileTab === "service" ? "text-blue-600 scale-125" : "text-blue-600"}`} />
                {activeMobileTab === "service" && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-ping" />}
              </div>
              <span className={`text-xs font-medium text-blue-600 ${activeMobileTab === "service" ? "font-bold" : ""}`}>Service</span>
            </button>

            {/* Home */}
            <button
              onClick={() => {
                setShowServicesMenu(false);
                setMenuOpen(false);
                handleMobileNavClick("home", "/");
              }}
              className="flex flex-col items-center justify-center w-1/6 py-1"
            >
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${activeMobileTab === "home" ? "bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-300 shadow-lg scale-110" : "bg-gray-100"}`}>
                <FiHome className={`h-6 w-6 ${activeMobileTab === "home" ? "text-blue-600 scale-125" : "text-blue-600"}`} />
                {activeMobileTab === "home" && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-ping" />}
              </div>
              <span className={`text-xs font-medium text-blue-600 ${activeMobileTab === "home" ? "font-bold" : ""}`}>Home</span>
            </button>

            {/* Vendors */}
            <button
              onClick={() => {
                setShowServicesMenu(false);
                setMenuOpen(false);
                handleMobileNavClick("vendors", "/sellerlist");
              }}
              className="flex flex-col items-center justify-center w-1/6 py-1"
            >
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${activeMobileTab === "vendors" ? "bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-300 shadow-lg scale-110" : "bg-gray-100"}`}>
                <FiTruck className={`h-6 w-6 ${activeMobileTab === "vendors" ? "text-blue-600 scale-125" : "text-blue-600"}`} />
                {activeMobileTab === "vendors" && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-ping" />}
              </div>
              <span className={`text-xs font-medium text-blue-600 ${activeMobileTab === "vendors" ? "font-bold" : ""}`}>Vendors</span>
            </button>

            {/* Profile */}
            <button
              onClick={() => {
                setShowServicesMenu(false);
                setMenuOpen(false);
                handleMobileNavClick("profile", isLoggedIn ? "/customerProfile" : "/customer/login");
              }}
              className="flex flex-col items-center justify-center w-1/6 py-1"
            >
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${activeMobileTab === "profile" ? "bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-300 shadow-lg scale-110" : "bg-gray-100"}`}>
                <FiUser className={`h-6 w-6 ${activeMobileTab === "profile" ? "text-blue-600 scale-125" : "text-blue-600"}`} />
                {isLoggedIn && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                    <span className="text-[8px]">✓</span>
                  </span>
                )}
                {activeMobileTab === "profile" && !isLoggedIn && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-ping" />}
              </div>
              <span className={`text-xs font-medium text-blue-600 ${activeMobileTab === "profile" ? "font-bold" : ""}`}>Profile</span>
            </button>

            {/* ✅ More — closes Services menu before opening More */}
            <button
              onClick={() => {
                setShowServicesMenu(false);  // ← KEY FIX: close Services menu
                setMenuOpen(true);
                setActiveMobileTab("more");
              }}
              className="flex flex-col items-center justify-center w-1/6 py-1"
            >
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${activeMobileTab === "more" ? "bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-300 shadow-lg scale-110" : "bg-gray-100"}`}>
                <FiMoreHorizontal className={`h-6 w-6 ${activeMobileTab === "more" ? "text-blue-600 scale-125" : "text-blue-600"}`} />
                {activeMobileTab === "more" && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-ping" />}
              </div>
              <span className={`text-xs font-medium text-blue-600 ${activeMobileTab === "more" ? "font-bold" : ""}`}>More</span>
            </button>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE SERVICES MENU (bottom sheet)
          z-[70] — above bottom nav [100] only when overlaid
      ═══════════════════════════════════════════════════════════════════ */}
      {showServicesMenu && (
        <div className="fixed inset-0 z-[80]" onClick={() => setShowServicesMenu(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b bg-[#1565c0] rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#1565c0] px-4 py-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg">Our Services</h3>
                  <p className="text-blue-100 text-sm mt-1">Explore 11 premium services</p>
                </div>
                <button onClick={() => setShowServicesMenu(false)} className="p-2 hover:bg-blue-500 rounded-full">
                  <FiX className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-4 pb-28">
              <button
                onClick={() => { handleServiceNavigate("/servicelistpage"); }}
                className="w-full mb-6 p-4 bg-blue-500 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="text-white text-lg font-bold">View All Services</h4>
                    <p className="text-blue-100 text-sm mt-1">Browse all 11 services in one place</p>
                  </div>
                  <div className="bg-white p-3 rounded-full"><FiServer className="h-6 w-6 text-blue-500" /></div>
                </div>
              </button>
              <div className="grid grid-cols-2 gap-3">
                {allServices.map((service) => (
                  <button key={service.id} onClick={() => { handleServiceNavigate(service.path); }}
                    className="bg-white rounded-xl p-4 text-left hover:shadow-lg transition-shadow w-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-3 overflow-hidden ring-2 ring-white">
                        {service.img ? (<img src={service.img} alt={service.title} className="w-14 h-14 object-cover rounded-full" />) : (<span className="text-blue-500 font-bold text-lg">{service.title.substring(0, 2)}</span>)}
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm truncate w-full">{service.title}</h4>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE MORE MENU (bottom sheet)
          z-[60] — below Services [80] so Services can overlay it
      ═══════════════════════════════════════════════════════════════════ */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-[#1565c0] rounded-t-3xl shadow-2xl h-[75vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#1565c0] border-b border-blue-600 px-4 py-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-lg">Menu</h3>
                <button onClick={() => { setMenuOpen(false); }} className="p-2 hover:bg-blue-600 rounded-full">
                  <FiX className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-4 pb-28 overflow-y-auto flex-1">
              {isLoggedIn && userData && (
                <div className="mb-6 p-4 bg-blue-600 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">{userData.username?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{userData.username}</p>
                      <p className="text-xs text-blue-200">{userData.email}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <button onClick={() => { navigate(isLoggedIn ? '/cart' : '/customer/login'); setMenuOpen(false); }}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white relative">
                  <div className="relative">
                    <FiShoppingCart className="h-5 w-5 text-white" />
                    {isLoggedIn && cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount > 9 ? '9+' : cartCount}</span>}
                  </div>
                  <span className="font-medium text-white">Cart {isLoggedIn ? `(${cartCount})` : ''}</span>
                </button>

                <button onClick={() => { navigate("/productlist"); setMenuOpen(false); }} className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white">
                  <FiShoppingBag className="h-5 w-5 text-white" /><span className="font-medium text-white">All Products</span>
                </button>

                {/* Product Condition */}
                <div className="rounded-xl overflow-hidden">
                  <button onClick={() => setShowConditionMenu(!showConditionMenu)} className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-blue-600 text-white">
                    <div className="flex items-center gap-3"><FiFilter className="h-5 w-5" /><span className="font-medium">Product Condition</span></div>
                    <FiChevronDown className={`transition-transform duration-300 ${showConditionMenu ? "rotate-180" : ""}`} />
                  </button>
                  {showConditionMenu && (
                    <div className="ml-10 mt-1 space-y-1">
                      {["new","like new","refurbished","used"].map(c => (
                        <button key={c} onClick={() => { handleConditionSearch(c); setMenuOpen(false); }}
                          className="block w-full text-left p-2 rounded-lg hover:bg-blue-600 text-white text-sm capitalize">{c}</button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => { navigate("/Offer"); setMenuOpen(false); }} className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white">
                  <FiTag className="h-5 w-5 text-white" /><span className="font-medium text-white">Offers</span>
                </button>
                <button onClick={() => { navigate("/brandlist"); setMenuOpen(false); }} className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white">
                  <FiBox className="h-5 w-5 text-white" /><span className="font-medium text-white">Brands</span>
                </button>

                {/* ✅ Services button inside More menu — closes More, opens Services */}
                <button
                  onClick={() => {
                    setMenuOpen(false);          // close More menu
                    setShowServicesMenu(true);   // open Services menu
                    setActiveMobileTab("service");
                  }}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white">
                  <FiServer className="h-5 w-5 text-white" /><span className="font-medium text-white">Services</span>
                </button>

                {isLoggedIn ? (
                  <>
                    <button onClick={() => { navigate("/customerProfile"); setMenuOpen(false); setActiveMobileTab("profile"); }} className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white">
                      <FiUser className="h-5 w-5 text-white" /><span className="font-medium text-white">My Dashboard</span>
                    </button>
                    <button onClick={() => { navigate("/orders"); setMenuOpen(false); }} className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white">
                      <FiPackage className="h-5 w-5 text-white" /><span className="font-medium text-white">My Orders</span>
                    </button>
                    <button onClick={() => { handleLogout(); setMenuOpen(false); setActiveMobileTab("home"); }} className="flex items-center gap-3 w-full text-left p-3 rounded-xl text-red-300 hover:bg-red-900 hover:text-white">
                      <FiLogOut className="h-5 w-5" /><span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { navigate("/customer/login"); setMenuOpen(false); setActiveMobileTab("profile"); }} className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white">
                      <FiUser className="h-5 w-5 text-white" /><span className="font-medium text-white">User Login</span>
                    </button>
                    <button onClick={() => { navigate("/customer/registration"); setMenuOpen(false); }} className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white">
                      <FiUser className="h-5 w-5 text-white" /><span className="font-medium text-white">User Registration</span>
                    </button>
                  </>
                )}

                <button onClick={() => { navigate("/vendor-registration"); setMenuOpen(false); }} className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white">
                  <FiUser className="h-5 w-5 text-white" /><span className="font-medium text-white">Become a Vendor</span>
                </button>
                <button onClick={() => { window.location.href = "https://initcart.in/product-vendor/"; }} className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white">
                  <FiUser className="h-5 w-5 text-white" /><span className="font-medium text-white">Vendor Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        @keyframes ping { 75%,100% { transform:scale(2); opacity:0; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-ping { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
    </header>
  );
}