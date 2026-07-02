// // RealEstateHome.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { publicAxios } from "../api/axios";
// import Slider from "react-slick";
// import { FiSearch } from "react-icons/fi";
// import {
//     FaShieldAlt,
//     FaHandshake,
//     FaMapMarkedAlt,
//     FaQuoteLeft,
//     FaStar,
//     FaRulerCombined,
//     FaMapMarkerAlt,
//     FaBuilding
// } from "react-icons/fa";
// import { MdVerified, MdMeetingRoom } from "react-icons/md";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// export default function RealEstateHome() {
//     const navigate = useNavigate();
//     const [featuredProperties, setFeaturedProperties] = useState([]);
//     const [recentProperties, setRecentProperties] = useState([]);
//     const [tabFilteredProperties, setTabFilteredProperties] = useState([]); // ✅ ADD THIS
//     const [searchFilters, setSearchFilters] = useState({
//         cities: [],
//         property_types: [],
//         transaction_types: [],
//         price_range: { min: 0, max: 0 },
//         area_range: { min: 0, max: 0 }
//     });
//     const [loading, setLoading] = useState(true);
//     const [searchParams, setSearchParams] = useState({
//         city: "",
//         property_type: "",
//         transaction_type: "",
//         min_price: "",
//         max_price: "",
//         search: ""
//     });
//     const [selectedTab, setSelectedTab] = useState("ALL");
//     const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
//     const [tabLoading, setTabLoading] = useState(false); // ✅ ADD THIS

//     useEffect(() => {
//         fetchHomePageData();
//         fetchPropertyTypes();
//     }, []);

//     const fetchHomePageData = async () => {
//         try {
//             setLoading(true);
//             setTabFilteredProperties([]); // ✅ RESET TAB FILTERS

//             // Fetch featured properties
//             const featuredResponse = await publicAxios.get('/api/services/real-estate/public/featured/');
//             setFeaturedProperties(featuredResponse.data || []);

//             // Fetch recent properties
//             const recentResponse = await publicAxios.get('/api/services/real-estate/public/recent/');
//             setRecentProperties(recentResponse.data || []);
//             setTabFilteredProperties(recentResponse.data || []); // ✅ SET INITIAL TAB FILTERS

//             // Fetch search filters
//             const filtersResponse = await publicAxios.get('/api/services/real-estate/public/search_filters/');
//             if (filtersResponse.data) {
//                 setSearchFilters(filtersResponse.data);
//             }

//         } catch (error) {
//             console.error("Error fetching data:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchPropertyTypes = async () => {
//         try {
//             // Fetch dynamic property types from API
//             const response = await publicAxios.get('/api/services/real-estate/public/property_types/');
//             if (response.data && Array.isArray(response.data)) {
//                 setPropertyTypeOptions(response.data);
//             }
//         } catch (error) {
//             console.error("Error fetching property types:", error);
//             // Fallback to default types if API fails
//             const defaultTypes = [
//                 { value: 'apartment', label: 'Apartment' },
//                 { value: 'house', label: 'House' },
//                 { value: 'villa', label: 'Villa' },
//                 { value: 'commercial', label: 'Commercial' },
//                 { value: 'pg_coliving', label: 'PG/Co-living' },
//                 { value: 'plots', label: 'Plots' },
//             ];
//             setPropertyTypeOptions(defaultTypes);
//         }
//     };

//     // ✅ UPDATE: Tab click handler - filter locally
//     const handleTabClick = async (tab) => {
//         setSelectedTab(tab);
//         setTabLoading(true);

//         if (tab === "ALL") {
//             setTabFilteredProperties(recentProperties);
//             setSearchParams(prev => ({
//                 ...prev,
//                 property_type: ""
//             }));
//             setTabLoading(false);
//             return;
//         }

//         // Find the property type value for this tab
//         const propertyTypeOption = propertyTypeOptions.find(
//             option => option.label.toUpperCase() === tab
//         );

//         if (propertyTypeOption) {
//             const propertyTypeValue = propertyTypeOption.value;
//             setSearchParams(prev => ({
//                 ...prev,
//                 property_type: propertyTypeValue
//             }));

//             // Filter properties locally
//             const filtered = recentProperties.filter(prop => 
//                 prop.property_type === propertyTypeValue
//             );
//             setTabFilteredProperties(filtered);
//         } else {
//             // If no match, show all
//             setTabFilteredProperties(recentProperties);
//         }

//         setTabLoading(false);
//     };

//     // ✅ UPDATE: Search function - navigate to ServiceList page
//     const handleSearch = () => {
//         try {
//             const params = {};
//             if (searchParams.city) params.city = searchParams.city;
//             if (searchParams.property_type) params.property_type = searchParams.property_type;
//             if (searchParams.search) params.search = searchParams.search;

//             // Navigate to servicelist with filters
//             navigate(`/servicelist?${new URLSearchParams(params).toString()}`);
//         } catch (error) {
//             console.error("Search error:", error);
//         }
//     };

//     const redirectToRealEstate = () => {
//         navigate("/servicelist");
//     };

//     // Function to handle property click
//     const handlePropertyClick = (property) => {
//         if (property.id) {
//             navigate(`/realestate/${property.id}`);
//         } else {
//             redirectToRealEstate();
//         }
//     };

//     const formatPrice = (price) => {
//         if (!price) return "₹0";
//         if (price >= 10000000) {
//             return `₹${(price / 10000000).toFixed(2)} Cr`;
//         } else if (price >= 100000) {
//             return `₹${(price / 100000).toFixed(2)} Lakh`;
//         }
//         return `₹${price.toLocaleString()}`;
//     };

//     const getTransactionType = (type) => {
//         switch (type) {
//             case 'sale': return 'For Sale';
//             case 'rent': return 'For Rent';
//             case 'lease': return 'For Lease';
//             default: return type;
//         }
//     };

