import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import { FiSearch } from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { BsBoxSeam } from "react-icons/bs";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { IoChevronDown, IoRefreshOutline } from "react-icons/io5";
import { MdOutlineStar } from "react-icons/md";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Serviceslider from "./ServiceSlider";
import ServiceShowcase from "./ServiceFlashdeal";
import MobileServiceBottomNav from "../components/MobileServiceBottomNav";
import MobileServiceHomeFull from "./mobile/MobileServiceHome";

function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      aria-label="next"
      className={`${className} bg-white/95 text-gray-800 rounded-full p-2 shadow-md`}
      style={{ ...style, display: "block", right: -20, zIndex: 10 }}
      onClick={onClick}
    >
      →
    </button>
  );
}
function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      aria-label="prev"
      className={`${className} bg-white/95 text-gray-800 rounded-full p-2 shadow-md`}
      style={{ ...style, display: "block", left: -20, zIndex: 10 }}
      onClick={onClick}
    >
      ←
    </button>
  );
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

// helper to format large numbers as in the image
function formatNumber(x) {
  if (x >= 1000000000) return (x / 1000000000).toFixed(1) + "B";
  if (x >= 1000000) return (x / 1000000).toFixed(1) + "M";
  if (x >= 1000) return (x / 1000).toFixed(0) + "k";
  return x;
}

// FeatureCard reverted to side-by-side, but with new styling
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-blue-50 rounded-2xl p-6 shadow flex items-start gap-4 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer">
      <div className="text-3xl bg-white p-3 rounded-lg">{icon}</div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-700 mt-1">{desc}</p>
      </div>
    </div>
  );
}

