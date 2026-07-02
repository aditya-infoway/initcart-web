import React from "react";
import Slider from "react-slick";
import { FaStar, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

export default function RelatedServicesSlider({ properties = [] }) {
  const sliderSettings = {
    dots: true,
    infinite: properties.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, properties.length),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, properties.length),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
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

  if (properties.length === 0) return null;

  return (
    <div className="bg-gray-50 py-8 rounded-xl">
      <Slider {...sliderSettings}>
        {properties.map((property) => (
          <div key={property.id} className="px-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="relative h-48">
                <img
                  src={property.main_image || property.thumbnail_image || "https://placehold.co/600x400"}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FaStar className="text-xs" />
                    Featured
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-2">
                  {property.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <FaMapMarkerAlt />
                  <span className="line-clamp-1">{property.city}</span>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                    <MdVerified />
                    Verified
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaBed />
                    <span>{property.bedrooms || 0} Beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaBath />
                    <span>{property.bathrooms || 0} Baths</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaRulerCombined />
                    <span>{property.total_area_size || 0} sq.ft</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}