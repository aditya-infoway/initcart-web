// src/pages/mobile/MobileRealEstateHome.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axios";
import Slider from "react-slick";
import { FiSearch } from "react-icons/fi";
import {
  FaShieldAlt,
  FaHandshake,
  FaMapMarkedAlt,
  FaQuoteLeft,
  FaStar,
  FaRulerCombined,
  FaMapMarkerAlt,
  FaBuilding,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaTimes,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { MdVerified, MdMeetingRoom } from "react-icons/md";
import { FiHeart, FiShare2 } from "react-icons/fi";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MobileServiceReviewsDisplay from "./MobileServiceReviewsDisplay";

export default function MobileRealEstateHome() {
  const navigate = useNavigate();

  // ✅ ALL STATE DECLARED FIRST
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [tabFilteredProperties, setTabFilteredProperties] = useState([]);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    cities: [],
    property_types: [],
    transaction_types: [],
    price_range: { min: 0, max: 0 },
    area_range: { min: 0, max: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    city: "",
    property_type: "",
    transaction_type: "",
    min_price: "",
    max_price: "",
    search: ""
  });
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalService, setModalService] = useState(null);
  const [ads, setAds] = useState([]);
  const [bigAd, setBigAd] = useState(null);
  const [showCities, setShowCities] = useState(false);

  // Auto-slider for services (2 cards visible at a time)
  const serviceSliderSettings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      }
    ]
  };

  const openInquiryModal = (service) => {
    setModalService(service);
    setShowModal(true);
  };

  const closeInquiryModal = () => {
    setShowModal(false);
    setModalService(null);
  };

  // ✅ useEffect now has access to showCities
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCities && !e.target.closest('.city-dropdown-wrapper')) {
        setShowCities(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCities]);

  useEffect(() => {
    fetchHomePageData();
    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    publicAxios
      .get("api/init-realestate-smallads/")
      .then((res) => setAds(res.data))
      .catch((err) => console.error("Error fetching small ads:", err));
  }, []);

  useEffect(() => {
    publicAxios
      .get("api/init-realestate-bigad/")
      .then((res) => setBigAd(res.data))
      .catch((err) => console.error("Error fetching big ad:", err));
  }, []);

  const slot1 = ads.find((ad) => ad.slot === 1);
  const slot2 = ads.find((ad) => ad.slot === 2);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      setTabFilteredProperties([]);

      const featuredResponse = await publicAxios.get('/api/services/real-estate/public/featured/');
      setFeaturedProperties(featuredResponse.data || []);

      const recentResponse = await publicAxios.get('/api/services/real-estate/public/');
      const sortedRecent = (recentResponse.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentProperties(sortedRecent);
      setTabFilteredProperties(sortedRecent);

      const filtersResponse = await publicAxios.get('/api/services/real-estate/public/search_filters/');
      if (filtersResponse.data) {
        setSearchFilters(filtersResponse.data);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const response = await publicAxios.get('/api/services/real-estate/public/property_types/');
      if (response.data && Array.isArray(response.data)) {
        setPropertyTypeOptions(response.data);
      }
    } catch (error) {
      console.error("Error fetching property types:", error);
      const defaultTypes = [
        { value: 'apartment', label: 'Apartment' },
        { value: 'house', label: 'House' },
        { value: 'villa', label: 'Villa' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'pg_coliving', label: 'PG/Co-living' },
        { value: 'plots', label: 'Plots' },
      ];
      setPropertyTypeOptions(defaultTypes);
    }
  };

  const handleTabClick = async (tab) => {
    setSelectedTab(tab);
    setTabLoading(true);

    if (tab === "ALL") {
      setTabFilteredProperties(recentProperties);
      setSearchParams(prev => ({
        ...prev,
        property_type: ""
      }));
      setTabLoading(false);
      return;
    }

    const propertyTypeOption = propertyTypeOptions.find(
      option => option.label.toUpperCase() === tab
    );

    if (propertyTypeOption) {
      const propertyTypeValue = propertyTypeOption.value;
      setSearchParams(prev => ({
        ...prev,
        property_type: propertyTypeValue
      }));

      const filtered = recentProperties.filter(prop =>
        prop.property_type === propertyTypeValue
      );
      setTabFilteredProperties(filtered);
    } else {
      setTabFilteredProperties(recentProperties);
    }

    setTabLoading(false);
  };

  const handleSearch = () => {
    try {
      const params = {};
      if (searchParams.city) params.city = searchParams.city;
      if (searchParams.property_type) params.property_type = searchParams.property_type;
      if (searchParams.search) params.search = searchParams.search;
      navigate(`/servicelist?${new URLSearchParams(params).toString()}`);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const redirectToRealEstate = () => {
    navigate("/servicelist");
  };

  const redirectToServicelist = (property_type) => {
    navigate(`/servicelist?property_type=${encodeURIComponent(property_type)}`);
  };

  const handlePropertyClick = (property) => {
    if (property.id) {
      navigate(`/realestate/${property.id}`);
    } else {
      redirectToRealEstate();
    }
  };

  const formatPrice = (price) => {
    if (!price) return "₹0";
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const getTransactionType = (type) => {
    switch (type) {
      case 'sale': return 'For Sale';
      case 'rent': return 'For Rent';
      case 'lease': return 'For Lease';
      default: return type;
    }
  };

  const getPropertyTypeTabs = () => {
    const baseTabs = ["ALL"];
    if (propertyTypeOptions.length > 0) {
      const propertyTypeTabs = propertyTypeOptions.map(option =>
        option.label.toUpperCase()
      );
      return [...baseTabs, ...propertyTypeTabs];
    }
    return ["ALL", "APARTMENTS", "HOUSES", "VILLAS", "COMMERCIAL", "PG/CO-LIVING", "PLOTS"];
  };

  const cities = React.useMemo(() => {
    if (!searchFilters.cities) return [];
    const normalized = searchFilters.cities
      .map(city => city?.trim().toLowerCase())
      .filter(Boolean);
    return [...new Set(normalized)]
      .map(city => city.charAt(0).toUpperCase() + city.slice(1))
      .sort();
  }, [searchFilters.cities]);

  const groupedProperties = Object.values(
    recentProperties.reduce((acc, property) => {
      const type = property.property_type || "Other";
      if (!acc[type]) acc[type] = { property_type: type, services: [] };
      acc[type].services.push(property);
      return acc;
    }, {})
  );

  const propertyBlocks = [
    groupedProperties.slice(0, 2),
    groupedProperties.slice(2, 4),
    groupedProperties.slice(4),
  ];

  const propertyTypeTabs = getPropertyTypeTabs();

  const renderServiceBlock = (block = [], blockIndex) => {
    if (!Array.isArray(block)) return null;

    return block.map((category, index) => {
      const services = category.services || [];

      return (
        <section key={`${blockIndex}-${index}`} className="py-5">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 
              className="text-[15px] font-bold text-gray-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {category.property_type}
            </h2>
            <button
              onClick={() => redirectToServicelist(category.property_type)}
              className="text-blue-600 text-[11px] font-semibold flex items-center gap-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              See All <span className="text-lg">›</span>
            </button>
          </div>

          {services.length > 2 ? (
            <Slider {...serviceSliderSettings}>
              {services.map((service) => (
                <div key={service.id} className="px-1.5">
                  <PropertyCard 
                    service={service} 
                    onInquiry={openInquiryModal}
                    onPropertyClick={handlePropertyClick}
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {services.map((service) => (
                <PropertyCard   
                  key={service.id}
                  service={service} 
                  onInquiry={openInquiryModal}
                  onPropertyClick={handlePropertyClick}
                />
              ))}
            </div>
          )}
        </section>
      );
    });
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center justify-between overflow-x-hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-full transition flex-shrink-0">
            <FaArrowLeft className="text-gray-700 text-lg" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[17px] font-bold text-gray-900 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
              Real Estate
            </h1>
            <p className="text-[10px] text-gray-500 truncate">Find your dream home</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0">
          <FiShare2 className="text-gray-600 text-lg" />
        </button>
      </div>

      {/* Hero Section with Search */}
      <section className="relative mx-3 mt-3 rounded-3xl overflow-hidden h-[280px]">
        <img
          src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="realestate-banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>

        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <h2 className="text-white text-[16px] font-bold leading-snug" style={{ fontFamily: "'Inter', sans-serif" }}>
            Find Your Dream <br />Property
          </h2>
          <p className="text-blue-200 text-[10px] mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            <span className="font-bold text-white">500+</span> verified properties
          </p>

          {/* Search Bar */}
          <div className="mt-2.5 bg-white rounded-2xl shadow-xl p-1.5 flex items-center gap-1.5 relative z-10">
            {/* City Dropdown */}
            <div className="relative city-dropdown-wrapper flex-1 min-w-[80px] z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCities(!showCities);
                }}
                className="flex items-center justify-between w-full px-2.5 py-2 text-[10px] text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <span className="truncate max-w-[60px]">{searchParams.city || "City"}</span>
                <FaChevronDown size={10} className={`text-gray-400 flex-shrink-0 ml-1 transition-transform ${showCities ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Search Input */}
            <div className="flex-[2] min-w-[100px]">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchParams.search}
                onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-3 py-2 text-[10px] bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[10px] font-semibold rounded-xl hover:shadow-lg transition flex-shrink-0"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <FiSearch size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Dropdown */}
      {showCities && cities.length > 0 && (
        <div className="relative px-3 -mt-1 z-[9999] overflow-x-hidden">
          <div className="w-full bg-white shadow-2xl rounded-xl max-h-52 overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white px-3 py-2 border-b border-gray-100">
              <span className="text-[9px] font-semibold text-gray-500">Select City</span>
            </div>
            {cities.map((city, idx) => (
              <div
                key={idx}
                className="px-3 py-2.5 text-[11px] hover:bg-blue-50 cursor-pointer text-gray-700 transition flex items-center justify-between"
                onClick={() => {
                  setSearchParams({ ...searchParams, city: city });
                  setShowCities(false);
                }}
              >
                <span>{city}</span>
                {searchParams.city === city && (
                  <FaCheckCircle className="text-blue-500 text-xs" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-3 py-4 overflow-x-hidden">
        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-3 mb-1">
          {propertyTypeTabs.slice(0, 6).map((tab, idx) => (
            <button
              key={idx}
              className={`flex-shrink-0 px-4 py-1.5 text-[10px] font-semibold rounded-full whitespace-nowrap transition-all ${
                selectedTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feature Grid - Mobile */}
        <section className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { icon: <FaShieldAlt className="text-xl text-blue-600" />, title: "Verified", count: "500+" },
            { icon: <FaHandshake className="text-xl text-green-600" />, title: "Financing", count: "Easy" },
            { icon: <FaMapMarkedAlt className="text-xl text-pink-600" />, title: "Locations", count: "Prime" },
          ].map((item, i) => (
            <div
              key={i}
              onClick={redirectToRealEstate}
              className="bg-white rounded-2xl shadow-sm p-3.5 text-center hover:shadow-md transition cursor-pointer border border-gray-100"
            >
              <div className="flex justify-center mb-1.5">{item.icon}</div>
              <p className="text-[10px] font-semibold text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                {item.title}
              </p>
              <p className="text-[8px] text-gray-400">{item.count}</p>
            </div>
          ))}
        </section>

        {/* Recent Properties by Tab */}
        <section className="py-3">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-[15px] font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
              {selectedTab === "ALL" ? "Recent Properties" : `${selectedTab}`}
            </h2>
            <button
              onClick={redirectToRealEstate}
              className="text-blue-600 text-[11px] font-semibold flex items-center gap-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              See All <span className="text-lg">›</span>
            </button>
          </div>

          {tabLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : tabFilteredProperties.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl">
              <p className="text-gray-500 text-[11px]">No properties available</p>
            </div>
          ) : (
            <Slider {...serviceSliderSettings}>
              {tabFilteredProperties.slice(0, 6).map((property) => (
                <div key={property.id} className="px-1.5">
                  <RecentPropertyCard 
                    property={property} 
                    onInquiry={openInquiryModal}
                    onPropertyClick={handlePropertyClick}
                  />
                </div>
              ))}
            </Slider>
          )}
        </section>

        {/* Service Blocks */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-500 text-[11px]">Loading...</p>
          </div>
        ) : (
          renderServiceBlock(propertyBlocks[0], 'one')
        )}

        {/* Small Ads - Mobile */}
        {(slot1 || slot2) && (
          <section className="py-3">
            <div className="grid grid-cols-2 gap-3">
              {slot1 && (
                <div className="relative rounded-2xl overflow-hidden shadow-sm h-24 group cursor-pointer overflow-x-hidden" onClick={() => window.open(slot1.url, "_blank")}>
                  <img src={slot1.image} alt={slot1.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <h3 className="text-white text-[10px] font-semibold truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {slot1.title}
                    </h3>
                  </div>
                </div>
              )}
              {slot2 && (
                <div className="relative rounded-2xl overflow-hidden shadow-sm h-24 group cursor-pointer overflow-x-hidden" onClick={() => window.open(slot2.url, "_blank")}>
                  <img src={slot2.image} alt={slot2.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <h3 className="text-white text-[10px] font-semibold truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {slot2.title}
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {renderServiceBlock(propertyBlocks[1], 'two')}

        {/* Big Ad - Mobile */}
        {bigAd && (
          <section className="py-3">
            <div className="relative rounded-2xl overflow-hidden shadow-sm h-36 group cursor-pointer overflow-x-hidden" onClick={() => window.open(bigAd.url, "_blank")}>
              <img src={bigAd.image} alt={bigAd.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3.5">
                <h2 className="text-white text-[14px] font-bold truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {bigAd.title}
                </h2>
                <button className="inline-block mt-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[10px] font-medium px-3.5 py-0.5 rounded-full hover:shadow-lg transition">
                  Shop Now →
                </button>
              </div>
            </div>
          </section>
        )}

        {renderServiceBlock(propertyBlocks[2], 'three')}

        {/* ✅ REVIEWS - DYNAMIC */}
        <section className="py-5 overflow-x-hidden">
          {recentProperties.length > 0 && (
            <MobileServiceReviewsDisplay
              modelName="property"
              title="Client Reviews"
              accentColor="blue"
              detailPath="/realestate"
              serviceItems={recentProperties.map(p => ({ 
                id: p.id, 
                name: p.title || p.business_name || "Property" 
              }))}
              maxReviews={6}
              emptyMessage="No client reviews yet"
            />
          )}
        </section>
      </div>

      {/* Inquiry Modal - Mobile Bottom Sheet */}
      {showModal && modalService && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 overflow-x-hidden"
          onClick={closeInquiryModal}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-md mx-auto max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 flex justify-between items-center border-b border-gray-100 z-10">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Send Inquiry
                </h3>
                <p className="text-[10px] text-gray-500 truncate max-w-[200px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {modalService.business_name || modalService.title}
                </p>
              </div>
              <button 
                onClick={closeInquiryModal} 
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition flex-shrink-0"
              >
                <FaTimes className="text-gray-600 text-sm" />
              </button>
            </div>
            <div className="p-5">
              <MobileInquiryForm serviceData={modalService} onClose={closeInquiryModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Property Card Component - Mobile
const PropertyCard = ({ service, onInquiry, onPropertyClick }) => {
  const formatPrice = (price) => {
    if (!price) return "₹0";
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const getTransactionType = (type) => {
    switch (type) {
      case 'sale': return 'For Sale';
      case 'rent': return 'For Rent';
      case 'lease': return 'For Lease';
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div 
        className="relative h-40 w-full cursor-pointer overflow-hidden"
        onClick={() => onPropertyClick(service)}
      >
        <img
          src={service.main_image || service.thumbnail_image || "https://placehold.co/400x300/1e40af/white?text=Property"}
          alt={service.business_name || service.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow">
          <FiHeart className="text-gray-600 text-sm" />
        </div>
        {service.transaction_type && (
          <div className="absolute top-2 left-2">
            <span className={`${service.transaction_type === "rent" ? "bg-green-500" : service.transaction_type === "sale" ? "bg-blue-500" : "bg-purple-500"} text-white px-1.5 py-0.5 rounded-full text-[7px] font-medium`}>
              {getTransactionType(service.transaction_type)}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-12"></div>
      </div>
      <div className="p-3">
        {service.price && (
          <h3 className="text-[13px] font-bold text-blue-600" style={{ fontFamily: "'Inter', sans-serif" }}>
            {formatPrice(service.price)}
          </h3>
        )}
        <h4 className="text-[12px] font-semibold text-gray-900 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
          {service.business_name || service.title}
        </h4>
        <p className="text-[10px] text-gray-500 flex items-center mt-0.5 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
          <FaMapMarkerAlt className="mr-0.5 text-red-500 text-[8px] flex-shrink-0" />
          <span className="truncate">{service.city || service.address}</span>
        </p>
        <div className="flex items-center justify-between mt-1.5 text-[9px] text-gray-600">
          <div className="flex items-center gap-1">
            <MdMeetingRoom className="text-[10px]" />
            <span>{service.bedrooms ? `${service.bedrooms} BHK` : "—"}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaRulerCombined className="text-[10px]" />
            <span>{service.total_area_size ? `${service.total_area_size} Sq.Ft` : "—"}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaBuilding className="text-[10px]" />
            <span className="truncate capitalize">{service.property_type || "—"}</span>
          </div>
        </div>
        <div className="flex gap-1.5 mt-2">
          {service.contact_mobile && (
            <a
              href={`tel:${service.contact_mobile}`}
              className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[9px] font-medium py-1.5 rounded-lg hover:shadow-md transition"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <FaPhone className="text-[8px]" /> Call
            </a>
          )}
          <button
            onClick={() => onInquiry(service)}
            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[9px] font-medium py-1.5 rounded-lg hover:shadow-md transition"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <FaEnvelope className="text-[8px]" /> Inquiry
          </button>
        </div>
      </div>
    </div>
  );
};

// Recent Property Card - Mobile
const RecentPropertyCard = ({ property, onInquiry, onPropertyClick }) => {
  const formatPrice = (price) => {
    if (!price) return "₹0";
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const getTransactionType = (type) => {
    switch (type) {
      case 'sale': return 'For Sale';
      case 'rent': return 'For Rent';
      case 'lease': return 'For Lease';
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div 
        className="relative h-40 w-full cursor-pointer overflow-hidden"
        onClick={() => onPropertyClick(property)}
      >
        <img
          src={property.main_image || property.thumbnail_image || "https://placehold.co/400x300/1e40af/white?text=Property"}
          alt={property.business_name || property.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow">
          <FiHeart className="text-gray-600 text-sm" />
        </div>
        {property.transaction_type && (
          <div className="absolute top-2 left-2">
            <span className={`${property.transaction_type === "rent" ? "bg-green-500" : property.transaction_type === "sale" ? "bg-blue-500" : "bg-purple-500"} text-white px-1.5 py-0.5 rounded-full text-[7px] font-medium`}>
              {getTransactionType(property.transaction_type)}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-12"></div>
      </div>
      <div className="p-3">
        {property.price && (
          <h3 className="text-[13px] font-bold text-blue-600" style={{ fontFamily: "'Inter', sans-serif" }}>
            {formatPrice(property.price)}
          </h3>
        )}
        <h4 className="text-[12px] font-semibold text-gray-900 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
          {property.business_name || property.title}
        </h4>
        <p className="text-[10px] text-gray-500 flex items-center mt-0.5 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
          <FaMapMarkerAlt className="mr-0.5 text-red-500 text-[8px] flex-shrink-0" />
          <span className="truncate">{property.city || property.address}</span>
        </p>
        <div className="flex items-center justify-between mt-1.5 text-[9px] text-gray-600">
          <div className="flex items-center gap-1">
            <MdMeetingRoom className="text-[10px]" />
            <span>{property.bedrooms ? `${property.bedrooms} BHK` : "—"}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaRulerCombined className="text-[10px]" />
            <span>{property.total_area_size ? `${property.total_area_size} Sq.Ft` : "—"}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaBuilding className="text-[10px]" />
            <span className="truncate capitalize">{property.property_type || "—"}</span>
          </div>
        </div>
        <div className="flex gap-1.5 mt-2">
          {property.contact_mobile && (
            <a
              href={`tel:${property.contact_mobile}`}
              className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[9px] font-medium py-1.5 rounded-lg hover:shadow-md transition"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <FaPhone className="text-[8px]" /> Call
            </a>
          )}
          <button
            onClick={() => onInquiry(property)}
            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[9px] font-medium py-1.5 rounded-lg hover:shadow-md transition"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <FaEnvelope className="text-[8px]" /> Inquiry
          </button>
        </div>
      </div>
    </div>
  );
};

// Mobile Inquiry Form - Collapsible
const MobileInquiryForm = ({ serviceData, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedField, setExpandedField] = useState(null);

  const toggleField = (fieldName) => {
    if (expandedField === fieldName) {
      setExpandedField(null);
    } else {
      setExpandedField(fieldName);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vendorId = serviceData?.vendor?.id || serviceData?.vendor;
    const category = serviceData?.category || serviceData?.service_category || "real_estate";
    const serviceId = serviceData?.id;

    if (!vendorId || !category || !serviceId) {
      setErrorMsg("Missing information. Please try again.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        service_category: category,
        vendor: vendorId,
        service_id: serviceId,
        service_url: window.location.href,
        service_name: serviceData?.title || serviceData?.business_name,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        customer_city: form.city,
        subject: `Inquiry about ${serviceData?.business_name || serviceData?.title}`,
        message: form.message,
      };

      const response = await publicAxios.post("/api/public/inquiries/", payload);

      if (response.status !== 201) {
        throw new Error("Inquiry failed");
      }

      setSuccessMsg("✓ Inquiry submitted successfully!");
      setForm({ name: "", phone: "", email: "", city: "", message: "" });

      setTimeout(() => {
        setSuccessMsg("");
        if (onClose) onClose();
      }, 2000);

    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', placeholder: 'Enter your full name', required: true, type: 'text' },
    { name: 'phone', label: 'Phone Number', placeholder: 'Enter your phone number', required: true, type: 'tel' },
    { name: 'email', label: 'Email Address', placeholder: 'Enter your email', required: false, type: 'email' },
    { name: 'city', label: 'City', placeholder: 'Enter your city', required: false, type: 'text' },
    { name: 'message', label: 'Message', placeholder: 'Write your message here...', required: false, type: 'textarea' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full">
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-[11px] w-full">
          <FaCheckCircle className="text-green-500 flex-shrink-0" />
          <span className="break-words">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px] w-full">
          <FaTimes className="text-red-500 flex-shrink-0" />
          <span className="break-words">{errorMsg}</span>
        </div>
      )}

      {fields.map((field) => {
        const isExpanded = expandedField === field.name;
        const value = form[field.name];

        return (
          <div key={field.name} className="w-full">
            <button
              type="button"
              onClick={() => toggleField(field.name)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200"
            >
              <span className="text-[12px] font-medium text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
                {value && <span className="text-green-500 text-[10px] ml-2">✓</span>}
              </span>
              {isExpanded ? (
                <FaChevronUp className="text-gray-400 text-sm" />
              ) : (
                <FaChevronDown className="text-gray-400 text-sm" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-2 px-1 w-full">
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 text-[13px] border-2 border-blue-500 rounded-xl outline-none resize-none focus:ring-2 focus:ring-blue-300 transition"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    autoFocus
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={value}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[13px] border-2 border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 transition"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    autoFocus
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="submit"   
        disabled={submitting}
        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-[13px] disabled:opacity-50 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-4"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {submitting ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            Sending...
          </>
        ) : (
          <>
            <FaEnvelope className="text-sm" /> Send Inquiry
          </>
        )}
      </button>
    </form>
  );
};