//     const getPropertyTypeTabs = () => {
//         const baseTabs = ["ALL"];

//         if (propertyTypeOptions.length > 0) {
//             const propertyTypeTabs = propertyTypeOptions.map(option =>
//                 option.label.toUpperCase()
//             );

//             return [...baseTabs, ...propertyTypeTabs];
//         }

//         // Fallback to default tabs if no dynamic types
//         return ["ALL", "APARTMENTS", "HOUSES", "VILLAS", "COMMERCIAL", "PG/CO-LIVING", "PLOTS"];
//     };

//     const getRentalProperties = () => {
//         return recentProperties.filter(prop => prop.transaction_type === 'rent');
//     };

//     const getCommercialProperties = () => {
//         return recentProperties.filter(prop => prop.property_type === 'commercial');
//     };

//     const cities = React.useMemo(() => {
//         if (!searchFilters.cities) return [];

//         const normalized = searchFilters.cities
//             .map(city =>
//                 city
//                     ?.trim()
//                     .toLowerCase()
//             )
//             .filter(Boolean);

//         return [...new Set(normalized)]
//             .map(city => city.charAt(0).toUpperCase() + city.slice(1))
//             .sort();
//     }, [searchFilters.cities]);

//     const categorySlider = {
//         dots: false,
//         infinite: true,
//         autoplay: true,
//         autoplaySpeed: 3000,
//         speed: 500,
//         slidesToShow: 4,
//         slidesToScroll: 1,
//         responsive: [
//             { breakpoint: 1024, settings: { slidesToShow: 3 } },
//             { breakpoint: 768, settings: { slidesToShow: 2 } },
//             { breakpoint: 480, settings: { slidesToShow: 1 } },
//         ],
//     };

//     const reviewSlider = {
//         dots: true,
//         infinite: true,
//         autoplay: true,
//         autoplaySpeed: 4000,
//         speed: 500,
//         slidesToShow: 2,
//         slidesToScroll: 1,
//         responsive: [
//             { breakpoint: 1024, settings: { slidesToShow: 1 } },
//         ],
//     };

//     const propertyTypeTabs = getPropertyTypeTabs();

//     // Property Card Component
//     const PropertyCard = ({ property }) => {
//         return (
//             <div className="p-2">
//                 <div
//                     onClick={() => handlePropertyClick(property)}
//                     className="bg-white rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition"
//                 >
//                     {/* IMAGE */}
//                     <div className="relative h-44 w-full">
//                         <img
//                             src={
//                                 property.main_image ||
//                                 property.thumbnail_image ||
//                                 "https://placehold.co/400x300"
//                             }
//                             alt={property.title}
//                             className="w-full h-full object-cover"
//                         />

//                         {/* TOP BADGES */}
//                         <div className="absolute top-2 left-2 flex flex-col gap-1">
//                             <span className={`${property.transaction_type === "rent"
//                                     ? "bg-green-500"
//                                     : property.transaction_type === "sale"
//                                         ? "bg-blue-500"
//                                         : "bg-purple-500"
//                                 } text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1`}>
//                                 <MdVerified />
//                                 {getTransactionType(property.transaction_type)}
//                             </span>
//                         </div>
//                     </div>

//                     {/* CONTENT */}
//                     <div className="px-3 py-3 space-y-1">
//                         {/* TITLE */}
//                         <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
//                             {property.title}
//                         </h3>

//                         {/* PRICE */}
//                         <p className="flex items-center gap-1 text-xs text-gray-600">
//                             {formatPrice(property.price)}
//                         </p>

//                         {/* CITY */}
//                         <div className="flex items-center gap-1 text-xs text-gray-500">
//                             <FaMapMarkerAlt className="text-xs" />
//                             <span>{property.city}</span>
//                         </div>

//                         {/* BOTTOM INFO */}
//                         <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
//                             <div className="flex items-center gap-1">
//                                 <MdMeetingRoom />
//                                 <span>
//                                     {property.bedrooms
//                                         ? `${property.bedrooms} BHK`
//                                         : "—"}
//                                 </span>
//                             </div>

//                             <div className="flex items-center gap-1">
//                                 <FaRulerCombined />
//                                 <span>
//                                     {property.total_area_size
//                                         ? `${property.total_area_size} Sq.Ft`
//                                         : "—"}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="bg-gray-50">
//             {/* Hero Banner */}
//             <section className="relative w-full h-[540px]">
//                 <img
//                     src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1600"
//                     alt="banner"
//                     className="w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 bg-black/40"></div>

//                 {/* Search Box with Categories above it */}
//                 <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
//                     <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-snug">
//                         Find the Best Properties and Real Estate Services Near You
//                     </h2>
//                     <p className="text-blue-100 text-xs sm:text-sm md:text-base mb-6 max-w-[90%] sm:max-w-[80%]">
//                         <span className="font-semibold">500+</span> verified properties and{" "}
//                         <span className="font-semibold">300+</span> real estate services to help you buy, sell, or rent your dream home!
//                     </p>

//                     {/* Tabs - Dynamic Property Types */}
//                     <div className="bg-[#00000080] text-white rounded-2xl flex items-center justify-start sm:justify-center gap-4 sm:gap-6 px-4 py-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] overflow-x-auto scrollbar-hide">
//                         {propertyTypeTabs.map((tab, idx) => (
//                             <button
//                                 key={idx}
//                                 onClick={() => handleTabClick(tab)}
//                                 className={`flex-shrink-0 pb-1 text-xs sm:text-sm md:text-base font-semibold border-b-2 ${selectedTab === tab
//                                         ? "border-white text-white"
//                                         : "border-transparent text-gray-300 hover:text-white hover:border-white"
//                                     } transition`}
//                             >
//                                 {tab}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Search Bar - SIRF CITY AUR SEARCH INPUT */}
//                     <div className="relative bg-white shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] p-2 mt-4 rounded-b-sm sm:rounded-full">

