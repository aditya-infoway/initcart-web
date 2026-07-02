// src/Services/mobile/MobileServiceHome.jsx
import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import { FiSearch, FiHome, FiShoppingBag, FiTruck, FiShield, FiCheckCircle, FiTrendingUp, FiPackage, FiBox, FiStar, FiGlobe, FiSmartphone, FiGrid } from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { BsBoxSeam, BsBuilding } from "react-icons/bs";
import { AiOutlineShoppingCart, AiOutlineRocket } from "react-icons/ai";
import { IoChevronDown, IoRefreshOutline } from "react-icons/io5";
import { MdOutlineStar, MdOutlineVerified } from "react-icons/md";
import { RiSecurePaymentLine } from "react-icons/ri";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import MobileServiceBottomNav from "../../components/MobileServiceBottomNav";

// ─── Helper Functions ──────────────────────────────────────────────────────
function formatNumber(x) {
  if (x >= 1000000000) return (x / 1000000000).toFixed(1) + "B";
  if (x >= 1000000) return (x / 1000000).toFixed(1) + "M";
  if (x >= 1000) return (x / 1000).toFixed(0) + "k";
  return x;
}

function useCountUp(end, ms = 1700) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = Math.max(1, Math.floor(end / (ms / 16)));
    const id = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(id);
      } else setCount(start);
    }, 16);
    return () => clearInterval(id);
  }, [end, ms]);
  return count;
}

// ─── Mobile Feature Card ──────────────────────────────────────────────────
const MobileFeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3 hover:shadow-md transition">
    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
    <div>
      <h4 className="text-[13px] font-semibold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>{title}</h4>
      <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{desc}</p>
    </div>
  </div>
);

// ─── Mobile Category Card ──────────────────────────────────────────────────
const MobileCategoryCard = ({ icon: Icon, name, color }) => (
  <div className="flex flex-col items-center bg-white rounded-2xl p-3 shadow-sm border border-gray-100 min-w-[80px] hover:shadow-md transition">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: color }}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <span className="text-[10px] font-medium text-center text-gray-700 mt-1.5 leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
      {name}
    </span>
  </div>
);

// ─── Top Card ──────────────────────────────────────────────────────────────
const TopCard = ({ title, subtitle, img }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
    <div className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <FiTrendingUp className="w-4 h-4 text-blue-600" />
        <h4 className="text-[13px] font-semibold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>{title}</h4>
      </div>
      <p className="text-[10px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>{subtitle}</p>
    </div>
  </div>
);

// ─── Review Card ──────────────────────────────────────────────────────────
const ReviewCard = ({ name, role, text, img }) => (
  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
    <div className="flex items-center gap-3 mb-3">
      <img src={img} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
      <div>
        <div className="flex text-yellow-500 text-[10px]">
          <MdOutlineStar /><MdOutlineStar /><MdOutlineStar /><MdOutlineStar /><MdOutlineStar />
        </div>
        <p className="text-[12px] font-semibold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>{name}</p>
        <p className="text-[9px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>{role}</p>
      </div>
    </div>
    <p className="text-[11px] text-gray-700 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>"{text}"</p>
  </div>
);

