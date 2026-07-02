// src/Services/TechIndustryHome.jsx
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import {
  FaQuoteLeft,
  FaStar,
  FaMapMarkerAlt,
  FaCubes,
  FaHeadset,
  FaLightbulb,
} from "react-icons/fa";
import { publicAxios } from "../api/axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MobileTechIndustryHome from "./mobile/MobileTechIndustryHome";
import ServiceReviewsDisplay from "./ServiceReviewsDisplay";

export default function TechIndustryHome() {
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
    return <MobileTechIndustryHome />;
  }

  const navigateToServiceList = () => {
    const params = new URLSearchParams();
    params.append("type", "tech_industry");
    if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
    if (selectedCity) params.append("city", selectedCity);
    if (searchKeyword.trim() !== "") params.append("keyword", searchKeyword.trim());
    navigate(`/searchservice?${params.toString()}`);
  };

  const navigateToServiceDetail = (id, subcategory) => {
    navigate(`/techdetail/${id}`);
  };

  const navigateToViewAll = (subcategory) => {
    if (!subcategory) return;
    navigate(`/searchservice?subcategory=${encodeURIComponent(subcategory)}&type=tech_industry`);
  };

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

  // Fetch subcategories
  const fetchSubcategories = async () => {
    try {
      // Use the correct API endpoint with proper URL encoding for "Tech Industry"
      const response = await publicAxios.get("services/service-subcategory/");
      console.log("API data:", response.data);

      const techSubs = response.data
        .filter(sub => sub.parent_service?.toLowerCase().trim() === "tech industry")
        .map(sub => sub.subcategory_name);

      console.log("Filtered Tech subcategories:", techSubs);
      setSubcategories(techSubs);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  useEffect(() => {
    fetchSubcategoryServices();
  }, []);

  const fetchSubcategoryServices = async () => {
    try {
      // Try the public endpoint directly
      const res = await publicAxios.get("/api/public/tech-services/");
      console.log("Public Tech Services Response:", res.data);

      const servicesData = Array.isArray(res.data) ? res.data : res.data.results || [];
      console.log("Tech Services Data:", servicesData);

      const serviceList = servicesData.map(service => ({
        id: service.id,
        name: service.business_name,
      }));
      setServiceListForReviews(serviceList);

      const grouped = Object.values(
        servicesData.reduce((acc, service) => {
          const subcat = service.subcategory_name || "Other";
          if (!acc[subcat]) acc[subcat] = { subcategory: subcat, services: [] };
          acc[subcat].services.push(service);
          return acc;
        }, {})
      );

      console.log("Grouped Tech Services:", grouped);
      setSubcategoryData(grouped);
    } catch (err) {
      console.error("Subcategory Fetch Error:", err);
    }
  };
  const [selectedCity, setSelectedCity] = React.useState("");
  const [showCities, setShowCities] = React.useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [serviceListForReviews, setServiceListForReviews] = useState([]);

  const openInquiryModal = (service) => {
    setSelectedService(service);
    setShowInquiryModal(true);
  };

  const closeInquiryModal = () => {
    setShowInquiryModal(false);
    setSelectedService(null);
  };

  useEffect(() => {
    const getCities = async () => {
      try {
        const res = await publicAxios.get("services/service-city/");
        console.log("City API Response:", res.data); // 👈 ADD THIS
        const cityData = Array.isArray(res.data.cities) ? res.data.cities : [];

        // Log all unique types to see what's available
        const types = [...new Set(cityData.map(c => c.type))];
        console.log("Available city types:", types); // 👈 ADD THIS

        const techCities = cityData.filter(city => city.type === "tech_industry_service");
        console.log("Filtered Tech Cities:", techCities); // 👈 ADD THIS

        const filteredCities = selectedSubcategory
          ? techCities.filter(city => city.subcategories?.some(sub => sub.name.toLowerCase() === selectedSubcategory.toLowerCase()))
          : techCities;
        setCities(filteredCities);
        setSelectedCity("");
      } catch (error) {
        console.log("City Fetch Error:", error);
      }
    };
    getCities();
  }, [selectedSubcategory]);

  const [bigAd, setBigAd] = useState(null);
  useEffect(() => {
    publicAxios.get("api/init-techindustry-bigad/")
      .then((res) => setBigAd(res.data))
      .catch((err) => console.error("Error fetching big ad:", err));
  }, []);

  const [ads, setAds] = useState([]);
  useEffect(() => {
    publicAxios.get("api/init-techindustry-smallads/")
      .then((res) => setAds(res.data))
      .catch((err) => console.error("Error fetching small ads:", err));
  }, []);

  const slot1 = ads.find((ad) => ad.slot === 1);
  const slot2 = ads.find((ad) => ad.slot === 2);

  const blockOne = subcategoryData.slice(0, 2);
  const blockTwo = subcategoryData.slice(2, 4);
  const blockThree = subcategoryData.slice(4);

  const renderServiceBlock = (block = []) => {
    if (!Array.isArray(block)) return null;
    return block.map((category, index) => (
      <section key={index} className="py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">{category.subcategory}</h2>
          <button onClick={() => navigateToViewAll(category.subcategory)} className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center">
            View All <span className="ml-1">→</span>
          </button>
        </div>
        <Slider {...categorySlider}>
          {category.services?.map((service) => (
            <div key={service.id} className="p-3">
              <div className="bg-white border-2 border-cyan-500 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 cursor-pointer w-full flex flex-col overflow-hidden">
                <div className="relative w-full h-56 md:h-64 lg:h-72">
                  <img src={service.main_image} alt={service.business_name} className="w-full h-full object-cover rounded-t-2xl"
                    onClick={() => navigateToServiceDetail(service.id, service.subcategory)} />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-gray-900 font-bold text-lg md:text-xl truncate">{service.business_name}</p>
                    <p className="text-gray-500 text-sm md:text-base flex items-center mt-1 truncate">
                      <FaMapMarkerAlt className="mr-2 text-red-600 flex-shrink-0" />
                      <span>{service.address}</span>
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      {Array(5).fill(0).map((_, i) => (<FaStar key={i} className="text-yellow-500" />))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {service.contact_no && (
                      <a href={`tel:${service.contact_no}`} className="flex-1 text-center bg-orange-500 text-white font-medium py-2 rounded-md hover:bg-orange-600 transition">Call Now</a>
                    )}
                    <button onClick={() => openInquiryModal(service)} className="flex-1 text-center bg-cyan-600 text-white font-medium py-2 rounded-md hover:bg-cyan-700 transition">Inquiry</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>
    ));
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Banner */}
      <section className="relative w-full h-[540px]">
        <img src="https://images.pexels.com/photos/3894153/pexels-photo-3894153.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="tech-banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-blue-900/70"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-snug">Find the Best Tech Companies & IT Services Near You</h2>
          <p className="text-blue-100 text-xs sm:text-sm md:text-base mb-6 max-w-[90%] sm:max-w-[80%]">
            <span className="font-semibold">300+</span> verified tech companies and <span className="font-semibold">150+</span> IT services!
          </p>
          <div className="bg-[#00000080] text-white rounded-2xl flex items-center justify-start sm:justify-center gap-4 sm:gap-6 px-4 py-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] overflow-x-auto scrollbar-hide min-h-[40px]">
            {subcategories.length === 0 && <p className="text-white">Loading...</p>}
            {subcategories.map((tab, idx) => (
              <button key={idx} className={`flex-shrink-0 pb-1 px-2 text-xs sm:text-sm md:text-base font-semibold border-b-2 ${selectedSubcategory === tab ? "border-white text-white" : "border-transparent text-gray-300 hover:text-white hover:border-white"} transition`}
                onClick={() => { setSelectedSubcategory(tab); setSelectedCity(""); setShowCities(false); }}>
                {tab}
              </button>
            ))}
          </div>
          <div className="relative bg-white shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] p-2 mt-[-1px] rounded-b-sm sm:rounded-full">
            <div className="relative sm:w-40 w-full sm:border-r border-b sm:border-b-0">
              <button onClick={() => setShowCities((prev) => !prev)} className="flex items-center justify-between w-full px-4 py-2 text-gray-800 font-medium">
                {selectedCity || "Select City"}
                <svg className={`w-4 h-4 text-gray-500 transform transition ${showCities ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCities && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white shadow-lg rounded-lg z-30">
                  {cities.map(city => (
                    <div key={city.id} className="px-4 py-2 text-left hover:bg-gray-100 cursor-pointer text-gray-700" onClick={() => { setSelectedCity(city.name); setShowCities(false); }}>
                      {city.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              <input type="text" placeholder="Search for tech company or IT service" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 outline-none border border-gray-200 rounded-md sm:border-none sm:rounded-none" />
            </div>
            <button onClick={navigateToServiceList} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md sm:rounded-full font-semibold flex items-center justify-center transition w-full sm:w-auto">
              <FiSearch className="h-5 w-5 mr-2 sm:hidden" /> Search
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-20 -mt-16">
        <div className="relative bg-blue-100 rounded-tl-[80px] rounded-tr-[80px] py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: <FaCubes className="text-4xl text-cyan-600" />, title: "Scalable Solutions", text: "Build and deploy applications that grow with your business.", bg: "bg-white" },
                { icon: <FaHeadset className="text-4xl text-green-600" />, title: "24/7 Expert Support", text: "Dedicated technical teams available around the clock.", bg: "bg-white" },
                { icon: <FaLightbulb className="text-4xl text-pink-600" />, title: "Innovation & Consulting", text: "Strategic guidance from CTO-level experts.", bg: "bg-white" },
              ].map((item, i) => (
                <div key={i} onClick={navigateToServiceList} className={`${item.bg} rounded-xl shadow-lg p-8 text-center hover:scale-[1.02] transition duration-300 cursor-pointer`}>
                  <div className="mb-4 flex justify-center">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-16" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1200 120">
            <path d="M0,0 C300,120 900,120 1200,0 L1200,120 L0,120 Z" fill="#bfdbfe"></path>
          </svg>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <hr className="my-8 border-gray-200" />
        {renderServiceBlock(blockOne)}
        <hr className="my-8 border-gray-200" />

        {/* Banners */}
        <section className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slot1 && (
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img src={slot1.image} alt={slot1.title || "banner1"} className="w-full h-full object-cover" />
                {(slot1.title || slot1.url) && (
                  <div className="absolute bottom-0 left-0 p-3 sm:p-4 md:p-5 flex flex-col gap-1.5">
                    {slot1.title && <h3 className="text-white font-semibold leading-snug text-sm sm:text-base md:text-lg max-w-[60%] lg:max-w-[270px]">{slot1.title}</h3>}
                    {slot1.url && <a href={slot1.url} target="_blank" rel="noopener noreferrer" className="inline-block text-center rounded transition bg-orange-500 hover:bg-orange-600 text-white w-20 sm:w-24 text-xs sm:text-sm py-1">Shop Now</a>}
                  </div>
                )}
              </div>
            )}
            {slot2 && (
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img src={slot2.image} alt={slot2.title || "banner2"} className="w-full h-full object-cover" />
                {(slot2.title || slot2.url) && (
                  <div className="absolute bottom-0 left-0 p-3 sm:p-4 md:p-5 flex flex-col gap-1.5">
                    {slot2.title && <h3 className="text-white font-semibold leading-snug text-sm sm:text-base md:text-lg max-w-[60%] lg:max-w-[270px]">{slot2.title}</h3>}
                    {slot2.url && <a href={slot2.url} target="_blank" rel="noopener noreferrer" className="inline-block text-center rounded transition bg-orange-500 hover:bg-orange-600 text-white w-20 sm:w-24 text-xs sm:text-sm py-1">Shop Now</a>}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {renderServiceBlock(blockTwo)}
        <hr className="my-8 border-gray-200" />

        {bigAd && (
          <section className="py-4">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img src={bigAd.image} alt="big-banner" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 p-3 sm:p-5 md:p-8 lg:p-10 flex flex-col gap-2">
                <h2 className="text-white font-bold leading-snug text-sm sm:text-base md:text-lg lg:text-2xl max-w-[85%] md:max-w-[400px] lg:max-w-[443px]">{bigAd.title}</h2>
                {bigAd.url && <a href={bigAd.url} target="_blank" rel="noopener noreferrer" className="inline-block text-center rounded shadow transition bg-orange-500 hover:bg-orange-600 text-white w-20 sm:w-24 lg:w-28 py-1 sm:py-2 text-xs sm:text-sm lg:text-base font-medium">Shop Now</a>}
              </div>
            </div>
          </section>
        )}

        {renderServiceBlock(blockThree)}
        <hr className="my-8 border-gray-200" />

{serviceListForReviews.length > 0 && (
  <section className="py-12">
    <ServiceReviewsDisplay
      modelName="techindustryservice"
      title="Client Success Stories"
      accentColor="cyan"
      detailPath="/techdetail"
      serviceItems={serviceListForReviews}
      maxReviews={6}
      emptyMessage="No client reviews yet"
    />
  </section>
)}
      </div>

      <div className="h-20 bg-gray-200 mt-10"></div>

      {showInquiryModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeInquiryModal}>
          <div className="bg-white rounded-xl shadow-xl w-11/12 md:w-3/4 lg:w-1/2 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-cyan-600 text-white text-xl font-bold px-6 py-4 flex justify-between items-center">
              Inquiry Form
              <button className="text-white font-bold text-2xl" onClick={closeInquiryModal}>&times;</button>
            </div>
            <div className="p-6"><InquiryForm serviceData={selectedService} /></div>
          </div>
        </div>
      )}
    </div>
  );
}

const InquiryForm = ({ serviceData, prefillMessage }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", message: prefillMessage || "" });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vendorId = serviceData?.vendor?.id || serviceData?.vendor;
    const category = "tech";
    if (!vendorId) { setErrorMsg("Vendor info missing."); return; }
    setSubmitting(true);
    try {
      const payload = { service_category: category, vendor: vendorId, service_id: serviceData?.id, service_name: serviceData?.business_name, service_url: window.location.href, customer_name: form.name, customer_phone: form.phone, customer_email: form.email, customer_city: form.city, inquiry_type: 'general', subject: `Inquiry about ${serviceData?.business_name}`, message: form.message };
      const response = await publicAxios.post("/api/public/inquiries/", payload);
      if (response.status === 201) { setSuccessMsg("✅ Inquiry submitted!"); setForm({ name: "", phone: "", email: "", city: "", message: "" }); }
    } catch (err) { setErrorMsg("❌ Failed to submit."); } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white rounded-lg">
      {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMsg}</div>}
      {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Your Name*" required value={form.name} onChange={handleChange} disabled={submitting} className="w-full border px-4 py-2 rounded" />
        <input type="text" name="phone" placeholder="Phone Number*" required value={form.phone} onChange={handleChange} disabled={submitting} className="w-full border px-4 py-2 rounded" />
        <input type="email" name="email" placeholder="Email (Optional)" value={form.email} onChange={handleChange} disabled={submitting} className="w-full border px-4 py-2 rounded" />
        <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} disabled={submitting} className="w-full border px-4 py-2 rounded" />
        <textarea name="message" placeholder="Your message..." rows="4" value={form.message} onChange={handleChange} disabled={submitting} className="w-full border px-4 py-2 rounded" />
        <button type="submit" disabled={submitting} className={`w-full ${submitting ? 'bg-cyan-400' : 'bg-cyan-600 hover:bg-cyan-700'} text-white py-3 rounded-md font-semibold`}>{submitting ? 'Submitting...' : 'Send Inquiry'}</button>
      </form>
    </div>
  );
};