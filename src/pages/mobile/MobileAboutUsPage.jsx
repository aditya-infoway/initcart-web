// ecommerce/frontend/src/pages/mobile/MobileAboutUsPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiFacebook, 
  FiInstagram, 
  FiTwitter, 
  FiYoutube, 
  FiShoppingBag, 
  FiPackage, 
  FiTool, 
  FiFileText, 
  FiShield, 
  FiClock,
  FiSend,
  FiCheckCircle,
  FiGlobe
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { RiTwitterXLine } from 'react-icons/ri';
import { publicAxios } from '../../api/axios';
import logo from '/logo.png';

// ─── Font Tokens ──────────────────────────────────────────────────────────
const F = {
  pageTitle:    { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle:    { fontSize: 14, fontWeight: 600 },
  cardSub:      { fontSize: 11, fontWeight: 400 },
  badge:        { fontSize: 10, fontWeight: 600 },
  pill:         { fontSize: 11, fontWeight: 600 },
  statNum:      { fontSize: 13, fontWeight: 700 },
  statLabel:    { fontSize:  9, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLetter:{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 },
  emptyTitle:   { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

const MobileAboutUsPage = () => {
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      const res = await publicAxios.get('api/banners/init-admin-footer/');
      setInfo(res.data);
    } catch (err) {
      console.error('Footer API error:', err);
    }
  };

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  // Quick Links Data
  const quickLinks = [
    { name: "Profile Info", path: "/customerProfile" },
    { name: "Flash Deal", path: "/flash-deal" },
    { name: "Featured Products", path: "/featured" },
    { name: "Best Selling Products", path: "/best-selling" },
    { name: "Latest Products", path: "/latest" },
    { name: "Top Rated Products", path: "/top-rated" },
    { name: "Track Order", path: "/track-order" },
  ];

  // Our Products Data
  const ourProducts = [
    { name: "All Products", path: "/productlist" },
    { name: "Categories", path: "/categories" },
    { name: "Brands", path: "/brandlist" },
    { name: "Offers", path: "/Offer" },
    { name: "New Arrivals", path: "/new-arrivals" },
  ];

  // Our Services Data
  const ourServices = [
    { name: "Real Estate", path: "/realestatehome" },
    { name: "Gym", path: "/gymhome" },
    { name: "Saloon", path: "/saloonhome" },
    { name: "Travel Agency", path: "/travelhome" },
    { name: "Finance", path: "/financehome" },
    { name: "Tech Industry", path: "/techindustryhome" },
    { name: "Hotel & Restaurant", path: "/hotelhome" },
    { name: "Healthcare", path: "/helthcarehome" },
    { name: "Education", path: "/educationhome" },
    { name: "Professional", path: "/professionalhome" },
    { name: "Work Place", path: "/workplacehome" },
  ];

  // Other Links
  const otherLinks = [
    { name: "Terms & Conditions", path: "/terms" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Refund Policy", path: "/refund-policy" },
    { name: "Return Policy", path: "/return-policy" },
    { name: "Cancellation Policy", path: "/cancellation-policy" },
  ];

  // Social Media Links
  const socialLinks = [
    { icon: <FiFacebook size={14} />, url: info?.facebook, label: "Facebook", color: "#1877F2" },
    { icon: <FiInstagram size={14} />, url: info?.instagram, label: "Instagram", color: "#E4405F" },
    { icon: <RiTwitterXLine size={14} />, url: info?.twitter, label: "Twitter", color: "#1DA1F2" },
    { icon: <FiYoutube size={14} />, url: info?.youtube, label: "YouTube", color: "#FF0000" },
    { icon: <FaWhatsapp size={14} />, url: info?.whatsapp, label: "WhatsApp", color: "#25D366" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200">
            <FiArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-[16px] font-bold text-gray-900">About Us</h1>
            <p className="text-[11px] text-gray-500">Everything about Initcart</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Company Header */}
        <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Initcart" className="w-20 h-20 object-contain" />
          </div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">Initcart</h2>
          <p className="text-[11px] text-gray-500">Biggest MarketPlace</p>
          <div className="mt-3 inline-flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
            <FiCheckCircle size={12} className="text-green-600" />
            <span className="text-[10px] text-green-600 font-medium">Verified Marketplace</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiPhone size={14} className="text-blue-600" /> Contact Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <FiPhone size={12} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Phone</p>
                <p className="text-[12px] font-medium text-gray-800">{info?.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <FiMail size={12} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Email</p>
                <p className="text-[12px] font-medium text-gray-800">{info?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <FiMapPin size={12} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Address</p>
                <p className="text-[12px] font-medium text-gray-800">{info?.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiShoppingBag size={14} className="text-blue-600" /> Quick Links
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => navigate(link.path)}
                className="text-left py-2 px-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition"
              >
                <p className="text-[11px] text-gray-600 hover:text-blue-600 transition">{link.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Our Products */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiPackage size={14} className="text-blue-600" /> Our Products
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ourProducts.map((product, idx) => (
              <button
                key={idx}
                onClick={() => navigate(product.path)}
                className="text-left py-2 px-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition"
              >
                <p className="text-[11px] text-gray-600 hover:text-blue-600 transition">{product.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Our Services */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiTool size={14} className="text-blue-600" /> Our Services
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ourServices.map((service, idx) => (
              <button
                key={idx}
                onClick={() => navigate(service.path)}
                className="text-left py-2 px-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition"
              >
                <p className="text-[11px] text-gray-600 hover:text-blue-600 transition">{service.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiFileText size={14} className="text-blue-600" /> Policies
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {otherLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => navigate(link.path)}
                className="text-left py-2 px-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition"
              >
                <p className="text-[11px] text-gray-600 hover:text-blue-600 transition">{link.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiGlobe size={14} className="text-blue-600" /> Connect With Us
          </h3>
          <div className="flex justify-center gap-4">
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                style={{ background: `${social.color}15` }}
              >
                <span style={{ color: social.color }}>{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
          <h3 className="text-[14px] font-semibold mb-2">Subscribe to Newsletter</h3>
          <p className="text-[10px] text-blue-100 mb-3">Get latest updates and offers</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-xl bg-white/20 text-white text-[12px] px-3 py-2 placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white"
            />
            <button
              onClick={handleSubscribe}
              className="bg-white text-blue-600 rounded-xl px-4 py-2 text-[12px] font-semibold active:scale-95 transition"
            >
              {subscribed ? <FiCheckCircle size={14} /> : <FiSend size={14} />}
            </button>
          </div>
          {subscribed && (
            <p className="text-[10px] text-green-200 mt-2 text-center">Subscribed successfully!</p>
          )}
        </div>

        {/* Copyright */}
        <div className="text-center py-4">  
          <p className="text-[10px] text-gray-400">© 2025 Initcart. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default MobileAboutUsPage;