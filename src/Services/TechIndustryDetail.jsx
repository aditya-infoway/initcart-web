// src/Services/TechIndustryDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import {
  FiHeart, FiShare2, FiPhone, FiMail, FiMapPin, FiCheckCircle,
  FiClock, FiGrid, FiLoader, FiTag, FiPackage, FiGlobe, FiMap,
} from "react-icons/fi";
import { FaWhatsapp, FaStar, FaMapMarkerAlt, FaLaptopCode } from "react-icons/fa";
import { publicAxios } from "../api/axios";
import MobileTechIndustryDetail from "./mobile/MobileTechIndustryDetail";
import ServiceReviewSection from "./ServiceReviewSection";

export default function TechIndustryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const [inquiryData, setInquiryData] = useState({ name: "", phone: "", email: "", city: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get(`/api/public/tech-service/${id}/`);
        if (response.data) { setService(response.data); setError(null); }
        else { setError("Service not found."); }
      } catch (err) { console.error("Error:", err); setError("Failed to load service details."); }
      finally { setLoading(false); }
    };
    if (id) fetchServiceDetail();
  }, [id]);

  const formatCurrency = (amount) => {
    if (!amount || amount == 0) return null;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };
  const formatTime = (time) => {
    if (!time) return "—";
    try { const [h, m] = time.split(":"); const date = new Date(); date.setHours(parseInt(h), parseInt(m)); return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }); }
    catch { return time; }
  };
  const handleShare = () => { if (navigator.share && service) { navigator.share({ title: service.business_name, url: window.location.href }).catch(() => {}); } else { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); } };
  const handleFavorite = () => { const favs = JSON.parse(localStorage.getItem("tech_favorites") || "[]"); if (service && !favs.includes(service.id)) { favs.push(service.id); localStorage.setItem("tech_favorites", JSON.stringify(favs)); alert("Added to favorites!"); } };
  const getInitials = (name) => { if (!name) return "T"; return name.charAt(0).toUpperCase(); };

  const handleInquirySubmit = async (e) => {
    e.preventDefault(); if (!service) return;
    setSubmitting(true); setSubmitError(null);
    try {
      const vendorId = service.vendor; if (!vendorId) throw new Error("Vendor not found");
      const payload = { service_category: "tech", vendor: vendorId, service_id: service.id, service_name: service.business_name, service_url: window.location.href, customer_name: inquiryData.name, customer_email: inquiryData.email || "", customer_phone: inquiryData.phone, customer_city: inquiryData.city, inquiry_type: "general", subject: `Inquiry about ${service.business_name}`, message: inquiryData.message };
      const response = await publicAxios.post("/api/public/inquiries/", payload);
      if (response.status === 201) { setSubmitSuccess(true); setInquiryData({ name: "", phone: "", email: "", city: "", message: "" }); setTimeout(() => setSubmitSuccess(false), 5000); }
    } catch (err) { setSubmitError("Failed to submit."); } finally { setSubmitting(false); }
  };

  const OverviewItem = ({ icon: Icon, title, value }) => (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 flex items-center space-x-3">
      <div className="pr-3 border-r border-cyan-200"><Icon className="w-6 h-6 text-cyan-600 flex-shrink-0" /></div>
      <div><strong className="block text-xs text-gray-500 uppercase leading-none">{title}</strong><span className="text-sm font-semibold text-gray-800">{value || "—"}</span></div>
    </div>
  );

    if (isMobile) {
    return <MobileTechIndustryDetail />;
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><FiLoader className="animate-spin text-4xl text-cyan-600" /><span className="ml-3 text-lg">Loading...</span></div>;
  if (error) return <div className="flex flex-col justify-center items-center h-screen"><div className="text-red-500 text-xl mb-4">{error}</div><button onClick={() => navigate("/techindustryhome")} className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700">Back to Tech Services</button></div>;
  if (!service) return <div className="flex justify-center items-center h-screen"><div className="text-xl">Service not found</div></div>;

  const mainImage = service.main_image || "https://placehold.co/600x400/06B6D4/white?text=Tech+Service";
  const secondImage = service.second_image || null;
  const multiImages = (service.multi_images || []).map(img => typeof img === "string" ? img : img.image);
  const allImages = [mainImage, ...(secondImage ? [secondImage] : []), ...multiImages].filter(Boolean);
  const slides = allImages.map(src => ({ src }));
  const additionalImages = allImages.slice(1);
  const items = service.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <div><h1 className="text-2xl font-bold text-gray-800">{service.business_name || "Tech Service"}</h1>{service.subcategory_name && <span className="inline-block mt-1 bg-cyan-100 text-cyan-800 text-xs px-3 py-1 rounded-full font-medium">{service.subcategory_name}</span>}</div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0"><FiHeart onClick={handleFavorite} className="text-gray-400 hover:text-red-500 cursor-pointer w-6 h-6 transition" /><FiShare2 onClick={handleShare} className="text-gray-400 hover:text-blue-500 cursor-pointer w-6 h-6 transition" /></div>
      </div>
      <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 border-b pb-4 gap-4">
        <div className="flex items-center"><FiMapPin className="w-4 h-4 mr-1 text-cyan-500" /><p>{service.address || "N/A"}</p></div>
        {service.city && <div className="flex items-center"><FaMapMarkerAlt className="w-4 h-4 mr-1 text-red-500" /><p>{[service.city, service.state, service.country].filter(Boolean).join(", ")}</p></div>}
        <div className="flex items-center gap-1">{Array(5).fill(0).map((_, i) => (<FaStar key={i} className="text-yellow-400 w-4 h-4" />))}</div>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <div className="relative col-span-2 row-span-2"><img className="rounded-lg shadow-md cursor-pointer hover:opacity-90 w-full h-96 object-cover transition" src={mainImage} alt={service.business_name} onClick={() => { setPhotoIndex(0); setIsOpen(true); }} />{slides.length > 0 && <button onClick={() => setIsOpen(true)} className="absolute bottom-4 right-4 bg-cyan-600 text-white font-medium py-2 px-4 rounded-full hover:bg-cyan-700 flex items-center text-sm"><FiGrid className="w-4 h-4 mr-2" /> View All ({slides.length})</button>}</div>
            {additionalImages.slice(0, 5).map((src, idx) => (<div key={idx}><img className="rounded-lg shadow-md cursor-pointer hover:opacity-90 w-full h-40 object-cover transition" src={src} alt={`${service.business_name} - ${idx + 1}`} onClick={() => { setPhotoIndex(idx + 1); setIsOpen(true); }} /></div>))}
          </div>
          <Lightbox open={isOpen} close={() => setIsOpen(false)} slides={slides} index={photoIndex} on={{ view: ({ index }) => setPhotoIndex(index) }} />
          <section className="mb-8 p-6 bg-gray-50 rounded-lg"><h2 className="text-xl font-bold mb-4 border-b pb-2">About Us</h2><div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: service.description || "No description." }} /></section>
          <section className="mb-8"><h2 className="text-xl font-bold mb-4 border-b pb-2">Overview</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><OverviewItem icon={FiTag} title="Category" value={service.subcategory_name || "Tech"} /><OverviewItem icon={FiClock} title="Opens At" value={formatTime(service.open_time)} /><OverviewItem icon={FiClock} title="Closes At" value={formatTime(service.close_time)} /><OverviewItem icon={FiGlobe} title="Country" value={service.country || "—"} /><OverviewItem icon={FiMap} title="State" value={service.state || "—"} /><OverviewItem icon={FaMapMarkerAlt} title="City" value={service.city || "—"} /><OverviewItem icon={FiPhone} title="Contact" value={service.contact_no || "—"} /><OverviewItem icon={FaWhatsapp} title="WhatsApp" value={service.whatsapp_no || "—"} /></div></section>
          {items.length > 0 && (<section className="mb-8"><h2 className="text-xl font-bold mb-4 border-b pb-2">Services & Packages</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{items.map((item, idx) => (<div key={idx} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"><div className="flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><FaLaptopCode className="text-cyan-500 w-4 h-4" /><h3 className="font-semibold">{item.name}</h3></div>{item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}</div>{formatCurrency(item.price) && <div className="ml-4"><span className="text-cyan-600 font-bold text-lg">{formatCurrency(item.price)}</span></div>}</div></div>))}</div></section>)}
          <section className="mb-8"><h2 className="text-xl font-bold mb-4 border-b pb-2">Business Details</h2><div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm"><div className="bg-white p-3 rounded shadow-sm"><strong className="block text-xs text-gray-500 uppercase">Business Name</strong>{service.business_name || "—"}</div><div className="bg-white p-3 rounded shadow-sm"><strong className="block text-xs text-gray-500 uppercase">Category</strong>{service.subcategory_name || "—"}</div><div className="bg-white p-3 rounded shadow-sm"><strong className="block text-xs text-gray-500 uppercase">Hours</strong>{formatTime(service.open_time)} – {formatTime(service.close_time)}</div><div className="bg-white p-3 rounded shadow-sm"><strong className="block text-xs text-gray-500 uppercase">Contact</strong>{service.contact_no || "—"}</div><div className="bg-white p-3 rounded shadow-sm"><strong className="block text-xs text-gray-500 uppercase">WhatsApp</strong>{service.whatsapp_no || "—"}</div><div className="bg-white p-3 rounded shadow-sm"><strong className="block text-xs text-gray-500 uppercase">Status</strong><span className={`capitalize font-semibold ${service.status === "approved" ? "text-green-600" : "text-yellow-600"}`}>{service.status || "—"}</span></div></div></section>
          <section className="mb-8"><h2 className="text-xl font-bold mb-4 border-b pb-2">Location</h2><div className="grid grid-cols-2 gap-4 text-sm"><div className="bg-white p-3 rounded shadow-sm"><strong className="block text-xs text-gray-500 uppercase">City</strong>{service.city || "—"}</div><div className="bg-white p-3 rounded shadow-sm"><strong className="block text-xs text-gray-500 uppercase">State</strong>{service.state || "—"}</div><div className="bg-white p-3 rounded shadow-sm"><strong className="block text-xs text-gray-500 uppercase">Country</strong>{service.country || "—"}</div><div className="bg-white p-3 rounded shadow-sm col-span-2"><strong className="block text-xs text-gray-500 uppercase">Address</strong>{service.address || "—"}</div>{service.location && <div className="bg-white p-3 rounded shadow-sm col-span-2"><strong className="block text-xs text-gray-500 uppercase mb-1">Map Link</strong><a href={service.location} target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline text-sm break-all">{service.location}</a></div>}</div></section>
          <section className="mb-8"><ServiceReviewSection modelName="techindustryservice" objectId={service.id} serviceName={service.business_name} accentColor="cyan"/></section>
        </div>
        <div className="lg:col-span-1"><div className="lg:sticky lg:top-20 space-y-8">
          <div className="bg-white shadow-lg rounded-lg p-6 border"><h2 className="text-xl font-bold mb-4">Contact Tech</h2><div className="flex items-center mb-4"><div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center border-2 border-cyan-500"><span className="text-cyan-700 font-bold text-xl">{getInitials(service.business_name)}</span></div><div className="ml-4"><p className="font-bold text-lg">{service.business_name}</p>{service.contact_no && <p className="text-sm text-gray-600 flex items-center gap-2 mt-1"><FiPhone className="w-4 h-4 text-cyan-500" /> {service.contact_no}</p>}</div></div><div className="space-y-3">{service.contact_no && <a href={`tel:${service.contact_no}`} className="w-full bg-cyan-600 text-white py-2 rounded-md hover:bg-cyan-700 flex items-center justify-center gap-2 font-medium"><FiPhone /> Call Now</a>}{(service.whatsapp_no || service.contact_no) && <a href={`https://wa.me/${(service.whatsapp_no || service.contact_no).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full border border-green-500 text-green-600 py-2 rounded-md hover:bg-green-50 flex items-center justify-center gap-2 font-medium"><FaWhatsapp className="w-5 h-5" /> WhatsApp</a>}</div></div>
          <div className="bg-white shadow-lg rounded-lg p-6 border"><h2 className="text-xl font-bold mb-4">Inquire Now</h2>{submitSuccess && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">✅ Submitted!</div>}{submitError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">❌ {submitError}</div>}<form onSubmit={handleInquirySubmit} className="space-y-4"><input type="text" name="name" placeholder="Your Name*" required value={inquiryData.name} onChange={e => setInquiryData(p => ({...p, name: e.target.value}))} className="w-full border rounded-md px-4 py-2 text-sm" disabled={submitting} /><input type="text" name="phone" placeholder="Phone*" required value={inquiryData.phone} onChange={e => setInquiryData(p => ({...p, phone: e.target.value}))} className="w-full border rounded-md px-4 py-2 text-sm" disabled={submitting} /><input type="email" name="email" placeholder="Email (Optional)" value={inquiryData.email} onChange={e => setInquiryData(p => ({...p, email: e.target.value}))} className="w-full border rounded-md px-4 py-2 text-sm" disabled={submitting} /><input type="text" name="city" placeholder="City*" required value={inquiryData.city} onChange={e => setInquiryData(p => ({...p, city: e.target.value}))} className="w-full border rounded-md px-4 py-2 text-sm" disabled={submitting} /><textarea name="message" placeholder="I am interested in your tech services." rows="3" value={inquiryData.message} onChange={e => setInquiryData(p => ({...p, message: e.target.value}))} className="w-full border rounded-md px-4 py-2 text-sm" disabled={submitting}></textarea><button type="submit" disabled={submitting} className={`w-full ${submitting ? 'bg-cyan-400' : 'bg-cyan-600 hover:bg-cyan-700'} text-white py-3 rounded-md font-bold`}>{submitting ? 'Submitting...' : 'Send Inquiry'}</button></form></div>
          <div className="bg-white shadow-lg rounded-lg p-6 border"><h3 className="text-xl font-bold mb-4 border-b pb-2">Why Choose Us?</h3><ul className="text-sm space-y-3"><li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5" /> Certified Tech Experts</li><li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5" /> Agile Development</li><li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5" /> 24/7 Support</li><li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5" /> On-Time Delivery</li></ul></div>
        </div></div>
      </div>
    </div>
  );
}