// src/pages/mobile/MobileSalonDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import {
  FiHeart, FiShare2, FiPhone, FiMail, FiMapPin, FiCheckCircle,
  FiClock, FiGrid, FiLoader, FiTag, FiPackage, FiGlobe, FiMap,
  FiScissors, FiArrowLeft, FiChevronDown, FiChevronUp, FiX
} from "react-icons/fi";
import { FaWhatsapp, FaStar, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { publicAxios } from "../../api/axios";
import MobileServiceReviewSection from "./MobileServiceReviewSection"; // ✅ Import review section

export default function MobileSalonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [subcategories, setSubcategories] = useState([]);
  const [activeTab, setActiveTab] = useState("details");

  const [inquiryData, setInquiryData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [expandedField, setExpandedField] = useState(null);

  const toggleField = (fieldName) => {
    if (expandedField === fieldName) {
      setExpandedField(null);
    } else {
      setExpandedField(fieldName);
    }
  };

  // Fetch subcategories
  useEffect(() => {
    publicAxios.get('/api/service-subcategories/by_service/?service=Salon')
      .then(res => {
        if (res.data && res.data["Salon"]) {
          setSubcategories(res.data["Salon"]);
        }
      })
      .catch(err => console.error("Subcategory fetch error:", err));
  }, []);

  // Fetch service detail
  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get(`/api/public/salon-service/${id}/`);
        if (response.data) {
          setService(response.data);
          setError(null);
        } else {
          setError("Service not found.");
        }
      } catch (err) {
        console.error("Error fetching salon service:", err);
        setError("Failed to load service details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchServiceDetail();
  }, [id]);

  const getSubcategoryName = (subcategoryId) => {
    if (!subcategoryId) return "Salon Service";
    const subId = typeof subcategoryId === 'object' ? subcategoryId.id : subcategoryId;
    const match = subcategories.find(s => String(s.id) === String(subId));
    return match?.subcategory_name || "Salon Service";
  };

  const formatCurrency = (amount) => {
    if (!amount || amount == 0) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (time) => {
    if (!time) return "—";
    try {
      const [h, m] = time.split(":");
      const date = new Date();
      date.setHours(parseInt(h), parseInt(m));
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return time;
    }
  };

  const handleShare = () => {
    if (navigator.share && service) {
      navigator.share({
        title: service.business_name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("salon_favorites") || "[]");
    if (service && !favorites.includes(service.id)) {
      favorites.push(service.id);
      localStorage.setItem("salon_favorites", JSON.stringify(favorites));
      alert("Added to favorites!");
    }
  };

  const getInitials = (name) => {
    if (!name) return "S";
    return name.charAt(0).toUpperCase();
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!service) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const vendorId = service.vendor;
      if (!vendorId) throw new Error("Vendor information not found");

      const payload = {
        service_category: "salon",
        vendor: vendorId,
        service_id: service.id,
        service_name: service.business_name,
        service_url: window.location.href,
        customer_name: inquiryData.name,
        customer_email: inquiryData.email || "",
        customer_phone: inquiryData.phone,
        customer_city: inquiryData.city,
        inquiry_type: "general",
        subject: `Inquiry about ${service.business_name}`,
        message: inquiryData.message,
      };

      const response = await publicAxios.post("/api/public/inquiries/", payload);
      if (response.status === 201) {
        setSubmitSuccess(true);
        setInquiryData({ name: "", phone: "", email: "", city: "", message: "" });
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Inquiry error:", err);
      setSubmitError("Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <FiLoader className="animate-spin text-4xl text-pink-600" />
        <span className="mt-3 text-detail-body text-gray-600">Loading salon details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 px-4">
        <div className="text-red-500 text-detail-body mb-4 text-center">{error}</div>
        <button onClick={() => navigate("/saloonhome")} className="bg-pink-600 text-white px-6 py-2 rounded-lg text-detail-btn-sm hover:bg-pink-700">
          Back to Salons
        </button>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-detail-body text-gray-600">Service not found</div>
      </div>
    );
  }

  const mainImage = service.main_image || "https://placehold.co/600x400/F9A8D4/white?text=Salon+Service";
  const secondImage = service.second_image || null;
  const multiImages = (service.multi_images || []).map(img => typeof img === "string" ? img : img.image);
  const allImages = [mainImage, ...(secondImage ? [secondImage] : []), ...multiImages].filter(Boolean);
  const slides = allImages.map(src => ({ src }));
  const additionalImages = allImages.slice(1);
  const items = service.items || [];

  const fields = [
    { name: 'name', label: 'Full Name', placeholder: 'Enter your full name', required: true, type: 'text' },
    { name: 'phone', label: 'Phone Number', placeholder: 'Enter your phone number', required: true, type: 'tel' },
    { name: 'email', label: 'Email Address', placeholder: 'Enter your email', required: false, type: 'email' },
    { name: 'city', label: 'City', placeholder: 'Enter your city', required: true, type: 'text' },
    { name: 'message', label: 'Message', placeholder: 'Write your message here...', required: false, type: 'textarea' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center justify-between overflow-x-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-full transition flex-shrink-0">
            <FiArrowLeft className="text-gray-700 text-detail-icon" />
          </button>
          <h1 className="text-detail-title font-bold text-gray-900 truncate max-w-[200px]">
            {service.business_name}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleFavorite} className="p-1.5 hover:bg-gray-100 rounded-full transition">
            <FiHeart className="text-gray-600 text-detail-icon" />
          </button>
          <button onClick={handleShare} className="p-1.5 hover:bg-gray-100 rounded-full transition">
            <FiShare2 className="text-gray-600 text-detail-icon" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative mx-3 mt-3 rounded-2xl overflow-hidden">
        <img
          className="w-full h-64 object-cover"
          src={mainImage}
          alt={service.business_name}
          onClick={() => { setPhotoIndex(0); setIsOpen(true); }}
        />
        {allImages.length > 1 && (
          <button
            onClick={() => setIsOpen(true)}
            className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-detail-xs font-medium py-1.5 px-3 rounded-full flex items-center gap-1.5"
          >
            <FiGrid className="w-3.5 h-3.5" /> {allImages.length}
          </button>
        )}
        {service.subcategory_name && (
          <span className="absolute top-3 left-3 bg-pink-600 text-white text-detail-xs font-medium px-2.5 py-1 rounded-full">
            {service.subcategory_name}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {additionalImages.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto px-3 mt-2 scrollbar-hide">
          {additionalImages.slice(0, 6).map((src, idx) => (
            <img
              key={idx}
              className="rounded-lg w-16 h-16 object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
              src={src}
              alt={`${service.business_name} - ${idx + 2}`}
              onClick={() => { setPhotoIndex(idx + 1); setIsOpen(true); }}
            />
          ))}
          {additionalImages.length > 6 && (
            <div className="rounded-lg w-16 h-16 bg-gray-200 flex items-center justify-center flex-shrink-0 cursor-pointer" onClick={() => setIsOpen(true)}>
              <span className="text-detail-xs font-medium text-pink-600">+{additionalImages.length - 6}</span>
            </div>
          )}
        </div>
      )}

      <Lightbox open={isOpen} close={() => setIsOpen(false)} slides={slides} index={photoIndex} on={{ view: ({ index }) => setPhotoIndex(index) }} />

      {/* Title & Rating */}
      <div className="px-4 mt-3 overflow-x-hidden">
        <h1 className="text-detail-title font-bold text-gray-900">
          {service.business_name}
        </h1>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (<FaStar key={i} className="text-yellow-400 w-3.5 h-3.5" />))}
            <span className="text-detail-xs text-gray-500 ml-1">(5.0)</span>
          </div>
          <div className="flex items-center gap-1 text-detail-xs text-gray-500">
            <FiMapPin className="w-3 h-3 text-pink-500" />
            <span className="truncate max-w-[150px]">{service.city || "Location"}</span>
          </div>
        </div>
      </div>

      {/* Quick Contact Buttons */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-hidden">
        {service.contact_no && (
          <a href={`tel:${service.contact_no}`} className="flex-1 bg-pink-600 text-white text-detail-btn-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-pink-700 transition">
            <FiPhone className="w-3.5 h-3.5" /> Call Now
          </a>
        )}
        {(service.whatsapp_no || service.contact_no) && (
          <a href={`https://wa.me/${(service.whatsapp_no || service.contact_no).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 border border-green-500 text-green-600 text-detail-btn-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-green-50 transition">
            <FaWhatsapp className="w-3.5 h-3.5" /> WhatsApp
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4 border-b border-gray-200 overflow-x-hidden">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {["details", "location", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-detail-btn-sm font-medium whitespace-nowrap transition ${
                activeTab === tab ? "border-b-2 border-pink-600 text-pink-600" : "text-gray-500"
              }`}
            >
              {tab === "details" ? "About" : tab === "location" ? "Location" : "Reviews"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4 overflow-x-hidden">
        {activeTab === "details" && (
          <div className="space-y-4">
            {/* Description */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-detail-subtitle font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FiScissors className="text-pink-600 text-detail-icon-sm" /> About
              </h2>
              <div className="text-detail-text text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: service.description || "No description available." }} />
            </div>

            {/* Services / Packages */}
            {items.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-detail-subtitle font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FiScissors className="text-pink-600 text-detail-icon-sm" /> Services & Packages
                </h2>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-detail-value text-gray-800">{item.name}</h3>
                          {item.description && (
                            <p className="text-detail-small text-gray-600 mt-0.5 leading-relaxed">{item.description}</p>
                          )}
                        </div>
                        {formatCurrency(item.price) && (
                          <div className="ml-2 flex-shrink-0">
                            <span className="text-pink-600 font-bold text-detail-price">{formatCurrency(item.price)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview - Grid */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-detail-subtitle font-bold text-gray-900 mb-3">Overview</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: FiTag, label: "Category", value: service.subcategory_name || "Salon" },
                  { icon: FiClock, label: "Opens At", value: formatTime(service.open_time) },
                  { icon: FiClock, label: "Closes At", value: formatTime(service.close_time) },
                  { icon: FiGlobe, label: "Country", value: service.country || "—" },
                  { icon: FiMap, label: "State", value: service.state || "—" },
                  { icon: FaMapMarkerAlt, label: "City", value: service.city || "—" },
                  { icon: FiPhone, label: "Contact", value: service.contact_no || "—" },
                  { icon: FaWhatsapp, label: "WhatsApp", value: service.whatsapp_no || "—" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <item.icon className="w-3.5 h-3.5 text-pink-500" />
                      <span className="text-detail-label text-gray-500 uppercase">{item.label}</span>
                    </div>
                    <span className="text-detail-value text-gray-800 truncate block">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-detail-subtitle font-bold text-gray-900 mb-3">Business Details</h2>
              <div className="space-y-2">
                {[
                  { label: "Business Name", value: service.business_name || "—" },
                  { label: "Category", value: service.subcategory_name || "—" },
                  { label: "Opening Hours", value: `${formatTime(service.open_time)} – ${formatTime(service.close_time)}` },
                  { label: "Contact No.", value: service.contact_no || "—" },
                  { label: "WhatsApp", value: service.whatsapp_no || "—" },
                  { label: "Status", value: service.status || "—", isStatus: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-detail-label text-gray-500">{item.label}</span>
                    <span className={`text-detail-value ${item.isStatus && item.value === "approved" ? "text-green-600" : item.isStatus && item.value === "pending" ? "text-yellow-600" : item.isStatus && item.value === "rejected" ? "text-red-600" : "text-gray-800"}`}>
                      {item.isStatus ? <span className="capitalize">{item.value}</span> : item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "location" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-detail-subtitle font-bold text-gray-900 mb-3">Location Information</h2>
              <div className="space-y-2">
                {[
                  { label: "City", value: service.city || "—" },
                  { label: "State", value: service.state || "—" },
                  { label: "Country", value: service.country || "—" },
                  { label: "Complete Address", value: service.address || "—", full: true },
                ].map((item, idx) => (
                  <div key={idx} className={`flex ${item.full ? 'flex-col' : 'justify-between'} py-1.5 border-b border-gray-50 last:border-0`}>
                    <span className="text-detail-label text-gray-500">{item.label}</span>
                    <span className={`text-detail-value text-gray-800 ${item.full ? 'mt-0.5' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {service.location && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <span className="text-detail-label text-gray-500 uppercase block mb-1">Google Maps Location</span>
                <a href={service.location} target="_blank" rel="noopener noreferrer" className="text-pink-600 text-detail-text break-all hover:text-pink-800">
                  {service.location}
                </a>
              </div>
            )}
          </div>
        )}

        {/* ✅ REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="pb-6">
            <MobileServiceReviewSection
              modelName="saloonservice"
              objectId={service.id}
              serviceName={service.business_name}
              accentColor="pink"
            />
          </div>
        )}
      </div>

      {/* Bottom Sheet - Inquiry Form */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 shadow-lg">
        <button
          onClick={() => {
            const modal = document.getElementById('inquiryModal');
            if (modal) modal.classList.toggle('hidden');
          }}
          className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white text-detail-btn font-semibold py-3 rounded-xl hover:shadow-lg transition"
        >
          Send Inquiry
        </button>
      </div>

      {/* Inquiry Modal - Bottom Sheet */}
      <div id="inquiryModal" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-[100] hidden">
        <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto max-h-[92vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-5 pt-4 pb-3 flex justify-between items-center border-b border-gray-100 z-10">
            <div>
              <h3 className="text-detail-title font-bold text-gray-900">
                Send Inquiry
              </h3>
              <p className="text-detail-small text-gray-500 truncate max-w-[200px]">
                {service.business_name}
              </p>
            </div>
            <button 
              onClick={() => {
                const modal = document.getElementById('inquiryModal');
                if (modal) modal.classList.add('hidden');
              }}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
              <FiX className="text-gray-600 text-detail-icon-sm" />
            </button>
          </div>
          <div className="p-5">
            <form onSubmit={handleInquirySubmit} className="space-y-3 w-full">
              {submitSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-detail-small w-full">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  <span className="break-words">✓ Inquiry submitted successfully!</span>
                </div>
              )}
              {submitError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-detail-small w-full">
                  <FaTimes className="text-red-500 flex-shrink-0" />
                  <span className="break-words">{submitError}</span>
                </div>
              )}

              {fields.map((field) => {
                const isExpanded = expandedField === field.name;
                const value = inquiryData[field.name];

                return (
                  <div key={field.name} className="w-full">
                    <button
                      type="button"
                      onClick={() => toggleField(field.name)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200"
                    >
                      <span className="text-detail-small font-medium text-gray-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                        {value && <span className="text-green-500 text-detail-xs ml-2">✓</span>}
                      </span>
                      {isExpanded ? (
                        <FiChevronUp className="text-gray-400 text-sm" />
                      ) : (
                        <FiChevronDown className="text-gray-400 text-sm" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 px-1 w-full">
                        {field.type === 'textarea' ? (
                          <textarea
                            name={field.name}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(e) => setInquiryData({ ...inquiryData, [field.name]: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-3 text-detail-input border-2 border-pink-500 rounded-xl outline-none resize-none focus:ring-2 focus:ring-pink-300 transition"
                            autoFocus
                          />
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            placeholder={field.placeholder}
                            required={field.required}
                            value={value}
                            onChange={(e) => setInquiryData({ ...inquiryData, [field.name]: e.target.value })}
                            className="w-full px-4 py-3 text-detail-input border-2 border-pink-500 rounded-xl outline-none focus:ring-2 focus:ring-pink-300 transition"
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
                className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl font-semibold text-detail-btn disabled:opacity-50 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiScissors className="text-detail-icon-sm" /> Send Inquiry
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}