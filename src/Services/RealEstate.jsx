// RealEstate.jsx
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
  FiTrello,
  FiClipboard,
  FiDollarSign,
  FiMaximize,
  FiDroplet,
  FiLayers,
  FiCrop,
  FiSquare,
  FiGrid,
  FiLoader,
  FiHome
} from "react-icons/fi";
import { FaWhatsapp, FaUniversity, FaBus, FaHospital, FaShoppingBag } from "react-icons/fa";
import { publicAxios } from "../api/axios";
import MobileRealEstateDetail from "./mobile/MobileRealEstateDetail";
import ServiceReviewSection from "./ServiceReviewSection";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  
  // ✅ ADD THIS: Dynamic property types state
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(false);

  // Simplified inquiry form states
  const [inquiryData, setInquiryData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ✅ ADD THIS: Fetch dynamic property types
  const fetchPropertyTypes = async () => {
    try {
      setLoadingPropertyTypes(true);
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
    } finally {
      setLoadingPropertyTypes(false);
    }
  };

    //  Mobile detection useEffect
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        
        // ✅ Fetch property types first
        await fetchPropertyTypes();

        // First get all properties to find the slug for this ID
        const allPropertiesResponse = await publicAxios.get('/api/services/real-estate/public/');
        const allProperties = allPropertiesResponse.data.results || allPropertiesResponse.data || [];

        // Find property by ID
        const propertyFromList = allProperties.find(p =>
          p.id === parseInt(id) ||
          String(p.id) === id
        );

        if (!propertyFromList) {
          setError('Property not found. It may not be published yet.');
          return;
        }

        // Now fetch detailed data using slug
        if (propertyFromList.slug) {
          const detailResponse = await publicAxios.get(
            `/api/services/real-estate/public/${propertyFromList.slug}/`
          );
          setProperty(detailResponse.data);
          setError(null);
        } else {
          // Fallback: use the list data
          setProperty(propertyFromList);
        }

      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  // Auto-fill message with property details
  // useEffect(() => {
  //   if (property) {
  //     setInquiryData(prev => ({
  //       ...prev,
  //      // message: `I am interested in ${property.title} (${getPropertyTypeDisplay(property.property_type)}) at ${property.address}. Please contact me.`
  //     }));
  //   }
  // }, [property]);

  // ✅ UPDATE THIS: Dynamic property type display function
const getPropertyTypeDisplay = (type) => {
  if (!type) return "Property";
  
  // Convert to string for comparison
  const typeStr = String(type);
  
  // First check if it matches a dynamic property type by ID
  const option = propertyTypeOptions.find(
    opt => String(opt.id) === typeStr
  );
  
  if (option) {
    return option.label || option.subcategory_name;
  }
  
  // Then check by value
  const optionByValue = propertyTypeOptions.find(
    opt => opt.value === typeStr || opt.label?.toLowerCase().replace(/\s+/g, '_') === typeStr
  );
  
  if (optionByValue) {
    return optionByValue.label || optionByValue.subcategory_name;
  }
  
  // Fallback to static mapping
  const staticTypes = {
    'apartment': 'Apartment',
    'house': 'House',
    'villa': 'Villa',
    'commercial': 'Commercial',
    'pg_coliving': 'PG/Co-living',
    'plots': 'Plot'
  };
  
  return staticTypes[typeStr] || typeStr.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const getPropertySubTypeDisplay = (type) => {
  if (!type) return "Property";
  
  const typeStr = String(type);
  
  // Look for matching subcategory by ID
  const option = propertyTypeOptions.find(
    opt => String(opt.id) === typeStr
  );
  
  if (option) {
    return option.label || option.subcategory_name;
  }
  
  return getPropertyTypeDisplay(type);
};

  // Rest of the functions remain same...
  const handleShare = () => {
    if (navigator.share && property) {
      navigator.share({
        title: property.title,
        text: property.short_description || property.description?.substring(0, 100) || '',
        url: window.location.href,
      })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('property_favorites') || '[]');
    if (property && !favorites.includes(property.id)) {
      favorites.push(property.id);
      localStorage.setItem('property_favorites', JSON.stringify(favorites));
      alert('Added to favorites!');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatArea = (area) => {
    if (!area || area === 0) return "0 SqFt";
    return `${area.toLocaleString()} SqFt`;
  };

  const getTransactionDisplay = (type) => {
    const types = {
      'sale': 'For Sale',
      'rent': 'For Rent',
      'lease': 'For Lease'
    };
    return types[type] || type;
  };

  // ✅ REMOVE OLD STATIC FUNCTION:
  // const getPropertyTypeDisplay = (type) => {
  //   const types = {
  //     'apartment': 'Apartment',
  //     'house': 'House',
  //     'villa': 'Villa',
  //     'commercial': 'Commercial',
  //     'pg_coliving': 'PG/Co-living',
  //     'plots': 'Plots'
  //   };
  //   return types[type] || type;
  // };

  const getFurnishingDisplay = (status) => {
    const statuses = {
      'fully_furnished': 'Fully Furnished',
      'semi_furnished': 'Semi Furnished',
      'unfurnished': 'Unfurnished'
    };
    return statuses[status] || status;
  };

  const getFacingDisplay = (direction) => {
    const directions = {
      'east': 'East',
      'west': 'West',
      'north': 'North',
      'south': 'South',
      'north_east': 'North-East',
      'north_west': 'North-West',
      'south_east': 'South-East',
      'south_west': 'South-West'
    };
    return directions[direction] || direction;
  };

  const getOrdinalSuffix = (num) => {
    if (!num) return "";
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return num + "st";
    if (j === 2 && k !== 12) return num + "nd";
    if (j === 3 && k !== 13) return num + "rd";
    return num + "th";
  };

  const getContactInfo = () => {
    if (!property) return {};

    let contactName, contactMobile, contactEmail, contactWhatsapp;

    if (property.use_vendor_info || !property.contact_name) {
      contactName = property.vendor_name || property.vendor?.business_name || 'Seller';
      contactMobile = property.vendor_phone || property.vendor?.phone || '';
      contactEmail = property.vendor_email || property.vendor?.email || '';
      contactWhatsapp = property.contact_whatsapp || contactMobile;
    } else {
      contactName = property.contact_name || 'Seller';
      contactMobile = property.contact_mobile || '';
      contactEmail = property.contact_email || '';
      contactWhatsapp = property.contact_whatsapp || contactMobile;
    }

    return {
      name: contactName,
      mobile: contactMobile,
      email: contactEmail,
      whatsapp: contactWhatsapp
    };
  };

  // ✅ UPDATE OverviewItem component usage
  const OverviewItem = ({ icon: Icon, title, value }) => (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 flex items-center space-x-3">
      <div className="pr-3 border-r border-blue-200">
        <Icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
      </div>
      <div>
        <strong className="block text-xs text-gray-500 uppercase leading-none">{title}</strong>
        <span className="text-sm font-semibold text-gray-800">{value || "—"}</span>
      </div>
    </div>
  );

  // ✅ UPDATE Description text with dynamic property type
  // useEffect(() => {
  //   if (property) {
  //     const propertyType = getPropertyTypeDisplay(property.property_type);
  //     setInquiryData(prev => ({
  //       ...prev,
  //       message: `I am interested in ${property.title} (${propertyType}) at ${property.address}. Please contact me.`
  //     }));
  //   }
  // }, [property, propertyTypeOptions]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();

    if (!property) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      console.log("🔍 Property Object:", property);
      console.log("🔍 Vendor ID:", property.vendor_id);
      console.log("🔍 Vendor Object:", property.vendor);

      const vendorId = property.vendor_id ||
        property.vendor?.id ||
        (property.vendor ? property.vendor : null);

      console.log("🔍 Final Vendor ID:", vendorId);

      if (!vendorId) {
        throw new Error("Vendor information not found in property data");
      }

      // ✅ USE DYNAMIC PROPERTY TYPE IN SUBJECT
      const propertyType = getPropertyTypeDisplay(property.property_type);
      const inquiryPayload = {
        service_category: 'real_estate',
        vendor: vendorId,
        service_id: property.id,
        service_name: property.title,
        service_url: window.location.href,
        customer_name: inquiryData.name,
        customer_email: inquiryData.email || '',
        customer_phone: inquiryData.phone,
        customer_city: inquiryData.city,
        inquiry_type: 'general',
        subject: `Inquiry about ${property.title} (${propertyType})`,
        message: inquiryData.message
      };

      console.log("📤 Inquiry Payload:", inquiryPayload);

      const response = await publicAxios.post(
        '/api/services/public/inquiries/',
        inquiryPayload
      );

      console.log("✅ Response:", response.data);

      if (response.status === 201) {
        setSubmitSuccess(true);
        setInquiryData({
          name: '',
          phone: '',
          email: '',
          city: '',
          message: ''
        });

        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      }

    } catch (err) {
      console.error('❌ Error submitting inquiry:', err);
      console.error('❌ Error response:', err.response?.data);

      if (err.response?.data?.vendor) {
        setSubmitError(`Vendor error: ${err.response.data.vendor.join(' ')}`);
      } else if (err.response?.data?.detail) {
        setSubmitError(err.response.data.detail);
      } else if (err.response?.data) {
        const errors = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join(' | ');
        setSubmitError(`Validation errors: ${errors}`);
      } else {
        setSubmitError('Failed to submit inquiry. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInquiryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

    if (isMobile) {
    return <MobileRealEstateDetail />;
    }
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-4xl text-blue-600" />
        <span className="ml-3 text-lg">Loading property details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => navigate('/realestatehome')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Property not found</div>
      </div>
    );
  }

  const propertyImages = property.images || [];
  const mainImage = propertyImages.find(img => img.image_type === 'main')?.image_url ||
    propertyImages[0]?.image_url ||
    "https://placehold.co/600x400/87CEEB/white?text=Property+Image";

  const additionalImages = propertyImages.filter(img => img.image_type !== 'main').map(img => img.image_url) || [];
  const allImages = [mainImage, ...additionalImages].filter(Boolean);
  const slides = allImages.map(src => ({ src }));

  const contactInfo = getContactInfo();
  
  const getInitials = (name) => {
    if (!name) return 'S';
    return name.charAt(0).toUpperCase();
  };

  const displayAmenities = property.amenities?.slice(0, 6) || [];
  const nearbyFacilities = property.nearby_facilities || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title + Price & Action Icons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-800">{property.title || "Property"}</h1>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <p className="text-3xl font-extrabold text-blue-600">{formatCurrency(property.price)}</p>
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

      {/* Location and Property Type */}
      <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 border-b pb-4">
        <div className="flex items-center mr-4 mb-2">
          <FiMapPin className="w-4 h-4 mr-1 text-blue-500" />
          <p>{property.address || "Address not available"}</p>
        </div>
        <div className="flex items-center">
          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
            {getPropertyTypeDisplay(property.property_type)}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Images + Details (Col-span 2) */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <div className="relative col-span-2 row-span-2">
              <img
                className="rounded-lg shadow-md cursor-pointer hover:opacity-90 w-full h-96 object-cover transition duration-300"
                src={mainImage}
                alt={property.title || "Property"}
                onClick={() => {
                  setPhotoIndex(0);
                  setIsOpen(true);
                }}
              />
              {slides.length > 0 && (
                <button
                  onClick={() => setIsOpen(true)}
                  className="absolute bottom-4 right-4 bg-blue-600 text-white font-medium py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300 flex items-center justify-center text-sm shadow-lg"
                >
                  <FiGrid className="w-4 h-4 mr-2" /> View All Photos ({slides.length})
                </button>
              )}
            </div>

            {additionalImages.slice(0, 5).map((src, idx) => (
              <div key={idx} className="relative">
                <img
                  className="rounded-lg shadow-md cursor-pointer hover:opacity-90 w-full h-40 object-cover transition duration-300"
                  src={src}
                  alt={`${property.title || "Property"} - ${idx + 1}`}
                  onClick={() => {
                    setPhotoIndex(idx + 1);
                    setIsOpen(true);
                  }}
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

          {/* Description */}
          <section className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {property.description || "No description available."}
            </p>
          </section>

          {/* Overview - ✅ UPDATE: Use dynamic property types */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <OverviewItem 
                icon={FiTrello} 
                title="Type" 
                value={getPropertyTypeDisplay(property.property_type)} 
              />
              <OverviewItem 
                icon={FiClipboard} 
                title="Property Type" 
                value={getPropertySubTypeDisplay(property.property_type)} 
              />
              <OverviewItem 
                icon={FiDollarSign} 
                title="Transaction" 
                value={getTransactionDisplay(property.transaction_type)} 
              />
              <OverviewItem 
                icon={FiMaximize} 
                title="Balconies" 
                value={property.balconies || "—"} 
              />
              <OverviewItem 
                icon={FiDroplet} 
                title="Bathrooms" 
                value={property.bathrooms || "—"} 
              />
              <OverviewItem 
                icon={FiCrop} 
                title="Carpet Area" 
                value={formatArea(property.carpet_area)} 
              />
              <OverviewItem 
                icon={FiSquare} 
                title="Total Area" 
                value={formatArea(property.total_area_size)} 
              />
              <OverviewItem 
                icon={FiLayers} 
                title="Floor" 
                value={getOrdinalSuffix(property.floor_number) || "—"} 
              />
            </div>
          </section>

          {/* Property Details */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Price</strong>
                {formatCurrency(property.price)}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Furnishing</strong>
                {getFurnishingDisplay(property.furnishing_status)}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Total Floors</strong>
                {property.total_floors || "—"}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Facing</strong>
                {getFacingDisplay(property.facing_direction)}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Negotiable</strong>
                {property.negotiable !== undefined ? (property.negotiable ? 'Yes' : 'No') : '—'}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Maintenance</strong>
                {formatCurrency(property.maintenance_charges)}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Property Age</strong>
                {property.property_age || "—"}
              </div>
            </div>
          </section>

          {/* Amenities And Features */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Amenities And Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
              {displayAmenities.length > 0 ? (
                <>
                  <ul className="space-y-2">
                    {displayAmenities.slice(0, 3).map((amenity, index) => (
                      <li key={index} className="flex items-center">
                        <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" /> {amenity}
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-2">
                    {displayAmenities.slice(3, 6).map((amenity, index) => (
                      <li key={index} className="flex items-center">
                        <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" /> {amenity}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-gray-500 col-span-full">No amenities listed</p>
              )}
            </div>
          </section>

          {/* Location Details */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Location Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">City</strong>
                {property.city || "—"}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">Pin Code</strong>
                {property.pincode || "—"}
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <strong className="block text-xs text-gray-500 uppercase">State</strong>
                {property.state || "—"}
              </div>
            </div>
          </section>

          {/* ✅ REVIEWS SECTION - Location Details KE BAAD ADD KARO */}
<section className="mb-8">
  <ServiceReviewSection
    modelName="property"
    objectId={property.id}
    serviceName={property.title}
    accentColor="blue"
  />
</section>

          {/* What's Nearby? */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">What's Nearby?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-700">
              {(() => {
                const facilities = property.normalized_nearby_facilities || property.nearby_facilities || {};

                return (
                  <>
                    {facilities.hospitals && (
                      <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg shadow-md">
                        <FaHospital className="text-blue-500 w-6 h-6 mb-2" />
                        <p className="font-semibold">Hospitals</p>
                        <p className="text-xs text-gray-500">{facilities.hospitals} km away</p>
                      </div>
                    )}

                    {facilities.colleges && (
                      <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg shadow-md">
                        <FaUniversity className="text-blue-500 w-6 h-6 mb-2" />
                        <p className="font-semibold">Colleges/Universities</p>
                        <p className="text-xs text-gray-500">{facilities.colleges} km away</p>
                      </div>
                    )}

                    {facilities.shopping && (
                      <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg shadow-md">
                        <FaShoppingBag className="text-blue-500 w-6 h-6 mb-2" />
                        <p className="font-semibold">Shopping</p>
                        <p className="text-xs text-gray-500">{facilities.shopping} km away</p>
                      </div>
                    )}

                    {facilities.transport && (
                      <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg shadow-md">
                        <FaBus className="text-blue-500 w-6 h-6 mb-2" />
                        <p className="font-semibold">Transport</p>
                        <p className="text-xs text-gray-500">{facilities.transport} km away</p>
                      </div>
                    )}

                    {Object.keys(facilities).length === 0 && (
                      <p className="col-span-full text-center text-gray-500">
                        No nearby facilities information available
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
          </section>
        </div>

        {/* Right Column (Col-span 1) - STICKY CONTAINER */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 space-y-8">
            {/* Contact Seller Details */}
            <div className="h-fit bg-white shadow-lg rounded-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Contact Seller</h2>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-blue-500 p-0.5">
                  <span className="text-gray-700 font-bold text-xl">
                    {getInitials(contactInfo.name)}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="font-bold text-lg text-gray-900">{contactInfo.name}</p>
                  {contactInfo.mobile && (
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <FiPhone className="w-4 h-4 text-blue-500" /> {contactInfo.mobile}
                    </p>
                  )}
                  {contactInfo.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <FiMail className="w-4 h-4 text-blue-500" /> {contactInfo.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {contactInfo.mobile && (
                  <a
                    href={`tel:${contactInfo.mobile}`}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-150 flex items-center justify-center gap-2 font-medium"
                  >
                    <FiPhone /> Call Now
                  </a>
                )}
                {contactInfo.whatsapp && (
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-green-500 text-green-600 py-2 rounded-md hover:bg-green-50 flex items-center justify-center gap-2 transition duration-150 font-medium"
                  >
                    <FaWhatsapp className="w-5 h-5" /> WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Simplified Inquiry Form */}
            <div className="h-fit bg-white shadow-lg rounded-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Inquire Now</h2>

              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                  ✅ Inquiry submitted successfully! We'll contact you soon.
                </div>
              )}

              {submitError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  ❌ {submitError}
                </div>
              )}
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your Name</label>
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name*"
                  required
                  value={inquiryData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={submitting}
                />
                <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your Phone</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number*"
                  required
                  value={inquiryData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={submitting}
                />
                <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email (Optional)"
                  value={inquiryData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={submitting}
                />
                <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Your City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City*"
                  required
                  value={inquiryData.city}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={submitting}
                />
                <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Add message</label>
                <textarea
                  name="message"
                  placeholder="I am interested in this property. Please contact me."
                  rows="3"
                  value={inquiryData.message}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={submitting}
                ></textarea>

                {/* ✅ ADD: Property Type Info */}
                {/* <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                  <p><strong>Property:</strong> {property.title}</p>
                  <p><strong>Type:</strong> {getPropertyTypeDisplay(property.property_type)}</p>
                  <p><strong>Location:</strong> {property.city}, {property.state}</p>
                </div> */}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full ${submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-md transition duration-150 font-bold tracking-wide flex items-center justify-center`}
                >
                  {submitting ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Send Inquiry'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting, you agree to our Terms & Privacy Policy
                </p>
              </form>
            </div>

            {/* Why Choose Us? section */}
            <div className="h-fit bg-white shadow-lg rounded-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">Why Choose Us?</h3>
              <ul className="text-sm text-gray-700 space-y-3">
                <li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" /> **Verified Properties**</li>
                <li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" /> **Genuine Buyers**</li>
                <li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" /> **Hassle-free Experience**</li>
                <li className="flex items-center"><FiCheckCircle className="text-green-500 mr-3 w-5 h-5 flex-shrink-0" /> **Secure Transactions**</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}