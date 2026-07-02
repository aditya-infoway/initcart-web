import React, { useEffect, useState } from "react";
import Slider from "react-slick";
// 🚨 IMPORTANT: Use useNavigate to enable actual routing 🚨
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import {
  FaUserCheck,
  FaCalendarAlt,
  FaCogs,
  FaQuoteLeft,
  FaStar,
  FaMapMarkerAlt,
  FaHome,
} from "react-icons/fa";
import { publicAxios } from "../api/axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MobileSaloonHome from "./mobile/MobileSaloonHome";
import ServiceReviewsDisplay from "./ServiceReviewsDisplay";

// ⚠️ IMPORTANT: Custom CSS is required to effectively hide the scrollbar for
// react-slick on certain configurations or browsers. Add the following to your
// main CSS file (e.g., index.css or global.css):
/*
.slider-scrollbar-hide .slick-list {
  overflow: hidden !important;
}
.slider-scrollbar-hide .slick-track {
  display: flex !important;
}
*/
// You also already use scrollbar-hide for the tabs, which typically requires a utility:
/*
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
*/

// Function name: SaloonBeautyHome
export default function SaloonBeautyHome() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Initialize the navigation hook
  const navigate = useNavigate();

  // 🎯 Single Redirection Function for all clicks
  const navigateToServiceList = () => {
    const params = new URLSearchParams();

    // ADD type=salon
    params.append("type", "salon");

    if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
    if (selectedCity) params.append("city", selectedCity);
    if (searchKeyword.trim() !== "") params.append("keyword", searchKeyword.trim());

    navigate(`/searchservice?${params.toString()}`);
  };

  const navigateToServiceDetail = (id, subcategory) => {
    navigate(`/salondetail/${id}`);
  };

  const navigateToViewAll = (subcategory) => {
    if (!subcategory) return;
    // ADD type=salon so ServiceList knows which API to call
    navigate(`/searchservice?subcategory=${encodeURIComponent(subcategory)}&type=salon`);
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
      // ✅ This setting ensures only 1 item shows on screens smaller than 480px.
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


  const fetchSubcategories = async () => {
    try {
      const response = await publicAxios.get("services/service-subcategory/");
      console.log("API data:", response.data);

      const gymSubs = response.data
        .filter(sub => sub.parent_service?.toLowerCase().trim() === "salon")
        .map(sub => sub.subcategory_name);

      console.log("Filtered Gym subcategories:", gymSubs);
      setSubcategories(gymSubs);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []); // ✅ only once on mount

  useEffect(() => {
    fetchSubcategoryServices();
  }, []);



  // Fetch all services and filter only saloon_service
  const fetchSubcategoryServices = async () => {
    try {
      const res = await publicAxios.get("/api/public/salon-services/");
      const servicesData = Array.isArray(res.data) ? res.data : res.data.results || res.data.data || [];

      const serviceList = servicesData.map(service => ({
        id: service.id,
        name: service.business_name || service.restaurant_name,
      }));
      setServiceListForReviews(serviceList);
      // Group by subcategory - travel agency ki tarah
      const grouped = Object.values(
        servicesData.reduce((acc, service) => {
          const subcat = service.subcategory_name || "Other";
          if (!acc[subcat]) {
            acc[subcat] = { subcategory: subcat, services: [] };
          }
          acc[subcat].services.push(service);
          return acc;
        }, {})
      );

      setSubcategoryData(grouped);
    } catch (err) {
      console.error("Subcategory Fetch Error:", err);
    }
  };

  // 📸 UPDATED Image content for Saloon/Beauty Parlour
  const serviceImages = [
    // 1. Haircut
    "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 2. Manicure/Nails
    "https://images.pexels.com/photos/3997387/pexels-photo-3997387.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 3. Facial/Skincare
    "https://images.pexels.com/photos/5993073/pexels-photo-5993073.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 4. Hair Colouring
    "https://images.pexels.com/photos/2281267/pexels-photo-2281267.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 5. Makeup
    "https://images.pexels.com/photos/1570779/pexels-photo-1570779.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 6. Hair Styling
    "https://images.pexels.com/photos/6146036/pexels-photo-6146036.jpeg?auto=compress&cs=tinysrgb&w=400",
  ];

  const treatmentImages = [
    // 1. Hair Spa/Wash
    "https://images.pexels.com/photos/3932738/pexels-photo-3932738.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 2. Pedicure
    "https://images.pexels.com/photos/3932731/pexels-photo-3932731.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 3. Massage/Spa
    "https://images.pexels.com/photos/3932759/pexels-photo-3932759.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 4. Waxing/Body Treatment
    "https://images.pexels.com/photos/6620958/pexels-photo-6620958.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 5. Threading
    "https://images.pexels.com/photos/5431189/pexels-photo-5431189.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 6. Bridal Makeup
    "https://images.pexels.com/photos/6147775/pexels-photo-6147775.jpeg?auto=compress&cs=tinysrgb&w=400",
  ];

  const productImages = [
    // 1. Hair Product Bottles
    "https://images.pexels.com/photos/4203102/pexels-photo-4203102.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 2. Skincare Bottles
    "https://images.pexels.com/photos/4132039/pexels-photo-4132039.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 3. Makeup items
    "https://images.pexels.com/photos/3373733/pexels-photo-3373733.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 4. Nail polishes
    "https://images.pexels.com/photos/4203173/pexels-photo-4203173.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 5. Combs/Tools
    "https://images.pexels.com/photos/3997382/pexels-photo-3997382.jpeg?auto=compress&cs=tinysrgb&w=400",
    // 6. Perfume/Aromatherapy
    "https://images.pexels.com/photos/4132038/pexels-photo-4132038.jpeg?auto=compress&cs=tinysrgb&w=400",
  ];

  // Category text is set to Saloon categories
  const searchCategories = [
    { label: "Men's" },
    { label: "Ladies" },
    { label: "Unisex" },
    { label: "Bridal" },
    { label: "Kids" },
  ];
  const [selectedCity, setSelectedCity] = React.useState("");
  const [showCities, setShowCities] = React.useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [cities, setCities] = useState([]);
  const [groupedSections, setGroupedSections] = useState({});
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
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
        const cityData = Array.isArray(res.data.cities) ? res.data.cities : [];

        // Filter cities by gym_service type
        const gymCities = cityData.filter(city => city.type === "saloon_service");

        // ✅ Filter cities that have the selected subcategory
        const filteredCities = selectedSubcategory
          ? gymCities.filter(city =>
            city.subcategories?.some(
              sub => sub.name.toLowerCase() === selectedSubcategory.toLowerCase()
            )
          )
          : gymCities;

        setCities(filteredCities);
        setSelectedCity(""); // Reset selected city whenever subcategory changes
      } catch (error) {
        console.log("City Fetch Error:", error);
      }
    };

    getCities();
  }, [selectedSubcategory]); // 🔑 run whenever selected subcategory changes



  const [bigAd, setBigAd] = useState(null);

  // --- Fetch Big Ad API ---
  useEffect(() => {
    publicAxios
      .get("api/init-saloon-bigad/")
      .then((res) => {
        setBigAd(res.data);
      })
      .catch((err) => console.error("Error fetching big ad:", err));
  }, []);

  const [ads, setAds] = useState([]);
  useEffect(() => {
    publicAxios
      .get("api/init-saloon-smallads/")
      .then((res) => setAds(res.data))
      .catch((err) => console.error("Error fetching small ads:", err));
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Slot 1 and Slot 2
  const slot1 = ads.find((ad) => ad.slot === 1);
  const slot2 = ads.find((ad) => ad.slot === 2);

  const groupedData = Object.values(
    subcategoryData.reduce((acc, service) => {
      const subcat = service.subcategory_name;

      if (!acc[subcat]) {
        acc[subcat] = {
          subcategory: subcat,
          services: [],
        };
      }

      acc[subcat].services.push(service);
      return acc;
    }, {})
  );

  const blockOne = subcategoryData.slice(0, 2);
  const blockTwo = subcategoryData.slice(2, 4);
  const blockThree = subcategoryData.slice(4);
  if (isMobile) {
    return <MobileSaloonHome />;
  }
  const renderServiceBlock = (block = []) => {
    if (!Array.isArray(block)) return null;

    return block.map((category, index) => (
      <section key={index} className="py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold mb-6">{category.subcategory}</h2>
          <button
            onClick={() => navigateToViewAll(category.subcategory)}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            View All <span className="ml-1">→</span>
          </button>
        </div>

        <Slider {...categorySlider}>
          {category.services?.map((service) => (
            <div key={service.id} className="p-3">
              {/* Card */}
              <div className="bg-white border-2 border-blue-500 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 cursor-pointer w-full flex flex-col overflow-hidden">

                {/* Image */}
                <div className="relative w-full h-56 md:h-64 lg:h-72">
                  <img
                    src={service.main_image}
                    alt={service.business_name}
                    className="w-full h-full object-cover rounded-t-2xl"
                    onClick={() => navigateToServiceDetail(service.id, service.subcategory)}
                  />
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Business Name */}
                    <p className="text-gray-900 font-bold text-lg md:text-xl truncate">
                      {service.business_name}
                    </p>

                    {/* Location */}
                    <p className="text-gray-500 text-sm md:text-base flex items-center mt-1 truncate">
                      <FaMapMarkerAlt className="mr-2 text-red-600 flex-shrink-0" />
                      <span>{service.address}</span>
                    </p>

                    {/* Add space before rating */}
                    <div className="mt-2 flex items-center gap-1">
                      <div className="flex items-center gap-2">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <FaStar key={i} className="text-yellow-500" />
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-4">
                    {service.contact_no && (
                      <a
                        href={`tel:${service.contact_no}`}
                        className="flex-1 text-center bg-orange-500 text-white font-medium py-2 rounded-md hover:bg-orange-600 transition"
                      >
                        Call Now
                      </a>
                    )}
                    <button
                      onClick={() => openInquiryModal(service)}
                      className="flex-1 text-center bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition"
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
    ));
  };


  return (
    <div className="bg-gray-50">
      {/* 🎯 Hero Banner */}
      <section className="relative w-full h-[540px]">
        <img
          // ⭐ UPDATED MAIN BANNER IMAGE (Stylish saloon interior)
          src="https://img.freepik.com/free-vector/beauty-saloon-banner-template_23-2148936322.jpg"
          alt="saloon-banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Search Box with Categories above it */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          {/* Title */}
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-snug">
            Find the Best Salons and Beauty Services Near You
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm md:text-base mb-6 max-w-[90%] sm:max-w-[80%]">
            <span className="font-semibold">200+</span> verified salons and{" "}
            <span className="font-semibold">150+</span> beauty professionals to help you look and feel your best!
          </p>

          {/* Tabs - Uses scrollbar-hide to prevent horizontal scrollbar */}
          <div className="bg-[#00000080] text-white rounded-2xl flex items-center justify-start sm:justify-center gap-4 sm:gap-6 px-4 py-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] overflow-x-auto scrollbar-hide min-h-[40px]">
            {subcategories.length === 0 && <p className="text-white">Loading...</p>}
            {subcategories.map((tab, idx) => (
              <button
                key={idx}
                className={`flex-shrink-0 pb-1 px-2 text-xs sm:text-sm md:text-base font-semibold border-b-2 ${selectedSubcategory === tab
                  ? "border-white text-white"
                  : "border-transparent text-gray-300 hover:text-white hover:border-white"
                  } transition`}
                onClick={() => {
                  setSelectedSubcategory(tab);  // ✅ store selected subcategory
                  setSelectedCity("");           // Reset city when subcategory changes
                  setShowCities(false);          // Close dropdown
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div
            className="relative bg-white shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] p-2 mt-[-1px]
  rounded-b-sm sm:rounded-full"
          >
            {/* City Dropdown */}
            <div className="relative sm:w-40 w-full sm:border-r border-b sm:border-b-0">
              <button
                onClick={() => setShowCities((prev) => !prev)}
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
                <div className="absolute top-full left-0 mt-1 w-full bg-white shadow-lg rounded-lg z-30">
                  {cities.map(city => (
                    <div
                      key={city.id}
                      className="px-4 py-2 text-left hover:bg-gray-100 cursor-pointer text-gray-700"
                      onClick={() => {
                        setSelectedCity(city.name);
                        setShowCities(false);

                        // ✅ Only navigate if subcategory is selected
                        // if (selectedSubcategory) {
                        //   navigateToServiceList(selectedSubcategory);
                        // }
                      }}
                    >
                      {city.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search for gym, trainer, or fitness center"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 outline-none border border-gray-200 rounded-md sm:border-none sm:rounded-none"
              />
            </div>
            <button
              onClick={navigateToServiceList}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md sm:rounded-full font-semibold flex items-center justify-center transition w-full sm:w-auto"
            >
              Search
            </button>
          </div>
        </div>

      </section>

      {/* 💇 Our Services (Saloon Features) */}
      <section className="relative z-20 -mt-16">
        <div className="relative bg-blue-50 rounded-tl-[80px] rounded-tr-[80px] py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <FaUserCheck className="text-4xl text-blue-600" />,
                  title: "Certified Stylists",
                  text: "Consult with highly qualified and experienced beauty professionals.",
                  bg: "bg-white",
                },
                {
                  icon: <FaCalendarAlt className="text-4xl text-green-600" />,
                  title: "Flexible Bookings",
                  text: "Morning, afternoon, or night—book an appointment that fits your schedule.",
                  bg: "bg-white",
                },
                {
                  icon: <FaCogs className="text-4xl text-pink-600" />,
                  title: "Top-Tier Products",
                  text: "We use the latest and best professional-grade beauty products.",
                  bg: "bg-white",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  // 🎯 Redirection applied
                  onClick={navigateToServiceList}
                  className={`${item.bg} rounded-xl shadow-lg p-8 text-center hover:scale-105 transition cursor-pointer`}
                >
                  <div className="mb-4 flex justify-center">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-full h-16"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path
              d="M0,0 C300,120 900,120 1200,0 L1200,120 L0,120 Z"
              fill="#bfdbfe"
            ></path>
          </svg>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* 💅 Popular Saloon Services (Slider) */}
        {/* <section className="py-10 **slider-scrollbar-hide**">
          <h2 className="text-2xl font-semibold mb-4">Popular Saloon Services</h2>
          <Slider {...categorySlider}>
            {serviceImages.map((img, id) => (
              <div key={id} className="p-2">
                <div
                  className="bg-white shadow rounded-lg hover:shadow-lg transition cursor-pointer"
                  // 🎯 Redirection applied
                  onClick={navigateToServiceList}
                >
                  <img
                    src={img}
                    alt={`service ${id + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="font-semibold">Signature Haircut {id + 1}</p>
                    <p className="text-sm text-gray-500">
                      ₹{(id + 1) * 500}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section> */}
        {renderServiceBlock(blockOne)}
        {/* ✨ Specialized Beauty Treatments (Slider) */}
        {/* <section className="py-10 **slider-scrollbar-hide**">
          <h2 className="text-2xl font-semibold mb-4">Specialized Beauty Treatments</h2>
          <Slider {...categorySlider}>
            {treatmentImages.map((img, id) => (
              <div key={id} className="p-2">
                <div
                  className="bg-white shadow rounded-lg hover:shadow-lg transition cursor-pointer"
                  // 🎯 Redirection applied
                  onClick={navigateToServiceList}
                >
                  <img
                    src={img}
                    alt={`treatment ${id + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="font-semibold">Luxury Facial & Spa {id + 1}</p>
                    <p className="text-sm text-gray-500">
                      ₹{(id + 1) * 1500}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section> */}

        {/* 📢 Two Marketing Banners */}
        <section className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Slot 1 */}
            {slot1 && (
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img
                  src={slot1.image}
                  alt={slot1.title || "banner1"}
                  className="w-full h-full object-cover"
                />

                {(slot1.title || slot1.url) && (
                  <div className="absolute bottom-0 left-0 
                          p-3 sm:p-4 md:p-5 
                          flex flex-col gap-1.5">

                    {/* Title — 30% width */}
                    {slot1.title && (
                      <h3 className="text-white font-semibold leading-snug
                text-sm sm:text-base md:text-lg
                max-w-[60%] lg:max-w-[270px]">
                        {slot1.title}
                      </h3>
                    )}

                    {/* Button */}
                    {slot1.url && (
                      <a
                        href={slot1.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-center rounded transition
                  bg-orange-500 hover:bg-orange-600 text-white
                  
                  w-20 sm:w-24
                  text-xs sm:text-sm
                  py-1"
                      >
                        Shop Now
                      </a>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* Slot 2 */}
            {slot2 && (
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img
                  src={slot2.image}
                  alt={slot2.title || "banner2"}
                  className="w-full h-full object-cover"
                />

                {(slot2.title || slot2.url) && (
                  <div className="absolute bottom-0 left-0 
                          p-3 sm:p-4 md:p-5 
                          flex flex-col gap-1.5">

                    {slot2.title && (
                      <h3 className="text-white font-semibold leading-snug
                text-sm sm:text-base md:text-lg
                max-w-[60%] lg:max-w-[270px]">
                        {slot2.title}
                      </h3>
                    )}

                    {slot2.url && (
                      <a
                        href={slot2.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-center rounded transition
                  bg-orange-500 hover:bg-orange-600 text-white
                  
                  w-20 sm:w-24
                  text-xs sm:text-sm
                  py-1"
                      >
                        Shop Now
                      </a>
                    )}

                  </div>
                )}
              </div>
            )}

          </div>
        </section>
        {renderServiceBlock(blockTwo)}
        {/* 🛍️ Top-Selling Products (Slider) */}
        {/* <section className="py-10 **slider-scrollbar-hide**">
          <h2 className="text-2xl font-semibold mb-4">Top-Selling Products</h2>
          <Slider {...categorySlider}>
            {productImages.map((img, id) => (
              <div key={id} className="p-2">
                <div
                  className="bg-white shadow rounded-lg hover:shadow-lg transition cursor-pointer"
                  // 🎯 Redirection applied
                  onClick={navigateToServiceList}
                >
                  <img
                    src={img}
                    alt={`product ${id + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="font-semibold">Premium Hair Serum {id + 1}</p>
                    <p className="text-sm text-gray-500">
                      ₹{(id + 1) * 800}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section> */}

        {/* 📢 Fullwidth Marketing Banner */}
        {bigAd && (
          <section className="py-4">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img
                src={bigAd.image}
                alt="big-banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 
                      p-3 sm:p-5 md:p-8 lg:p-10 
                      flex flex-col gap-2">
                <h2 className="text-white font-bold leading-snug
          text-sm sm:text-base md:text-lg lg:text-2xl
          max-w-[85%] md:max-w-[400px] lg:max-w-[443px]">{bigAd.title}</h2>

                {/* ✅ Shop Now Button (smaller width) */}
                {bigAd.url && (
                  <a
                    href={bigAd.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-center rounded shadow transition
              bg-orange-500 hover:bg-orange-600 text-white w-20 sm:w-24 lg:w-28 py-1 sm:py-2 
              text-xs sm:text-sm lg:text-base font-medium"
                  >
                    Shop Now
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
        {renderServiceBlock(blockThree)}
        {/* ⭐ Reviews Section */}
{serviceListForReviews.length > 0 && (
  <section className="py-12">
    <ServiceReviewsDisplay
      modelName="saloonservice"
      title="What Our Clients Say"
      accentColor="pink"
      detailPath="/salondetail"
      serviceItems={serviceListForReviews}
      maxReviews={6}
      emptyMessage="No client reviews yet"
    />
  </section>
)}
      </div>
      {showInquiryModal && selectedService && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeInquiryModal} // close if click outside
        >
          <div
            className="bg-white rounded-xl shadow-xl w-11/12 md:w-3/4 lg:w-1/2 overflow-hidden"
            onClick={(e) => e.stopPropagation()} // prevent modal close on inner click
          >
            <div className="bg-blue-600 text-white text-xl font-bold px-6 py-4 flex justify-between items-center">
              Inquiry Form
              <button className="text-white font-bold text-2xl" onClick={closeInquiryModal}>
                &times;
              </button>
            </div>

            <div className="p-6">
              <InquiryForm
                serviceData={selectedService}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    const category = serviceData?.category || serviceData?.service_category || "salon";

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
        sservice_url: window.location.href,
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