//                         {/* City Dropdown ONLY */}
//                         <div className="relative sm:w-40 w-full sm:border-r border-b sm:border-b-0">
//                             <select
//                                 value={searchParams.city}
//                                 onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
//                                 className="w-full px-4 py-2 text-gray-800 font-medium outline-none bg-white"
//                             >
//                                 <option value="">Select City</option>
//                                 {cities.map((city, index) => (
//                                     <option key={index} value={city}>{city}</option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Search Input ONLY */}
//                         <div className="flex-1 w-full">
//                             <input
//                                 type="text"
//                                 placeholder="Search for property, house, or apartment"
//                                 value={searchParams.search}
//                                 onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
//                                 className="w-full px-4 py-2 text-gray-700 outline-none border border-gray-200 rounded-md sm:border-none sm:rounded-none"
//                             />
//                         </div>

//                         {/* Search Button */}
//                         <button
//                             onClick={handleSearch}
//                             className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md sm:rounded-full font-semibold flex items-center justify-center transition w-full sm:w-auto"
//                         >
//                             <FiSearch className="h-5 w-5 mr-2 sm:hidden" /> Search
//                         </button>
//                     </div>
//                 </div>
//             </section>

//             {/* Feature Grid */}
//             <section className="relative z-20 -mt-16">
//                 <div className="relative bg-blue-50 rounded-tl-[80px] rounded-tr-[80px] py-16">
//                     <div className="max-w-6xl mx-auto px-4">
//                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                             {[
//                                 {
//                                     icon: <FaShieldAlt className="text-4xl text-blue-600" />,
//                                     title: "Verified Listings",
//                                     text: "Every property is verified for authenticity.",
//                                     bg: "bg-white",
//                                 },
//                                 {
//                                     icon: <FaHandshake className="text-4xl text-green-600" />,
//                                     title: "Easy Financing",
//                                     text: "Get loan assistance with trusted banks.",
//                                     bg: "bg-white",
//                                 },
//                                 {
//                                     icon: <FaMapMarkedAlt className="text-4xl text-pink-600" />,
//                                     title: "Prime Locations",
//                                     text: "Homes in prime locations across cities.",
//                                     bg: "bg-white",
//                                 },
//                             ].map((item, i) => (
//                                 <div
//                                     key={i}
//                                     className={`${item.bg} rounded-xl shadow-lg p-8 text-center hover:scale-105 transition cursor-pointer`}
//                                     onClick={redirectToRealEstate}
//                                 >
//                                     <div className="mb-4 flex justify-center">{item.icon}</div>
//                                     <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
//                                     <p className="text-sm text-gray-700">{item.text}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-[0]">
//                     <svg
//                         className="relative block w-full h-16"
//                         xmlns="http://www.w3.org/2000/svg"
//                         preserveAspectRatio="none"
//                         viewBox="0 0 1200 120"
//                     >
//                         <path
//                             d="M0,0 C300,120 900,120 1200,0 L1200,120 L0,120 Z"
//                             fill="#bfdbfe"
//                         ></path>
//                     </svg>
//                 </div>
//             </section>

//             <div className="max-w-6xl mx-auto px-4">
//                 {/* ✅ UPDATE: Recent Properties by Selected Tab - LOCAL FILTER */}
//                 <section className="py-10">
//                     <div className="flex items-center justify-between mb-6">
//                         <h2 className="text-3xl font-bold text-gray-800">
//                             {selectedTab === "ALL" ? "Recent Properties" : `${selectedTab} Properties`}
//                         </h2>
//                         <button
//                             onClick={redirectToRealEstate}
//                             className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
//                         >
//                             View All <span className="ml-1">→</span>
//                         </button>
//                     </div>

//                     {tabLoading ? (
//                         <div className="text-center py-8">
//                             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
//                             <p className="mt-2 text-gray-600">Loading {selectedTab.toLowerCase()} properties...</p>
//                         </div>
//                     ) : tabFilteredProperties.length === 0 ? (
//                         <div className="text-center py-8 bg-white rounded-lg shadow">
//                             <p className="text-gray-500">No properties available for {selectedTab.toLowerCase()}</p>
//                         </div>
//                     ) : (
//                         <Slider {...categorySlider}>
//                             {tabFilteredProperties.slice(0, 6).map((property, index) => (
//                                 <PropertyCard
//                                     key={`${selectedTab}-${property.id || index}`}
//                                     property={property}
//                                 />
//                             ))}
//                         </Slider>
//                     )}
//                 </section>

//                 {/* Rental Properties */}
//                 <section className="py-10">
//                     <div className="flex items-center justify-between mb-6">
//                         <h2 className="text-3xl font-bold text-gray-800">Properties for Rent</h2>
//                     </div>
//                     {loading ? (
//                         <div className="text-center py-8">
//                             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
//                             <p className="mt-2 text-gray-600">Loading rental properties...</p>
//                         </div>
//                     ) : getRentalProperties().length === 0 ? (
//                         <div className="text-center py-8 bg-white rounded-lg shadow">
//                             <p className="text-gray-500">No rental properties available</p>
//                         </div>
//                     ) : (
//                         <Slider {...categorySlider}>
//                             {getRentalProperties().slice(0, 6).map((property, index) => (
//                                 <PropertyCard
//                                     key={`rental-${property.id || index}`}
//                                     property={property}
//                                 />
//                             ))}
//                         </Slider>
//                     )}
//                 </section>

