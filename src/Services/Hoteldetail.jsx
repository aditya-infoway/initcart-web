// src/pages/public/HotelDetail.jsx
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
  FiGrid,
  FiLoader,
  FiTag,
  FiGlobe,
  FiMap,
  FiUsers,
} from "react-icons/fi";
import {
  FaWhatsapp,
  FaStar,
  FaMapMarkerAlt,
  FaHotel,
  FaBed,
} from "react-icons/fa";
import { publicAxios } from "../api/axios";
import MobileHotelDetail from "./mobile/MobileHotelDetail";
// ✅ IMPORT ADDED
import ServiceReviewSection from "./ServiceReviewSection";

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  // ✅ activeTab STATE ADDED
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

  // ─── Fetch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    publicAxios
      .get(`/api/public/hotel-service/${id}/`)
      .then((res) => {
        if (res.data) {
          setService(res.data);
          setError(null);
        } else {
          setError("Hotel not found.");
        }
      })
      .catch(() => setError("Failed to load hotel details."))
      .finally(() => setLoading(false));
  }, [id]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const handleShare = () => {
    if (navigator.share && service) {
      navigator
        .share({ title: service.hotel_name, url: window.location.href })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  const handleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem("hotel_favorites") || "[]");
    if (service && !favs.includes(service.id)) {
      favs.push(service.id);
      localStorage.setItem("hotel_favorites", JSON.stringify(favs));
      alert("Added to favorites!");
    }
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "H");

  const formatCurrency = (amount) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // ─── Inquiry ─────────────────────────────────────────────────────────────
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!service) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const vendorId = service.vendor;
      if (!vendorId) throw new Error("Vendor not found");
      const payload = {
        service_category: "hotel",
        vendor: vendorId,
        service_id: service.id,
        service_name: service.hotel_name,
        service_url: window.location.href,
        customer_name: inquiryData.name,
        customer_email: inquiryData.email || "",
        customer_phone: inquiryData.phone,
        customer_city: inquiryData.city,
        inquiry_type: "general",
        subject: `Inquiry about ${service.hotel_name}`,
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ─── Overview card ────────────────────────────────────────────────────────
  const OverviewItem = ({ icon: Icon, title, value }) => (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 flex items-center space-x-3">
      <div className="pr-3 border-r border-blue-200">
        <Icon className="w-6 h-6 text-blue-700 flex-shrink-0" />
      </div>
      <div>
        <strong className="block text-xs text-gray-500 uppercase leading-none">
          {title}
        </strong>
        <span className="text-sm font-semibold text-gray-800">
          {value || "—"}
        </span>
      </div>
    </div>
  );

  // ─── Star rating ──────────────────────────────────────────────────────────
  const RatingStars = ({ rating }) => {
    const filled = Math.round(parseFloat(rating) || 0);
    return (
      <div className="flex items-center gap-1">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <FaStar
              key={i}
              className={i < filled ? "text-yellow-400" : "text-gray-300"}
            />
          ))}
        {rating && (
          <span className="ml-1 text-sm font-semibold text-gray-700">
            {parseFloat(rating).toFixed(1)}
          </span>
        )}
      </div>
    );
  };

  if (isMobile) {
    return <MobileHotelDetail />;
  }

  // ─── Loading / Error ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-4xl text-blue-700" />
        <span className="ml-3 text-lg text-gray-600">
          Loading hotel details...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => navigate("/hotelhome")}
          className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
        >
          Back to Hotels
        </button>
      </div>
    );
  }

  if (!service) return null;

  // ─── Images ───────────────────────────────────────────────────────────────
  const mainImage =
    service.main_image ||
    "https://placehold.co/600x400/1e40af/white?text=Hotel";
  const multiImages = (service.multi_images || []).map((img) =>
    typeof img === "string" ? img : img.image
  );
  const allImages = [mainImage, ...multiImages].filter(Boolean);
  const slides = allImages.map((src) => ({ src }));
  const additionalImages = allImages.slice(1);
  const roomTypes = service.room_types || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {service.hotel_name || "Hotel"}
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {service.subcategory_name && (
              <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                {service.subcategory_name}
              </span>
            )}
            {service.room_category && (
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  service.room_category === "premium"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {service.room_category.charAt(0).toUpperCase() +
                  service.room_category.slice(1)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <FiHeart
            onClick={handleFavorite}
            className="text-gray-400 hover:text-red-500 cursor-pointer w-6 h-6 transition"
          />
          <FiShare2
            onClick={handleShare}
            className="text-gray-400 hover:text-blue-500 cursor-pointer w-6 h-6 transition"
          />
        </div>
      </div>

      {/* ── Meta row ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 border-b pb-4 gap-4">
        {service.address && (
          <div className="flex items-center">
            <FiMapPin className="w-4 h-4 mr-1 text-blue-600" />
            <p>{service.address}</p>
          </div>
        )}
        {service.city && (
          <div className="flex items-center">
            <FaMapMarkerAlt className="w-4 h-4 mr-1 text-red-500" />
            <p>
              {[service.city, service.state, service.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}
        {service.hotel_rating && (
          <RatingStars rating={service.hotel_rating} />
        )}
      </div>

      {/* ── Tabs Navigation ────────────────────────────────────────── */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          {["details", "location", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium transition ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "details" && "About & Details"}
              {tab === "location" && "Location"}
              {tab === "reviews" && "Reviews"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <div className="relative col-span-2 row-span-2">
              <img
                className="rounded-lg shadow-md cursor-pointer hover:opacity-90 w-full h-96 object-cover transition"
                src={mainImage}
                alt={service.hotel_name}
                onClick={() => { setPhotoIndex(0); setIsOpen(true); }}
              />
              {slides.length > 0 && (
                <button
                  onClick={() => setIsOpen(true)}
                  className="absolute bottom-4 right-4 bg-blue-700 text-white font-medium py-2 px-4 rounded-full hover:bg-blue-800 transition text-sm shadow-lg flex items-center"
                >
                  <FiGrid className="w-4 h-4 mr-2" /> View All ({slides.length})
                </button>
              )}
            </div>
            {additionalImages.slice(0, 5).map((src, idx) => (
              <div key={idx}>
                <img
                  className="rounded-lg shadow-md cursor-pointer hover:opacity-90 w-full h-40 object-cover transition"
                  src={src}
                  alt={`${service.hotel_name} ${idx + 1}`}
                  onClick={() => { setPhotoIndex(idx + 1); setIsOpen(true); }}
                />
              </div>
            ))}
          </div>

          <Lightbox
            open={isOpen}
            close={() => setIsOpen(false)}
            slides={slides}
            index={photoIndex}
            on={{ view: ({ index }) => setPhotoIndex(index) }}
          />

          {/* ── TAB CONTENT ────────────────────────────────────────────── */}
          
          {/* DETAILS TAB */}
          {activeTab === "details" && (
            <>
              {/* About */}
              <section className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">
                  About the Hotel
                </h2>
                <div
                  className="text-gray-700 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: service.description || "No description available.",
                  }}
                />
              </section>

              {/* Room Types Table */}
              {roomTypes.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">
                    Room Types &amp; Rates
                  </h2>
                  <div className="overflow-x-auto rounded-lg shadow">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-blue-700 text-white">
                        <tr>
                          <th className="px-4 py-3 font-semibold">
                            <div className="flex items-center gap-2">
                              <FaBed /> Room Type
                            </div>
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            <div className="flex items-center gap-2">
                              <FiUsers /> Persons
                            </div>
                          </th>
                          <th className="px-4 py-3 font-semibold">Rate / Night</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomTypes.map((room, idx) => (
                          <tr
                            key={room.id || idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                            }
                          >
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {room.room_type}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {room.person}{" "}
                              {room.person === 1 ? "Person" : "Persons"}
                            </td>
                            <td className="px-4 py-3 font-semibold text-blue-700">
                              {formatCurrency(room.rate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Overview */}
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">
                  Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <OverviewItem
                    icon={FiTag}
                    title="Category"
                    value={service.subcategory_name || "Hotel"}
                  />
                  <OverviewItem
                    icon={FaStar}
                    title="Rating"
                    value={
                      service.hotel_rating
                        ? `${parseFloat(service.hotel_rating).toFixed(1)} / 5`
                        : "—"
                    }
                  />
                  <OverviewItem icon={FiGlobe} title="Country" value={service.country} />
                  <OverviewItem icon={FiMap} title="State" value={service.state} />
                  <OverviewItem icon={FaMapMarkerAlt} title="City" value={service.city} />
                  <OverviewItem icon={FiPhone} title="Contact" value={service.contact_no} />
                  <OverviewItem icon={FaWhatsapp} title="WhatsApp" value={service.whatsapp_no} />
                  <OverviewItem icon={FiMail} title="Email" value={service.gmail_id} />
                </div>
              </section>

              {/* Business Details */}
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">
                  Hotel Details
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
                  {[
                    { label: "Hotel Name", value: service.hotel_name },
                    { label: "Category", value: service.subcategory_name },
                    {
                      label: "Rating",
                      value: service.hotel_rating
                        ? `${parseFloat(service.hotel_rating).toFixed(1)} / 5`
                        : null,
                    },
                    { label: "Room Category", value: service.room_category },
                    { label: "Contact No.", value: service.contact_no },
                    { label: "WhatsApp", value: service.whatsapp_no },
                    { label: "Email", value: service.gmail_id },
                    {
                      label: "Status",
                      value: service.status,
                      colored: true,
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-3 rounded shadow-sm">
                      <strong className="block text-xs text-gray-500 uppercase">
                        {item.label}
                      </strong>
                      {item.colored ? (
                        <span
                          className={`capitalize font-semibold ${
                            service.status === "approved"
                              ? "text-green-600"
                              : service.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.value || "—"}
                        </span>
                      ) : (
                        item.value || "—"
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Location */}
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">
                  Location Details
                </h2>
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
                      <strong className="block text-xs text-gray-500 uppercase mb-1">
                        Map / Location Link
                      </strong>
                      <a
                        href={service.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline text-sm break-all"
                      >
                        {service.location}
                      </a>
                    </div>
                  )}
                </div>
              </section>

              {/* Gallery */}
              {allImages.length > 1 && (
                <section className="mb-8">
                  <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">
                    Gallery
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {allImages.map((src, idx) => (
                      <img
                        key={idx}
                        className="rounded-lg shadow-md cursor-pointer hover:opacity-90 w-full h-32 object-cover"
                        src={src}
                        alt={`Gallery ${idx + 1}`}
                        onClick={() => { setPhotoIndex(idx); setIsOpen(true); }}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* LOCATION TAB */}
          {activeTab === "location" && (
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">
                Location Information
              </h2>
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
                    <strong className="block text-xs text-gray-500 uppercase mb-1">
                      Map / Location Link
                    </strong>
                    <a
                      href={service.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline text-sm break-all"
                    >
                      {service.location}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ✅ REVIEWS TAB - ADDED */}
          {activeTab === "reviews" && (
            <section className="mb-8">
              <ServiceReviewSection
                modelName="hotelservice"
                objectId={service.id}
                serviceName={service.hotel_name}
                accentColor="blue"
              />
            </section>
          )}
        </div>

        {/* ── Right sticky column ──────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 space-y-8">
            {/* Contact Card */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-700">
                Contact Hotel
              </h2>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-blue-600">
                  <span className="text-blue-700 font-bold text-xl">
                    {getInitials(service.hotel_name)}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="font-bold text-lg text-gray-900">
                    {service.hotel_name}
                  </p>
                  {service.contact_no && (
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <FiPhone className="w-4 h-4 text-blue-600" />
                      {service.contact_no}
                    </p>
                  )}
                </div>
              </div>

              {/* Lowest rate callout */}
              {roomTypes.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4 text-center">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Starting from
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(
                      Math.min(...roomTypes.map((r) => parseFloat(r.rate)))
                    )}
                  </p>
                  <p className="text-xs text-gray-400">per night</p>
                </div>
              )}

              <div className="space-y-3">
                {service.contact_no && (
                  <a
                    href={`tel:${service.contact_no}`}
                    className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition flex items-center justify-center gap-2 font-medium"
                  >
                    <FiPhone /> Call Now
                  </a>
                )}
                {(service.whatsapp_no || service.contact_no) && (
                  <a
                    href={`https://wa.me/${(
                      service.whatsapp_no || service.contact_no
                    ).replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-green-500 text-green-600 py-2 rounded-md hover:bg-green-50 flex items-center justify-center gap-2 transition font-medium"
                  >
                    <FaWhatsapp className="w-5 h-5" /> WhatsApp
                  </a>
                )}
                {service.gmail_id && (
                  <a
                    href={`mailto:${service.gmail_id}`}
                    className="w-full border border-gray-400 text-gray-700 py-2 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 transition font-medium"
                  >
                    <FiMail /> Email Us
                  </a>
                )}
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-700">
                Inquire Now
              </h2>
              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                  ✅ Inquiry submitted successfully!
                </div>
              )}
              {submitError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  ❌ {submitError}
                </div>
              )}
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                {[
                  { name: "name", placeholder: "Your Name*", required: true, type: "text" },
                  { name: "phone", placeholder: "Phone Number*", required: true, type: "tel" },
                  { name: "email", placeholder: "Email (Optional)", required: false, type: "email" },
                  { name: "city", placeholder: "City*", required: true, type: "text" },
                ].map((f) => (
                  <input
                    key={f.name}
                    type={f.type}
                    placeholder={f.placeholder}
                    required={f.required}
                    value={inquiryData[f.name]}
                    onChange={(e) =>
                      setInquiryData((p) => ({ ...p, [f.name]: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                    disabled={submitting}
                  />
                ))}
                <textarea
                  placeholder="I am interested in your hotel..."
                  rows="3"
                  value={inquiryData.message}
                  onChange={(e) =>
                    setInquiryData((p) => ({ ...p, message: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full ${
                    submitting ? "bg-blue-400" : "bg-blue-700 hover:bg-blue-800"
                  } text-white py-3 rounded-md transition font-bold`}
                >
                  {submitting ? "Submitting..." : "Send Inquiry"}
                </button>
              </form>
            </div>

            {/* Why Choose */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">
                Why Stay With Us?
              </h3>
              <ul className="text-sm text-gray-700 space-y-3">
                <li className="flex items-center">
                  <FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" />
                  Comfortable &amp; Clean Rooms
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" />
                  24/7 Front Desk Support
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" />
                  Prime Location &amp; Easy Access
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" />
                  Best Price Guarantee
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}