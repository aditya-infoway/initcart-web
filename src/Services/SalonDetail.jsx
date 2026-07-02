// src/pages/public/SalonDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import {
  FiHeart,
  FiShare2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiLoader,
  FiTag,
  FiPackage,
  FiGlobe,
  FiMap,
  FiScissors
} from "react-icons/fi";
import { FaWhatsapp, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { publicAxios } from "../api/axios";
import MobileSalonDetail from "./mobile/MobileSaloonDetail";
import ServiceReviewSection from "./ServiceReviewSection";


export default function SalonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [subcategories, setSubcategories] = useState([]);

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


    useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
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
      // Use the PUBLIC endpoint
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

  const OverviewItem = ({ icon: Icon, title, value }) => (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 flex items-center space-x-3">
      <div className="pr-3 border-r border-pink-200">
        <Icon className="w-6 h-6 text-pink-600 flex-shrink-0" />
      </div>
      <div>
        <strong className="block text-xs text-gray-500 uppercase leading-none">{title}</strong>
        <span className="text-sm font-semibold text-gray-800">{value || "—"}</span>
      </div>
    </div>
  );

    if (isMobile) {
    return <MobileSalonDetail />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-4xl text-pink-600" />
        <span className="ml-3 text-lg">Loading service details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button onClick={() => navigate("/saloonhome")} className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700">
          Back to Salons
        </button>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Service not found</div>
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title + Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{service.business_name || "Salon Service"}</h1>
          {service.subcategory_name && (
            <span className="inline-block mt-1 bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full font-medium">
              {service.subcategory_name}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <FiHeart onClick={handleFavorite} className="text-gray-400 hover:text-red-500 cursor-pointer w-6 h-6 transition" />
          <FiShare2 onClick={handleShare} className="text-gray-400 hover:text-blue-500 cursor-pointer w-6 h-6 transition" />
        </div>
      </div>

      {/* Location & Meta */}
      <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 border-b pb-4 gap-4">
        <div className="flex items-center">
          <FiMapPin className="w-4 h-4 mr-1 text-pink-500" />
          <p>{service.address || "Address not available"}</p>
        </div>
        {service.city && (
          <div className="flex items-center">
            <FaMapMarkerAlt className="w-4 h-4 mr-1 text-red-500" />
            <p>{[service.city, service.state, service.country].filter(Boolean).join(", ")}</p>
          </div>
        )}
        <div className="flex items-center gap-1">
          {Array(5).fill(0).map((_, i) => (<FaStar key={i} className="text-yellow-400 w-4 h-4" />))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Images + Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <div className="relative col-span-2 row-span-2">
              <img className="rounded-lg shadow-md cursor-pointer hover:opacity-90 w-full h-96 object-cover transition duration-300"
                src={mainImage} alt={service.business_name || "Salon Service"}
                onClick={() => { setPhotoIndex(0); setIsOpen(true); }} />
              {slides.length > 0 && (
                <button onClick={() => setIsOpen(true)}
                  className="absolute bottom-4 right-4 bg-pink-600 text-white font-medium py-2 px-4 rounded-full hover:bg-pink-700 transition duration-300 flex items-center justify-center text-sm shadow-lg">
                  <FiGrid className="w-4 h-4 mr-2" /> View All Photos ({slides.length})
                </button>
              )}
            </div>
            {additionalImages.slice(0, 5).map((src, idx) => (
              <div key={idx} className="relative">
                <img className="rounded-lg shadow-md cursor-pointer hover:opacity-90 w-full h-40 object-cover transition duration-300"
                  src={src} alt={`${service.business_name} - ${idx + 1}`}
                  onClick={() => { setPhotoIndex(idx + 1); setIsOpen(true); }} />
              </div>
            ))}
          </div>

          <Lightbox open={isOpen} close={() => setIsOpen(false)} slides={slides} index={photoIndex}
            on={{ view: ({ index }) => setPhotoIndex(index) }} />

          {/* Description */}
          <section className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">About Us</h2>
            <div className="text-gray-700 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: service.description || "No description available." }} />
          </section>

          {/* Overview */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <OverviewItem icon={FiTag} title="Category" value={service.subcategory_name || "Salon"} />
              <OverviewItem icon={FiClock} title="Opens At" value={formatTime(service.open_time)} />
              <OverviewItem icon={FiClock} title="Closes At" value={formatTime(service.close_time)} />
              <OverviewItem icon={FiGlobe} title="Country" value={service.country || "—"} />
              <OverviewItem icon={FiMap} title="State" value={service.state || "—"} />
              <OverviewItem icon={FaMapMarkerAlt} title="City" value={service.city || "—"} />
              <OverviewItem icon={FiPhone} title="Contact" value={service.contact_no || "—"} />
              <OverviewItem icon={FaWhatsapp} title="WhatsApp" value={service.whatsapp_no || "—"} />
            </div>
          </section>

          {/* Services / Packages */}
          {items.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Services &amp; Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FiScissors className="text-pink-500 w-4 h-4 flex-shrink-0" />
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                      {formatCurrency(item.price) && (
                        <div className="ml-4 flex-shrink-0">
                          <span className="text-pink-600 font-bold text-lg">{formatCurrency(item.price)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Business Details */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Business Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Business Name</strong>
                {service.business_name || "—"}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Category</strong>
                {service.subcategory_name || "—"}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Opening Hours</strong>
                {formatTime(service.open_time)} – {formatTime(service.close_time)}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Contact No.</strong>
                {service.contact_no || "—"}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">WhatsApp</strong>
                {service.whatsapp_no || "—"}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Status</strong>
                <span className={`capitalize font-semibold ${service.status === "approved" ? "text-green-600" : service.status === "pending" ? "text-yellow-600" : "text-red-600"}`}>
                  {service.status || "—"}
                </span>
              </div>
            </div>
          </section>

          {/* Location Details */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Location Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">City</strong>
                {service.city || "—"}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">State</strong>
                {service.state || "—"}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Country</strong>
                {service.country || "—"}
              </div>
              <div className="bg-white p-3 rounded shadow-sm col-span-2">
                <strong className="block text-xs text-gray-500 uppercase">Full Address</strong>
                {service.address || "—"}
              </div>
              {service.location && (
                <div className="bg-white p-3 rounded shadow-sm col-span-2">
                  <strong className="block text-xs text-gray-500 uppercase mb-1">Map / Location Link</strong>
                  <a href={service.location} target="_blank" rel="noopener noreferrer"
                    className="text-pink-600 underline text-sm break-all">{service.location}</a>
                </div>
              )}
            </div>
          </section>

          {/* Full Gallery */}
          {allImages.length > 1 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allImages.map((src, idx) => (
                  <img key={idx} className="rounded-lg shadow-md cursor-pointer hover:opacity-90 w-full h-32 object-cover"
                    src={src} alt={`Gallery ${idx + 1}`}
                    onClick={() => { setPhotoIndex(idx); setIsOpen(true); }} />
                ))}
              </div>
            </section>
          )}

          {/* ✅ REVIEWS SECTION - Gallery KE BAAD ADD KARO */}
<section className="mb-8">
  <ServiceReviewSection
    modelName="saloonservice"
    objectId={service.id}
    serviceName={service.business_name}
    accentColor="pink"
  />
</section>
        </div>

        {/* Right Column: Sticky */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 space-y-8">
            {/* Contact Card */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Contact Salon</h2>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-pink-500">
                  <span className="text-pink-700 font-bold text-xl">{getInitials(service.business_name)}</span>
                </div>
                <div className="ml-4">
                  <p className="font-bold text-lg text-gray-900">{service.business_name}</p>
                  {service.contact_no && (
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <FiPhone className="w-4 h-4 text-pink-500" /> {service.contact_no}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3 mt-4">
                {service.contact_no && (
                  <a href={`tel:${service.contact_no}`}
                    className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition flex items-center justify-center gap-2 font-medium">
                    <FiPhone /> Call Now
                  </a>
                )}
                {(service.whatsapp_no || service.contact_no) && (
                  <a href={`https://wa.me/${(service.whatsapp_no || service.contact_no).replace(/[^0-9]/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full border border-green-500 text-green-600 py-2 rounded-md hover:bg-green-50 flex items-center justify-center gap-2 transition font-medium">
                    <FaWhatsapp className="w-5 h-5" /> WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Inquire Now</h2>
              {submitSuccess && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">✅ Inquiry submitted successfully!</div>}
              {submitError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">❌ {submitError}</div>}
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <input type="text" name="name" placeholder="Your Name*" required value={inquiryData.name}
                  onChange={e => setInquiryData(p => ({...p, name: e.target.value}))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-pink-500 focus:border-pink-500" disabled={submitting} />
                <input type="text" name="phone" placeholder="Phone Number*" required value={inquiryData.phone}
                  onChange={e => setInquiryData(p => ({...p, phone: e.target.value}))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-pink-500 focus:border-pink-500" disabled={submitting} />
                <input type="email" name="email" placeholder="Email (Optional)" value={inquiryData.email}
                  onChange={e => setInquiryData(p => ({...p, email: e.target.value}))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-pink-500 focus:border-pink-500" disabled={submitting} />
                <input type="text" name="city" placeholder="City*" required value={inquiryData.city}
                  onChange={e => setInquiryData(p => ({...p, city: e.target.value}))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-pink-500 focus:border-pink-500" disabled={submitting} />
                <textarea name="message" placeholder="I am interested in your salon services." rows="3" value={inquiryData.message}
                  onChange={e => setInquiryData(p => ({...p, message: e.target.value}))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-pink-500 focus:border-pink-500" disabled={submitting}></textarea>
                <button type="submit" disabled={submitting}
                  className={`w-full ${submitting ? 'bg-pink-400' : 'bg-pink-600 hover:bg-pink-700'} text-white py-3 rounded-md transition font-bold tracking-wide flex items-center justify-center`}>
                  {submitting ? 'Submitting...' : 'Send Inquiry'}
                </button>
              </form>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">Why Choose Us?</h3>
              <ul className="text-sm text-gray-700 space-y-3">
                <li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" /> Certified Stylists</li>
                <li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" /> Premium Products</li>
                <li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" /> Hygienic Environment</li>
                <li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" /> Satisfied Customers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}