//                 {/* Two Marketing Banners */}
//                 <section className="py-12">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="relative h-[280px] rounded-xl overflow-hidden shadow-lg">
//                             <img
//                                 src="https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1600"
//                                 alt="banner1"
//                                 className="w-full h-full object-cover"
//                             />
//                             <div className="absolute inset-0 bg-black/40 flex items-center p-6">
//                                 <div className="text-white max-w-sm">
//                                     <h2 className="text-2xl font-bold mb-3">Find Your Dream Home</h2>
//                                     <button
//                                         className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 transition"
//                                         onClick={redirectToRealEstate}
//                                     >
//                                         Explore Properties
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="relative h-[280px] rounded-xl overflow-hidden shadow-lg">
//                             <img
//                                 src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1600"
//                                 alt="banner2"
//                                 className="w-full h-full object-cover"
//                             />
//                             <div className="absolute inset-0 bg-black/40 flex items-center justify-end p-6">
//                                 <div className="text-right text-white max-w-sm">
//                                     <h2 className="text-2xl font-bold mb-3">Luxury Villas</h2>
//                                     <button
//                                         className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 transition"
//                                         onClick={() => {
//                                             const villaOption = propertyTypeOptions.find(
//                                                 opt => opt.label.toLowerCase() === 'villa'
//                                             );
//                                             if (villaOption) {
//                                                 setSelectedTab(villaOption.label.toUpperCase());
//                                                 // Filter locally
//                                                 const filtered = recentProperties.filter(prop => 
//                                                     prop.property_type === villaOption.value
//                                                 );
//                                                 setTabFilteredProperties(filtered);
//                                             }
//                                         }}
//                                     >
//                                         Discover Villas
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Commercial Properties */}
//                 <section className="py-10">
//                     <div className="flex items-center justify-between mb-6">
//                         <h2 className="text-3xl font-bold text-gray-800">Commercial Properties</h2>
//                     </div>
//                     {loading ? (
//                         <div className="text-center py-8">
//                             <p className="text-gray-500">Loading commercial properties...</p>
//                         </div>
//                     ) : getCommercialProperties().length === 0 ? (
//                         <div className="text-center py-8 bg-white rounded-lg shadow">
//                             <p className="text-gray-500">No commercial properties available</p>
//                         </div>
//                     ) : (
//                         <Slider {...categorySlider}>
//                             {getCommercialProperties().slice(0, 6).map((property, index) => (
//                                 <PropertyCard
//                                     key={`commercial-${property.id || index}`}
//                                     property={property}
//                                 />
//                             ))}
//                         </Slider>
//                     )}
//                 </section>

//                 {/* Fullwidth Marketing Banner */}
//                 <section className="py-12">
//                     <div className="relative h-[300px] rounded-xl overflow-hidden shadow-lg">
//                         <img
//                             src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600"
//                             alt="big-banner"
//                             className="w-full h-full object-cover"
//                         />
//                         <div className="absolute inset-0 bg-black/40 flex items-center justify-end p-10">
//                             <div className="text-right text-white max-w-md">
//                                 <h2 className="text-3xl font-bold mb-4">Your Future Office Awaits</h2>
//                                 <p className="mb-4">Book premium commercial properties at prime locations.</p>
//                                 <button
//                                     className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition"
//                                     onClick={() => {
//                                         const commercialOption = propertyTypeOptions.find(
//                                             opt => opt.label.toLowerCase() === 'commercial'
//                                         );
//                                         if (commercialOption) {
//                                             setSelectedTab(commercialOption.label.toUpperCase());
//                                             // Filter locally
//                                             const filtered = recentProperties.filter(prop => 
//                                                 prop.property_type === commercialOption.value
//                                             );
//                                             setTabFilteredProperties(filtered);
//                                         }
//                                     }}
//                                 >
//                                     Get Started
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Reviews Section */}
//                 <section className="py-12">
//                     <h2 className="text-2xl font-semibold mb-6">What Our Clients Say</h2>
//                     <div className="overflow-hidden">
//                         <Slider {...reviewSlider}>
//                             {[
//                                 {
//                                     id: 1,
//                                     name: "Rajesh Sharma",
//                                     review: "Amazing experience! I found my dream house in just a week through this platform.",
//                                     rating: 5
//                                 },
//                                 {
//                                     id: 2,
//                                     name: "Priya Patel",
//                                     review: "The verification process gave me confidence in my purchase. Highly recommended!",
//                                     rating: 5
//                                 },
//                                 {
//                                     id: 3,
//                                     name: "Amit Verma",
//                                     review: "Professional service and genuine properties. Saved me months of searching.",
//                                     rating: 4
//                                 }
//                             ].map((review) => (
//                                 <div key={review.id} className="p-4">
//                                     <div className="bg-purple-100 p-6 rounded-lg shadow hover:shadow-lg transition h-full">
//                                         <FaQuoteLeft className="text-blue-600 text-3xl mb-3" />
//                                         <p className="text-gray-700 mb-4 italic">"{review.review}"</p>
//                                         <div className="flex items-center gap-2 mb-3">
//                                             {Array(review.rating).fill(0).map((_, i) => (
//                                                 <FaStar key={i} className="text-yellow-500" />
//                                             ))}
//                                         </div>
//                                         <p className="mt-2 font-semibold text-gray-800">{review.name}</p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </Slider>
//                     </div>
//                 </section>
//             </div>
//         </div>
//     );
// }

// RealEstateHome.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../api/axios";
import axiosInstance from "../api/axios"; // adjust path as needed
import Slider from "react-slick";
import { FiSearch } from "react-icons/fi";
import {
    FaShieldAlt,
    FaHandshake,
    FaMapMarkedAlt,
    FaQuoteLeft,
    FaStar,
    FaRulerCombined,
    FaMapMarkerAlt,
    FaBuilding
} from "react-icons/fa";
import { MdVerified, MdMeetingRoom } from "react-icons/md";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MobileRealEstateHome from "./mobile/MobileRealEstateHome";
import ServiceReviewsDisplay from "./ServiceReviewsDisplay";