// ─── Factory Card ──────────────────────────────────────────────────────────
const FactoryCard = ({ title, img, icon: Icon }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
    <div className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-blue-600" />
        <h4 className="text-[13px] font-semibold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>{title}</h4>
      </div>
      <p className="text-[10px] text-gray-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
        Work with manufacturers and get better pricing by sourcing direct.
      </p>
      <div className="mt-3 flex gap-2">
        <button className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-medium hover:bg-blue-700 transition" style={{ fontFamily: "'Inter', sans-serif" }}>
          Get Started
        </button>
        <button className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-medium hover:bg-gray-200 transition" style={{ fontFamily: "'Inter', sans-serif" }}>
          Learn more
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────
export default function MobileServiceHomeFull() {
  const navigate = useNavigate();
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [searchTerm, setSearchTerm] = useState("");
  const searchContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categoriesForDropdown = [
    "All categories", "Electronics", "Apparel", "Machinery",
    "Home & Garden", "Beauty & Personal Care", "Automotive",
    "Packaging", "Construction", "Health", "Sports", "Office",
    "Toys", "Jewelry", "Food & Beverage",
  ];

  const recommendedSearchTerms = [
    "iPhone 15 Pro Max", "T-Shirt for Men", "Samsung S24 Ultra",
    "Smartwatch", "Laptop Bag",
  ];

  const categoryColors = [
    '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
    '#06B6D4', '#A3A3A3'
  ];

  const categoryIcons = [
    { name: "Electronics", icon: FiSmartphone },
    { name: "Home & Garden", icon: FiHome },
    { name: "Beauty", icon: FiStar },
    { name: "Furniture", icon: FiBox },
    { name: "Apparel", icon: FiShoppingBag },
    { name: "Sports", icon: FiTruck },
    { name: "Toys", icon: FiPackage },
    { name: "Office", icon: FiGrid },
  ];

  // ─── Slider Settings ──────────────────────────────────────────────────────
  const categorySliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3.5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    pauseOnHover: true,
  };

  const topCardsSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    dotsClass: "slick-dots custom-dots",
  };

  const reviewsSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    dotsClass: "slick-dots custom-dots",
  };

  // ─── Counters ──────────────────────────────────────────────────────────────
  const servicesCount = useCountUp(200000000);
  const categoriesCount = useCountUp(5900);
  const suppliersCount = useCountUp(200000);
  const citiesCount = useCountUp(200);

  // ─── Top Cards Data ──────────────────────────────────────────────────────
  const topCards = [
    {
      title: "Hot Selling",
      subtitle: "Popular picks today",
      img: "https://images.pexels.com/photos/340889/pexels-photo-340889.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    },
    {
      title: "New Arrivals",
      subtitle: "120,000+ products added today",
      img: "https://images.pexels.com/photos/5638840/pexels-photo-5638840.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    },
    {
      title: "Top Deals",
      subtitle: "Save more with bulk pricing",
      img: "https://images.pexels.com/photos/4031853/pexels-photo-4031853.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    },
    {
      title: "Industrial Tools",
      subtitle: "Direct-from-factory offers",
      img: "https://images.pexels.com/photos/5926388/pexels-photo-5926388.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    },
  ];

  // ─── Reviews Data ──────────────────────────────────────────────────────
  const reviews = [
    {
      name: "Ron Williams",
      role: "CEO, Ron Williams Fitness",
      text: "A game changer for small businesses. Found the exact product we needed. Couldn't have sourced without it.",
      img: "https://i.pravatar.cc/150?img=1",
    },
    {
      name: "Eva Jane",
      role: "Beauty Supplier, New York",
      text: "A reliable partner — smooth transactions and excellent support. The platform made it easy to scale.",
      img: "https://i.pravatar.cc/150?img=2",
    },
    {
      name: "Aisha K.",
      role: "Procurement Manager, Europe",
      text: "Trade assurance gave us confidence to work with new suppliers and complete large orders without worry.",
      img: "https://i.pravatar.cc/150?img=3",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ─── HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="relative h-[300px] w-full overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-5">
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <HiOutlineShieldCheck className="w-3.5 h-3.5 text-white" />
                <span className="text-[9px] font-medium text-white" style={{ fontFamily: "'Inter', sans-serif" }}>Verified</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <RiSecurePaymentLine className="w-3.5 h-3.5 text-white" />
                <span className="text-[9px] font-medium text-white" style={{ fontFamily: "'Inter', sans-serif" }}>Secure</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <AiOutlineRocket className="w-3.5 h-3.5 text-white" />
                <span className="text-[9px] font-medium text-white" style={{ fontFamily: "'Inter', sans-serif" }}>Global</span>
              </div>
            </div>

            <h1 className="text-[18px] font-extrabold text-white leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              Leading B2B Platform<br />for Global Trade
            </h1>
            <p className="text-[11px] text-white/90 mt-1 max-w-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              Find verified suppliers, request samples, and buy with confidence.
            </p>

            {/* ─── Search Bar ────────────────────────────────────────────── */}

          </div>
        </div>
      </section>

      {/* ─── FEATURE CARDS ───────────────────────────────────────────────── */}
      <section className="px-4 py-4 -mt-6 relative z-10">
        <div className="grid grid-cols-1 gap-3">
          <MobileFeatureCard
            icon={FiGlobe}
            title="Millions of business offerings"
            desc="Discover millions of products from suppliers across the world."
          />
          <div className="grid grid-cols-2 gap-3">
            <MobileFeatureCard
              icon={MdOutlineVerified}
              title="Assured quality"
              desc="Verified suppliers and trade protection."
            />
            <MobileFeatureCard
              icon={AiOutlineRocket}
              title="One-stop solution"
              desc="Sourcing, logistics, and payment."
            />
          </div>
        </div>
      </section>

      {/* ─── STATS / TRUST ROW ────────────────────────────────────────────── */}
      <section className="px-4 py-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            Explore millions of offerings
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-[18px] font-extrabold text-blue-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                {formatNumber(servicesCount)}+
              </div>
              <div className="text-[9px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Products & Services</div>
            </div>
            <div>
              <div className="text-[18px] font-extrabold text-blue-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                {formatNumber(suppliersCount)}+
              </div>
              <div className="text-[9px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Verified Suppliers</div>
            </div>
            <div>
              <div className="text-[18px] font-extrabold text-blue-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                {formatNumber(categoriesCount)}+
              </div>
              <div className="text-[9px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Product Categories</div>
            </div>
            <div>
              <div className="text-[18px] font-extrabold text-blue-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                {formatNumber(citiesCount)}+
              </div>
              <div className="text-[9px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Countries & Regions</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES SLIDER ────────────────────────────────────────────── */}
      <section className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
            Categories
          </h3>
          <button className="text-[10px] text-blue-600 font-semibold hover:text-blue-800" style={{ fontFamily: "'Inter', sans-serif" }}>
            View All →
          </button>
        </div>
        <Slider {...categorySliderSettings}>
          {categoryIcons.map((cat, idx) => (
            <div key={idx} className="px-1.5">
              <MobileCategoryCard
                icon={cat.icon}
                name={cat.name}
                color={categoryColors[idx % categoryColors.length]}
              />
            </div>
          ))}
        </Slider>
      </section>

      {/* ─── DISCOVER SLIDER ───────────────────────────────────────────────── */}
      <section className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
            Discover Opportunities
          </h3>
          <button className="text-[10px] text-blue-600 font-semibold hover:text-blue-800" style={{ fontFamily: "'Inter', sans-serif" }}>
            View More →
          </button>
        </div>
        <Slider {...topCardsSettings}>
          {topCards.map((c, i) => (
            <div key={i} className="px-1">
              <TopCard title={c.title} subtitle={c.subtitle} img={c.img} />
            </div>
          ))}
        </Slider>
      </section>

      {/* ─── FACTORY CARDS ─────────────────────────────────────────────────── */}
      <section className="px-4 py-3">
        <h3 className="text-[14px] font-bold text-gray-800 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
          Source Direct-from-Factory
        </h3>
        <div className="space-y-3">
          <FactoryCard
            title="Get samples"
            img="https://images.pexels.com/photos/5460567/pexels-photo-5460567.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop"
            icon={FiPackage}
          />
          <FactoryCard
            title="Take factory tour"
            img="https://images.pexels.com/photos/4505969/pexels-photo-4505969.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop"
            icon={BsBuilding}
          />
          <FactoryCard
            title="Connect with top suppliers"
            img="https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop"
            icon={FiTruck}
          />
        </div>
      </section>

      {/* ─── REVIEWS ───────────────────────────────────────────────────────── */}
      <section className="px-4 py-4 bg-white">
        <h3 className="text-[14px] font-bold text-gray-800 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
          What Our Customers Say
        </h3>
        <Slider {...reviewsSettings}>
          {reviews.map((r, i) => (
            <div key={i} className="px-1">
              <ReviewCard name={r.name} role={r.role} text={r.text} img={r.img} />
            </div>
          ))}
        </Slider>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────────── */}
      <section className="px-4 py-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-center shadow-lg">
          <h3 className="text-[16px] font-bold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            Ready to Get Started?
          </h3>
          <p className="text-[11px] text-blue-100 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            Access millions of products from trusted suppliers.
          </p>
          <button className="mt-3 px-6 py-2.5 rounded-full bg-white text-blue-600 text-[12px] font-semibold shadow-md hover:bg-gray-50 transition" style={{ fontFamily: "'Inter', sans-serif" }}>
            Sign Up Now
          </button>
        </div>
      </section>

      {/* ─── BOTTOM NAV ────────────────────────────────────────────────────── */}
      <MobileServiceBottomNav />

      {/* ─── Custom Dots Styles ────────────────────────────────────────────── */}
      <style>{`
        .custom-dots {
          bottom: -20px;
          display: flex !important;
          justify-content: center;
          gap: 6px;
          padding: 0;
        }
        .custom-dots li {
          margin: 0;
          width: auto;
        }
        .custom-dots li button {
          padding: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s;
        }
        .custom-dots li button::before {
          display: none;
        }
        .custom-dots li.slick-active button {
          background: #2563eb;
          width: 24px;
          border-radius: 4px;
        }
        .slick-slide {
          height: auto !important;
        }
        .slick-track {
          display: flex !important;
          align-items: stretch !important;
        }
        .slick-slide > div {
          height: 100%;
        }
      `}</style>
    </div>
  );
}