// src/pages/mobile/MobileRealEstateDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import {
  FiHeart, FiShare2, FiPhone, FiMail, FiMapPin, FiCheckCircle,
  FiTrello, FiClipboard, FiDollarSign, FiMaximize, FiDroplet,
  FiLayers, FiCrop, FiSquare, FiGrid, FiLoader, FiHome,
  FiArrowLeft, FiChevronDown, FiChevronUp, FiX
} from "react-icons/fi";
import { FaWhatsapp, FaUniversity, FaBus, FaHospital, FaShoppingBag, FaTimes } from "react-icons/fa";
import { publicAxios } from "../../api/axios";
import MobileServiceReviewSection from "./MobileServiceReviewSection";

export default function MobileRealEstateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(false);
  const [expandedField, setExpandedField] = useState(null);

  const [inquiryData, setInquiryData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const toggleField = (fieldName) => {
    if (expandedField === fieldName) {
      setExpandedField(null);
    } else {
      setExpandedField(fieldName);
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      setLoadingPropertyTypes(true);
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
    } finally {
      setLoadingPropertyTypes(false);
    }
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        await fetchPropertyTypes();

        const allPropertiesResponse = await publicAxios.get('/api/services/real-estate/public/');
        const allProperties = allPropertiesResponse.data.results || allPropertiesResponse.data || [];

        const propertyFromList = allProperties.find(p =>
          p.id === parseInt(id) ||
          String(p.id) === id
        );

        if (!propertyFromList) {
          setError('Property not found. It may not be published yet.');
          return;
        }

        if (propertyFromList.slug) {
          const detailResponse = await publicAxios.get(
            `/api/services/real-estate/public/${propertyFromList.slug}/`
          );
          setProperty(detailResponse.data);
          setError(null);
        } else {
          setProperty(propertyFromList);
        }

      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const getPropertyTypeDisplay = (type) => {
    if (!type) return "Property";
    const typeStr = String(type);
    const option = propertyTypeOptions.find(opt => String(opt.id) === typeStr);
    if (option) return option.label || option.subcategory_name;
    const optionByValue = propertyTypeOptions.find(
      opt => opt.value === typeStr || opt.label?.toLowerCase().replace(/\s+/g, '_') === typeStr
    );
    if (optionByValue) return optionByValue.label || optionByValue.subcategory_name;
    const staticTypes = {
      'apartment': 'Apartment',
      'house': 'House',
      'villa': 'Villa',
      'commercial': 'Commercial',
      'pg_coliving': 'PG/Co-living',
      'plots': 'Plot'
    };
    return staticTypes[typeStr] || typeStr.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getPropertySubTypeDisplay = (type) => {
    if (!type) return "Property";
    const typeStr = String(type);
    const option = propertyTypeOptions.find(opt => String(opt.id) === typeStr);
    if (option) return option.label || option.subcategory_name;
    return getPropertyTypeDisplay(type);
  };

  const handleShare = () => {
    if (navigator.share && property) {
      navigator.share({
        title: property.title,
        text: property.short_description || property.description?.substring(0, 100) || '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('property_favorites') || '[]');
    if (property && !favorites.includes(property.id)) {
      favorites.push(property.id);
      localStorage.setItem('property_favorites', JSON.stringify(favorites));
      alert('Added to favorites!');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatArea = (area) => {
    if (!area || area === 0) return "0 SqFt";
    return `${area.toLocaleString()} SqFt`;
  };

  const getTransactionDisplay = (type) => {
    const types = {
      'sale': 'For Sale',
      'rent': 'For Rent',
      'lease': 'For Lease'
    };
    return types[type] || type;
  };

  const getFurnishingDisplay = (status) => {
    const statuses = {
      'fully_furnished': 'Fully Furnished',
      'semi_furnished': 'Semi Furnished',
      'unfurnished': 'Unfurnished'
    };
    return statuses[status] || status;
  };

  const getFacingDisplay = (direction) => {
    const directions = {
      'east': 'East',
      'west': 'West',
      'north': 'North',
      'south': 'South',
      'north_east': 'North-East',
      'north_west': 'North-West',
      'south_east': 'South-East',
      'south_west': 'South-West'
    };
    return directions[direction] || direction;
  };

  const getOrdinalSuffix = (num) => {
    if (!num) return "";
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return num + "st";
    if (j === 2 && k !== 12) return num + "nd";
    if (j === 3 && k !== 13) return num + "rd";
    return num + "th";
  };

  const getContactInfo = () => {
    if (!property) return {};
    let contactName, contactMobile, contactEmail, contactWhatsapp;
    if (property.use_vendor_info || !property.contact_name) {
      contactName = property.vendor_name || property.vendor?.business_name || 'Seller';
      contactMobile = property.vendor_phone || property.vendor?.phone || '';
      contactEmail = property.vendor_email || property.vendor?.email || '';
      contactWhatsapp = property.contact_whatsapp || contactMobile;
    } else {
      contactName = property.contact_name || 'Seller';
      contactMobile = property.contact_mobile || '';
      contactEmail = property.contact_email || '';
      contactWhatsapp = property.contact_whatsapp || contactMobile;
    }
    return { name: contactName, mobile: contactMobile, email: contactEmail, whatsapp: contactWhatsapp };
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!property) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const vendorId = property.vendor_id || property.vendor?.id || (property.vendor ? property.vendor : null);
      if (!vendorId) throw new Error("Vendor information not found in property data");
      const propertyType = getPropertyTypeDisplay(property.property_type);
      const inquiryPayload = {
        service_category: 'real_estate',
        vendor: vendorId,
        service_id: property.id,
        service_name: property.title,
        service_url: window.location.href,
        customer_name: inquiryData.name,
        customer_email: inquiryData.email || '',
        customer_phone: inquiryData.phone,
        customer_city: inquiryData.city,
        inquiry_type: 'general',
        subject: `Inquiry about ${property.title} (${propertyType})`,
        message: inquiryData.message
      };
      const response = await publicAxios.post('/api/services/public/inquiries/', inquiryPayload);
      if (response.status === 201) {
        setSubmitSuccess(true);
        setInquiryData({ name: '', phone: '', email: '', city: '', message: '' });
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      if (err.response?.data?.vendor) {
        setSubmitError(`Vendor error: ${err.response.data.vendor.join(' ')}`);
      } else if (err.response?.data?.detail) {
        setSubmitError(err.response.data.detail);
      } else if (err.response?.data) {
        const errors = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join(' | ');
        setSubmitError(`Validation errors: ${errors}`);
      } else {
        setSubmitError('Failed to submit inquiry. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInquiryData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <FiLoader className="animate-spin text-4xl text-blue-600" />
        <span className="mt-3 text-detail-body text-gray-600">Loading property details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 px-4">
        <div className="text-red-500 text-detail-body mb-4 text-center">{error}</div>
        <button onClick={() => navigate('/realestatehome')} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-detail-btn-sm hover:bg-blue-700">
          Back to Properties
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-detail-body text-gray-600">Property not found</div>
      </div>
    );
  }

  const propertyImages = property.images || [];
  const mainImage = propertyImages.find(img => img.image_type === 'main')?.image_url ||
    propertyImages[0]?.image_url ||
    "https://placehold.co/600x400/87CEEB/white?text=Property+Image";

  const additionalImages = propertyImages.filter(img => img.image_type !== 'main').map(img => img.image_url) || [];
  const allImages = [mainImage, ...additionalImages].filter(Boolean);
  const slides = allImages.map(src => ({ src }));

  const contactInfo = getContactInfo();
  const getInitials = (name) => {
    if (!name) return 'S';
    return name.charAt(0).toUpperCase();
  };

  const displayAmenities = property.amenities?.slice(0, 6) || [];

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
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-full transition flex-shrink-0">
            <FiArrowLeft className="text-gray-700 text-detail-icon" />
          </button>
          <h1 className="text-detail-title font-bold text-gray-900 truncate max-w-[180px]">
            {property.title}
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
          alt={property.title}
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
        {property.transaction_type && (
          <span className={`absolute top-3 left-3 text-detail-xs font-medium px-2.5 py-1 rounded-full ${
            property.transaction_type === "rent" ? "bg-green-500 text-white" :
            property.transaction_type === "sale" ? "bg-blue-600 text-white" :
            "bg-purple-500 text-white"
          }`}>
            {getTransactionDisplay(property.transaction_type)}
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
              alt={`${property.title} - ${idx + 2}`}
              onClick={() => { setPhotoIndex(idx + 1); setIsOpen(true); }}
            />
          ))}
          {additionalImages.length > 6 && (
            <div className="rounded-lg w-16 h-16 bg-gray-200 flex items-center justify-center flex-shrink-0 cursor-pointer" onClick={() => setIsOpen(true)}>
              <span className="text-detail-xs font-medium text-blue-600">+{additionalImages.length - 6}</span>
            </div>
          )}
        </div>
      )}

      <Lightbox open={isOpen} close={() => setIsOpen(false)} slides={slides} index={photoIndex} on={{ view: ({ index }) => setPhotoIndex(index) }} />

      {/* Title & Price */}
      <div className="px-4 mt-3 overflow-x-hidden">
        <h1 className="text-detail-title font-bold text-gray-900">
          {property.title}
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-detail-price-lg font-extrabold text-blue-600">{formatCurrency(property.price)}</p>
          <div className="flex items-center gap-1 text-detail-xs text-gray-500">
            <FiMapPin className="w-3 h-3 text-blue-500" />
            <span className="truncate max-w-[150px]">{property.city || "Location"}</span>
          </div>
        </div>
        <div className="mt-1">
          <span className="bg-blue-100 text-blue-800 text-detail-xs px-2.5 py-0.5 rounded-full font-medium">
            {getPropertyTypeDisplay(property.property_type)}
          </span>
        </div>
      </div>

      {/* Quick Contact Buttons */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-hidden">
        {contactInfo.mobile && (
          <a href={`tel:${contactInfo.mobile}`} className="flex-1 bg-blue-600 text-white text-detail-btn-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-blue-700 transition">
            <FiPhone className="w-3.5 h-3.5" /> Call Now
          </a>
        )}
        {contactInfo.whatsapp && (
          <a href={`https://wa.me/${contactInfo.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 border border-green-500 text-green-600 text-detail-btn-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-green-50 transition">
            <FaWhatsapp className="w-3.5 h-3.5" /> WhatsApp
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4 border-b border-gray-200 overflow-x-hidden">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {["details", "location", "amenities", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-detail-btn-sm font-medium whitespace-nowrap transition ${
                activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
              }`}
            >
              {tab === "details" ? "Details" : tab === "location" ? "Location" : tab === "amenities"?  "Amenities" : "Reviews" }
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
                <FiHome className="text-blue-600 text-detail-icon-sm" /> About
              </h2>
              <p className="text-detail-text text-gray-700 leading-relaxed">
                {property.description || "No description available."}
              </p>
            </div>

            {/* Property Details - Grid */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-detail-subtitle font-bold text-gray-900 mb-3">Property Details</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: FiTrello, label: "Type", value: getPropertyTypeDisplay(property.property_type) },
                  { icon: FiClipboard, label: "Sub Type", value: getPropertySubTypeDisplay(property.property_type) },
                  { icon: FiDollarSign, label: "Transaction", value: getTransactionDisplay(property.transaction_type) },
                  { icon: FiMaximize, label: "Balconies", value: property.balconies || "—" },
                  { icon: FiDroplet, label: "Bathrooms", value: property.bathrooms || "—" },
                  { icon: FiCrop, label: "Carpet Area", value: formatArea(property.carpet_area) },
                  { icon: FiSquare, label: "Total Area", value: formatArea(property.total_area_size) },
                  { icon: FiLayers, label: "Floor", value: getOrdinalSuffix(property.floor_number) || "—" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <item.icon className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-detail-label text-gray-500 uppercase">{item.label}</span>
                    </div>
                    <span className="text-detail-value text-gray-800 truncate block">{item.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* More Details */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-detail-subtitle font-bold text-gray-900 mb-3">More Details</h2>
              <div className="space-y-2">
                {[
                  { label: "Furnishing", value: getFurnishingDisplay(property.furnishing_status) },
                  { label: "Total Floors", value: property.total_floors || "—" },
                  { label: "Facing", value: getFacingDisplay(property.facing_direction) },
                  { label: "Negotiable", value: property.negotiable !== undefined ? (property.negotiable ? 'Yes' : 'No') : '—' },
                  { label: "Maintenance", value: formatCurrency(property.maintenance_charges) },
                  { label: "Property Age", value: property.property_age || "—" },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-detail-label text-gray-500">{item.label}</span>
                    <span className="text-detail-value text-gray-800">{item.value}</span>
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
                  { label: "City", value: property.city || "—" },
                  { label: "State", value: property.state || "—" },
                  { label: "Pin Code", value: property.pincode || "—" },
                  { label: "Complete Address", value: property.address || "—", full: true },
                ].map((item, idx) => (
                  <div key={idx} className={`flex ${item.full ? 'flex-col' : 'justify-between'} py-1.5 border-b border-gray-50 last:border-0`}>
                    <span className="text-detail-label text-gray-500">{item.label}</span>
                    <span className={`text-detail-value text-gray-800 ${item.full ? 'mt-0.5' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Facilities */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-detail-subtitle font-bold text-gray-900 mb-3">What's Nearby?</h2>
              <div className="grid grid-cols-2 gap-3">
                {(() => {
                  const facilities = property.normalized_nearby_facilities || property.nearby_facilities || {};
                  const items = [
                    { key: 'hospitals', icon: FaHospital, label: 'Hospitals' },
                    { key: 'colleges', icon: FaUniversity, label: 'Colleges' },
                    { key: 'shopping', icon: FaShoppingBag, label: 'Shopping' },
                    { key: 'transport', icon: FaBus, label: 'Transport' },
                  ];
                  const hasFacilities = items.some(item => facilities[item.key]);
                  return hasFacilities ? (
                    items.filter(item => facilities[item.key]).map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-2.5 rounded-lg text-center">
                        <item.icon className="text-blue-500 w-5 h-5 mx-auto mb-1" />
                        <p className="text-detail-xs font-semibold text-gray-700">{item.label}</p>
                        <p className="text-detail-xs text-gray-500">{facilities[item.key]} km</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-detail-text text-gray-500 col-span-2 text-center">No nearby facilities listed</p>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === "amenities" && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-detail-subtitle font-bold text-gray-900 mb-3">Amenities & Features</h2>
            {displayAmenities.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {displayAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 py-1.5">
                    <FiCheckCircle className="text-green-500 w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-detail-small text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-detail-text text-gray-500 text-center">No amenities listed</p>
            )}
          </div>
        )}

        {/* ✅ REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="pb-6">
            <MobileServiceReviewSection
              modelName="property"
              objectId={property.id}
              serviceName={property.title}
              accentColor="blue"
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
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-detail-btn font-semibold py-3 rounded-xl hover:shadow-lg transition"
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
                {property.title}
              </p>
            </div>
            <button 
              onClick={() => {
                const modal = document.getElementById('inquiryModal');
                if (modal) modal.classList.add('hidden');
              }}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition flex-shrink-0"
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
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-3 text-detail-input border-2 border-blue-500 rounded-xl outline-none resize-none focus:ring-2 focus:ring-blue-300 transition"
                            autoFocus
                          />
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            placeholder={field.placeholder}
                            required={field.required}
                            value={value}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 text-detail-input border-2 border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 transition"
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
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-detail-btn disabled:opacity-50 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiHome className="text-detail-icon-sm" /> Send Inquiry
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