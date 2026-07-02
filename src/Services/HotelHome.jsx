// src/pages/public/HotelHome.jsx
import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import ServiceReviewsDisplay from "./ServiceReviewsDisplay";
import { FiSearch, FiMapPin } from "react-icons/fi";
import {
  FaMapMarkerAlt,
  FaStar,
  FaQuoteLeft,
  FaHotel,
  FaConciergeBell,
  FaSwimmingPool,
  FaWhatsapp,
} from "react-icons/fa";
import { publicAxios } from "../api/axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MobileHotelHome from "./mobile/MobileHotelHome";
export default function HotelHome() {
  const navigate = useNavigate();


  // ─── Navigation ──────────────────────────────────────────────────────────
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

  // ─── State ───────────────────────────────────────────────────────────────
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

  // ─── Sliders ─────────────────────────────────────────────────────────────
  const cardSlider = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3200,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 560, settings: { slidesToShow: 1 } },
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

  // ─── Fetch Subcategories ──────────────────────────────────────────────────
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

  // ─── Fetch Cities ─────────────────────────────────────────────────────────
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

  // ─── Fetch Services ───────────────────────────────────────────────────────
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

  // ─── Fetch Ads ────────────────────────────────────────────────────────────
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

  const blockOne = groupedServices.slice(0, 2);
  const blockTwo = groupedServices.slice(2, 4);
  const blockThree = groupedServices.slice(4);

  // ─── Service Card ─────────────────────────────────────────────────────────
  const ServiceCard = ({ service }) => (
    <div className="p-2">
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer">
        {/* Image */}
        <div className="relative h-52 w-full overflow-hidden">
          <img
            src={
              service.main_image ||
              "https://placehold.co/400x300/1e40af/white?text=Hotel"
            }
            alt={service.hotel_name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            onClick={() => navigateToDetail(service.id)}
          />
          {service.hotel_rating && (
            <span className="absolute top-3 right-3 bg-white text-yellow-600 text-xs font-bold px-2 py-1 rounded-full shadow flex items-center gap-1">
              <FaStar className="text-yellow-500" />
              {parseFloat(service.hotel_rating).toFixed(1)}
            </span>
          )}
          {service.room_category === "premium" && (
            <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
              Premium
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-grow">
          <h3
            className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 hover:text-blue-700"
            onClick={() => navigateToDetail(service.id)}
          >
            {service.hotel_name}
          </h3>
          {service.subcategory_name && (
            <p className="text-xs text-blue-600 mb-1">{service.subcategory_name}</p>
          )}
          <p className="text-sm text-gray-500 flex items-center truncate mb-1">
            <FaMapMarkerAlt className="mr-1 text-red-500 flex-shrink-0" />
            {service.city || service.address || "—"}
          </p>
          {/* Lowest room rate if available */}
          {service.room_types?.length > 0 && (
            <p className="text-sm font-semibold text-blue-700 mb-2">
              From ₹
              {Math.min(...service.room_types.map((r) => parseFloat(r.rate)))}
              /night
            </p>
          )}
          <div className="flex gap-2 mt-auto pt-2">
            {service.contact_no && (
              <a
                href={`tel:${service.contact_no}`}
                className="flex-1 text-center bg-blue-700 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-800 transition"
              >
                Call Now
              </a>
            )}
            <button
              onClick={() => {
                setSelectedService(service);
                setShowInquiryModal(true);
              }}
              className="flex-1 text-center bg-amber-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-amber-600 transition"
            >
              Inquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Block renderer ───────────────────────────────────────────────────────
  const renderBlock = (block) =>
    block.map((category, i) => (
      <section key={i} className="py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {category.subcategory}
          </h2>
          <button
            onClick={() => navigateToViewAll(category.subcategory)}
            className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
          >
            View All →
          </button>
        </div>
        <Slider {...cardSlider}>
          {category.services?.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </Slider>
      </section>
    ));

  // ─── Ad Banner ────────────────────────────────────────────────────────────
  const AdBanner = ({ ad, big = false }) =>
    !ad ? null : (
      <div
        className={`relative rounded-xl overflow-hidden shadow-lg group cursor-pointer ${
          big ? "h-72" : "h-56"
        }`}
        onClick={() => window.open(ad.url, "_blank")}
      >
        <img
          src={ad.image}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div
          className={`absolute inset-0 ${
            big
              ? "bg-gradient-to-r from-black/70 to-transparent flex items-center p-8"
              : "bg-gradient-to-t from-black/60 to-transparent flex items-end p-5"
          }`}
        >
          {big ? (
            <div className="text-white max-w-md">
              <h2 className="text-xl md:text-3xl font-bold mb-2">{ad.title}</h2>
              <button className="bg-blue-700 hover:bg-blue-800 px-6 py-2 rounded-lg text-sm font-semibold transition mt-2">
                Book Now →
              </button>
            </div>
          ) : (
            <h3 className="text-white font-bold text-lg">{ad.title}</h3>
          )}
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative w-full h-[540px]">
        <img
          src="https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="hotel-banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 drop-shadow">
            Find Your Perfect Hotel Stay
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm md:text-base mb-6 max-w-xl">
            <span className="font-semibold">200+</span> verified hotels — luxury
            resorts, boutique stays and budget-friendly options.
          </p>

          {/* Subcategory tabs */}
          <div className="bg-black/40 text-white rounded-2xl flex items-center justify-start sm:justify-center gap-4 sm:gap-6 px-4 py-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] overflow-x-auto scrollbar-hide min-h-[40px]">
            {subcategories.length === 0 ? (
              <p className="text-white text-sm">Loading...</p>
            ) : (
              subcategories.map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSubcategory(tab);
                    setSelectedCity("");
                    setShowCities(false);
                  }}
                  className={`flex-shrink-0 pb-1 px-2 text-xs sm:text-sm font-semibold border-b-2 transition ${
                    selectedSubcategory === tab
                      ? "border-white text-white"
                      : "border-transparent text-gray-300 hover:text-white hover:border-white"
                  }`}
                >
                  {tab}
                </button>
              ))
            )}
          </div>

          {/* Search bar */}
          <div className="relative bg-white shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] p-2 mt-[-1px] rounded-b-sm sm:rounded-full">
            {/* City dropdown */}
            <div className="relative sm:w-40 w-full sm:border-r border-b sm:border-b-0">
              <button
                onClick={() => setShowCities((p) => !p)}
                className="flex items-center justify-between w-full px-4 py-2 text-gray-800 font-medium"
              >
                <span className="flex items-center gap-1">
                  <FiMapPin className="text-blue-600 w-3 h-3" />
                  {selectedCity || "Select City"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 text-gray-500 transform transition ${
                    showCities ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showCities && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white shadow-lg rounded-lg z-30 max-h-60 overflow-y-auto border">
                  {cities.map((city) => (
                    <div
                      key={city.id || city.name}
                      onClick={() => {
                        setSelectedCity(city.name);
                        setShowCities(false);
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 text-sm"
                    >
                      {city.name}
                    </div>
                  ))}
                  {cities.length === 0 && (
                    <div className="px-4 py-2 text-gray-400 text-sm">
                      No cities found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Keyword */}
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search hotels, resorts, or locations..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && navigateToList()}
                className="w-full px-4 py-2 text-gray-700 outline-none border border-gray-200 rounded-md sm:border-none sm:rounded-none"
              />
            </div>
            <button
              onClick={navigateToList}
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md sm:rounded-full font-semibold flex items-center justify-center gap-2 transition w-full sm:w-auto"
            >
              <FiSearch /> Search
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* ── Feature Cards ─────────────────────────────────────────── */}
        <section className="relative z-20 -mt-16">
          <div className="bg-blue-50 rounded-tl-[80px] rounded-tr-[80px] py-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
              {[
                {
                  icon: <FaHotel className="text-4xl text-blue-700" />,
                  title: "Luxury Hotels",
                  text: "Premium 5-star stays with world-class amenities and services.",
                },
                {
                  icon: <FaConciergeBell className="text-4xl text-amber-500" />,
                  title: "24/7 Concierge",
                  text: "Round-the-clock assistance for all your needs during your stay.",
                },
                {
                  icon: <FaSwimmingPool className="text-4xl text-teal-500" />,
                  title: "Top Facilities",
                  text: "Pools, spas, gyms and fine dining in one place.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={navigateToList}
                  className="bg-white rounded-xl shadow-lg p-8 text-center hover:scale-105 transition cursor-pointer"
                >
                  <div className="mb-4 flex justify-center">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services + Ads ────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4" />
            <p className="text-gray-500">Loading hotel services...</p>
          </div>
        ) : (
          <>
            {renderBlock(blockOne)}

            {(ads.slot1 || ads.slot2) && (
              <section className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AdBanner ad={ads.slot1} />
                  <AdBanner ad={ads.slot2} />
                </div>
              </section>
            )}

            {renderBlock(blockTwo)}

            {ads.bigAd && (
              <section className="py-4">
                <AdBanner ad={ads.bigAd} big />
              </section>
            )}

            {renderBlock(blockThree)}
          </>
        )}

        {/* ── Reviews ───────────────────────────────────────────────── */}
        <section className="py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            What Our Guests Say
          </h2>
          <Slider {...reviewSlider}>
            {[
              "Absolutely stunning property. The rooms were immaculate and the staff were incredibly welcoming.",
              "Found the perfect hotel for our anniversary trip. Breathtaking views and top-notch service.",
              "Great value for money. Clean, comfortable and centrally located. Highly recommend!",
            ].map((review, i) => (
              <div key={i} className="p-4">
                <div
                  onClick={navigateToList}
                  className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
                >
                  <FaQuoteLeft className="text-blue-500 text-3xl mb-3" />
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    "{review}"
                  </p>
                  <div className="flex items-center gap-1">
                    {Array(5)
                      .fill(0)
                      .map((_, idx) => (
                        <FaStar key={idx} className="text-yellow-400" />
                      ))}
                  </div>
                  <p className="mt-2 font-semibold text-gray-800">
                    Guest {i + 1}
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </section>
      </div>

      {/* ── Inquiry Modal ─────────────────────────────────────────── */}
      {showInquiryModal && selectedService && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowInquiryModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-blue-700 text-white text-lg font-bold px-6 py-4 flex justify-between items-center sticky top-0">
              <span>Inquiry Form</span>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="text-white text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <HotelInquiryForm
                serviceData={selectedService}
                onSuccess={() => setShowInquiryModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inquiry Form ─────────────────────────────────────────────────────────────
const HotelInquiryForm = ({ serviceData, onSuccess }) => {
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

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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
        setSuccessMsg("✅ Inquiry submitted successfully!");
        setForm({ name: "", phone: "", email: "", city: "", message: "" });
        setTimeout(() => {
          setSuccessMsg("");
          if (onSuccess) onSuccess();
        }, 2500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMsg && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}
      {[
        { name: "name", label: "Your Name *", type: "text", required: true },
        { name: "phone", label: "Phone Number *", type: "tel", required: true },
        { name: "email", label: "Email (Optional)", type: "email", required: false },
        { name: "city", label: "City", type: "text", required: false },
      ].map((f) => (
        <div key={f.name}>
          <label className="block text-gray-700 font-medium mb-1">
            {f.label}
          </label>
          <input
            type={f.type}
            name={f.name}
            required={f.required}
            value={form[f.name]}
            onChange={handleChange}
            disabled={submitting}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
      ))}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Message</label>
        <textarea
          name="message"
          rows="3"
          value={form.message}
          onChange={handleChange}
          disabled={submitting}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className={`w-full ${
          submitting ? "bg-blue-400" : "bg-blue-700 hover:bg-blue-800"
        } text-white py-3 rounded-lg font-semibold transition`}
      >
        {submitting ? "Submitting..." : "Send Inquiry"}
      </button>
    </form>
  );
};