export default function ServiceHomeFull() {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [searchTerm, setSearchTerm] = useState("");

  const searchContainerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);  
    // ✅ Mobile detection
    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);
  
    // ✅ If mobile, render mobile version
    if (isMobile) {
      return <MobileServiceHomeFull/>;
    }    
  

  // Close dropdown if clicked outside search container
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const categoriesForDropdown = [
    "All categories",
    "Electronics",
    "Apparel",
    "Machinery",
    "Home & Garden",
    "Beauty & Personal Care",
    "Automotive",
    "Packaging",
    "Construction",
    "Health",
    "Sports",
    "Office",
    "Toys",
    "Jewelry",
    "Food & Beverage",
  ];

  const recommendedSearchTerms = [
    "i phone 15 pro max",
    "t shirt for men",
    "samsung s24 ultra",
    "smartwatch",
    "laptop bag",
  ];

  const categoryIcons = [
    { name: "Environment", icon: "🌱" },
    { name: "Consumer Electronics", icon: "📱" },
    { name: "Home & Garden", icon: "🏡" },
    { name: "Commercial Equipment", icon: "🏗️" },
    { name: "Beauty", icon: "💄" },
    { name: "Jewelry, Eyewear", icon: "💎" },
    { name: "Industrial Machinery", icon: "⚙️" },
    { name: "Furniture", icon: "🛋️" },
    { name: "Apparel", icon: "👕" },
    { name: "Sports", icon: "⚽" },
    { name: "Office", icon: "📁" },
    { name: "Toys", icon: "🧸" },
  ];

  // UPDATED: Stable and thematic image links for Top Cards (Discover section)
  const topCards = [
    {
      title: "Hot Selling",
      subtitle: "Popular picks today",
      img: "https://images.pexels.com/photos/340889/pexels-photo-340889.jpeg?auto=compress&cs=tinysrgb&w=300&h=180&fit=crop", // Electronics
    },
    {
      title: "New Arrivals",
      subtitle: "120,000+ products added today",
      img: "https://images.pexels.com/photos/5638840/pexels-photo-5638840.jpeg?auto=compress&cs=tinysrgb&w=300&h=180&fit=crop", // Apparel/Textiles
    },
    {
      title: "Top Deals",
      subtitle: "Save more with bulk pricing",
      img: "https://images.pexels.com/photos/4031853/pexels-photo-4031853.jpeg?auto=compress&cs=tinysrgb&w=300&h=180&fit=crop", // Shipping/Bulk
    },
    {
      title: "Industrial Tools",
      subtitle: "Direct-from-factory offers",
      img: "https://images.pexels.com/photos/5926388/pexels-photo-5926388.jpeg?auto=compress&cs=tinysrgb&w=300&h=180&fit=crop", // Power Tools
    },
  ];

  // Factory Cards: Image links retained from last update (stable and relevant)
  const factoryCards = [
    { title: "Get samples", img: "https://images.pexels.com/photos/5460567/pexels-photo-5460567.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop" },
    { title: "Take factory tour", img: "https://images.pexels.com/photos/4505969/pexels-photo-4505969.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop" },
    { title: "Connect with top suppliers", img: "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop" },
  ];

  // Testimonial Data: Image links retained for reliability
  const reviews = [
    {
      name: "Ron Williams and Tonja Williams",
      role: "Founder and CEO (respectively) of Ron Williams Fitness",
      text: "Alibaba.com is a game changer for small businesses like us. We were able to find the exact product we needed and I don't think we could have sourced anything without Alibaba.com.",
      img: "https://i.pravatar.cc/150?img=1"
    },
    {
      name: "Eva Jane",
      role: "Beauty Supplier, New York",
      text: "A reliable partner — smooth transactions and excellent support. The platform made it easy to scale.",
      img: "https://i.pravatar.cc/150?img=2"
    },
    {
      name: "Aisha K.",
      role: "Procurement Manager, Europe",
      text: "Trade assurance gave us confidence to work with new suppliers and complete large orders without worry.",
      img: "https://i.pravatar.cc/150?img=3"
    },
  ];

  const heroSliderSettings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 7000,
    arrows: false,
  };

  // --- DISCOVER SECTION SLIDER SETTINGS ---
  const topCardsSettings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } }, // ✅ Show 1 item per row on mobile
    ],
  };

  // --- TESTIMONIALS SLIDER SETTINGS ---
  const reviewsSettings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 7000,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 1 } }, // ✅ Ensures 1 item per row in mobile view
    ],
  };

  const categorySliderSettings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 7,
    slidesToScroll: 2,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 6 } },
      { breakpoint: 1024, settings: { slidesToShow: 5 } },
      { breakpoint: 768, settings: { slidesToShow: 4 } },
      { breakpoint: 640, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 3, slidesToScroll: 1 } },
    ],
  };

  const servicesCount = useCountUp(200000000);
  const categoriesCount = useCountUp(5900);
  const suppliersCount = useCountUp(200000);
  const citiesCount = useCountUp(200);

  return (
    <div className="font-sans text-gray-800">
      {/* HERO BANNER & SEARCH */}
      <section className="relative h-[420px] md:h-[520px] w-full overflow-visible">
        <Slider {...heroSliderSettings} className="h-full">
          <div>
            <div
              className="h-[420px] md:h-[520px] bg-cover bg-center flex items-center"
              style={{
                // Hero Banner BG: Image retained from last update (stable and relevant)
                backgroundImage: "url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
              }}
            >
              <div className="w-full h-full bg-gradient-to-r from-black/60 to-black/10 absolute"></div>
              <div className="absolute inset-0 flex items-center px-4 sm:px-6 md:px-10 lg:px-24">
                <div className="max-w-xl w-full text-white relative **z-20** text-left">
                  {/* Quick links above main title */}
                  <div className="hidden sm:flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90 mb-4">
                    <div className="flex items-center gap-1.5">
                      <HiOutlineShieldCheck className="w-5 h-5 text-white/90" />
                      <span className="font-medium">Verified Supplier</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BsBoxSeam className="w-5 h-5 text-white/90" />
                      <span className="font-medium">Trade Assurance</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AiOutlineShoppingCart className="w-5 h-5 text-white/90" />
                      <span className="font-medium">Secure Transactions</span>
                    </div>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow-lg">
                    The leading B2B ecommerce platform for global trade
                  </h1>
                  <p className="mt-3 text-xs sm:text-sm md:text-base text-white/90 max-w-lg">
                    Find verified suppliers, request samples, and buy with confidence — all in one place.
                  </p>

                  {/* Search Bar with integrated dropdown - Z-INDEX FIXED HERE (relative z-30) */}
                  <div className="mt-6 sm:mt-8 relative z-30" ref={searchContainerRef}>
                    <div className="bg-white rounded-xl md:rounded-full shadow-xl p-1 flex items-center relative z-20">
                      <div className="flex items-center flex-1">
                        {/* Category Dropdown (integrated into search bar logic) */}
                        <div className="relative">
                          <button
                            className="flex items-center justify-between w-full md:w-36 px-4 py-2.5 text-sm md:py-3.5 bg-gray-100 md:bg-white rounded-lg md:rounded-full border-r border-gray-200 focus:outline-none hover:bg-gray-200 transition-colors"
                            onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                          >
                            <span className="truncate text-black">{selectedCategory}</span> <IoChevronDown className="ml-1 text-gray-700" />
                          </button>
                        </div>
                        <input
                          className="flex-1 w-full px-3 md:px-4 py-2.5 text-sm md:py-3.5 rounded-lg md:rounded-none focus:outline-none text-gray-800"
                          placeholder="Search products, suppliers, or services..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onFocus={() => setShowSearchDropdown(true)}
                        />
                      </div>
                      <button className="justify-center flex items-center gap-2 bg-blue-700 hover:bg-blue-700 text-white font-semibold px-5 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-full shadow">
                        <FiSearch /> Search
                      </button>
                    </div>

                    {/* Unified Search Dropdown Content - Z-INDEX FIXED TO Z-[999] (Will always be on top) */}
                    {showSearchDropdown && (
                      <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[999] ">
                        <div className="p-4 border-b border-gray-100">
                          <h4 className="font-semibold text-gray-700 mb-2">Recommended for you</h4>
                          <div className="space-y-1">
                            {recommendedSearchTerms.map((term, idx) => (
                              <div
                                key={`rec-${idx}`}
                                className="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded"
                                onClick={() => {
                                  setSearchTerm(term);
                                  setShowSearchDropdown(false);
                                }}
                              >
                                {term}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-700">All Categories</h4>
                            <button className="flex items-center text-xs text-gray-700 hover:text-blue-700">
                              <IoRefreshOutline className="mr-1" /> Refresh
                            </button>
                          </div>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {categoriesForDropdown.map((cat, idx) => (
                              <div
                                key={`cat-${idx}`}
                                className="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setShowSearchDropdown(false);
                                }}
                              >
                                {cat}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Slider>
      </section>

      {/* 4 FEATURE CARDS (Now correctly positioned below the z-indexed dropdown) */}
      <section className="px-4 sm:px-6 md:px-16 lg:px-32 py-10 md:py-12 -mt-8 relative z-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <FeatureCard
            title="Millions of business offerings"
            desc="Discover millions of products from suppliers across the world."
            icon="🏢"
          />
          <FeatureCard
            title="Assured quality and transactions"
            desc="Verified suppliers and trade protection keep your business secure."
            icon="✅"
          />
          <FeatureCard
            title="One-stop trading solution"
            desc="Sourcing, logistics, and payment — streamlined for you."
            icon="🔁"
          />
          <FeatureCard
            title="Tailored trading experience"
            desc="Get personalized supplier recommendations and pricing."
            icon="🎯"
          />
        </div>
      </section>

      {/* --- */}

      {/* STATS / TRUST ROW */}
      <section className="px-4 sm:px-6 md:px-16 lg:px-32 py-10 md:py-12">
        <div className="bg-white rounded-2xl shadow px-6 py-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side: Heading */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold leading-tight">
                Explore millions of offerings tailored to your business needs
              </h3>
            </div>
            {/* Right side: Stats */}
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-blue-700">{formatNumber(servicesCount)}+</div>
                <div className="text-xs md:text-sm text-gray-700">Products & Services</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-blue-700">{formatNumber(suppliersCount)}+</div>
                <div className="text-xs md:text-sm text-gray-700">Verified Suppliers</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-blue-700">{formatNumber(categoriesCount)}+</div>
                <div className="text-xs md:text-sm text-gray-700">Product Categories</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-blue-700">{formatNumber(citiesCount)}+</div>
                <div className="text-xs md:text-sm text-gray-700">Countries & Regions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- */}

      {/* CATEGORIES SLIDER */}
      <section className="px-4 sm:px-6 md:px-16 lg:px-32 py-4">
        <div className="relative">
          <ServiceShowcase />
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-16 lg:px-32 py-8">
        <div className="relative">
          <Serviceslider />
        </div>
      </section>

      {/* --- */}

      {/* DISCOVERY / TOP CARDS SLIDER (Images Updated) */}
      <section className="px-4 sm:px-6 md:px-16 lg:px-32 py-10 md:py-12 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-2xl font-bold">Discover your next business opportunity</h3>
          <a className="hidden sm:inline text-sm text-blue-700 font-semibold hover:underline" href="#!">View more</a>
        </div>

        <div className="overflow-hidden"> {/* ✅ prevent overflow issue */}
          <Slider {...topCardsSettings}>
            {topCards.map((c, i) => (
              <div key={i} className="px-2">
                <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-shadow flex">
                  <div
                    className="w-1/3 min-w-[120px] h-36 bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${c.img})` }}
                  ></div>
                  <div className="p-4 flex flex-col justify-center">
                    <h4 className="font-semibold text-base">{c.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{c.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>


      {/* --- */}

      {/* DIRECT FROM FACTORY CARDS (Images Retained) */}
      <section className="px-4 sm:px-6 md:px-16 lg:px-32 py-10 md:py-12">
        <h3 className="text-2xl font-bold mb-6">Source direct-from-factory</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {factoryCards.map((f, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow">
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${f.img})` }} />
              <div className="p-6">
                <h4 className="font-semibold">{f.title}</h4>
                <p className="text-sm text-gray-700 mt-2">Work with manufacturers and get better pricing by sourcing direct.</p>
                <div className="mt-4 flex items-center gap-3">
                  <button className="px-4 py-2 rounded-full bg-blue-700 text-white text-sm hover:bg-blue-700 transition-colors">Get Started</button>
                  <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors">Learn more</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- */}

      {/* TESTIMONIALS (Images Retained) */}
      <section className="px-4 sm:px-6 md:px-16 lg:px-32 py-10 md:py-12 bg-gray-50 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">What our customers say</h3>

          <div className="overflow-hidden"> {/* ✅ prevent overflow issue */}
            <Slider {...reviewsSettings}>
              {reviews.map((r, i) => (
                <div key={i} className="px-3">
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow flex flex-col md:flex-row gap-6 items-start hover:shadow-lg transition-shadow">
                    <div className="flex flex-col items-start w-full md:w-1/3 max-w-[200px] flex-shrink-0">
                      <img
                        src={r.img}
                        alt={r.name}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover shadow-md mb-3"
                      />
                      <div className="flex text-yellow-700 mb-2">
                        <MdOutlineStar /><MdOutlineStar /><MdOutlineStar /><MdOutlineStar /><MdOutlineStar />
                      </div>
                      <div className="text-base md:text-lg font-bold text-gray-800 leading-snug">{r.name}</div>
                      <div className="text-xs md:text-sm text-gray-700 mt-1 leading-snug">{r.role}</div>
                    </div>

                    <div className="relative w-full md:w-2/3 mt-4 md:mt-0 flex items-center">
                      <p className="text-lg md:text-xl text-gray-800 font-semibold leading-relaxed z-10">"{r.text}"</p>
                      <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 text-6xl md:text-8xl font-serif text-gray-200 opacity-70">”</div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>


      {/* --- */}

      {/* FINAL CTA */}
      <section className="px-4 sm:px-6 md:px-16 lg:px-32 py-10 md:py-6">
        <div className="bg-blue-700 text-white rounded-2xl p-8 md:p-12 text-center shadow-lg">
          <h3 className="text-2xl md:text-3xl font-bold">Ready to get started?</h3>
          <p className="mt-3 md:mt-4 max-w-2xl mx-auto text-sm md:text-base">Access millions of products from trusted suppliers by signing up today.</p>
          <div className="mt-5 md:mt-6">
            <button className="px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-white text-blue-700 font-semibold hover:bg-gray-100 transition-colors">Sign Up</button>
          </div>
        </div>
      </section>
      <MobileServiceBottomNav />
    </div>
  );
}