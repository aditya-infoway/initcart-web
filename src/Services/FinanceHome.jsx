// src/pages/home/FinanceHome.tsx
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiMapPin, FiPhone, FiStar, FiCheckCircle, FiBriefcase, FiUser, FiClock } from "react-icons/fi";
import { FaQuoteLeft, FaStar, FaChartLine, FaShieldAlt, FaHandshake, FaFileInvoiceDollar, FaBalanceScale, FaCoins } from "react-icons/fa";
import { publicAxios } from "../api/axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MobileFinanceHome from "./mobile/MobileFinanaceHome";
import ServiceReviewsDisplay from "./ServiceReviewsDisplay";

export default function FinanceHome() {

  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // ✅ Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ If mobile, render mobile version
  if (isMobile) {
    return <MobileFinanceHome />;
  }

  // State variables
  const [selectedCity, setSelectedCity] = useState("");
  const [showCities, setShowCities] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [cities, setCities] = useState([]);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [ads, setAds] = useState({ bigAd: null, slot1: null, slot2: null });
  const [loading, setLoading] = useState(true);


  // Slider settings
  const categorySlider = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const reviewSlider = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [{ breakpoint: 1024, settings: { slidesToShow: 1 } }],
  };

  // Navigation functions
  const navigateToServiceDetail = (id) => {
    navigate(`/financedetail/${id}`);
  };

  const navigateToViewAll = (subcategory) => {
    if (!subcategory) return;
    navigate(`/searchservice?subcategory=${encodeURIComponent(subcategory)}&type=finance`);
  };

  const navigateToServiceList = () => {
    const params = new URLSearchParams();
    params.append("type", "finance");
    if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
    if (selectedCity) params.append("city", selectedCity);
    if (searchKeyword.trim() !== "") params.append("keyword", searchKeyword.trim());
    navigate(`/searchservice?${params.toString()}`);
  };

  const openInquiryModal = (service) => {
    setSelectedService(service);
    setShowInquiryModal(true);
  };

  const closeInquiryModal = () => {
    setShowInquiryModal(false);
    setSelectedService(null);
  };

  // Fetch subcategories for Finance
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await publicAxios.get("api/service-subcategories/by_service/?service=Finance");
        const data = response.data;
        let subs = [];
        if (data["Finance"]) subs = data["Finance"];
        else if (Array.isArray(data)) subs = data;
        else if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          if (firstKey && data[firstKey]) subs = data[firstKey];
        }
        setSubcategories(subs);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchSubcategories();
  }, []);

  // Fetch cities based on selected subcategory
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await publicAxios.get("services/service-city/");
        const cityData = Array.isArray(res.data.cities) ? res.data.cities : [];
        const financeCities = cityData.filter(city => city.type === "finance_service");
        
        const filteredCities = selectedSubcategory
          ? financeCities.filter(city =>
              city.subcategories?.some(
                sub => sub.name?.toLowerCase() === selectedSubcategory.toLowerCase()
              )
            )
          : financeCities;
        
        setCities(filteredCities);
        setSelectedCity("");
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, [selectedSubcategory]);

  // Fetch finance services
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await publicAxios.get("api/public/finance-services/");
        const services = Array.isArray(response.data) ? response.data : response.data.results || [];
        
        // Group services by subcategory
        const grouped = Object.values(
          services.reduce((acc, service) => {
            const subcat = service.subcategory_name || "Other";
            if (!acc[subcat]) {
              acc[subcat] = { subcategory: subcat, services: [] };
            }
            acc[subcat].services.push(service);
            return acc;
          }, {})
        );
        
        setSubcategoryData(grouped);
      } catch (error) {
        console.error("Error fetching finance services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch finance ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const [bigAdRes, smallAdsRes] = await Promise.all([
          publicAxios.get("api/init-finance-bigad/").catch(() => ({ data: null })),
          publicAxios.get("api/init-finance-smallads/").catch(() => ({ data: [] }))
        ]);
        
        const slot1 = smallAdsRes.data?.find(ad => ad.slot === 1);
        const slot2 = smallAdsRes.data?.find(ad => ad.slot === 2);
        
        setAds({ 
          bigAd: bigAdRes.data, 
          slot1, 
          slot2 
        });
      } catch (error) {
        console.error("Error fetching finance ads:", error);
      }
    };
    fetchAds();
  }, []);

  // Render service blocks
  const renderServiceBlocks = () => {
    const blocks = [];
    for (let i = 0; i < subcategoryData.length; i += 2) {
      blocks.push(subcategoryData.slice(i, i + 2));
    }
    
    return blocks.map((block, blockIndex) => (
      <React.Fragment key={blockIndex}>
        {block.map((category, idx) => (
          <section key={idx} className="py-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">{category.subcategory}</h2>
              <button
                onClick={() => navigateToViewAll(category.subcategory)}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition"
              >
                View All →
              </button>
            </div>
            
            {category.services?.length > 0 ? (
              <Slider {...categorySlider}>
                {category.services.map((service) => (
                  <div key={service.id} className="p-2">
                    <div className="bg-white rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={service.main_image || "https://placehold.co/400x300/2563EB/white?text=Finance+Service"}
                          alt={service.business_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onClick={() => navigateToServiceDetail(service.id)}
                        />
                        {service.status === "approved" && (
                          <div className="absolute top-3 right-3">
                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow">
                              <FiCheckCircle className="w-3 h-3" /> Verified
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">
                          {service.business_name}
                        </h3>
                        <p className="text-xs text-blue-600 mb-2">{service.subcategory_name}</p>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <FiMapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{service.city}{service.state ? `, ${service.state}` : ""}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                          <FiPhone className="w-3 h-3 flex-shrink-0" />
                          <span>{service.contact_no}</span>
                        </div>
                        
                        <div className="flex gap-2 mt-auto">
                          <a
                            href={`tel:${service.contact_no}`}
                            className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                          >
                            Call Now
                          </a>
                          <button
                            onClick={() => openInquiryModal(service)}
                            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                          >
                            Inquiry
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No services available in this category yet</p>
              </div>
            )}
          </section>
        ))}
        
        {/* Marketing Banners between blocks */}
        {blockIndex === 0 && (ads.slot1 || ads.slot2) && (
          <section className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ads.slot1 && (
                <div 
                  className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer h-64"
                  onClick={() => window.open(ads.slot1.url, "_blank")}
                >
                  <img 
                    src={ads.slot1.image} 
                    alt={ads.slot1.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
                    <h3 className="text-white font-bold text-xl">{ads.slot1.title}</h3>
                  </div>
                </div>
              )}
              {ads.slot2 && (
                <div 
                  className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer h-64"
                  onClick={() => window.open(ads.slot2.url, "_blank")}
                >
                  <img 
                    src={ads.slot2.image} 
                    alt={ads.slot2.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
                    <h3 className="text-white font-bold text-xl">{ads.slot2.title}</h3>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        
        {blockIndex === 1 && ads.bigAd && (
          <section className="py-6">
            <div 
              className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer h-72"
              onClick={() => window.open(ads.bigAd.url, "_blank")}
            >
              <img 
                src={ads.bigAd.image} 
                alt={ads.bigAd.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-8">
                <div className="text-white max-w-md">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{ads.bigAd.title}</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-sm font-semibold transition mt-2">
                    Learn More →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </React.Fragment>
    ));
  };

  const blockOne = subcategoryData.slice(0, 2);
  const blockTwo = subcategoryData.slice(2, 4);
  const blockThree = subcategoryData.slice(4, 6);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Gradient Background - NO IMAGE BANNER */}
      <section className="relative w-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/6863286/pexels-photo-6863286.jpeg?auto=compress&cs=tinysrgb&w=1600')] opacity-10 bg-cover bg-center"></div>
        
        <div className="relative py-16 md:py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Find Trusted Financial Services
            </h2>
            <p className="text-blue-100 text-sm sm:text-base md:text-lg mb-8 max-w-2xl mx-auto">
              Connect with verified Financial Advisors, Wealth Managers, Tax Consultants and more
            </p>

            {/* Category Tabs */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-start sm:justify-center gap-4 sm:gap-6 px-4 py-3 w-full max-w-4xl mx-auto overflow-x-auto scrollbar-hide">
              {subcategories.length === 0 ? (
                <p className="text-white text-sm">Loading categories...</p>
              ) : (
                subcategories.slice(0, 6).map((tab, idx) => (
                  <button
                    key={idx}
                    className={`flex-shrink-0 pb-1 px-1 text-xs sm:text-sm md:text-base font-semibold border-b-2 transition ${
                      selectedSubcategory === (tab.subcategory_name || tab)
                        ? "border-white text-white"
                        : "border-transparent text-gray-200 hover:text-white hover:border-white/50"
                    }`}
                    onClick={() => {
                      setSelectedSubcategory(tab.subcategory_name || tab);
                      setSelectedCity("");
                      setShowCities(false);
                    }}
                  >
                    {tab.subcategory_name || tab}
                  </button>
                ))
              )}
            </div>

            {/* Search Bar */}
            <div className="mt-6 bg-white shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full max-w-4xl mx-auto p-2 rounded-xl sm:rounded-full">
              {/* City Dropdown */}
              <div className="relative sm:w-44 w-full sm:border-r border-b sm:border-b-0">
                <button
                  onClick={() => setShowCities(prev => !prev)}
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-800 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <FiMapPin className="text-blue-500" />
                    {selectedCity || "Select City"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 text-gray-500 transform transition ${showCities ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showCities && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white shadow-lg rounded-lg z-30 max-h-60 overflow-y-auto border">
                    {cities.map(city => (
                      <div
                        key={city.id}
                        className="px-4 py-2 text-left hover:bg-blue-50 cursor-pointer text-gray-700 transition"
                        onClick={() => {
                          setSelectedCity(city.name);
                          setShowCities(false);
                        }}
                      >
                        {city.name}
                      </div>
                    ))}
                    {cities.length === 0 && (
                      <div className="px-4 py-2 text-gray-500">No cities available</div>
                    )}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search for Financial Advisor, Wealth Manager, Tax Consultant..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && navigateToServiceList()}
                  className="w-full px-4 py-2 text-gray-700 outline-none border border-gray-200 rounded-md sm:border-none sm:rounded-none"
                />
              </div>

              {/* Search Button */}
              <button
                onClick={navigateToServiceList}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md sm:rounded-full font-semibold flex items-center justify-center gap-2 transition w-full sm:w-auto"
              >
                <FiSearch className="w-4 h-4" /> Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* Feature Cards */}
        <section className="relative z-20 -mt-16">
          <div className="relative bg-blue-50 rounded-tl-[80px] rounded-tr-[80px] py-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
              {[
                {
                  icon: <FaChartLine className="text-4xl text-blue-600" />,
                  title: "Investment Planning",
                  text: "Expert guidance for wealth creation, portfolio management and retirement planning.",
                },
                {
                  icon: <FaShieldAlt className="text-4xl text-green-600" />,
                  title: "Insurance & Risk",
                  text: "Comprehensive insurance solutions for life, health, and asset protection.",
                },
                {
                  icon: <FaBalanceScale className="text-4xl text-purple-600" />,
                  title: "Tax & Legal",
                  text: "Professional tax planning, filing, and financial legal advisory services.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={navigateToServiceList}
                  className="bg-white rounded-xl shadow-lg p-8 text-center hover:scale-105 transition cursor-pointer group"
                >
                  <div className="mb-4 flex justify-center group-hover:scale-110 transition">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-[0]">
            <svg className="relative block w-full h-16" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1200 120">
              <path d="M0,0 C300,120 900,120 1200,0 L1200,120 L0,120 Z" fill="#eff6ff"></path>
            </svg>
          </div>
        </section>

        {/* Service Sections */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading financial services...</p>
          </div>
        ) : (
          <>
            {/* Block One */}
            {blockOne.map((category, idx) => (
              <section key={idx} className="py-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">{category.subcategory}</h2>
                  <button
                    onClick={() => navigateToViewAll(category.subcategory)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition"
                  >
                    View All →
                  </button>
                </div>
                <Slider {...categorySlider}>
                  {category.services?.map((service) => (
                    <div key={service.id} className="p-2">
                      <div className="bg-white rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                        <div className="relative h-48 w-full overflow-hidden">
                          <img
                            src={service.main_image || "https://placehold.co/400x300/2563EB/white?text=Finance+Service"}
                            alt={service.business_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onClick={() => navigateToServiceDetail(service.id)}
                          />
                          {service.status === "approved" && (
                            <div className="absolute top-3 right-3">
                              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <FiCheckCircle className="w-3 h-3" /> Verified
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{service.business_name}</h3>
                          <p className="text-xs text-blue-600 mb-2">{service.subcategory_name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <FiMapPin className="w-3 h-3" />
                            <span>{service.city || "Location not specified"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                            <FiPhone className="w-3 h-3" />
                            <span>{service.contact_no}</span>
                          </div>
                          <div className="flex gap-2 mt-auto">
                            <a href={`tel:${service.contact_no}`} className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition">Call Now</a>
                            <button onClick={() => openInquiryModal(service)} className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition">Inquiry</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </section>
            ))}

            {/* Small Ads Banner */}
            {(ads.slot1 || ads.slot2) && (
              <section className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ads.slot1 && (
                    <div className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer h-56" onClick={() => window.open(ads.slot1.url, "_blank")}>
                      <img src={ads.slot1.image} alt={ads.slot1.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                        <h3 className="text-white font-bold text-lg">{ads.slot1.title}</h3>
                      </div>
                    </div>
                  )}
                  {ads.slot2 && (
                    <div className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer h-56" onClick={() => window.open(ads.slot2.url, "_blank")}>
                      <img src={ads.slot2.image} alt={ads.slot2.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                        <h3 className="text-white font-bold text-lg">{ads.slot2.title}</h3>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Block Two */}
            {blockTwo.map((category, idx) => (
              <section key={idx} className="py-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">{category.subcategory}</h2>
                  <button onClick={() => navigateToViewAll(category.subcategory)} className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">View All →</button>
                </div>
                <Slider {...categorySlider}>
                  {category.services?.map((service) => (
                    <div key={service.id} className="p-2">
                      <div className="bg-white rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                        <div className="relative h-48 w-full overflow-hidden">
                          <img src={service.main_image || "https://placehold.co/400x300/2563EB/white?text=Finance+Service"} alt={service.business_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" onClick={() => navigateToServiceDetail(service.id)} />
                          {service.status === "approved" && (
                            <div className="absolute top-3 right-3">
                              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FiCheckCircle className="w-3 h-3" /> Verified</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{service.business_name}</h3>
                          <p className="text-xs text-blue-600 mb-2">{service.subcategory_name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><FiMapPin className="w-3 h-3" /><span>{service.city || "Location not specified"}</span></div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3"><FiPhone className="w-3 h-3" /><span>{service.contact_no}</span></div>
                          <div className="flex gap-2 mt-auto">
                            <a href={`tel:${service.contact_no}`} className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition">Call Now</a>
                            <button onClick={() => openInquiryModal(service)} className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition">Inquiry</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </section>
            ))}

            {/* Big Banner Ad */}
            {ads.bigAd && (
              <section className="py-6">
                <div className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer h-72" onClick={() => window.open(ads.bigAd.url, "_blank")}>
                  <img src={ads.bigAd.image} alt={ads.bigAd.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-8">
                    <div className="text-white max-w-md">
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">{ads.bigAd.title}</h2>
                      <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-sm font-semibold transition mt-2">Learn More →</button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Block Three */}
            {blockThree.map((category, idx) => (
              <section key={idx} className="py-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">{category.subcategory}</h2>
                  <button onClick={() => navigateToViewAll(category.subcategory)} className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">View All →</button>
                </div>
                <Slider {...categorySlider}>
                  {category.services?.map((service) => (
                    <div key={service.id} className="p-2">
                      <div className="bg-white rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                        <div className="relative h-48 w-full overflow-hidden">
                          <img src={service.main_image || "https://placehold.co/400x300/2563EB/white?text=Finance+Service"} alt={service.business_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" onClick={() => navigateToServiceDetail(service.id)} />
                          {service.status === "approved" && (
                            <div className="absolute top-3 right-3">
                              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FiCheckCircle className="w-3 h-3" /> Verified</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{service.business_name}</h3>
                          <p className="text-xs text-blue-600 mb-2">{service.subcategory_name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><FiMapPin className="w-3 h-3" /><span>{service.city || "Location not specified"}</span></div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3"><FiPhone className="w-3 h-3" /><span>{service.contact_no}</span></div>
                          <div className="flex gap-2 mt-auto">
                            <a href={`tel:${service.contact_no}`} className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition">Call Now</a>
                            <button onClick={() => openInquiryModal(service)} className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition">Inquiry</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </section>
            ))}
          </>
        )}

        <ServiceReviewsDisplay
          modelName="financeservice"
          title="What Our Clients Say"
          accentColor="blue"
          detailPath="/financedetail"
          serviceItems={subcategoryData.flatMap(cat =>
            (cat.services || []).map(s => ({ id: s.id, name: s.business_name }))
          )}
          maxReviews={6}
          emptyMessage="No client reviews yet"
        />


      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeInquiryModal}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-blue-600 text-white text-lg font-bold px-6 py-4 flex justify-between items-center sticky top-0">
              <span>Inquiry Form</span>
              <button onClick={closeInquiryModal} className="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            <div className="p-6">
              <InquiryForm serviceData={selectedService} onSuccess={closeInquiryModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inquiry Form Component
const InquiryForm = ({ serviceData, onSuccess }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vendorId = serviceData?.vendor?.id || serviceData?.vendor;
    const category = "finance";

    if (!vendorId) {
      setErrorMsg("Unable to submit inquiry. Please try again later.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        service_category: category,
        sub_category: serviceData?.subcategory_name || "",
        vendor: vendorId,
        service_id: serviceData?.id,
        service_name: serviceData?.business_name,
        service_url: window.location.href,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        customer_city: form.city,
        inquiry_type: 'general',
        subject: `Inquiry about ${serviceData?.business_name}`,
        message: form.message,
      };

      const response = await publicAxios.post("/api/public/inquiries/", payload);
      if (response.status === 201) {
        setSuccessMsg("✅ Inquiry submitted successfully! We'll contact you soon.");
        setForm({ name: "", phone: "", email: "", city: "", message: "" });
        setTimeout(() => {
          setSuccessMsg("");
          if (onSuccess) onSuccess();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMsg && <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">{successMsg}</div>}
      {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errorMsg}</div>}
      
      <div>
        <label className="block text-gray-700 font-medium mb-1">Your Name *</label>
        <input type="text" name="name" required value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-1">Phone Number *</label>
        <input type="tel" name="phone" required value={form.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-1">Email (Optional)</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-1">City</label>
        <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-1">Message</label>
        <textarea name="message" rows="3" value={form.message} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
      </div>
      
      <button type="submit" disabled={submitting} className={`w-full ${submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-lg font-semibold transition`}>
        {submitting ? 'Submitting...' : 'Send Inquiry'}
      </button>
    </form>
  );
};