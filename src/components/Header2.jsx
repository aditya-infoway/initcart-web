// src/components/Header2.jsx - Updated with hover dropdown for profile

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiSearch,
  FiUser,
  FiX,
  FiHeart,
  FiLogOut,
  FiUserCheck,
  FiPackage,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";
import logo from "/logo.png";
import MobileServiceHeader from "./MobileServiceHeader";

// ── Services list ──────────────────────────────────────────────────────────
const services = [
  ["Real Estate", "/realestatehome"],
  ["Gym", "/gymhome"],
  ["Saloon", "/saloonhome"],
  ["Travel Agency", "/travelhome"],
  ["Finance", "/financehome"],
  ["Tech Industry", "/techindustryhome"],
  ["Hotel", "/hotelhome"],
  ["Healthcare", "/helthcarehome"],
  ["Education", "/educationhome"],
  ["Professional", "/professionalhome"],
  ["Workplace", "/workplacehome"],
  ["Restaurant", "/restauranthome"],
];

export default function Header2() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [vendorZoneOpen, setVendorZoneOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [mobileServiceOpen, setMobileServiceOpen] = useState(false);
  const [mobileVendorOpen, setMobileVendorOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // ── Auth state ──────────────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const fixedRef = useRef(null);
  const serviceDropdownRef = useRef(null);
  const vendorDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // ── Check login status ──────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('customer_token');
      const userStr = localStorage.getItem('customer_user');
      if (token && userStr) {
        try {
          setUserData(JSON.parse(userStr));
          setIsLoggedIn(true);
        } catch { setIsLoggedIn(false); setUserData(null); }
      } else {
        setIsLoggedIn(false); setUserData(null);
      }
    };
    checkAuth();
    window.addEventListener('authChanged', checkAuth);
    return () => window.removeEventListener('authChanged', checkAuth);
  }, []);

  // ── Click outside handler for all dropdowns ─────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
        setServiceOpen(false);
      }
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target)) {
        setVendorZoneOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Scroll handler ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Mobile detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── Handle service click ──────────────────────────────────────────────────
  const handleServiceClick = (path) => {
    setServiceOpen(false);
    navigate(path);
  };

  // ── Handle navigation ─────────────────────────────────────────────────────
  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
    setMobileServiceOpen(false);
    setMobileVendorOpen(false);
    setProfileDropdownOpen(false);
  };

  // ── Handle logout ─────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    localStorage.removeItem('remember_me');
    window.dispatchEvent(new Event("authChanged"));
    setIsLoggedIn(false);
    setUserData(null);
    setMenuOpen(false);
    setProfileDropdownOpen(false);
    navigate('/');
  };

  // ── Get user display name ─────────────────────────────────────────────────
  const getDisplayName = () => {
    if (!userData) return 'User';
    return userData.username || 'User';
  };

  // ── Get user initial ──────────────────────────────────────────────────────
  const getUserInitial = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="">
      {/* ── Mobile Service Header ─────────────────────────────────────── */}
      {isMobile && (
        <MobileServiceHeader onHeightChange={setHeaderHeight} />
      )}

      {/* ── Spacer for mobile header ───────────────────────────────────── */}
      {isMobile && <div style={{ height: headerHeight }} />}

      {/* ── Top Bar (Desktop Only) ────────────────────────────────────── */}
      <div className="hidden md:block bg-gray-100 text-xs text-gray-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>USD $</span>
            <span>English</span>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn && userData && (
              <span className="text-green-600 font-medium">
                Welcome back, {getDisplayName()}!
              </span>
            )}
            <a href="#" className="hover:text-gray-900">Help</a>
            <a href="#" className="hover:text-gray-900">Track Order</a>
          </div>
        </div>
      </div>

      {/* ── Main Header ────────────────────────────────────────────────── */}
      <div
        ref={fixedRef}
        className={`fixed top-0 inset-x-0 z-40 bg-white w-full transition-all duration-300 ${
          isMobile ? "hidden" : scrolled ? "shadow-sm" : ""
        }`}
        style={{ top: isMobile ? headerHeight : 0 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button - hidden on desktop */}
              <button
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md ring-1 ring-gray-300"
                onClick={() => setMenuOpen(true)}
                aria-label="Open Menu"
              >
                <FiMenu className="h-5 w-5" />
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="h-15 w-15" />
                <span className="font-semibold text-gray-900">Service</span>
              </Link>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="flex-1 max-w-3xl mx-4 hidden md:flex">
              <div className="flex w-full ring-1 ring-gray-300 rounded-md overflow-hidden">
                <input
                  className="flex-1 px-3 py-2 text-sm outline-none"
                  placeholder="Search for items..."
                />
                <button
                  className="px-4 bg-blue-600 text-white text-sm hover:bg-blue-700 inline-flex items-center gap-2"
                  aria-label="Search"
                >
                  <FiSearch className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2 md:gap-3">
              <button className="hidden md:inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm ring-1 ring-gray-300 hover:bg-gray-50">
                <FiHeart className="h-4 w-4" />
                <span className="text-xs">0</span>
              </button>

              {/* ── PROFILE DROPDOWN ───────────────────────────────────── */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-gray-300 hover:bg-gray-50 relative transition-all duration-200 hover:ring-blue-400"
                >
                  {isLoggedIn ? (
                    <>
                      <span className="text-sm font-bold text-blue-600">
                        {getUserInitial()}
                      </span>
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                    </>
                  ) : (
                    <FiUser className="h-5 w-5" />
                  )}
                </button>

                {/* ── Dropdown Menu ────────────────────────────────────── */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeInDown">
                    {/* Header - User Info */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                      {isLoggedIn && userData ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {getUserInitial()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {getDisplayName()}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {userData.email || ''}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Welcome to Service</p>
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {isLoggedIn ? (
                        <>
                          {/* Dashboard */}
                          <Link
                            to="/customerProfile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <FiUserCheck className="h-4 w-4" />
                            <span>My Dashboard</span>
                          </Link>

                          {/* My Orders */}
                          <Link
                            to="/orders"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <FiPackage className="h-4 w-4" />
                            <span>My Orders</span>
                          </Link>
                          {/* Logout */}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                          >
                            <FiLogOut className="h-4 w-4" />
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Login */}
                          <Link
                            to="/customer/login"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <FiUser className="h-4 w-4" />
                            <span>Login</span>
                          </Link>

                          {/* Register */}
                          <Link
                            to="/customer/registration"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <FiUserCheck className="h-4 w-4" />
                            <span>Register</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search - hidden on desktop */}
          <div className="md:hidden pb-3">
            <div className="flex w-full ring-1 ring-gray-300 rounded-md overflow-hidden">
              <button className="inline-flex items-center px-3 text-sm bg-gray-50 border-r border-gray-200">
                <FiMenu className="h-4 w-4 mr-2" />
                Categories
              </button>
              <input
                className="flex-1 px-3 py-2 text-sm outline-none"
                placeholder="Search for items..."
              />
              <button className="px-3 bg-blue-600 text-white text-sm inline-flex items-center gap-2">
                <FiSearch />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop Spacer (only on desktop) ───────────────────────────── */}
      <div className="hidden md:block" style={{ height: 35 }} />

      {/* ── Bottom Nav (Desktop Only) ──────────────────────────────────── */}
      <div className="hidden md:block bg-blue-800 text-white relative z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="h-12 flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm relative">
              <Link to="/" className="hover:text-blue-200">
                Home
              </Link>

              {/* ── SERVICES DROPDOWN ────────────────────────────────────── */}
              <div className="relative" ref={serviceDropdownRef}>
                <button
                  onClick={() => {
                    setServiceOpen(!serviceOpen);
                    setVendorZoneOpen(false);
                  }}
                  className="hover:text-blue-200 font-medium flex items-center gap-1"
                >
                  Services
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      serviceOpen ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {serviceOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-gray-700">
                    {services.map(([title, path]) => (
                      <button
                        key={path}
                        onClick={() => handleServiceClick(path)}
                        className="block w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/brandlist" className="hover:text-blue-200">
                About Us
              </Link>
              <Link to="/Offer" className="hover:text-blue-200">
                Contact Us
              </Link>
              <Link to="/sellerlist" className="hover:text-blue-200">
                All Vendors
              </Link>

              {/* ── VENDOR ZONE DROPDOWN ────────────────────────────────── */}
              <div className="relative" ref={vendorDropdownRef}>
                <button
                  onClick={() => {
                    setVendorZoneOpen(!vendorZoneOpen);
                    setServiceOpen(false);
                  }}
                  className="hover:text-blue-200 font-medium flex items-center gap-1"
                >
                  Vendor Zone
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      vendorZoneOpen ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {vendorZoneOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-gray-700">
                    <button
                      onClick={() => {
                        setVendorZoneOpen(false);
                        navigate("/vendor-registration");
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Become A Vendor
                    </button>
                    <button
                      onClick={() => {
                        setVendorZoneOpen(false);
                        navigate("/login");
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Vendor Login
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ────────────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-0 left-0 h-full w-80 bg-white shadow-2xl p-4 overflow-y-auto animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex gap-1 items-center">
                <img src={logo} alt="Logo" className="h-10" />
                <span className="font-semibold text-gray-900">Service</span>
              </div>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition"
                onClick={() => setMenuOpen(false)}
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* User info - Mobile */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {getUserInitial()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">{userData?.email || ''}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Link
                        to="/customerProfile"
                        onClick={() => setMenuOpen(false)}
                        className="text-xs text-blue-600 font-medium hover:underline"
                      >
                        Dashboard
                      </Link>
                      <span className="text-xs text-gray-300">|</span>
                      <Link
                        to="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="text-xs text-blue-600 font-medium hover:underline"
                      >
                        Orders
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">Welcome to Service</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => { setMenuOpen(false); navigate("/customer/login"); }}
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); navigate("/customer/registration"); }}
                      className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition"
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="flex w-full ring-1 ring-gray-300 rounded-md overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for items..."
                  className="flex-1 px-3 py-2 text-sm outline-none"
                />
                <button className="px-3 bg-blue-600 text-white text-sm">
                  <FiSearch />
                </button>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition"
              >
                <FiHome className="h-5 w-5" /> Home
              </Link>

              {/* MOBILE SERVICES DROPDOWN */}
              <div>
                <button
                  onClick={() => setMobileServiceOpen(!mobileServiceOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition"
                >
                  <span className="flex items-center gap-3">
                    <FiMenu className="h-5 w-5" /> Services
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      mobileServiceOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileServiceOpen && (
                  <div className="ml-4 pl-4 border-l-2 border-blue-200 space-y-1 mt-1">
                    {services.map(([title, path]) => (
                      <Link
                        key={path}
                        to={path}
                        onClick={() => {
                          setMenuOpen(false);
                          setMobileServiceOpen(false);
                        }}
                        className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        {title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* MOBILE VENDOR ZONE */}
              <div>
                <button
                  onClick={() => setMobileVendorOpen(!mobileVendorOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition"
                >
                  <span className="flex items-center gap-3">
                    <FiUser className="h-5 w-5" /> Vendor Zone
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      mobileVendorOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileVendorOpen && (
                  <div className="ml-4 pl-4 border-l-2 border-blue-200 space-y-1 mt-1">
                    <Link
                      to="/vendor-registration"
                      onClick={() => {
                        setMenuOpen(false);
                        setMobileVendorOpen(false);
                      }}
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      Become a Vendor
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => {
                        setMenuOpen(false);
                        setMobileVendorOpen(false);
                      }}
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      Vendor Login
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/brandlist"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition"
              >
                <FiHeart className="h-5 w-5" /> About Us
              </Link>
              <Link
                to="/Offer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition"
              >
                <FiHeart className="h-5 w-5" /> Contact Us
              </Link>
              <Link
                to="/sellerlist"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition"
              >
                <FiHeart className="h-5 w-5" /> All Vendors
              </Link>

              {/* Mobile Profile/Logout */}
              {isLoggedIn ? (
                <>
                  <Link
                    to="/customerProfile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition"
                  >
                    <FiUser className="h-5 w-5" /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 transition"
                  >
                    <FiLogOut className="h-5 w-5" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/customer/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition"
                  >
                    <FiUser className="h-5 w-5" /> Login
                  </Link>
                  <Link
                    to="/customer/registration"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition"
                  >
                    <FiUserCheck className="h-5 w-5" /> Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideRight {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideRight {
          animation: slideRight 0.3s ease-out;
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}