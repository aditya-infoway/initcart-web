// src/pages/ServiceList.jsx - UNIVERSAL SERVICE LIST PAGE
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { publicAxios } from "../api/axios";
import {
  FiSearch,
  FiFilter,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiTag
} from "react-icons/fi";
import {
  FaStar,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaBuilding,
} from "react-icons/fa";
import { MdVerified, MdMeetingRoom } from "react-icons/md";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MobileServiceList from "./mobile/MobilrServiceList";

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
    icon: "🏥",
  },
    hotel: {
    label: "Restaurant Services",
    apiUrl: "/api/public/hotel-services/",
    detailPath: "/hoteldetail",
    icon: "🏥",
  },
};

export default function ServiceList() {
  const location = useLocation();
  const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);  

  


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
    search: ""
  });

  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
    setFilters(prev => ({ ...prev, ...params }));
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
      const response = await publicAxios.get('/api/services/real-estate/public/property_types/');
      if (response.data && Array.isArray(response.data)) {
        setPropertyTypeOptions(response.data);
      }
    } catch (error) {
      setPropertyTypeOptions([
        { value: 'apartment', label: 'Apartment' },
        { value: 'house', label: 'House' },
        { value: 'villa', label: 'Villa' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'pg_coliving', label: 'PG/Co-living' },
        { value: 'plots', label: 'Plots' },
      ]);
    }
  };

  const fetchSearchFilters = async () => {
    try {
      const response = await publicAxios.get('/api/services/real-estate/public/search_filters/');
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
      Object.keys(filters).forEach(key => {
        if (filters[key] && key !== 'type') {
          params.append(key, filters[key]);
        }
      });

      if (sortBy && isRealEstate) {
        const orderingMap = {
          newest: '-created_at', oldest: 'created_at',
          price_low: 'price', price_high: '-price',
          area_low: 'total_area_size', area_high: '-total_area_size',
        };
        params.append('ordering', orderingMap[sortBy] || '-created_at');
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

    useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    fetchProperties();
    const params = new URLSearchParams();
    params.append('type', serviceType);
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    navigate(`/searchservice?${params.toString()}`, { replace: true });
  };

  const clearFilters = () => {
    setFilters({
      city: "", property_type: "", transaction_type: "", subcategory: "",
      min_price: "", max_price: "", bedrooms: "", search: ""
    });
    setCurrentPage(1);
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
      case 'sale': return 'For Sale';
      case 'rent': return 'For Rent';
      case 'lease': return 'For Lease';
      default: return type;
    }
  };

  // Universal Card Component
  const ServiceCard = ({ item }) => {
    if (!item) return null;

    const handleClick = () => {
      navigate(`${serviceConfig.detailPath}/${item.id}`);
    };

      if (isMobile) {
    return <MobileServiceList/>;
  }  

    return (
      <div onClick={handleClick}
        className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition duration-300 h-full flex flex-col">
        <div className="relative h-48 w-full">
          <img
            src={item.main_image || item.thumbnail_image || `https://placehold.co/400x300`}
            alt={item.business_name || item.title}
            className="w-full h-full object-cover"
          />
          {/* Transaction badge - only for Real Estate */}
          {isRealEstate && item.transaction_type && (
            <div className="absolute top-3 left-3">
              <span className={`${item.transaction_type === "rent" ? "bg-green-500" : item.transaction_type === "sale" ? "bg-blue-500" : "bg-purple-500"} text-white px-3 py-1 rounded-full text-xs font-semibold shadow`}>
                {getTransactionType(item.transaction_type)}
              </span>
            </div>
          )}
          {/* Featured badge */}
          {item.is_featured && (
            <div className="absolute top-3 right-3">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <FaStar className="text-xs" /> Featured
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          {item.price && (
            <h3 className="text-lg font-bold text-blue-600 mb-1">{formatPrice(item.price)}</h3>
          )}
          <h4 className="text-sm font-semibold text-gray-800 line-clamp-1 mb-2">
            {item.business_name || item.title}
          </h4>

          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <FaMapMarkerAlt />
            <span>{item.city || item.address}{item.state ? `, ${item.state}` : ""}</span>
          </div>

          <div className="border-t border-gray-200 pt-3 mt-auto">
            {/* Real Estate specific info */}
            {isRealEstate ? (
              <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                <span>{item.bedrooms ? `${item.bedrooms} BHK` : "—"}</span>
                <span>{item.total_area_size ? `${item.total_area_size} Sq.Ft` : "—"}</span>
                <span className="capitalize">{item.property_type || "—"}</span>
              </div>
            ) : (
              /* Other services info */
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-2">
                {item.subcategory_name && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{item.subcategory_name}</span>
                )}
                {item.open_time && (
                  <span className="flex items-center gap-1">🕐 {item.open_time} - {item.close_time}</span>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {(item.contact_no || item.contact_mobile) && (
                <a href={`tel:${item.contact_no || item.contact_mobile}`}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition text-center">
                  Call Now
                </a>
              )}
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition">
                Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
          <div className="h-44 bg-gray-300"></div>
          <div className="p-3 space-y-3">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            <div className="flex justify-between pt-2">
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const Pagination = () => {
    if (totalProperties <= itemsPerPage) return null;
    const totalPages = Math.ceil(totalProperties / itemsPerPage);
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
          <FiChevronLeft />
        </button>
        {startPage > 1 && (
          <>
            <button onClick={() => setCurrentPage(1)} className="px-3 py-2 rounded-lg border hover:bg-gray-50">1</button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        {pages.map(page => (
          <button key={page} onClick={() => setCurrentPage(page)}
            className={`px-3 py-2 rounded-lg border ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}>
            {page}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button onClick={() => setCurrentPage(totalPages)} className="px-3 py-2 rounded-lg border hover:bg-gray-50">{totalPages}</button>
          </>
        )}
        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
          <FiChevronRight />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Find {serviceConfig.label}
          </h1>
          <p className="text-blue-100 text-sm">
            Browse {totalProperties} {serviceConfig.label.toLowerCase()} across India
          </p>
          <div className="mt-4 bg-white rounded-lg shadow flex">
            <div className="flex-1">
              <input type="text" placeholder={`Search ${serviceConfig.label.toLowerCase()}...`}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 text-gray-700 outline-none rounded-l-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
            <button onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg font-medium flex items-center">
              <FiSearch className="mr-2" /> Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-1/4`}>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 sticky top-6">
              <div className="flex justify-between items-center mb-5 pb-3 border-b">
                <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Clear All</button>
              </div>

              <div className="space-y-5">
                {/* Subcategory filter for all services */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FiTag className="text-blue-500" /> Category
                  </h3>
                  <input type="text" placeholder="Filter by category..."
                    value={filters.subcategory}
                    onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>

                {/* City */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FiMapPin className="text-blue-500" /> City
                  </h3>
                  <input type="text" placeholder="Filter by city..."
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>

                {/* Real Estate specific filters */}
                {isRealEstate && (
                  <>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Property Type</h3>
                      <select value={filters.property_type}
                        onChange={(e) => handleFilterChange('property_type', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                        <option value="">All Types</option>
                        {propertyTypeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Bedrooms</h3>
                      <div className="flex flex-wrap gap-2">
                        {["1", "2", "3", "4+"].map(val => (
                          <button key={val} onClick={() => handleFilterChange('bedrooms', filters.bedrooms === val ? "" : val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filters.bedrooms === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            {val === "4+" ? "4+ BHK" : `${val} BHK`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Transaction Type</h3>
                      <select value={filters.transaction_type}
                        onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                        <option value="">All</option>
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                        <option value="lease">For Lease</option>
                      </select>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Price Range (₹)</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" placeholder="Min" value={filters.min_price}
                          onChange={(e) => handleFilterChange('min_price', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                        <input type="number" placeholder="Max" value={filters.max_price}
                          onChange={(e) => handleFilterChange('max_price', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button onClick={handleSearch}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2">
                <FiSearch /> Apply Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                    <FiFilter /> Filters
                  </button>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">{properties.length}</span> of{" "}
                    <span className="font-semibold">{totalProperties}</span> {serviceConfig.label.toLowerCase()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Sort:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? renderSkeleton() : properties.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                <div className="text-gray-400 text-5xl mb-3">{serviceConfig.icon}</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No {serviceConfig.label} Found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
                <button onClick={clearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {properties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item) => <ServiceCard key={item.id} item={item} />)}
                </div>
                <Pagination />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}