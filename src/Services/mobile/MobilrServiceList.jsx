// src/pages/mobile/MobileServiceList.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axios";
import {
  FiSearch,
  FiFilter,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiTag,
  FiX,
  FiArrowLeft,
  FiHeart,
  FiShare2,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import {
  FaStar,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaBuilding,
  FaWhatsapp,
} from "react-icons/fa";
import { MdVerified, MdMeetingRoom } from "react-icons/md";
import MobileServiceBottomNav from "../../components/MobileServiceBottomNav";

// Service type mapping
const SERVICE_TYPE_MAP = {
  real_estate: {
    label: "Properties",
    apiUrl: "/api/services/real-estate/public/",
    detailPath: "/realestate",
    icon: "🏠",
  },
  salon: {
    label: "Salon Services",
    apiUrl: "/api/public/salon-services/",
    detailPath: "/salondetail",
    icon: "💇",
  },
  travel_agency: {
    label: "Travel Services",
    apiUrl: "/api/public/travel-services/",
    detailPath: "/travelagencydetail",
    icon: "✈️",
  },
  tech_industry: {
    label: "Tech Services",
    apiUrl: "/api/public/tech-services/",
    detailPath: "/techdetail",
    icon: "💻",
  },
  gym: {
    label: "Gym Services",
    apiUrl: "/api/public/gym-services/",
    detailPath: "/gymdetail",
    icon: "🏋️",
  },
  professional: {
    label: "Professional Services",
    apiUrl: "/api/public/professional-services/",
    detailPath: "/professionaldetail",
    icon: "👔",
  },
  finance: {
    label: "Finance Services",
    apiUrl: "/api/public/finance-services/",
    detailPath: "/financedetail",
    icon: "💰",
  },
  education: {
    label: "Education Services",
    apiUrl: "/api/public/education-services/",
    detailPath: "/educationdetail",
    icon: "📚",
  },
  healthcare: {
    label: "Healthcare Services",
    apiUrl: "/api/public/healthcare-services/",
    detailPath: "/healthcaredetail",
    icon: "🏥",
  },
  restaurant: {
    label: "Restaurant Services",
    apiUrl: "/api/public/restaurant-services/",
    detailPath: "/restaurantdetail",
    icon: "🍽️",
  },
  hotel: {
    label: "Hotel Services",
    apiUrl: "/api/public/hotel-services/",
    detailPath: "/hoteldetail",
    icon: "🏨",
  },
};

export default function MobileServiceList() {
  const location = useLocation();
  const navigate = useNavigate();

  const [serviceType, setServiceType] = useState("real_estate");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProperties, setTotalProperties] = useState(0);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    cities: [],
    price_range: { min: 0, max: 0 },
  });

  const [filters, setFilters] = useState({
    city: "",
    property_type: "",
    transaction_type: "",
    subcategory: "",
    min_price: "",
    max_price: "",
    bedrooms: "",
    search: "",
  });

  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const itemsPerPage = 8;

  const serviceConfig = SERVICE_TYPE_MAP[serviceType] || SERVICE_TYPE_MAP.real_estate;
  const isRealEstate = serviceType === "real_estate";

  // Get query parameters from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const params = {};
    let detectedType = "real_estate";

    queryParams.forEach((value, key) => {
      params[key] = value;
    });

    if (params.type) {
      detectedType = params.type;
    }

    setServiceType(detectedType);
    setFilters((prev) => ({ ...prev, ...params }));
  }, [location.search]);

  // Fetch Real Estate specific filters
  useEffect(() => {
    if (isRealEstate) {
      fetchPropertyTypes();
      fetchSearchFilters();
    }
  }, [serviceType]);

  const fetchPropertyTypes = async () => {
    try {
      const response = await publicAxios.get("/api/services/real-estate/public/property_types/");
      if (response.data && Array.isArray(response.data)) {
        setPropertyTypeOptions(response.data);
      }
    } catch (error) {
      setPropertyTypeOptions([
        { value: "apartment", label: "Apartment" },
        { value: "house", label: "House" },
        { value: "villa", label: "Villa" },
        { value: "commercial", label: "Commercial" },
        { value: "pg_coliving", label: "PG/Co-living" },
        { value: "plots", label: "Plots" },
      ]);
    }
  };

  const fetchSearchFilters = async () => {
    try {
      const response = await publicAxios.get("/api/services/real-estate/public/search_filters/");
      if (response.data) setSearchFilters(response.data);
    } catch (error) {
      console.error("Error fetching search filters:", error);
    }
  };

  // Universal fetch function
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] && key !== "type") {
          params.append(key, filters[key]);
        }
      });

      if (sortBy && isRealEstate) {
        const orderingMap = {
          newest: "-created_at",
          oldest: "created_at",
          price_low: "price",
          price_high: "-price",
          area_low: "total_area_size",
          area_high: "-total_area_size",
        };
        params.append("ordering", orderingMap[sortBy] || "-created_at");
      }

      const response = await publicAxios.get(`${serviceConfig.apiUrl}?${params.toString()}`);
      const data = Array.isArray(response.data) ? response.data : response.data.results || response.data.data || [];
      setProperties(data);
      setTotalProperties(data.length);
    } catch (error) {
      console.error("Error fetching:", error);
      setProperties([]);
      setTotalProperties(0);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, serviceType]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProperties(), 500);
    return () => clearTimeout(timer);
  }, [filters, sortBy, fetchProperties]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    fetchProperties();
    const params = new URLSearchParams();
    params.append("type", serviceType);
    Object.keys(filters).forEach((key) => {
      if (filters[key]) params.append(key, filters[key]);
    });
    navigate(`/searchservice?${params.toString()}`, { replace: true });
  };

  const clearFilters = () => {
    setFilters({
      city: "",
      property_type: "",
      transaction_type: "",
      subcategory: "",
      min_price: "",
      max_price: "",
      bedrooms: "",
      search: "",
    });
    setCurrentPage(1);
    setShowFilters(false);
  };

  const formatPrice = (price) => {
    if (!price) return "₹0";
    const num = parseFloat(price);
    if (isNaN(num)) return "₹0";
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
    return `₹${num.toLocaleString()}`;
  };

  const getTransactionType = (type) => {
    switch (type) {
      case "sale":
        return "For Sale";
      case "rent":
        return "For Rent";
      case "lease":
        return "For Lease";
      default:
        return type;
    }
  };

  const openInquiryModal = (service) => {
    setSelectedService(service);
    setShowInquiryModal(true);
  };

  const closeInquiryModal = () => {
    setShowInquiryModal(false);
    setSelectedService(null);
  };

  // Universal Card Component
  const ServiceCard = ({ item }) => {
    if (!item) return null;

    const handleClick = () => {
      navigate(`${serviceConfig.detailPath}/${item.id}`);
    };

    return (
      <div
        onClick={handleClick}
        className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition duration-300 h-full flex flex-col border border-gray-100"
      >
        <div className="relative h-48 w-full">
          <img
            src={item.main_image || item.thumbnail_image || `https://placehold.co/400x300/2563EB/white?text=${serviceConfig.label}`}
            alt={item.business_name || item.title}
            className="w-full h-full object-cover"
          />
          {isRealEstate && item.transaction_type && (
            <div className="absolute top-3 left-3">
              <span
                className={`${
                  item.transaction_type === "rent"
                    ? "bg-green-500"
                    : item.transaction_type === "sale"
                    ? "bg-blue-500"
                    : "bg-purple-500"
                } text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow`}
              >
                {getTransactionType(item.transaction_type)}
              </span>
            </div>
          )}
          {item.is_featured && (
            <div className="absolute top-3 right-3">
              <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5">
                <FaStar className="text-[10px]" /> Featured
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite
            }}
            className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow"
          >
            <FiHeart className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-3 flex flex-col flex-grow">
          {item.price && (
            <h3 className="text-[15px] font-bold text-blue-600 mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
              {formatPrice(item.price)}
            </h3>
          )}
          <h4 className="text-[13px] font-semibold text-gray-800 line-clamp-1 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            {item.business_name || item.title}
          </h4>

          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            <FaMapMarkerAlt className="w-3 h-3" />
            <span className="truncate">
              {item.city || item.address}
              {item.state ? `, ${item.state}` : ""}
            </span>
          </div>

          <div className="border-t border-gray-100 pt-2 mt-auto">
            {isRealEstate ? (
              <div className="flex justify-between items-center text-[11px] text-gray-600 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span className="flex items-center gap-1">
                  <MdMeetingRoom className="w-3.5 h-3.5" /> {item.bedrooms ? `${item.bedrooms} BHK` : "—"}
                </span>
                <span className="flex items-center gap-1">
                  <FaRulerCombined className="w-3.5 h-3.5" /> {item.total_area_size ? `${item.total_area_size} Sq.Ft` : "—"}
                </span>
                <span className="capitalize flex items-center gap-1">
                  <FaBuilding className="w-3.5 h-3.5" /> {item.property_type || "—"}
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                {item.subcategory_name && (
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">{item.subcategory_name}</span>
                )}
                {item.open_time && (
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                    <FiClock className="w-3 h-3" /> {item.open_time}
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-1.5">
              {(item.contact_no || item.contact_mobile) && (
                <a
                  href={`tel:${item.contact_no || item.contact_mobile}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-[11px] font-medium py-1.5 rounded-lg transition text-center"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Call Now
                </a>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openInquiryModal(item);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-[11px] font-medium py-1.5 rounded-lg transition"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse border border-gray-100">
          <div className="h-40 bg-gray-200"></div>
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="flex justify-between pt-1">
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ─── HEADER ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-full transition">
            <FiArrowLeft className="text-gray-700 text-lg" />
          </button>
          <div>
            <h1 className="text-[16px] font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
              {serviceConfig.label}
            </h1>
            <p className="text-[10px] text-gray-500">{totalProperties} results</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 rounded-full transition relative"
          >
            <FiFilter className="text-gray-600 text-lg" />
            {Object.values(filters).some((v) => v) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* ─── SEARCH BAR ───────────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
          <input
            type="text"
            placeholder={`Search ${serviceConfig.label.toLowerCase()}...`}
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-4 py-2.5 text-[13px] text-gray-800 outline-none bg-transparent"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[13px] font-medium"
          >
            <FiSearch className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── FILTERS BOTTOM SHEET ────────────────────────────────────────── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 flex justify-between items-center border-b border-gray-100">
              <h3 className="text-[16px] font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                Filters
              </h3>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <FiX className="text-gray-600 text-lg" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Category */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 block" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <FiTag className="inline mr-1.5 text-blue-500" /> Category
                </label>
                <input
                  type="text"
                  placeholder="Filter by category..."
                  value={filters.subcategory}
                  onChange={(e) => handleFilterChange("subcategory", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:ring-2 focus:ring-blue-500 outline-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              {/* City */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 block" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <FiMapPin className="inline mr-1.5 text-blue-500" /> City
                </label>
                <input
                  type="text"
                  placeholder="Filter by city..."
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:ring-2 focus:ring-blue-500 outline-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              {isRealEstate && (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 mb-1 block" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Property Type
                    </label>
                    <select
                      value={filters.property_type}
                      onChange={(e) => handleFilterChange("property_type", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:ring-2 focus:ring-blue-500 outline-none"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <option value="">All Types</option>
                      {propertyTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 mb-1 block" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Bedrooms
                    </label>
                    <div className="flex gap-1.5">
                      {["1", "2", "3", "4+"].map((val) => (
                        <button
                          key={val}
                          onClick={() =>
                            handleFilterChange("bedrooms", filters.bedrooms === val ? "" : val)
                          }
                          className={`flex-1 py-1.5 rounded-xl text-[11px] font-medium transition ${
                            filters.bedrooms === val
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {val === "4+" ? "4+ BHK" : `${val} BHK`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 mb-1 block" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Transaction Type
                    </label>
                    <select
                      value={filters.transaction_type}
                      onChange={(e) => handleFilterChange("transaction_type", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:ring-2 focus:ring-blue-500 outline-none"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <option value="">All</option>
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                      <option value="lease">For Lease</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 mb-1 block" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Price Range (₹)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.min_price}
                        onChange={(e) => handleFilterChange("min_price", e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:ring-2 focus:ring-blue-500 outline-none"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.max_price}
                        onChange={(e) => handleFilterChange("max_price", e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:ring-2 focus:ring-blue-500 outline-none"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-medium hover:bg-gray-50 transition"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    handleSearch();
                    setShowFilters(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[13px] font-medium hover:shadow-lg transition"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SORT BAR ────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between">
        <span className="text-[11px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
          {properties.length} results
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] focus:ring-2 focus:ring-blue-500 outline-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <option value="newest">Newest</option>
          <option value="price_low">Price: Low → High</option>
          <option value="price_high">Price: High → Low</option>
        </select>
      </div>

      {/* ─── RESULTS ──────────────────────────────────────────────────────── */}
      <div className="p-3">
        {loading ? (
          renderSkeleton()
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <div className="text-5xl mb-3">{serviceConfig.icon}</div>
            <h3 className="text-[15px] font-bold text-gray-700 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              No {serviceConfig.label} Found
            </h3>
            <p className="text-[11px] text-gray-500 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              Try adjusting your filters
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-5 py-2 rounded-xl transition"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {properties
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((item) => (
                  <ServiceCard key={item.id} item={item} />
                ))}
            </div>

            {/* Pagination */}
            {totalProperties > itemsPerPage && (
              <div className="flex justify-center items-center gap-1.5 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-gray-600 px-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {currentPage} / {Math.ceil(totalProperties / itemsPerPage)}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(Math.ceil(totalProperties / itemsPerPage), currentPage + 1))
                  }
                  disabled={currentPage === Math.ceil(totalProperties / itemsPerPage)}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── INQUIRY MODAL ────────────────────────────────────────────────── */}
      {showInquiryModal && selectedService && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={closeInquiryModal}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-md mx-auto max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 flex justify-between items-center border-b border-gray-100">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Send Inquiry
                </h3>
                <p className="text-[10px] text-gray-500 truncate max-w-[200px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {selectedService.business_name || selectedService.title}
                </p>
              </div>
              <button
                onClick={closeInquiryModal}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <FiX className="text-gray-600 text-sm" />
              </button>
            </div>
            <div className="p-5">
              <MobileInquiryForm serviceData={selectedService} onClose={closeInquiryModal} />
            </div>
          </div>
        </div>
      )}

      {/* ─── BOTTOM NAV ────────────────────────────────────────────────────── */}
      <MobileServiceBottomNav />
    </div>
  );
}

// ─── Mobile Inquiry Form ────────────────────────────────────────────────────
const MobileInquiryForm = ({ serviceData, onClose }) => {
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
  const [expandedField, setExpandedField] = useState(null);

  const toggleField = (fieldName) => {
    if (expandedField === fieldName) {
      setExpandedField(null);
    } else {
      setExpandedField(fieldName);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vendorId = serviceData?.vendor?.id || serviceData?.vendor;
    const category = serviceData?.category || serviceData?.service_category || "real_estate";

    if (!vendorId || !category) {
      setErrorMsg("Missing vendor info.");
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
        service_name: serviceData?.business_name || serviceData?.title,
        service_url: window.location.href,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        customer_city: form.city,
        inquiry_type: "general",
        subject: `Inquiry about ${serviceData?.business_name || serviceData?.title}`,
        message: form.message,
      };

      const response = await publicAxios.post("/api/public/inquiries/", payload);
      if (response.status === 201) {
        setSuccessMsg("✓ Inquiry submitted successfully!");
        setForm({ name: "", phone: "", email: "", city: "", message: "" });
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 2000);
      }
    } catch (err) {
      setErrorMsg("❌ Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { name: "name", label: "Full Name", placeholder: "Enter your full name", required: true, type: "text" },
    { name: "phone", label: "Phone Number", placeholder: "Enter your phone number", required: true, type: "tel" },
    { name: "email", label: "Email Address", placeholder: "Enter your email", required: false, type: "email" },
    { name: "city", label: "City", placeholder: "Enter your city", required: false, type: "text" },
    { name: "message", label: "Message", placeholder: "Write your message here...", required: false, type: "textarea" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full">
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-[11px] w-full">
          <FaStar className="text-green-500 flex-shrink-0" /> <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px] w-full">
          <FiX className="text-red-500 flex-shrink-0" /> <span>{errorMsg}</span>
        </div>
      )}

      {fields.map((field) => {
        const isExpanded = expandedField === field.name;
        const value = form[field.name];

        return (
          <div key={field.name} className="w-full">
            <button
              type="button"
              onClick={() => toggleField(field.name)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200"
            >
              <span className="text-[12px] font-medium text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
                {value && <span className="text-green-500 text-[10px] ml-2">✓</span>}
              </span>
              {isExpanded ? (
                <FiChevronRight className="text-gray-400 text-sm transform rotate-90" />
              ) : (
                <FiChevronRight className="text-gray-400 text-sm" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-2 px-1 w-full">
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 text-[13px] border-2 border-blue-500 rounded-xl outline-none resize-none focus:ring-2 focus:ring-blue-300 transition"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    autoFocus
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={value}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[13px] border-2 border-blue-500 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 transition"
                    style={{ fontFamily: "'Inter', sans-serif" }}
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
        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-[13px] disabled:opacity-50 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-4"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {submitting ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            Sending...
          </>
        ) : (
          <>
            <FiMail className="text-sm" /> Send Inquiry
          </>
        )}
      </button>
    </form>
  );
};