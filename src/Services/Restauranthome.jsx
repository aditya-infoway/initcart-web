// src/pages/public/RestaurantHome.jsx
import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import {
  FaMapMarkerAlt,
  FaStar,
  FaQuoteLeft,
  FaUtensils,
  FaConciergeBell,
  FaLeaf,
  FaWhatsapp,
} from "react-icons/fa";
import { publicAxios } from "../api/axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MobileRestaurantHome from "./mobile/MobileRestaurantHome.";
import ServiceReviewsDisplay from "./ServiceReviewsDisplay";

export default function RestaurantHome() {
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
    return <MobileRestaurantHome />;
  }

  // ─── Navigation helpers ───────────────────────────────────────────────────
  const navigateToDetail = (id) => navigate(`/restaurantdetail/${id}`);

  const navigateToViewAll = (subcategory) => {
    if (!subcategory) return;
    navigate(`/searchservice?subcategory=${encodeURIComponent(subcategory)}&type=restaurant`);
  };

  const navigateToList = () => {
    const params = new URLSearchParams();
    params.append("type", "restaurant");
    if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
    if (selectedCity) params.append("city", selectedCity);
    if (searchKeyword.trim()) params.append("keyword", searchKeyword.trim());
    navigate(`/searchservice?${params.toString()}`);
  };

  // ─── State ────────────────────────────────────────────────────────────────
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [showCities, setShowCities] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [groupedServices, setGroupedServices] = useState([]);
  const [bigAd, setBigAd] = useState(null);
  const [smallAds, setSmallAds] = useState([]);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceListForReviews, setServiceListForReviews] = useState([]);

  // ─── Slider configs ───────────────────────────────────────────────────────
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
        const response = await publicAxios.get("api/service-subcategories/by_service/?service=Restaurant");
        const data = response.data;
        let subs = [];
        if (data["Restaurant"]) subs = data["Restaurant"];
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

  // ─── Fetch Cities (filtered by subcategory) ───────────────────────────────
  useEffect(() => {
    publicAxios
      .get("services/service-city/")
      .then((res) => {
        const all = Array.isArray(res.data.cities) ? res.data.cities : [];
        const restaurantCities = all.filter(
          (c) => c.type === "restaurant_service"
        );
        const filtered = selectedSubcategory
          ? restaurantCities.filter((c) =>
            c.subcategories?.some(
              (s) =>
                s.name.toLowerCase() ===
                selectedSubcategory.toLowerCase()
            )
          )
          : restaurantCities;
        setCities(filtered);
        setSelectedCity("");
      })
      .catch(console.error);
  }, [selectedSubcategory]);

  // ─── Fetch Services ───────────────────────────────────────────────────────
  useEffect(() => {
    publicAxios
      .get("/api/public/restaurant-services/")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || res.data.data || [];

        const serviceList = data.map(svc => ({
          id: svc.id,
          name: svc.restaurant_name || svc.business_name,
        }));
        setServiceListForReviews(serviceList);
        const grouped = Object.values(
          data.reduce((acc, svc) => {
            // ✅ FIX: Ensure subcategory_name is a string
            const sub = svc.subcategory_name || svc.subcategory?.subcategory_name || "Other";
            if (!acc[sub]) acc[sub] = { subcategory: sub, services: [] };
            acc[sub].services.push(svc);
            return acc;
          }, {})
        );
        setGroupedServices(grouped);
      })
      .catch(console.error);
  }, []);

  // ─── Fetch Ads ────────────────────────────────────────────────────────────
  useEffect(() => {
    publicAxios
      .get("api/init-restaurant-bigad/")
      .then((res) => setBigAd(res.data))
      .catch(console.error);
    publicAxios
      .get("api/init-restaurant-smallads/")
      .then((res) => setSmallAds(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, []);

  const slot1 = smallAds.find((a) => a.slot === 1);
  const slot2 = smallAds.find((a) => a.slot === 2);

  const blockOne = groupedServices.slice(0, 2);
  const blockTwo = groupedServices.slice(2, 4);
  const blockThree = groupedServices.slice(4);

  // ─── Ad Banner helper ─────────────────────────────────────────────────────
  const AdBanner = ({ ad }) =>
    !ad ? null : (
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <img
          src={ad.image}
          alt={ad.title || "banner"}
          className="w-full h-full object-cover"
        />
        {(ad.title || ad.url) && (
          <div className="absolute bottom-0 left-0 p-4 flex flex-col gap-2">
            {ad.title && (
              <h3 className="text-white font-semibold text-sm sm:text-base max-w-[60%]">
                {ad.title}
              </h3>
            )}
            {ad.url && (
              <a
                href={ad.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm py-1 px-4 rounded transition w-fit"
              >
                Order Now
              </a>
            )}
          </div>
        )}
      </div>
    );

  return (
    <div className="bg-gray-50">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section className="relative w-full h-[540px]">
        <img
          src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="restaurant-banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-snug drop-shadow">
            Discover the Best Restaurants Near You
          </h2>
          <p className="text-orange-100 text-xs sm:text-sm md:text-base mb-6 max-w-xl">
            <span className="font-semibold">300+</span> verified restaurants
            offering authentic flavours and unforgettable dining experiences.
          </p>

          {/* Subcategory tabs */}
          <div className="bg-black/40 text-white rounded-2xl flex items-center justify-start sm:justify-center gap-4 sm:gap-6 px-4 py-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] overflow-x-auto scrollbar-hide min-h-[40px]">
            {subcategories.length === 0 && (
              <p className="text-white text-sm">Loading...</p>
            )}
            {subcategories.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedSubcategory(tab);
                  setSelectedCity("");
                  setShowCities(false);
                }}
                className={`flex-shrink-0 pb-1 px-2 text-xs sm:text-sm font-semibold border-b-2 transition ${selectedSubcategory === tab
                    ? "border-white text-white"
                    : "border-transparent text-gray-300 hover:text-white hover:border-white"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative bg-white shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] p-2 mt-[-1px] rounded-b-sm sm:rounded-full">
            {/* City dropdown */}
            <div className="relative sm:w-40 w-full sm:border-r border-b sm:border-b-0">
              <button
                onClick={() => setShowCities((p) => !p)}
                className="flex items-center justify-between w-full px-4 py-2 text-gray-800 font-medium"
              >
                {selectedCity || "Select City"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 text-gray-500 transform transition ${showCities ? "rotate-180" : ""
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
                <div className="absolute top-full left-0 mt-1 w-full bg-white shadow-lg rounded-lg z-30 max-h-60 overflow-y-auto">
                  {cities.map((city) => (
                    <div
                      key={city.id || city.name}
                      onClick={() => {
                        setSelectedCity(city.name);
                        setShowCities(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
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

            {/* Keyword input */}
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search restaurants, cuisines, or dishes..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 outline-none border border-gray-200 rounded-md sm:border-none sm:rounded-none"
              />
            </div>
            <button
              onClick={navigateToList}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md sm:rounded-full font-semibold flex items-center justify-center transition w-full sm:w-auto gap-2"
            >
              <FiSearch /> Search
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* ── Feature Cards ────────────────────────────────────────── */}
        <section className="relative z-20 -mt-16">
          <div className="bg-orange-50 rounded-tl-[80px] rounded-tr-[80px] py-16">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    icon: <FaConciergeBell className="text-4xl text-red-600" />,
                    title: "Fine Dining Experiences",
                    text: "Curated restaurants known for exceptional service and ambiance.",
                  },
                  {
                    icon: <FaLeaf className="text-4xl text-green-600" />,
                    title: "Fresh Ingredients",
                    text: "Restaurants committed to locally sourced, quality produce.",
                  },
                  {
                    icon: <FaUtensils className="text-4xl text-amber-600" />,
                    title: "All Cuisines",
                    text: "Explore Indian, Chinese, Italian, continental and more.",
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
          </div>
        </section>

        {/* ── Block One ────────────────────────────────────────────── */}
        {/* ✅ FIX: Direct map like HealthcareHome */}
        {blockOne.map((category, idx) => {
          // ✅ Ensure subcategory is string
          const subcategoryName = typeof category.subcategory === 'string'
            ? category.subcategory
            : category.subcategory?.subcategory_name || "Other";

          return (
            <section key={idx} className="py-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {subcategoryName}
                </h2>
                <button
                  onClick={() => navigateToViewAll(subcategoryName)}
                  className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                >
                  View All <span>→</span>
                </button>
              </div>
              <Slider {...cardSlider}>
                {category.services?.map((svc) => (
                  <div key={svc.id} className="p-3">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-xl transition-transform hover:-translate-y-1 cursor-pointer flex flex-col overflow-hidden">
                      <div className="relative w-full h-52">
                        <img
                          src={svc.main_image || "https://placehold.co/400x300/ef4444/white?text=Restaurant"}
                          alt={svc.restaurant_name}
                          className="w-full h-full object-cover rounded-t-2xl"
                          onClick={() => navigateToDetail(svc.id)}
                        />
                        {svc.restaurant_rating && (
                          <span className="absolute top-3 right-3 bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full shadow flex items-center gap-1">
                            <FaStar className="text-yellow-500" />
                            {svc.restaurant_rating}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-lg text-gray-900 truncate">
                            {svc.restaurant_name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center mt-1 truncate">
                            <FaMapMarkerAlt className="mr-1 text-red-500 flex-shrink-0" />
                            {svc.city || svc.address || "—"}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            {Array(5).fill(0).map((_, idx) => (
                              <FaStar key={idx} className="text-yellow-400 w-3 h-3" />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {svc.contact_no && (
                            <a href={`tel:${svc.contact_no}`} className="flex-1 text-center bg-red-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 transition">
                              Call Now
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setSelectedService(svc);
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
                ))}
              </Slider>
            </section>
          );
        })}

        {/* ── Small Ads ────────────────────────────────────────────── */}
        {(slot1 || slot2) && (
          <section className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdBanner ad={slot1} />
              <AdBanner ad={slot2} />
            </div>
          </section>
        )}

        {/* ── Block Two ────────────────────────────────────────────── */}
        {blockTwo.map((category, idx) => {
          const subcategoryName = typeof category.subcategory === 'string'
            ? category.subcategory
            : category.subcategory?.subcategory_name || "Other";

          return (
            <section key={idx} className="py-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{subcategoryName}</h2>
                <button onClick={() => navigateToViewAll(subcategoryName)} className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1">View All <span>→</span></button>
              </div>
              <Slider {...cardSlider}>
                {category.services?.map((svc) => (
                  <div key={svc.id} className="p-3">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-xl transition-transform hover:-translate-y-1 cursor-pointer flex flex-col overflow-hidden">
                      <div className="relative w-full h-52">
                        <img src={svc.main_image || "https://placehold.co/400x300/ef4444/white?text=Restaurant"} alt={svc.restaurant_name} className="w-full h-full object-cover rounded-t-2xl" onClick={() => navigateToDetail(svc.id)} />
                        {svc.restaurant_rating && (
                          <span className="absolute top-3 right-3 bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full shadow flex items-center gap-1">
                            <FaStar className="text-yellow-500" />
                            {svc.restaurant_rating}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-lg text-gray-900 truncate">{svc.restaurant_name}</p>
                          <p className="text-sm text-gray-500 flex items-center mt-1 truncate"><FaMapMarkerAlt className="mr-1 text-red-500 flex-shrink-0" />{svc.city || svc.address || "—"}</p>
                          <div className="flex items-center gap-1 mt-2">{Array(5).fill(0).map((_, idx) => <FaStar key={idx} className="text-yellow-400 w-3 h-3" />)}</div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {svc.contact_no && <a href={`tel:${svc.contact_no}`} className="flex-1 text-center bg-red-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 transition">Call Now</a>}
                          <button onClick={() => { setSelectedService(svc); setShowInquiryModal(true); }} className="flex-1 text-center bg-amber-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-amber-600 transition">Inquiry</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </section>
          );
        })}

        {/* ── Big Ad ───────────────────────────────────────────────── */}
        {bigAd && (
          <section className="py-4">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img src={bigAd.image} alt="big-banner" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 p-5 md:p-8 flex flex-col gap-2">
                <h2 className="text-white font-bold leading-snug text-sm sm:text-lg md:text-2xl max-w-xs md:max-w-md">{bigAd.title}</h2>
                {bigAd.url && <a href={bigAd.url} target="_blank" rel="noopener noreferrer" className="inline-block bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm py-1 px-5 rounded shadow transition w-fit font-medium">Order Now</a>}
              </div>
            </div>
          </section>
        )}

        {/* ── Block Three ──────────────────────────────────────────── */}
        {blockThree.map((category, idx) => {
          const subcategoryName = typeof category.subcategory === 'string'
            ? category.subcategory
            : category.subcategory?.subcategory_name || "Other";

          return (
            <section key={idx} className="py-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{subcategoryName}</h2>
                <button onClick={() => navigateToViewAll(subcategoryName)} className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1">View All <span>→</span></button>
              </div>
              <Slider {...cardSlider}>
                {category.services?.map((svc) => (
                  <div key={svc.id} className="p-3">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow hover:shadow-xl transition-transform hover:-translate-y-1 cursor-pointer flex flex-col overflow-hidden">
                      <div className="relative w-full h-52">
                        <img src={svc.main_image || "https://placehold.co/400x300/ef4444/white?text=Restaurant"} alt={svc.restaurant_name} className="w-full h-full object-cover rounded-t-2xl" onClick={() => navigateToDetail(svc.id)} />
                        {svc.restaurant_rating && (
                          <span className="absolute top-3 right-3 bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full shadow flex items-center gap-1">
                            <FaStar className="text-yellow-500" />
                            {svc.restaurant_rating}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-lg text-gray-900 truncate">{svc.restaurant_name}</p>
                          <p className="text-sm text-gray-500 flex items-center mt-1 truncate"><FaMapMarkerAlt className="mr-1 text-red-500 flex-shrink-0" />{svc.city || svc.address || "—"}</p>
                          <div className="flex items-center gap-1 mt-2">{Array(5).fill(0).map((_, idx) => <FaStar key={idx} className="text-yellow-400 w-3 h-3" />)}</div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {svc.contact_no && <a href={`tel:${svc.contact_no}`} className="flex-1 text-center bg-red-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 transition">Call Now</a>}
                          <button onClick={() => { setSelectedService(svc); setShowInquiryModal(true); }} className="flex-1 text-center bg-amber-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-amber-600 transition">Inquiry</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </section>
          );
        })}


{/* ─── ✅ REVIEWS SECTION - PURANE REVIEWS KI JAGAH ─── */}
{serviceListForReviews.length > 0 && (
  <section className="py-12">
    <ServiceReviewsDisplay
      modelName="restaurantservice"
      title="What Our Diners Say"
      accentColor="red"
      detailPath="/restaurantdetail"
      serviceItems={serviceListForReviews}
      maxReviews={6}
      emptyMessage="No diner reviews yet"
    />
  </section>
)}
      </div>

      {/* ── Inquiry Modal ─────────────────────────────────────────── */}
      {showInquiryModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowInquiryModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-11/12 md:w-3/4 lg:w-1/2 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-red-600 text-white text-xl font-bold px-6 py-4 flex justify-between items-center">
              Inquiry Form
              <button onClick={() => setShowInquiryModal(false)} className="text-white text-2xl font-bold">&times;</button>
            </div>
            <div className="p-6">
              <RestaurantInquiryForm serviceData={selectedService} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inline Inquiry Form ──────────────────────────────────────────────────────
const RestaurantInquiryForm = ({ serviceData }) => {
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
        service_category: "restaurant",
        vendor: vendorId,
        service_id: serviceData?.id,
        service_name: serviceData?.restaurant_name,
        service_url: window.location.href,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        customer_city: form.city,
        inquiry_type: "general",
        subject: `Inquiry about ${serviceData?.restaurant_name}`,
        message: form.message,
      };
      const res = await publicAxios.post("/api/public/inquiries/", payload);
      if (res.status === 201) {
        setSuccessMsg("✅ Inquiry submitted! We'll contact you soon.");
        setForm({ name: "", phone: "", email: "", city: "", message: "" });
        setTimeout(() => setSuccessMsg(""), 5000);
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
      {successMsg && <div className="p-3 bg-green-100 text-green-700 rounded">{successMsg}</div>}
      {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>}
      {[
        { name: "name", placeholder: "Your Name*", required: true, type: "text" },
        { name: "phone", placeholder: "Phone Number*", required: true, type: "text" },
        { name: "email", placeholder: "Email (Optional)", required: false, type: "email" },
        { name: "city", placeholder: "City*", required: true, type: "text" },
      ].map((f) => (
        <input
          key={f.name}
          type={f.type}
          name={f.name}
          placeholder={f.placeholder}
          required={f.required}
          value={form[f.name]}
          onChange={handleChange}
          disabled={submitting}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-red-500 focus:border-red-500 outline-none"
        />
      ))}
      <textarea
        name="message"
        placeholder="Your message..."
        rows="3"
        value={form.message}
        onChange={handleChange}
        disabled={submitting}
        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-red-500 focus:border-red-500 outline-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className={`w-full ${submitting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"} text-white py-3 rounded-md font-bold transition`}
      >
        {submitting ? "Submitting..." : "Send Inquiry"}
      </button>
    </form>
  );
};