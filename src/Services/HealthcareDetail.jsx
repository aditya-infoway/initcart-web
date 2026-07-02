// src/Services/HealthcareDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import {
  FiHeart, FiShare2, FiPhone, FiMail, FiMapPin, FiCheckCircle,
  FiClock, FiGrid, FiLoader, FiTag, FiGlobe, FiMap, FiBriefcase, FiUser,
} from "react-icons/fi";
import { FaWhatsapp, FaStar, FaMapMarkerAlt, FaUserMd, FaHospitalUser } from "react-icons/fa";
import { publicAxios } from "../api/axios";
import MobileHealthcareDetail from "./mobile/MobileHealthcareDetail";
import ServiceReviewSection from "./ServiceReviewSection";

export default function HealthcareDetail() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");

  const [inquiryData, setInquiryData] = useState({ name: "", phone: "", email: "", city: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

    // ✅ Mobile detection useEffect
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get(`/api/public/healthcare-service/${id}/`);
        if (response.data) {
          setService(response.data);
          setError(null);
        } else {
          setError("Service not found.");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load service details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchServiceDetail();
  }, [id]);

  const handleShare = () => {
    if (navigator.share && service) {
      navigator.share({ title: service.business_name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  const handleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem("healthcare_favorites") || "[]");
    if (service && !favs.includes(service.id)) {
      favs.push(service.id);
      localStorage.setItem("healthcare_favorites", JSON.stringify(favs));
      alert("Added to favorites!");
    }
  };

  const getInitials = (name) => {
    if (!name) return "H";
    return name.charAt(0).toUpperCase();
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!service) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const vendorId = service.vendor;
      if (!vendorId) throw new Error("Vendor not found");
      const payload = {
        service_category: "healthcare",
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
      setSubmitError("Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const OverviewItem = ({ icon: Icon, title, value }) => (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100 flex items-center space-x-3">
      <div className="pr-3 border-r border-teal-200">
        <Icon className="w-5 h-5 text-teal-600 flex-shrink-0" />
      </div>
      <div>
        <strong className="block text-xs text-gray-500 uppercase">{title}</strong>
        <span className="text-sm font-semibold text-gray-800">{value || "—"}</span>
      </div>
    </div>
  );

    if (isMobile) {
    return <MobileHealthcareDetail />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-4xl text-teal-600" />
        <span className="ml-3 text-lg text-gray-600">Loading healthcare details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button onClick={() => navigate("/healthcarehome")} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
          Back to Healthcare Services
        </button>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Service not found</div>
      </div>
    );
  }

  // Prepare images
  const mainImage = service.main_image || "https://placehold.co/800x500/14b8a6/white?text=Healthcare+Service";
  const multiImages = (service.multi_images || []).map(img => typeof img === "string" ? img : img.image);
  const allImages = [mainImage, ...multiImages].filter(Boolean);
  const slides = allImages.map(src => ({ src }));
  const additionalImages = allImages.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{service.business_name || "Healthcare Service"}</h1>
          {service.subcategory_name && (
            <span className="inline-block mt-2 bg-teal-100 text-teal-800 text-xs px-3 py-1 rounded-full font-medium">
              {service.subcategory_name}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4 mt-3 md:mt-0">
          <button onClick={handleFavorite} className="text-gray-400 hover:text-red-500 transition">
            <FiHeart className="w-6 h-6" />
          </button>
          <button onClick={handleShare} className="text-gray-400 hover:text-teal-600 transition">
            <FiShare2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Location & Rating */}
      <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 border-b pb-4 gap-4">
        <div className="flex items-center">
          <FiMapPin className="w-4 h-4 mr-1 text-teal-500" />
          <span>{service.address || "Address not specified"}</span>
        </div>
        {service.city && (
          <div className="flex items-center">
            <FaMapMarkerAlt className="w-4 h-4 mr-1 text-red-500" />
            <span>{[service.city, service.state, service.country].filter(Boolean).join(", ")}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className="text-yellow-400 w-4 h-4" />
          ))}
          <span className="ml-1 text-gray-600">(5.0)</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-8">
            {/* Main Large Image */}
            <div className="relative mb-3">
              <img
                className="rounded-xl shadow-lg cursor-pointer hover:opacity-95 transition w-full h-96 object-cover"
                src={mainImage}
                alt={service.business_name}
                onClick={() => {
                  setPhotoIndex(0);
                  setIsOpen(true);
                }}
              />
              {allImages.length > 0 && (
                <button
                  onClick={() => setIsOpen(true)}
                  className="absolute bottom-4 right-4 bg-teal-600 text-white font-medium py-2 px-4 rounded-full hover:bg-teal-700 flex items-center text-sm shadow-lg"
                >
                  <FiGrid className="w-4 h-4 mr-2" /> View All ({allImages.length})
                </button>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {additionalImages.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                {additionalImages.slice(0, 5).map((src, idx) => (
                  <img
                    key={idx}
                    className="rounded-lg shadow cursor-pointer hover:opacity-90 transition w-full h-24 object-cover"
                    src={src}
                    alt={`${service.business_name} - ${idx + 2}`}
                    onClick={() => {
                      setPhotoIndex(idx + 1);
                      setIsOpen(true);
                    }}
                  />
                ))}
                {additionalImages.length > 5 && (
                  <div
                    className="rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition h-24"
                    onClick={() => setIsOpen(true)}
                  >
                    <span className="text-teal-600 font-medium">+{additionalImages.length - 5} more</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Lightbox 
            open={isOpen} 
            close={() => setIsOpen(false)} 
            slides={slides} 
            index={photoIndex} 
            on={{ view: ({ index }) => setPhotoIndex(index) }} 
          />

          {/* Tabs Navigation */}
          <div className="border-b mb-6">
            <div className="flex gap-6">
              {["details", "location"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 font-medium transition ${
                    activeTab === tab
                      ? "border-b-2 border-teal-600 text-teal-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "details" && "About & Details"}
                  {tab === "location" && "Location"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Description */}
              <section className="p-6 bg-gray-50 rounded-xl">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaUserMd className="text-teal-600" /> About {service.business_name}
                </h2>
                <div
                  className="text-gray-700 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: service.description || "No description available." }}
                />
              </section>

              {/* Overview Grid */}
              <section>
                <h2 className="text-xl font-bold mb-4">Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <OverviewItem icon={FiTag} title="Category" value={service.subcategory_name || "Healthcare"} />
                  <OverviewItem icon={FiBriefcase} title="Business" value={service.business_name} />
                  <OverviewItem icon={FiPhone} title="Contact" value={service.contact_no || "—"} />
                  <OverviewItem icon={FaWhatsapp} title="WhatsApp" value={service.whatsapp_no || "—"} />
                  <OverviewItem icon={FiMail} title="Email" value={service.gmail_id || "—"} />
                  <OverviewItem icon={FiGlobe} title="Country" value={service.country || "—"} />
                  <OverviewItem icon={FiMap} title="State" value={service.state || "—"} />
                  <OverviewItem icon={FaMapMarkerAlt} title="City" value={service.city || "—"} />
                </div>
              </section>

              {/* Business Details */}
              <section>
                <h2 className="text-xl font-bold mb-4">Business Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-xs text-gray-500 uppercase">Business Name</strong>
                    <span className="text-sm font-medium">{service.business_name || "—"}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-xs text-gray-500 uppercase">Category</strong>
                    <span className="text-sm font-medium">{service.subcategory_name || "—"}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-xs text-gray-500 uppercase">Email</strong>
                    <span className="text-sm font-medium">{service.gmail_id || "—"}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-xs text-gray-500 uppercase">Contact</strong>
                    <span className="text-sm font-medium">{service.contact_no || "—"}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-xs text-gray-500 uppercase">WhatsApp</strong>
                    <span className="text-sm font-medium">{service.whatsapp_no || "—"}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <strong className="block text-xs text-gray-500 uppercase">Status</strong>
                    <span className={`text-sm font-medium capitalize ${service.status === "approved" ? "text-green-600" : "text-yellow-600"}`}>
                      {service.status || "—"}
                    </span>
                  </div>
                </div>
              </section>
                  <ServiceReviewSection
      modelName="healthcareservice"
      objectId={id}
      serviceName={service?.business_name}
      accentColor="blue"
    />
            </div>
          )}
          {activeTab === "location" && (
            <section>
              <h2 className="text-xl font-bold mb-4">Location Information</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <strong className="block text-xs text-gray-500 uppercase">City</strong>
                  <span className="text-sm font-medium">{service.city || "—"}</span>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <strong className="block text-xs text-gray-500 uppercase">State</strong>
                  <span className="text-sm font-medium">{service.state || "—"}</span>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <strong className="block text-xs text-gray-500 uppercase">Country</strong>
                  <span className="text-sm font-medium">{service.country || "—"}</span>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 col-span-2">
                  <strong className="block text-xs text-gray-500 uppercase">Complete Address</strong>
                  <span className="text-sm font-medium">{service.address || "—"}</span>
                </div>
              </div>
              {service.location && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <strong className="block text-xs text-gray-500 uppercase mb-2">Google Maps Location</strong>
                  <a
                    href={service.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 underline text-sm break-all hover:text-teal-800"
                  >
                    {service.location}
                  </a>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column - Contact Card & Inquiry Form */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 space-y-6">
            {/* Contact Card */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center border-2 border-teal-500">
                  <span className="text-teal-700 font-bold text-xl">{getInitials(service.business_name)}</span>
                </div>
                <div className="ml-4">
                  <p className="font-bold text-lg text-gray-800">{service.business_name}</p>
                  {service.subcategory_name && (
                    <p className="text-xs text-teal-600">{service.subcategory_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <FiPhone className="w-4 h-4 text-teal-500" />
                  <span>{service.contact_no || "Contact number not available"}</span>
                </div>
                {service.whatsapp_no && (
                  <div className="flex items-center gap-2 text-sm">
                    <FaWhatsapp className="w-4 h-4 text-green-500" />
                    <span>{service.whatsapp_no}</span>
                  </div>
                )}
                {service.gmail_id && (
                  <div className="flex items-center gap-2 text-sm">
                    <FiMail className="w-4 h-4 text-red-500" />
                    <span className="truncate">{service.gmail_id}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {service.contact_no && (
                  <a
                    href={`tel:${service.contact_no}`}
                    className="w-full bg-teal-600 text-white py-2.5 rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2 font-medium transition"
                  >
                    <FiPhone /> Call Now
                  </a>
                )}
                {(service.whatsapp_no || service.contact_no) && (
                  <a
                    href={`https://wa.me/${(service.whatsapp_no || service.contact_no).replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-green-500 text-green-600 py-2.5 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2 font-medium transition"
                  >
                    <FaWhatsapp className="w-5 h-5" /> WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiUser className="text-teal-600" /> Inquire Now
              </h2>

              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                  ✅ Inquiry submitted successfully! We'll contact you soon.
                </div>
              )}
              {submitError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  ❌ {submitError}
                </div>
              )}

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  required
                  value={inquiryData.name}
                  onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  disabled={submitting}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  required
                  value={inquiryData.phone}
                  onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  disabled={submitting}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (Optional)"
                  value={inquiryData.email}
                  onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  disabled={submitting}
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  required
                  value={inquiryData.city}
                  onChange={(e) => setInquiryData({ ...inquiryData, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  disabled={submitting}
                />
                <textarea
                  name="message"
                  placeholder="I am interested in your healthcare services. Please contact me for more details."
                  rows="3"
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition resize-none"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full ${submitting ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'} text-white py-3 rounded-lg font-semibold transition`}
                >
                  {submitting ? 'Submitting...' : 'Send Inquiry'}
                </button>
              </form>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Why Choose Our Healthcare Services?</h3>
              <ul className="text-sm space-y-3">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 mt-0.5 w-4 h-4 flex-shrink-0" />
                  <span>NABH/NABL Accredited Facilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 mt-0.5 w-4 h-4 flex-shrink-0" />
                  <span>Experienced & Certified Medical Professionals</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 mt-0.5 w-4 h-4 flex-shrink-0" />
                  <span>24/7 Emergency & Ambulance Services</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 mt-0.5 w-4 h-4 flex-shrink-0" />
                  <span>Modern Equipment & Technology</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 mt-0.5 w-4 h-4 flex-shrink-0" />
                  <span>Affordable & Transparent Pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 mt-0.5 w-4 h-4 flex-shrink-0" />
                  <span>Safe & Hygienic Environment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}