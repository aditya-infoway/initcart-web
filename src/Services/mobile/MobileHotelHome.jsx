// src/pages/mobile/MobileHotelHome.tsx
import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaStar,
  FaQuoteLeft,
  FaHotel,
  FaConciergeBell,
  FaSwimmingPool,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaTimes,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { FiSearch, FiMapPin, FiHeart, FiShare2 } from "react-icons/fi";
import { publicAxios } from "../../api/axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MobileServiceReviewsDisplay from "./MobileServiceReviewsDisplay";

export default function MobileHotelHome() {
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [showCities, setShowCities] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [groupedServices, setGroupedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState({ bigAd: null, slot1: null, slot2: null });
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const navigateToDetail = (id) => navigate(`/hoteldetail/${id}`);

  const navigateToViewAll = (subcategory) => {
    if (!subcategory) return;
    navigate(
      `/searchservice?subcategory=${encodeURIComponent(subcategory)}&type=hotel`
    );
  };

  const navigateToList = () => {
    const params = new URLSearchParams();
    params.append("type", "hotel");
    if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
    if (selectedCity) params.append("city", selectedCity);
    if (searchKeyword.trim()) params.append("keyword", searchKeyword.trim());
    navigate(`/searchservice?${params.toString()}`);
  };

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

  const reviewSliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await publicAxios.get(
          "api/service-subcategories/by_service/?service=Hotel"
        );
        const data = response.data;
        let subs = [];
        if (data["Hotel"]) subs = data["Hotel"];
        else if (Array.isArray(data)) subs = data;
        else if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          if (firstKey && data[firstKey]) subs = data[firstKey];
        }
        setSubcategories(subs.map((s) => s.subcategory_name || s));
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchSubcategories();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await publicAxios.get("services/service-city/");
        const cityData = Array.isArray(res.data.cities) ? res.data.cities : [];
        const hotelCities = cityData.filter((c) => c.type === "hotel_service");
        const filtered = selectedSubcategory
          ? hotelCities.filter((c) =>
              c.subcategories?.some(
                (s) =>
                  s.name?.toLowerCase() === selectedSubcategory.toLowerCase()
              )
            )
          : hotelCities;
        setCities(filtered);
        setSelectedCity("");
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, [selectedSubcategory]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await publicAxios.get("api/public/hotel-services/");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || response.data.data || [];

        const grouped = Object.values(
          data.reduce((acc, svc) => {
            const sub = svc.subcategory_name || "Other";
            if (!acc[sub]) acc[sub] = { subcategory: sub, services: [] };
            acc[sub].services.push(svc);
            return acc;
          }, {})
        );
        setGroupedServices(grouped);
      } catch (error) {
        console.error("Error fetching hotel services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const [bigAdRes, smallAdsRes] = await Promise.all([
          publicAxios.get("api/init-hotel-bigad/").catch(() => ({ data: null })),
          publicAxios
            .get("api/init-hotel-smallads/")
            .catch(() => ({ data: [] })),
        ]);
        const slot1 = smallAdsRes.data?.find((a) => a.slot === 1);
        const slot2 = smallAdsRes.data?.find((a) => a.slot === 2);
        setAds({ bigAd: bigAdRes.data, slot1, slot2 });
      } catch (error) {
        console.error("Error fetching hotel ads:", error);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCities && !e.target.closest('.city-dropdown-wrapper')) {
        setShowCities(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCities]);

  const slot1 = ads.slot1;
  const slot2 = ads.slot2;
  const bigAd = ads.bigAd;

  const blockOne = groupedServices.slice(0, 2);
  const blockTwo = groupedServices.slice(2, 4);
  const blockThree = groupedServices.slice(4);

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
              {category.subcategory}
            </h2>
            <button
              onClick={() => navigateToViewAll(category.subcategory)}
              className="text-blue-700 text-[11px] font-semibold flex items-center gap-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              See All <span className="text-lg">›</span>
            </button>
          </div>

          {services.length > 2 ? (
            <Slider {...serviceSliderSettings}>
              {services.map((service) => (
                <div key={service.id} className="px-1.5">
                  <ServiceCard 
                    service={service} 
                    onInquiry={(service) => {
                      setSelectedService(service);
                      setShowInquiryModal(true);
                    }}
                    navigateToDetail={navigateToDetail}
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {services.map((service) => (
                <ServiceCard 
                  key={service.id}
                  service={service} 
                  onInquiry={(service) => {
                    setSelectedService(service);
                    setShowInquiryModal(true);
                  }}
                  navigateToDetail={navigateToDetail}
                />
              ))}
            </div>
          )}
        </section>
      );
    });
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-full transition">
            <FaArrowLeft className="text-gray-700 text-lg" />
          </button>
          <div>
            <h1 className="text-[17px] font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
              Hotels
            </h1>
            <p className="text-[10px] text-gray-500">Find your perfect stay</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <FiShare2 className="text-gray-600 text-lg" />
        </button>
      </div>

      {/* Hero Section with Search */}
      <section className="relative mx-3 mt-3 rounded-3xl overflow-hidden h-[250px]">
        <img
          src="https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="hotel-banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>

        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <h2 className="text-white text-[16px] font-bold leading-snug" style={{ fontFamily: "'Inter', sans-serif" }}>
            Find Your Perfect <br />Hotel Stay
          </h2>
          <p className="text-blue-200 text-[10px] mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            <span className="font-bold text-white">200+</span> verified hotels
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
                <span className="truncate max-w-[60px]">{selectedCity || "City"}</span>
                <FaChevronDown size={10} className={`text-gray-400 flex-shrink-0 ml-1 transition-transform ${showCities ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Search Input */}
            <div className="flex-[2] min-w-[100px]">
              <input
                type="text"
                placeholder="Search hotels, resorts..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && navigateToList()}
                className="w-full px-3 py-2 text-[10px] bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            {/* Search Button */}
            <button
              onClick={navigateToList}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-700 to-blue-800 text-white text-[10px] font-semibold rounded-xl hover:shadow-lg transition flex-shrink-0"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <FiSearch size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Dropdown */}
      {showCities && cities.length > 0 && (
        <div className="relative px-3 -mt-1 z-[9999]">
          <div className="w-full bg-white shadow-2xl rounded-xl max-h-52 overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white px-3 py-2 border-b border-gray-100">
              <span className="text-[9px] font-semibold text-gray-500">Select City</span>
            </div>
            {cities.map((city, idx) => (
              <div
                key={city.id || idx}
                className="px-3 py-2.5 text-[11px] hover:bg-blue-50 cursor-pointer text-gray-700 transition flex items-center justify-between"
                onClick={() => {
                  setSelectedCity(city.name);
                  setShowCities(false);
                }}
              >
                <span>{city.name}</span>
                {selectedCity === city.name && (
                  <FaCheckCircle className="text-blue-500 text-xs" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-3 py-4">
        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-3 mb-1">
          {subcategories.slice(0, 8).map((tab, idx) => (
            <button
              key={idx}
              className={`flex-shrink-0 px-4 py-1.5 text-[10px] font-semibold rounded-full whitespace-nowrap transition-all ${
                selectedSubcategory === tab
                  ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
              onClick={() => {
                setSelectedSubcategory(tab);
                setSelectedCity("");
                setShowCities(false);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feature Grid - Mobile */}
        <section className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { icon: <FaHotel className="text-xl text-blue-700" />, title: "Luxury", count: "50+" },
            { icon: <FaConciergeBell className="text-xl text-amber-500" />, title: "Service", count: "24/7" },
            { icon: <FaSwimmingPool className="text-xl text-teal-500" />, title: "Facilities", count: "30+" },
          ].map((item, i) => (
            <div
              key={i}
              onClick={navigateToList}
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

        {/* Service Blocks */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto mb-3"></div>
            <p className="text-gray-500 text-[11px]">Loading...</p>
          </div>
        ) : (
          renderServiceBlock(blockOne, 'one')
        )}

        {/* Small Ads - Mobile */}
        {(slot1 || slot2) && (
          <section className="py-3">
            <div className="grid grid-cols-2 gap-3">
              {slot1 && (
                <div className="relative rounded-2xl overflow-hidden shadow-sm h-24 group cursor-pointer" onClick={() => window.open(slot1.url, "_blank")}>
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
                <div className="relative rounded-2xl overflow-hidden shadow-sm h-24 group cursor-pointer" onClick={() => window.open(slot2.url, "_blank")}>
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

        {renderServiceBlock(blockTwo, 'two')}

        {/* Big Ad - Mobile */}
        {bigAd && (
          <section className="py-3">
            <div className="relative rounded-2xl overflow-hidden shadow-sm h-36 group cursor-pointer" onClick={() => window.open(bigAd.url, "_blank")}>
              <img src={bigAd.image} alt={bigAd.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3.5">
                <h2 className="text-white text-[14px] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {bigAd.title}
                </h2>
                <button className="inline-block mt-1 bg-gradient-to-r from-blue-700 to-blue-800 text-white text-[10px] font-medium px-3.5 py-0.5 rounded-full hover:shadow-lg transition">
                  Book Now →
                </button>
              </div>
            </div>
          </section>
        )}

        {renderServiceBlock(blockThree, 'three')}

        {/* ✅ REVIEWS - DYNAMIC */}
        <section className="py-5">
          {groupedServices.length > 0 && (
            <MobileServiceReviewsDisplay
              modelName="hotelservice"
              title="Guest Reviews"
              accentColor="blue"
              detailPath="/hoteldetail"
              serviceItems={groupedServices.flatMap(cat =>
                (cat.services || []).map(s => ({ id: s.id, name: s.hotel_name }))
              )}
              maxReviews={6}
              emptyMessage="No guest reviews yet"
            />
          )}
        </section>

        {/* ❌ PURANA REVIEWS HATA DO */}
        {/* <section className="py-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[15px] font-bold text-gray-900">Guest Reviews</h2>
            <button className="text-[11px] text-blue-700 font-semibold">See All →</button>
          </div>
          <Slider {...reviewSliderSettings}>
            {[...].map((item, id) => (...))}
          </Slider>
        </section> */}
      </div>

      {/* Inquiry Modal - Mobile Bottom Sheet */}
      {showInquiryModal && selectedService && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={() => setShowInquiryModal(false)}
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
                  {selectedService.hotel_name}
                </p>
              </div>
              <button 
                onClick={() => setShowInquiryModal(false)} 
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <FaTimes className="text-gray-600 text-sm" />
              </button>
            </div>
            <div className="p-5">
              <MobileInquiryForm serviceData={selectedService} onSuccess={() => setShowInquiryModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Service Card Component - Mobile
const ServiceCard = ({ service, onInquiry, navigateToDetail }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div 
        className="relative h-40 w-full cursor-pointer overflow-hidden"
        onClick={() => navigateToDetail(service.id)}
      >
        <img
          src={service.main_image || "https://placehold.co/400x300/1e40af/white?text=Hotel"}
          alt={service.hotel_name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow">
          <FiHeart className="text-gray-600 text-sm" />
        </div>
        {service.hotel_rating && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-yellow-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
            <FaStar className="text-yellow-500 text-[8px]" />
            {parseFloat(service.hotel_rating).toFixed(1)}
          </span>
        )}
        {service.room_category === "premium" && (
          <span className="absolute top-2 left-12 bg-amber-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">
            Premium
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-12"></div>
      </div>
      <div className="p-3">
        <h3 
          className="text-[13px] font-bold text-gray-900 truncate"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {service.hotel_name}
        </h3>
        <p 
          className="text-[9px] text-blue-600 font-medium truncate"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {service.subcategory_name}
        </p>
        <p 
          className="text-[10px] text-gray-500 flex items-center mt-0.5 truncate"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <FaMapMarkerAlt className="mr-0.5 text-red-500 text-[8px] flex-shrink-0" />
          <span className="truncate">{service.city || service.address || "—"}</span>
        </p>
        {service.room_types?.length > 0 && (
          <p className="text-[9px] font-semibold text-blue-700 mt-0.5">
            From ₹{Math.min(...service.room_types.map((r) => parseFloat(r.rate)))}/night
          </p>
        )}
        <div className="flex gap-1.5 mt-2">
          {service.contact_no && (
            <a
              href={`tel:${service.contact_no}`}
              className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-700 to-blue-800 text-white text-[9px] font-medium py-1.5 rounded-lg hover:shadow-md transition"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <FaPhone className="text-[8px]" /> Call
            </a>
          )}
          <button
            onClick={() => onInquiry(service)}
            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-medium py-1.5 rounded-lg hover:shadow-md transition"
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
const MobileInquiryForm = ({ serviceData, onSuccess }) => {
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
    if (!vendorId) {
      setErrorMsg("Vendor info missing.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const payload = {
        service_category: "hotel",
        vendor: vendorId,
        service_id: serviceData?.id,
        service_name: serviceData?.hotel_name,
        service_url: window.location.href,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        customer_city: form.city,
        inquiry_type: "general",
        subject: `Inquiry about ${serviceData?.hotel_name}`,
        message: form.message,
      };
      const res = await publicAxios.post("/api/public/inquiries/", payload);
      if (res.status === 201) {
        setSuccessMsg("✓ Inquiry submitted successfully!");
        setForm({ name: "", phone: "", email: "", city: "", message: "" });
        setTimeout(() => {
          setSuccessMsg("");
          if (onSuccess) onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Failed to submit. Please try again.");
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
        className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-xl font-semibold text-[13px] disabled:opacity-50 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-4"
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