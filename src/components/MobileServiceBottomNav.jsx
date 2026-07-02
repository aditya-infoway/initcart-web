// src/components/MobileServiceBottomNav.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiGrid,
  FiServer,
  FiTruck,
  FiUser,
  FiMoreHorizontal,
  FiX,
  FiShoppingCart,
  FiShoppingBag,
  FiTag,
  FiBox,
  FiFilter,
  FiLogOut,
  FiPackage,
  FiChevronDown,
  FiMenu,
  FiHeart,
} from "react-icons/fi";

// Service icons for the services menu
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
// import restaurantIcon from "../assets/service-icon/restaurant.png";

const allServices = [
  { id: 1, title: "Real Estate", path: "/realestatehome", img: realEstateIcon },
  { id: 2, title: "Gym", path: "/gymhome", img: gymIcon },
  { id: 3, title: "Saloon", path: "/saloonhome", img: saloonIcon },
  { id: 4, title: "Travel", path: "/travelhome", img: travelIcon },
  { id: 5, title: "Finance", path: "/financehome", img: financeIcon },
  { id: 6, title: "Tech", path: "/techindustryhome", img: techIcon },
  { id: 7, title: "Hotel", path: "/hotelhome", img: hotelIcon },
  { id: 8, title: "Healthcare", path: "/helthcarehome", img: healthcareIcon },
  { id: 9, title: "Education", path: "/educationhome", img: educationIcon },
  { id: 10, title: "Professional", path: "/professionalhome", img: professionalIcon },
  { id: 11, title: "Work Place", path: "/workplacehome", img: workplaceIcon },
  // { id: 12, title: "Restaurant", path: "/restauranthome", img: restaurantIcon },
];