export default function RealEstateHome() {
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
        return <MobileRealEstateHome />;
    }
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [recentProperties, setRecentProperties] = useState([]);
    const [tabFilteredProperties, setTabFilteredProperties] = useState([]);
    // If you fetch categories from an API or state, use that state
    const [subcategoryData, setSubcategoryData] = useState([]);
    const [serviceListForReviews, setServiceListForReviews] = useState([]);
    const [searchFilters, setSearchFilters] = useState({
        cities: [],
        property_types: [],
        transaction_types: [],
        price_range: { min: 0, max: 0 },
        area_range: { min: 0, max: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useState({
        city: "",
        property_type: "",
        transaction_type: "",
        min_price: "",
        max_price: "",
        search: ""
    });
    const [selectedTab, setSelectedTab] = useState("ALL");
    const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
    const [tabLoading, setTabLoading] = useState(false); // ✅ ADD THIS

    const [showModal, setShowModal] = useState(false);
    const [modalService, setModalService] = useState(null);

    const openInquiryModal = (service) => {
        setModalService(service);
        setShowModal(true);
    };

    const closeInquiryModal = () => {
        setShowModal(false);
        setModalService(null);
    };

    // Group properties by property_type
    const groupedProperties = Object.values(
        recentProperties.reduce((acc, property) => {
            const type = property.property_type || "Other"; // fallback
            if (!acc[type]) acc[type] = { property_type: type, services: [] };
            acc[type].services.push(property);
            return acc;
        }, {})
    );

    // Split into blocks for display
    const propertyBlocks = [
        groupedProperties.slice(0, 2),
        groupedProperties.slice(2, 4),
        groupedProperties.slice(4),
    ];

    useEffect(() => {
        fetchHomePageData();
        fetchPropertyTypes();
    }, []);

    const [ads, setAds] = useState([]);
    useEffect(() => {
        publicAxios
            .get("api/init-realestate-smallads/")
            .then((res) => setAds(res.data))
            .catch((err) => console.error("Error fetching small ads:", err));
    }, []);

    // Slot 1 and Slot 2
    const slot1 = ads.find((ad) => ad.slot === 1);
    const slot2 = ads.find((ad) => ad.slot === 2);

    const [bigAd, setBigAd] = useState(null);

    // --- Fetch Big Ad API ---
    useEffect(() => {
        publicAxios
            .get("api/init-realestate-bigad/")
            .then((res) => {
                setBigAd(res.data);
            })
            .catch((err) => console.error("Error fetching big ad:", err));
    }, []);

    const fetchHomePageData = async () => {
        try {
            setLoading(true);
            setTabFilteredProperties([]); // ✅ RESET TAB FILTERS

            // Fetch featured properties
            const featuredResponse = await publicAxios.get('/api/services/real-estate/public/featured/');
            setFeaturedProperties(featuredResponse.data || []);


            // Fetch recent properties
            // When fetching recent properties
            const recentResponse = await publicAxios.get('/api/services/real-estate/public/');
            const sortedRecent = (recentResponse.data || []).sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at) // newest first
            );
            setRecentProperties(sortedRecent);
            setTabFilteredProperties(sortedRecent); // initial tab filter

            const recentUpdates = recentProperties.filter(p => {
                const daysAgo = (new Date() - new Date(p.created_at)) / (1000 * 60 * 60 * 24);
                return daysAgo <= 7; // last 7 days
            });

            
            const serviceList = sortedRecent.map(property => ({
                id: property.id,
                name: property.title || property.business_name,
            }));
            setServiceListForReviews(serviceList)

            // Fetch search filters
            const filtersResponse = await publicAxios.get('/api/services/real-estate/public/search_filters/');
            if (filtersResponse.data) {
                setSearchFilters(filtersResponse.data);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPropertyTypes = async () => {
        try {
            // Fetch dynamic property types from API
            const response = await publicAxios.get('/api/services/real-estate/public/property_types/');
            if (response.data && Array.isArray(response.data)) {
                setPropertyTypeOptions(response.data);
            }
        } catch (error) {
            console.error("Error fetching property types:", error);
            // Fallback to default types if API fails
            const defaultTypes = [
                { value: 'apartment', label: 'Apartment' },
                { value: 'house', label: 'House' },
                { value: 'villa', label: 'Villa' },
                { value: 'commercial', label: 'Commercial' },
                { value: 'pg_coliving', label: 'PG/Co-living' },
                { value: 'plots', label: 'Plots' },
            ];
            setPropertyTypeOptions(defaultTypes);
        }
    };

    // ✅ UPDATE: Tab click handler - filter locally
    const handleTabClick = async (tab) => {
        setSelectedTab(tab);
        setTabLoading(true);

        if (tab === "ALL") {
            setTabFilteredProperties(recentProperties);
            setSearchParams(prev => ({
                ...prev,
                property_type: ""
            }));
            setTabLoading(false);
            return;
        }

        // Find the property type value for this tab
        const propertyTypeOption = propertyTypeOptions.find(
            option => option.label.toUpperCase() === tab
        );

        if (propertyTypeOption) {
            const propertyTypeValue = propertyTypeOption.value;
            setSearchParams(prev => ({
                ...prev,
                property_type: propertyTypeValue
            }));

            // Filter properties locally
            const filtered = recentProperties.filter(prop =>
                prop.property_type === propertyTypeValue
            );
            setTabFilteredProperties(filtered);
        } else {
            // If no match, show all
            setTabFilteredProperties(recentProperties);
        }

        setTabLoading(false);
    };

    // ✅ UPDATE: Search function - navigate to ServiceList page
    const handleSearch = () => {
        try {
            const params = {};
            if (searchParams.city) params.city = searchParams.city;
            if (searchParams.property_type) params.property_type = searchParams.property_type;
            if (searchParams.search) params.search = searchParams.search;

            // Navigate to servicelist with filters
            navigate(`/servicelist?${new URLSearchParams(params).toString()}`);
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const redirectToRealEstate = () => {
        navigate("/servicelist");
    };

    const redirectToServicelist = (property_type) => {
        navigate(`/servicelist?property_type=${encodeURIComponent(property_type)}`);
    };

    // Function to handle property click
    const handlePropertyClick = (property) => {
        if (property.id) {
            navigate(`/realestate/${property.id}`);
        } else {
            redirectToRealEstate();
        }
    };

    const formatPrice = (price) => {
        if (!price) return "₹0";
        if (price >= 10000000) {
            return `₹${(price / 10000000).toFixed(2)} Cr`;
        } else if (price >= 100000) {
            return `₹${(price / 100000).toFixed(2)} Lakh`;
        }
        return `₹${price.toLocaleString()}`;
    };

    const getTransactionType = (type) => {
        switch (type) {
            case 'sale': return 'For Sale';
            case 'rent': return 'For Rent';
            case 'lease': return 'For Lease';
            default: return type;
        }
    };

    const getPropertyTypeTabs = () => {
        const baseTabs = ["ALL"];

        if (propertyTypeOptions.length > 0) {
            const propertyTypeTabs = propertyTypeOptions.map(option =>
                option.label.toUpperCase()
            );

            return [...baseTabs, ...propertyTypeTabs];
        }

        // Fallback to default tabs if no dynamic types
        return ["ALL", "APARTMENTS", "HOUSES", "VILLAS", "COMMERCIAL", "PG/CO-LIVING", "PLOTS"];
    };

    const getRentalProperties = () => {
        return recentProperties.filter(prop => prop.transaction_type === 'rent');
    };

    const getCommercialProperties = () => {
        return recentProperties.filter(prop => prop.property_type === 'commercial');
    };

    const cities = React.useMemo(() => {
        if (!searchFilters.cities) return [];

        const normalized = searchFilters.cities
            .map(city =>
                city
                    ?.trim()
                    .toLowerCase()
            )
            .filter(Boolean);

        return [...new Set(normalized)]
            .map(city => city.charAt(0).toUpperCase() + city.slice(1))
            .sort();
    }, [searchFilters.cities]);

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
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 1 } },
        ],
    };

    const propertyTypeTabs = getPropertyTypeTabs();

    // Property Card Component
    const PropertyCard = (block = []) => {
        if (!Array.isArray(block)) return null;

        return block.map((category, index) => (
            <section key={index} className="py-10">
                {/* Heading: use property_type */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">{category.property_type}</h2>
                    <button
                        onClick={() => redirectToServicelist(category.property_type)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                        View All <span className="ml-1">→</span>
                    </button>
                </div>
                <Slider {...categorySlider}>
                    {category.services?.map((service) => (
                        <div key={service.id} className="p-2 h-full">
                            {/* Your existing card JSX */}
                            <div
                                onClick={() => handlePropertyClick(service)}
                                className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition duration-300 h-full flex flex-col"
                            >
                                <div className="relative h-48 w-full">
                                    <img
                                        src={service.main_image || service.thumbnail_image || "https://placehold.co/400x300"}
                                        alt={service.business_name}
                                        className="w-full h-full object-cover"
                                    />
                                    {service.transaction_type && (
                                        <div className="absolute top-3 left-3">
                                            <span
                                                className={`${service.transaction_type === "rent"
                                                    ? "bg-green-500"
                                                    : service.transaction_type === "sale"
                                                        ? "bg-blue-500"
                                                        : "bg-purple-500"
                                                    } text-white px-3 py-1 rounded-full text-xs font-semibold shadow`}
                                            >
                                                {getTransactionType(service.transaction_type)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 flex flex-col flex-grow">
                                    {service.price && (
                                        <h3 className="text-lg font-bold text-blue-600 mb-1">
                                            {formatPrice(service.price)}
                                        </h3>
                                    )}
                                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-1 mb-2">
                                        {service.business_name || service.title}
                                    </h4>

                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                        <FaMapMarkerAlt />
                                        <span>{service.city || service.address}, {service.state || ""}</span>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3 mt-auto">
                                        <div className="flex justify-between items-center text-xs text-gray-600 mb-2 flex-nowrap">
                                            <div className="flex items-center gap-1 min-w-0">
                                                <MdMeetingRoom />
                                                <span className="truncate">{service.bedrooms ? `${service.bedrooms} BHK` : "—"}</span>
                                            </div>
                                            <div className="flex items-center gap-1 min-w-0">
                                                <FaRulerCombined />
                                                <span className="truncate">{service.total_area_size ? `${service.total_area_size} Sq.Ft` : "—"}</span>
                                            </div>
                                            <div className="flex items-center gap-1 min-w-0">
                                                <FaBuilding />
                                                <span className="truncate capitalize">{service.property_type || "—"}</span>
                                            </div>
                                        </div>


                                        <div className="flex gap-2">
                                            {service.contact_mobile && (
                                                <button
                                                    href={`tel:${service.contact_mobile}`}
                                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition text-center"
                                                >
                                                    Call Now
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openInquiryModal(service);
                                                }}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                                            >
                                                Inquiry
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </section>
        ));
    };

    const RecentPropertyCard = ({ property }) => {
        if (!property) return null;

        return (
            <div
                onClick={() => handlePropertyClick(property)}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition duration-300 h-full flex flex-col"
            >
                <div className="relative h-48 w-full">
                    <img
                        src={property.main_image || property.thumbnail_image || "https://placehold.co/400x300"}
                        alt={property.business_name || property.title}
                        className="w-full h-full object-cover"
                    />
                    {property.transaction_type && (
                        <div className="absolute top-3 left-3">
                            <span
                                className={`${property.transaction_type === "rent"
                                    ? "bg-green-500"
                                    : property.transaction_type === "sale"
                                        ? "bg-blue-500"
                                        : "bg-purple-500"
                                    } text-white px-3 py-1 rounded-full text-xs font-semibold shadow`}
                            >
                                {getTransactionType(property.transaction_type)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                    {property.price && (
                        <h3 className="text-lg font-bold text-blue-600 mb-1">
                            {formatPrice(property.price)}
                        </h3>
                    )}
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-1 mb-2">
                        {property.business_name || property.title}
                    </h4>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <FaMapMarkerAlt />
                        <span>{property.city || property.address}, {property.state || ""}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 mt-auto">
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-2 flex-nowrap">
                            <div className="flex items-center gap-1 min-w-0">
                                <MdMeetingRoom />
                                <span className="truncate">{property.bedrooms ? `${property.bedrooms} BHK` : "—"}</span>
                            </div>
                            <div className="flex items-center gap-1 min-w-0">
                                <FaRulerCombined />
                                <span className="truncate">{property.total_area_size ? `${property.total_area_size} Sq.Ft` : "—"}</span>
                            </div>
                            <div className="flex items-center gap-1 min-w-0">
                                <FaBuilding />
                                <span className="truncate capitalize">{property.property_type || "—"}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {property.contact_mobile && (
                                <a
                                    href={`tel:${property.contact_mobile}`}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition text-center"
                                >
                                    Call Now
                                </a>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openInquiryModal(property);
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                            >
                                Inquiry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50">
            {/* Hero Banner */}
            <section className="relative w-full h-[540px]">
                <img
                    src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1600"
                    alt="banner"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Search Box with Categories above it */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-snug">
                        Find the Best Properties and Real Estate Services Near You
                    </h2>
                    <p className="text-blue-100 text-xs sm:text-sm md:text-base mb-6 max-w-[90%] sm:max-w-[80%]">
                        <span className="font-semibold">500+</span> verified properties and{" "}
                        <span className="font-semibold">300+</span> real estate services to help you buy, sell, or rent your dream home!
                    </p>

                    {/* Tabs - Dynamic Property Types */}
                    <div className="bg-[#00000080] text-white rounded-2xl flex items-center justify-start sm:justify-center gap-4 sm:gap-6 px-4 py-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] overflow-x-auto scrollbar-hide">
                        {propertyTypeTabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleTabClick(tab)}
                                className={`flex-shrink-0 pb-1 text-xs sm:text-sm md:text-base font-semibold border-b-2 ${selectedTab === tab
                                    ? "border-white text-white"
                                    : "border-transparent text-gray-300 hover:text-white hover:border-white"
                                    } transition`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar - SIRF CITY AUR SEARCH INPUT */}
                    <div className="relative bg-white shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-[95%] sm:w-[85%] md:w-[70%] lg:w-[60%] p-2 mt-4 rounded-b-sm sm:rounded-full">

                        {/* City Dropdown ONLY */}
                        <div className="relative sm:w-40 w-full sm:border-r border-b sm:border-b-0">
                            <select
                                value={searchParams.city}
                                onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                                className="w-full px-4 py-2 text-gray-800 font-medium outline-none bg-white"
                            >
                                <option value="">Select City</option>
                                {cities.map((city, index) => (
                                    <option key={index} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Input ONLY */}
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                placeholder="Search for property, house, or apartment"
                                value={searchParams.search}
                                onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                                className="w-full px-4 py-2 text-gray-700 outline-none border border-gray-200 rounded-md sm:border-none sm:rounded-none"
                            />
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md sm:rounded-full font-semibold flex items-center justify-center transition w-full sm:w-auto"
                        >
                            <FiSearch className="h-5 w-5 mr-2 sm:hidden" /> Search
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="relative z-20 -mt-16">
                <div className="relative bg-blue-50 rounded-tl-[80px] rounded-tr-[80px] py-16">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: <FaShieldAlt className="text-4xl text-blue-600" />,
                                    title: "Verified Listings",
                                    text: "Every property is verified for authenticity.",
                                    bg: "bg-white",
                                },
                                {
                                    icon: <FaHandshake className="text-4xl text-green-600" />,
                                    title: "Easy Financing",
                                    text: "Get loan assistance with trusted banks.",
                                    bg: "bg-white",
                                },
                                {
                                    icon: <FaMapMarkedAlt className="text-4xl text-pink-600" />,
                                    title: "Prime Locations",
                                    text: "Homes in prime locations across cities.",
                                    bg: "bg-white",
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className={`${item.bg} rounded-xl shadow-lg p-8 text-center hover:scale-105 transition cursor-pointer`}
                                    onClick={redirectToRealEstate}
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
                {/* ✅ UPDATE: Recent Properties by Selected Tab - LOCAL FILTER */}
                <section className="py-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">
                            {selectedTab === "ALL" ? "Recent Properties" : `${selectedTab} Properties`}
                        </h2>
                        <button
                            onClick={redirectToRealEstate}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        >
                            View All <span className="ml-1">→</span>
                        </button>
                    </div>

                    {tabLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading {selectedTab.toLowerCase()} properties...</p>
                        </div>
                    ) : tabFilteredProperties.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-lg shadow">
                            <p className="text-gray-500">No properties available for {selectedTab.toLowerCase()}</p>
                        </div>
                    ) : (
                        <Slider {...categorySlider}>
                            {tabFilteredProperties
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .slice(0, 6)
                                .map((property, index) => (
                                    <div key={`${selectedTab}-${property.id || index}`} className="p-2 h-full">
                                        <RecentPropertyCard property={property} />
                                    </div>
                                ))}
                        </Slider>
                    )}
                </section>
                {PropertyCard(propertyBlocks[0])}
                {/* Rental Properties */}
                {/* <section className="py-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Properties for Rent</h2>
                    </div>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading rental properties...</p>
                        </div>
                    ) : getRentalProperties().length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-lg shadow">
                            <p className="text-gray-500">No rental properties available</p>
                        </div>
                    ) : (
                        <Slider {...categorySlider}>
                            {getRentalProperties().slice(0, 6).map((property, index) => (
                                <PropertyCard
                                    key={`rental-${property.id || index}`}
                                    property={property}
                                />
                            ))}
                        </Slider>
                    )}
                </section> */}

                {/* Two Marketing Banners */}
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
                {PropertyCard(propertyBlocks[1])}
                {/* Commercial Properties */}
                {/* <section className="py-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Commercial Properties</h2>
                    </div>
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Loading commercial properties...</p>
                        </div>
                    ) : getCommercialProperties().length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-lg shadow">
                            <p className="text-gray-500">No commercial properties available</p>
                        </div>
                    ) : (
                        <Slider {...categorySlider}>
                            {getCommercialProperties().slice(0, 6).map((property, index) => (
                                <PropertyCard
                                    key={`commercial-${property.id || index}`}
                                    property={property}
                                />
                            ))}
                        </Slider>
                    )}
                </section> */}

                {/* Fullwidth Marketing Banner */}
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
                {PropertyCard(propertyBlocks[2])}
{serviceListForReviews.length > 0 && (
    <section className="py-12">
        <ServiceReviewsDisplay
            modelName="property"
            title="What Our Clients Say"
            accentColor="blue"
            detailPath="/realestate"
            serviceItems={serviceListForReviews}
            maxReviews={6}
            emptyMessage="No client reviews yet"
        />
    </section>
)}
            </div>
            {showModal && modalService && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={closeInquiryModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-11/12 max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-blue-600 text-white text-lg font-semibold px-5 py-3 flex justify-between items-center">
                            Inquiry Form
                            <button
                                className="text-white text-2xl"
                                onClick={closeInquiryModal}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                            <InquiryForm
                                serviceData={modalService}
                                onClose={closeInquiryModal}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const InquiryForm = ({ serviceData, prefillMessage, onClose }) => {
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
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);

    // ✅ SINGLE model mapping (important)
    const modelMap = {
        gym: "gymservice",
        salon: "saloonservice",
        travel_agency: "travelagencyservice",
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const vendorId = serviceData?.vendor?.id || serviceData?.vendor;
        const category = serviceData?.category || serviceData?.service_category || "real_estate";
        const serviceId = serviceData?.id;

        if (!vendorId) {
            setErrorMsg("vendor Id information missing.");
            return;
        }
        if (!category) {
            setErrorMsg("category information missing.");
            return;
        }
        if (!serviceId) {
            setErrorMsg("services Id information missing.");
            return;
        }

        setSubmitting(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            // ✅ 1. Submit Inquiry
            const payload = {
                service_category: category,
                vendor: vendorId,
                service_id: serviceId,
                service_url: window.location.href,
                service_name: serviceData?.title,
                customer_name: form.name,
                customer_phone: form.phone,
                customer_email: form.email,
                customer_city: form.city,
                subject: `Inquiry about ${serviceData?.business_name}`,
                message: form.message,
            };

            const response = await publicAxios.post(
                "/api/public/inquiries/",
                payload
            );

            if (response.status !== 201) {
                throw new Error("Inquiry failed");
            }

            // ✅ 2. Check Review
            const model = modelMap[category];

            if (!model) {
                setSuccessMsg("Inquiry submitted successfully!");
                setErrorMsg("firest Login Now")
                setTimeout(() => onClose(), 1200);
                return;
            }

            const reviewCheck = await axiosInstance.get(
                `/api/real-estate-reviews/object_id=${serviceId}`
            );

            if (reviewCheck.data.has_reviewed) {
                // ❌ Already reviewed → don't show review form
                setSuccessMsg(" Inquiry submitted!");
                setTimeout(() => onClose(), 1200);
            } else {
                const token = localStorage.getItem("customer_token");

                if (token) {
                    setShowReviewForm(true);
                } else {
                    setSuccessMsg(" Inquiry submitted!");
                    setTimeout(() => onClose(), 1200);
                }
            }

        } catch (err) {
            console.error(err);
            setErrorMsg("❌ Failed to submit inquiry.");
        } finally {
            setSubmitting(false);
        }
    };

    const submitReview = async () => {
        try {
            const token = localStorage.getItem("customer_token");

            if (!token) {
                alert("Login required");
                return;
            }

            const serviceId = serviceData?.id;

            if (!serviceId) {
                alert("Property ID missing");
                return;
            }

            // 🔥 Real Estate separate API – no model needed
            await axiosInstance.post("/api/real-estate-reviews/", {
                object_id: serviceId,
                rating: Number(reviewRating),
                review: reviewText,
            });

            alert("Review Added Successfully!");
            onClose();

        } catch (err) {
            console.log(err);

            if (err.response?.data?.error === "Already reviewed") {
                alert("You already reviewed this property");
                onClose();
            } else {
                alert("Error submitting review");
            }
        }
    };

    return (
        <div className="bg-white rounded-lg">

            {successMsg && (
                <div className="mb-3 p-2 bg-green-100 text-green-700 rounded text-sm">
                    {successMsg}
                </div>
            )}

            {errorMsg && (
                <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
                    {errorMsg}
                </div>
            )}

            {!showReviewForm ? (
                <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your Phone</label>
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your City</label>
                    <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Add description</label>
                    <textarea
                        name="message"
                        rows="3"
                        placeholder="Message"
                        value={form.message}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-2 rounded"
                    >
                        {submitting ? "Submitting..." : "Send Inquiry"}
                    </button>

                </form>
            ) : (
                <div className="mt-3 space-y-3">
                    <h3 className="font-semibold">Leave a Review</h3>
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">add review rating</label>
                    <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className={`w-6 h-6 cursor-pointer transition 
                                    ${reviewRating >= star
                                        ? "text-yellow-400"
                                        : "text-gray-300"}`}
                            />
                        ))}
                    </div>
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Add descriptions</label>
                    <textarea
                        rows="3"
                        placeholder="Write your review..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                    />

                    <button
                        onClick={submitReview}
                        className="w-full bg-green-600 text-white py-2 rounded"
                    >
                        Submit Review
                    </button>
                </div>
            )}
        </div>
    );
};