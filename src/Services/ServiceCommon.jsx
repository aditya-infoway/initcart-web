import React, { useState, useEffect } from "react";
import { publicAxios } from "../api/axios"; // adjust path if needed
import axiosInstance from "../api/axios";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import RelatedServiceSlider from "./RelatedService";
import {
  FaStar,
  FaMapMarkerAlt,
  FaBriefcase,
  FaPhoneAlt,
  FaWhatsapp,
} from 'react-icons/fa';
// At the top of your file
import { useParams } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";


// Custom Icons (Unchanged)
const ClockIcon = ({ className = "w-4 h-4 mr-1 text-gray-400" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = ({ className = "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = ({ className = "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = ({ className = "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.08 2h3a2 2 0 0 1 2 1.74 17.5 17.5 0 0 0 .81 4.96 2 2 0 0 1-1.07 2.13l-1.35.68a22.37 22.37 0 0 0 10.14 10.14l.68-1.35a2 2 0 0 1 2.13-1.07 17.5 17.5 0 0 0 4.96.81 2 2 0 0 1 1.74 2z" />
  </svg>
);

const MessageIcon = ({ className = "absolute left-3 top-3 w-5 h-5 text-gray-400" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BriefcaseIcon = ({ className = "w-6 h-6 text-blue-600 flex-shrink-0 mt-1" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const MapPinIcon = ({ className = "w-6 h-6 text-blue-600 flex-shrink-0 mt-1" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ImageIconComponent = ({ className = "w-6 h-6 mr-2 text-blue-600" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const StarIcon = ({ fill = true, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Mock Data (Unchanged)

const mockPhotos = [
  "https://placehold.co/800x600/F97316/ffffff?text=Hair+Style",
  "https://placehold.co/800x600/06B6D4/ffffff?text=Nails+Art",
  "https://placehold.co/800x600/10B981/ffffff?text=Spa+View",
  "https://placehold.co/800x600/EC4899/ffffff?text=Client+Result",
  "https://placehold.co/800x600/3B82F6/ffffff?text=Studio+Interior",
  "https://placehold.co/800x600/A855F7/ffffff?text=Product+Line",
];

// RecommendedCard Component (Unchanged)
const RecommendedCard = ({ service }) => (
  <div className="flex justify-between items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition duration-150">
    <div className="flex-grow pr-4">
      <h3 className="text-base font-semibold text-gray-800">{service.name}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{service.doing}</p>
      <div className="text-xs text-gray-400 mt-1 flex items-center">
        <ClockIcon />
        <span>{service.duration}</span>
      </div>
    </div>
    <div className="flex items-center space-x-4 flex-shrink-0">
      <div className="text-lg font-bold text-blue-600">₹ {service.price}</div>
    </div>
  </div>
);

// InquiryForm Component (Unchanged)
const InquiryForm = ({ serviceData, prefillMessage }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    message: prefillMessage || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (prefillMessage) {
      setForm(prev => ({ ...prev, message: prefillMessage }));
    }
  }, [prefillMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const vendorId = serviceData?.vendor?.id || serviceData?.vendor;
    const category = serviceData?.category || serviceData?.service_category;

    if (!vendorId || !category) {
      setErrorMsg("Vendor or Service info missing. Cannot submit inquiry.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        service_category: category,
        sub_category: serviceData?.sub_category || "",
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

      if (!response || response.status !== 201) {
        throw new Error("Failed to submit inquiry");
      }

      setSuccessMsg("✅ Inquiry submitted successfully! We'll contact you soon.");
      setForm({ name: "", phone: "", email: "", city: "", message: "" });
      setTimeout(() => setSuccessMsg(""), 5000);

    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with blue background */}
      <div className="bg-blue-600 text-white text-xl font-bold px-6 py-4 text-center">
        Inquiry Form
      </div>

      <div className="p-6">
        {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMsg}</div>}
        {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your Name*</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
              required
              value={form.name}
              onChange={handleChange}
              disabled={submitting}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-gray-700 font-semibold mb-1">Phone Number*</label>
            <input
              type="text"
              name="phone"
              id="phone"
              placeholder="Enter your phone number"
              required
              value={form.phone}
              onChange={handleChange}
              disabled={submitting}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Email (Optional)</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-gray-700 font-semibold mb-1">City</label>
            <input
              type="text"
              name="city"
              id="city"
              placeholder="Enter your city"
              value={form.city}
              onChange={handleChange}
              disabled={submitting}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-gray-700 font-semibold mb-1">Message</label>
            <textarea
              name="message"
              id="message"
              placeholder="Your message..."
              rows="4"
              value={form.message}
              onChange={handleChange}
              disabled={submitting}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full ${submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-md font-semibold`}
          >
            {submitting ? 'Submitting...' : 'Send Inquiry'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ReviewModal = ({
  isOpen,
  closeModal,
  rating,
  setRating,
  reviewText,
  setReviewText,
  submitReview,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 font-bold text-xl text-center">
          Rate & Review
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Rating */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold mb-2">Your Rating</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${rating >= star ? "text-yellow-400" : "text-gray-300"
                    } hover:text-yellow-500`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold mb-2">Your Review</label>
            <textarea
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Write your review..."
              rows={5}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-2">
          <button
            onClick={submitReview}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Submit
          </button>
          <button
            onClick={closeModal}
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// SpaHeader Component (Unchanged from last responsive revision)
const SpaHeader = ({
  handleOpenLightbox,
  serviceData,
  rating,
  setRating,
  avgRating,
  totalReviews,
  handleRatingClick,
  isLoggedIn,
  reviewText,
  setReviewText,
  submitReview
}) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  if (!serviceData) return null;


  const allImages = [
    `https://api.initcart.in${serviceData.main_image}`,
    `https://api.initcart.in${serviceData.second_image}`,
    ...serviceData.multi_images.map((img) => `https://api.initcart.in${img.image}`),
  ];

  return (
    <div className="bg-white p-4 sm:p-6 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">

        {/* Info Section */}
        <div className="md:col-span-1 border p-4 rounded-lg shadow-md bg-white order-2 md:order-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="bg-green-600 text-white text-sm font-semibold px-2 py-0.5 rounded flex gap-1 items-center">
                4.8 <FaStar className="w-3 h-3 text-yellow-400 cursor-pointer" />
              </span>
              <span className="text-gray-500 text-xs">(125 Reviews)</span>
            </div>
            {/* Rating stars */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm hidden sm:inline">Click to Rate:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`w-5 h-5 cursor-pointer transition ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                    onClick={() => {
                      if (!isLoggedIn) return alert("Please login to rate");
                      setRating(star);
                      setIsReviewModalOpen(true); // OPEN MODAL HERE
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <ReviewModal
            isOpen={isReviewModalOpen}
            closeModal={() => setIsReviewModalOpen(false)}
            rating={rating}
            setRating={setRating}
            reviewText={reviewText}
            setReviewText={setReviewText}
            submitReview={submitReview}
          />

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{serviceData.business_name}</h1>

          <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2 sm:gap-6 text-sm text-gray-600">
            {/* Address */}
            <div className="flex items-center space-x-1">
              <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
              <span>{serviceData.address}</span>
            </div>

            {/* Services Count */}
            <div className="flex items-center space-x-1">
              <FaBriefcase className="w-4 h-4 text-blue-500" />
              <span>{serviceData.items?.length} Services Available</span>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-green-600 font-semibold text-sm">
              {serviceData.open_time} - {serviceData.close_time}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 mt-4">
            <a
              href={`tel:${serviceData.contact_no}`}
              className="flex items-center justify-center space-x-2 bg-green-700 text-white text-base font-semibold py-2 px-4 rounded-lg hover:bg-green-800 transition flex-grow sm:flex-grow-0"
            >
              <FaPhoneAlt className="w-4 h-4" />
              <span>Call Now</span>
            </a>

            <a
              href={`https://wa.me/${serviceData.whatsapp_no}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 border border-green-500 text-green-700 text-base font-semibold py-2 px-4 rounded-lg hover:bg-green-50 transition flex-grow sm:flex-grow-0"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <a
              href={serviceData.location} // ✅ Use the direct link from your data
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white text-base font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition flex-grow sm:flex-grow-0"
            >
              <FaMapMarkerAlt className="w-4 h-4" />
              <span>View Location</span>
            </a>
          </div>
        </div>

        {/* Main Image */}
        <div
          className="cursor-pointer w-full h-60 md:h-56 lg:h-60 border border-gray-300 bg-gray-100 overflow-hidden rounded order-1 md:order-2"
          onClick={() => handleOpenLightbox(0)}
        >
          <img
            src={allImages[0]}
            alt="Main Image"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Secondary Images */}
        <div className="space-y-3 order-3 md:order-3">
          {allImages.slice(1, 2).map((img, idx) => (
            <div
              key={idx}
              className="w-full h-32 md:h-28 lg:h-32 border border-gray-300 bg-gray-100 overflow-hidden rounded cursor-pointer"
              onClick={() => handleOpenLightbox(idx + 1)}
            >
              <img
                src={img}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleOpenLightbox(0)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded transition"
          >
            View All Photos ({allImages.length})
          </button>
        </div>
      </div>
    </div>
  );
};

// DescriptionTab Component (Unchanged)
const DescriptionTab = ({ serviceData }) => {
  if (!serviceData) return null;

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg h-full border border-gray-200">
      {/* Service Name */}
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
        About {serviceData.business_name}
      </h2>

      {/* Description */}
      <p
        className="text-md text-gray-600 mb-3 italic"
        dangerouslySetInnerHTML={{ __html: serviceData.description || "No description available." }}
      />

      <div className="space-y-6 text-gray-700">
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Services Info */}
          {/* <div className="flex items-start space-x-3">
            <BriefcaseIcon />
            <div>
              <h3 className="font-bold text-gray-800">Available Services</h3>
              <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                {serviceData.items?.map((item) => (
                  <li key={item.id}>
                    {item.name} - ₹ {item.price} ({item.description})
                  </li>
                ))}
              </ul>
            </div>
          </div> */}

          {/* Location Info */}
          {/* <div className="flex items-start space-x-3">
            <MapPinIcon />
            <div>
              <h3 className="font-bold text-gray-800">Location</h3>
              <p className="text-sm text-gray-600">{serviceData.address}</p>
              {serviceData.location && (
                <a
                  href={serviceData.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm mt-1 block"
                >
                  View on Map
                </a>
              )}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

// ReviewsTab Component (Unchanged)
const ReviewsTab = ({ modelName, objectId }) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
   const [serviceData, setServiceData] = useState(null);

  const { id, subcategory } = useParams();
  const getModelName = () => {
    if (!serviceData) return null;

    switch (serviceData.category) {
      case "gym":
        return "gymservice";       // must match GymService model lowercase
      case "salon":
        return "saloonservice";     // must match SalonService model lowercase
      case "travel_agency":
        return "travelservice";    // must match TravelService model lowercase
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [modelName, objectId]);

  const fetchReviews = async () => {
    try {
      const res = await publicAxios.get("/api/all-review/", {
        params: {
          model : modelName,
          object_id: id,
        },
      });

      setReviews(res.data.reviews);
      setAvgRating(res.data.average_rating);
      setTotalReviews(res.data.total_reviews);
    } catch (err) {
      console.error("Error fetching reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <StarIcon
        key={index}
        className={`w-4 h-4 ${index < rating ? "text-yellow-500" : "text-gray-300"
          }`}
      />
    ));
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg h-full border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Customer Reviews ({totalReviews})
      </h2>

      {/* ⭐ Average Rating */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex">{renderStars(Math.round(avgRating))}</div>
        <span className="text-gray-700 font-semibold">
          {avgRating} / 5
        </span>
      </div>

      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 border rounded-lg bg-gray-50"
            >
              {/* <p className="font-semibold">{review.user}</p> */}

              <div className="flex text-sm my-1">
                {renderStars(review.rating)}
              </div>

              <p className="text-sm text-gray-700">
                {review.review}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ServicesTab Component (Unchanged)
const ServicesTab = ({ items }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full border border-gray-200">
    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h2 className="text-xl font-bold text-gray-800">Available Services</h2>
    </div>
    <div className="overflow-y-auto max-h-[70vh] lg:max-h-[calc(100vh-250px)]">
      {items?.map((service) => (
        <RecommendedCard key={service.id} service={{
          name: service.name,
          price: service.price,
          duration: service.duration || "60 Min",
          doing: service.description || "Free Consultation",
        }} />
      ))}
    </div>
  </div>
);

// PhotosTab Component (Unchanged)
const PhotosTab = ({ serviceData, handleOpenLightbox }) => {
  if (!serviceData) return null;

  const allImages = [
    `https://api.initcart.in${serviceData.main_image}`,
    `https://api.initcart.in${serviceData.second_image}`,
    ...serviceData.multi_images.map(img => `https://api.initcart.in${img.image}`),
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg h-full border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
        <ImageIconComponent />
        Photo Gallery
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {allImages.map((url, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl shadow-md hover:shadow-xl transition duration-300 transform hover:scale-[1.03] aspect-square cursor-pointer"
            onClick={() => handleOpenLightbox(i)}
          >
            <img
              src={url}
              alt={`Service ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Services Component
const Services = () => {
  const [activeTab, setActiveTab] = useState("services");
  const [openLightbox, setOpenLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);

  const getModelName = () => {
    if (!serviceData) return null;

    switch (serviceData.category) {
      case "gym":
        return "gymservice";       // must match GymService model lowercase
      case "salon":
        return "saloonservice";     // must match SalonService model lowercase
      case "travel_agency":
        return "travelservice";    // must match TravelService model lowercase
      default:
        return null;
    }
  };

  const { id, subcategory } = useParams();

  const handleRatingClick = (star) => {
    if (!isLoggedIn) {
      alert("Please Login to give rating");
      return;
    }
    setRating(star);
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (token) setIsLoggedIn(true);
  }, []);

  // console.log(localStorage.getItem("token"));
  const submitReview = async () => {
    const token = localStorage.getItem('customer_token');
    if (!token) return alert('You must be logged in to submit a review');
    if (!rating) return alert("Please select rating");

    try {
      const res = await axiosInstance.post(
        "/api/add-review/",
        {
          model: getModelName(),  // must match Django model name lowercase
          object_id: id,           // must exist
          rating: parseInt(rating), // ensure integer
          review: reviewText
        },
        {
          headers: {
            Authorization: `Token ${token}`,  // match DRF token auth
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("API response:", res.data);  // debug
      if (res.data.success) {
        alert("Review Added Successfully");
        fetchReviews();
      } else {
        alert("Failed: " + JSON.stringify(res.data.errors || res.data));
      }

    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.error || "Already Reviewed");
    }
  };

  const fetchReviews = async () => {

    const model = getModelName();
    if (!model) return;   // 🚀 Prevent undefined error

    try {
      const res = await publicAxios.get(
        `/api/reviews/?model=${model}&object_id=${id}`
      );

      setReviews(res.data);

      if (res.data.length > 0) {
        const total = res.data.reduce((acc, r) => acc + r.rating, 0);
        setAvgRating((total / res.data.length).toFixed(1));
        setTotalReviews(res.data.length);
      } else {
        setAvgRating(0);
        setTotalReviews(0);
      }

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (serviceData) {
      fetchReviews();
    }
  }, [serviceData]);

  useEffect(() => {

    if (!id || !subcategory) return;

    const fetchService = async () => {
      try {

        const response = await publicAxios.get(
          `services/services-detail/${id}/${subcategory}/`
        );

        console.log("API HIT SUCCESS", response.data);

        setServiceData(response.data);
        setLoading(false);

      } catch (error) {
        console.error("API ERROR", error);
        setLoading(false);
      }
    };

    fetchService();

  }, [id, subcategory]);

  const handleOpenLightbox = (index = 0) => {
    setLightboxIndex(index); // starting index
    setOpenLightbox(true);
  };

  // Inside your Services component

  // ✅ Get the service type safely from fetched data
  const serviceType = serviceData?.type || serviceData?.category;

  // ✅ Map API types to readable category names
  const SERVICE_TYPE_MAP = {
    gym_service: "Gym",
    saloon_service: "Saloon",
    travel_service: "Travel Agency",
    finance_service: "Finance",
    tech_service: "Tech Industry",
    hospitality_service: "Hospitality",
    healthcare_service: "Healthcare",
    education_service: "Education",
    professional_service: "Professional",
    restaurant_service: "restaurant",
    hotel_service : "hotel",
    workplace_service: "Workplace",
  };

  // ✅ Final readable category name
  const categoryName = SERVICE_TYPE_MAP[serviceType] || "Service";

  // ✅ Business name from API
  const businessName = serviceData?.business_name || "Service";

  {/* Tabs */ }
  const tabs = [
    { id: "services", label: "SERVICES", content: <ServicesTab items={serviceData?.items} /> },
    { id: "description", label: "DESCRIPTION", content: <DescriptionTab serviceData={serviceData} /> },
    { id: "reviews", label: "REVIEWS", content: (<ReviewsTab modelName={getModelName()} objectId={id} />)},
    { id: "photos", label: "PHOTOS", content: <PhotosTab serviceData={serviceData} handleOpenLightbox={handleOpenLightbox} /> },
  ];

  const ActiveContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 md:p-8">

      {/* Header Box */}
      <div className="w-full bg-white border border-gray-300 rounded-lg shadow-sm mb-4 p-4">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-2" aria-label="breadcrumb">
          <ol className="list-none p-0 inline-flex">
            {/* Home */}
            <li className="flex items-center">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">›</span>
            </li>

            {/* Service Type / Category */}
            {categoryName && (
              <li className="flex items-center">
                <Link
                  to={`/services/${serviceType}`}
                  className="hover:text-blue-600"
                >
                  {categoryName}
                </Link>
                <span className="mx-2">›</span>
              </li>
            )}

            {/* Business Name */}
            {businessName && (
              <li className="flex items-center">
                <span className="text-gray-700 font-medium">{businessName}</span>
              </li>
            )}
          </ol>
        </nav>

        {/* Title */}
        {/* <h1 className="text-2xl font-bold text-gray-800">Our Services</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Explore a variety of services we offer to meet your needs.
        </p> */}
      </div>

      {/* Spa Header Component */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <SpaHeader
          handleOpenLightbox={handleOpenLightbox}
          serviceData={serviceData}
          rating={rating}
          setRating={setRating}
          avgRating={avgRating}
          totalReviews={totalReviews}
          isLoggedIn={isLoggedIn}
          handleRatingClick={handleRatingClick}
          reviewText={reviewText}
          setReviewText={setReviewText}
          submitReview={submitReview}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left Column (Tabs and Content) */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">

          {/* 🚀 RESPONSIVE FIX: Tab Navigation 
            1. Reduced padding to px-3 py-1 on small screens.
            2. Ensured text size remains small (text-xs) on mobile.
            3. Added a thin border to the wrapper for better aesthetics.
          */}
          <div className="bg-white rounded-xl shadow-lg p-1.5 flex justify-start overflow-x-auto whitespace-nowrap space-x-1 sm:space-x-2 mb-3 border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  text-xs sm:text-sm font-semibold rounded-lg transition duration-300 ease-in-out uppercase flex-shrink-0
                  ${activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md px-3 py-1 sm:px-4 sm:py-2"
                    : "text-gray-600 hover:bg-gray-100 px-3 py-1 sm:px-4 sm:py-2"
                  } 
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full min-h-[400px]">
            {ActiveContent}
          </div>

        </div>

        {/* Right Column (Inquiry Form) */}
        {/* Right Column (Inquiry Form) */}
        {/* Right Column (Inquiry Form) */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          {serviceData && <InquiryForm serviceData={serviceData} />}
        </div>

      </div>

      {/* Related Service Slider (assumed component) */}
      <div className="mt-8">
        <RelatedServiceSlider />
      </div>

      {/* Lightbox Component */}
      <Lightbox
        open={openLightbox}
        close={() => setOpenLightbox(false)}
        index={lightboxIndex}
        slides={
          serviceData
            ? [
              { src: `https://api.initcart.in${serviceData.main_image}` },
              { src: `https://api.initcart.in${serviceData.second_image}` },
              ...serviceData.multi_images.map((img) => ({ src: `https://api.initcart.in${img.image}` })),
            ]
            : []
        }
        carousel={{ finite: true }}
      />
    </div>
  );
};

export default Services;