export default function MobileServiceBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState("home");
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showConditionMenu, setShowConditionMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // ── Check login status ──────────────────────────────────────────────────
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('customer_token');
      const userStr = localStorage.getItem('customer_user');
      if (token && userStr) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(userStr));
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('authChanged', checkLogin);
    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('authChanged', checkLogin);
    };
  }, []);

  // ── Set active tab based on route ──────────────────────────────────────
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/servicehome") setActiveTab("home");
    else if (path === "/categories" || path.startsWith("/category-products")) setActiveTab("category");
    else if (path === "/servicelistpage" || path.includes("service")) setActiveTab("service");
    else if (path === "/sellerlist") setActiveTab("vendors");
    else if (path === "/customerProfile" || path === "/customer/login" || path === "/customer/registration") setActiveTab("profile");
    else setActiveTab("more");
  }, [location]);

  // ── Navigation handlers ──────────────────────────────────────────────────
  const handleNavigate = (tab, path) => {
    setActiveTab(tab);
    setShowServicesMenu(false);
    setShowMoreMenu(false);
    navigate(path);
  };

  const handleConditionSearch = (condition) => {
    navigate(`/searchlist?keywords=${encodeURIComponent(condition)}`);
    setShowMoreMenu(false);
    setShowConditionMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    localStorage.removeItem('remember_me');
    window.dispatchEvent(new Event("authChanged"));
    setIsLoggedIn(false);
    setUserData(null);
    setShowMoreMenu(false);
    setActiveTab("home");
    navigate('/');
  };

  // ── Bottom Nav Icons ──────────────────────────────────────────────────────
  const NavIcon = ({ tab, icon: Icon, label, path, activeColor = "text-blue-600" }) => (
    <button
      onClick={() => handleNavigate(tab, path)}
      className="flex flex-col items-center justify-center w-1/5 py-1"
    >
      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
        activeTab === tab ? "bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-300 shadow-lg scale-110" : "bg-gray-100"
      }`}>
        <Icon className={`h-6 w-6 ${activeTab === tab ? `${activeColor} scale-125` : activeColor}`} />
        {activeTab === tab && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-ping" />}
        {tab === "profile" && isLoggedIn && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
            <span className="text-[8px]">✓</span>
          </span>
        )}
      </div>
      <span className={`text-xs font-medium ${activeTab === tab ? "font-bold" : ""}`} style={{ color: '#1565C0' }}>
        {label}
      </span>
    </button>
  );

  return (
    <>
      {/* ── BOTTOM NAVIGATION BAR ─────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100]">
        <div className="bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.1)] rounded-t-3xl">
          <div className="flex items-center justify-between px-1 py-3">
            
            {/* Service */}
            <button
              onClick={() => {
                setShowMoreMenu(false);
                setShowServicesMenu(!showServicesMenu);
                setActiveTab("service");
              }}
              className="flex flex-col items-center justify-center w-1/5 py-1"
            >
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                showServicesMenu || activeTab === "service" ? "bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-300 shadow-lg scale-110" : "bg-gray-100"
              }`}>
                <FiServer className={`h-6 w-6 ${showServicesMenu || activeTab === "service" ? "text-blue-600 scale-125" : "text-blue-600"}`} />
                {(showServicesMenu || activeTab === "service") && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-ping" />}
              </div>
              <span className={`text-xs font-medium ${showServicesMenu || activeTab === "service" ? "font-bold" : ""}`} style={{ color: '#1565C0' }}>
                Service
              </span>
            </button>

            {/* Home */}
            <NavIcon tab="home" icon={FiHome} label="Home" path="/servicehome" />

            {/* Vendors */}
            <NavIcon tab="vendors" icon={FiTruck} label="Vendors" path="/sellerlist" />

            {/* Profile */}
            <NavIcon tab="profile" icon={FiUser} label="Profile" path={isLoggedIn ? "/customerProfile" : "/customer/login"} />

            {/* More */}
            <button
              onClick={() => {
                setShowServicesMenu(false);
                setShowMoreMenu(!showMoreMenu);
                setActiveTab("more");
              }}
              className="flex flex-col items-center justify-center w-1/5 py-1"
            >
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                showMoreMenu || activeTab === "more" ? "bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-blue-300 shadow-lg scale-110" : "bg-gray-100"
              }`}>
                <FiMoreHorizontal className={`h-6 w-6 ${showMoreMenu || activeTab === "more" ? "text-blue-600 scale-125" : "text-blue-600"}`} />
                {(showMoreMenu || activeTab === "more") && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-ping" />}
              </div>
              <span className={`text-xs font-medium ${showMoreMenu || activeTab === "more" ? "font-bold" : ""}`} style={{ color: '#1565C0' }}>
                More
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* ── SERVICES MENU (Bottom Sheet) ──────────────────────────────────── */}
      {showServicesMenu && (
        <div className="fixed inset-0 z-[90]" onClick={() => setShowServicesMenu(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-[#1565C0] rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            
            <div className="sticky top-0 bg-[#1565C0] px-4 py-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg">Our Services</h3>
                  <p className="text-blue-100 text-sm mt-1">Explore premium services</p>
                </div>
                <button onClick={() => setShowServicesMenu(false)} className="p-2 hover:bg-blue-500 rounded-full">
                  <FiX className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-4 pb-28">
              <button
                onClick={() => { setShowServicesMenu(false); navigate("/servicelistpage"); }}
                className="w-full mb-6 p-4 bg-blue-500 rounded-2xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="text-white text-lg font-bold">View All Services</h4>
                    <p className="text-blue-100 text-sm mt-1">Browse all services in one place</p>
                  </div>
                  <div className="bg-white p-3 rounded-full"><FiServer className="h-6 w-6 text-blue-500" /></div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-3">
                {allServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => { setShowServicesMenu(false); navigate(service.path); }}
                    className="bg-white rounded-xl p-4 text-left hover:shadow-lg transition-shadow w-full"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-3 overflow-hidden ring-2 ring-white">
                        {service.img ? (
                          <img src={service.img} alt={service.title} className="w-14 h-14 object-cover rounded-full" />
                        ) : (
                          <span className="text-blue-500 font-bold text-lg">{service.title.substring(0, 2)}</span>
                        )}
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

{/* ── MORE MENU (Bottom Sheet) ──────────────────────────────────────── */}
{showMoreMenu && (
  <div className="fixed inset-0 z-[80]" onClick={() => setShowMoreMenu(false)}>
    <div className="absolute bottom-0 left-0 right-0 bg-[#1565C0] rounded-t-3xl shadow-2xl h-[85vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}>
      
      <div className="sticky top-0 bg-[#1565C0] border-b border-blue-600 px-4 py-4 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">Menu</h3>
          <button onClick={() => setShowMoreMenu(false)} className="p-2 hover:bg-blue-600 rounded-full">
            <FiX className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      <div className="p-4 pb-28 overflow-y-auto flex-1">
        {isLoggedIn && userData && (
          <div className="mb-4 p-4 bg-blue-600 rounded-2xl">
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

        <div className="space-y-1">

          {/* ── Header ke menu links ─────────────────────────── */}
          <p className="text-blue-300 text-xs font-semibold uppercase px-3 pt-2 pb-1">Navigation</p>

          <button
            onClick={() => { setShowMoreMenu(false); navigate("/"); setActiveTab("home"); }}
            className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white"
          >
            <FiHome className="h-5 w-5" />
            <span className="font-medium">Home</span>
          </button>

          {/* Services with sub-menu toggle */}
          <div>
            <button
              onClick={() => setShowConditionMenu(!showConditionMenu)}
              className="flex items-center justify-between w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white"
            >
              <div className="flex items-center gap-3">
                <FiServer className="h-5 w-5" />
                <span className="font-medium">Services</span>
              </div>
              <FiChevronDown className={`h-4 w-4 transition-transform ${showConditionMenu ? "rotate-180" : ""}`} />
            </button>
            {showConditionMenu && (
              <div className="ml-4 mt-1 space-y-1 bg-blue-700 rounded-xl p-2">
                {[
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
                ].map(([title, path]) => (
                  <button
                    key={path}
                    onClick={() => { setShowMoreMenu(false); setShowConditionMenu(false); navigate(path); }}
                    className="block w-full text-left px-3 py-2 text-sm text-blue-100 hover:text-white hover:bg-blue-600 rounded-lg"
                  >
                    {title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => { setShowMoreMenu(false); navigate("/sellerlist"); setActiveTab("vendors"); }}
            className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white"
          >
            <FiTruck className="h-5 w-5" />
            <span className="font-medium">All Vendors</span>
          </button>

          <button
            onClick={() => { setShowMoreMenu(false); navigate("/brandlist"); }}
            className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white"
          >
            <FiBox className="h-5 w-5" />
            <span className="font-medium">About Us</span>
          </button>

          <button
            onClick={() => { setShowMoreMenu(false); navigate("/Offer"); }}
            className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white"
          >
            <FiTag className="h-5 w-5" />
            <span className="font-medium">Contact Us</span>
          </button>

          {/* Vendor Zone */}
          <p className="text-blue-300 text-xs font-semibold uppercase px-3 pt-3 pb-1">Vendor Zone</p>

          <button
            onClick={() => { setShowMoreMenu(false); navigate("/vendor-registration"); }}
            className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white"
          >
            <FiUser className="h-5 w-5" />
            <span className="font-medium">Become a Vendor</span>
          </button>

          <button
            onClick={() => { setShowMoreMenu(false); navigate("/login"); }}
            className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white"
          >
            <FiUser className="h-5 w-5" />
            <span className="font-medium">Vendor Login</span>
          </button>



          {/* ── Account section ──────────────────────────────── */}
          <p className="text-blue-300 text-xs font-semibold uppercase px-3 pt-3 pb-1">Account</p>

          {isLoggedIn ? (
            <>
              <button
                onClick={() => { setShowMoreMenu(false); navigate("/customerProfile"); setActiveTab("profile"); }}
                className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white"
              >
                <FiUser className="h-5 w-5" />
                <span className="font-medium">My Dashboard</span>
              </button>
              <button
                onClick={() => { setShowMoreMenu(false); navigate("/orders"); }}
                className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white"
              >
                <FiPackage className="h-5 w-5" />
                <span className="font-medium">My Orders</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left p-3 rounded-xl text-red-300 hover:bg-red-900 hover:text-white"
              >
                <FiLogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setShowMoreMenu(false); navigate("/customer/login"); setActiveTab("profile"); }}
                className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white"
              >
                <FiUser className="h-5 w-5" />
                <span className="font-medium">User Login</span>
              </button>
              <button
                onClick={() => { setShowMoreMenu(false); navigate("/customer/registration"); }}
                className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-blue-600 text-white"
              >
                <FiUser className="h-5 w-5" />
                <span className="font-medium">User Registration</span>
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  </div>
)}


      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}