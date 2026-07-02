import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import realEstateIcon from "../assets/service-icon/realestate.png";
import gymIcon from "../assets/service-icon/gym.png";
import saloonIcon from "../assets/service-icon/saloon.png";
import travelIcon from "../assets/service-icon/travel-agency.png";
import financeIcon from "../assets/service-icon/finance.png";
import techIcon from "../assets/service-icon/tech-industry.png";
import hotelIcon from "../assets/service-icon/hotel-resturant.png";
import healthcareIcon from "../assets/service-icon/healthcare.png";
import educationIcon from "../assets/service-icon/education.png";
import professionalIcon from "../assets/service-icon/professional.png";
import workplaceIcon from "../assets/service-icon/workplace.png";

const services = [
  { id: 1, title: "Real Estate", keyword: "real estate,house", path: "/realestatehome", img: realEstateIcon },
  { id: 2, title: "Gym", keyword: "gym,fitness", path: "/gymhome", img: gymIcon },
  { id: 3, title: "Saloon", keyword: "salon,beauty", path: "/saloonhome", img: saloonIcon },
  { id: 4, title: "Travel Agency", keyword: "travel,holiday", path: "/travelhome", img: travelIcon },
  { id: 5, title: "Finance", keyword: "finance,money", path: "/financehome", img: financeIcon },
  { id: 6, title: "Tech Industry", keyword: "technology,startup", path: "/techindustryhome", img: techIcon },
  { id: 7, title: "Hotel & Restaurant", keyword: "hotel,restaurant", path: "/hotelhome", img: hotelIcon },
  { id: 8, title: "Healthcare", keyword: "healthcare,hospital", path: "/helthcarehome", img: healthcareIcon },
  { id: 9, title: "Education", keyword: "education,school", path: "/educationhome", img: educationIcon },
  { id: 10, title: "Professional", keyword: "professional,office", path: "/professionalhome", img: professionalIcon },
  { id: 11, title: "Work Place", keyword: "coworking,office", path: "/workplacehome", img: workplaceIcon },
];

function svgPlaceholder(title, size = 200) {
  const initials = title
    .split(" ")
    .map((s) => s[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bg = "#f1f5f9";
  const fg = "#475569";
  const fontSize = Math.round(size / 3.5);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
    <rect width='100%' height='100%' fill='${bg}'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='${fontSize}' fill='${fg}'>${initials}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function ServiceSegmentSlider() {
  const navigate = useNavigate();
  const [itemsPerView, setItemsPerView] = useState(6);
  const [start, setStart] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const setFromWidth = () => {
      const w = window.innerWidth;
      if (w >= 1280) setItemsPerView(8);
      else if (w >= 1024) setItemsPerView(6);
      else if (w >= 768) setItemsPerView(3);
      else setItemsPerView(3);
    };
    setFromWidth();
    window.addEventListener("resize", setFromWidth);
    return () => window.removeEventListener("resize", setFromWidth);
  }, []);

  useEffect(() => setStart(0), [itemsPerView]);

  const visible = useMemo(() => {
    const out = [];
    for (let i = 0; i < itemsPerView; i += 1) {
      out.push(services[(start + i) % services.length]);
    }
    return out;
  }, [start, itemsPerView]);

  const prev = () => setStart((s) => (s - 1 + services.length) % services.length);
  const next = () => setStart((s) => (s + 1) % services.length);

  // Auto-slide every 8 seconds
  useEffect(() => {
    const id = setInterval(() => setStart((s) => (s + 1) % services.length), 8000);
    return () => clearInterval(id);
  }, []);

  const getUnsplashUrl = (keyword) =>
    `https://source.unsplash.com/featured/300x300/?${encodeURIComponent(keyword)}`;

  return (
    <section className="mt-10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2 sm:px-4">
        <h2 className="text-lg font-semibold text-gray-900">OUR SERVICES</h2>
        <button
          onClick={() => navigate("/servicelistpage")}
          className="text-sm text-blue-600 transition-colors"
        >
          View all
        </button>
      </div>

      {/* Slider */}
      <div className="relative w-full overflow-hidden px-4 sm:px-4 group/slider">
        <div
          className="grid transition-all duration-500 ease-out gap-3 justify-center"
          style={{
            gridTemplateColumns: `repeat(${itemsPerView}, auto)`,
          }}
        >
          {visible.map((s) => (
            <div
              key={s.id}
              className="group/card cursor-pointer"
              onClick={() => navigate(s.path)}
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image Container - Minimal design */}
              <div className="relative mx-auto h-24 w-24 md:h-32 md:w-32 rounded-full bg-white border border-gray-200 flex items-center justify-center transition-all duration-300 group-hover/card:border-gray-400">
                <img
                  src={s.img || getUnsplashUrl(s.keyword)}
                  alt={s.title}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="h-4/5 w-4/5 object-cover rounded-full transition-all duration-500 group-hover/card:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getUnsplashUrl(s.keyword);
                    setTimeout(() => {
                      if (!e.currentTarget.complete || e.currentTarget.naturalWidth === 0) {
                        e.currentTarget.src = `https://picsum.photos/seed/service-${s.id}/300/300`;
                      }
                    }, 2000);
                    setTimeout(() => {
                      if (!e.currentTarget.complete || e.currentTarget.naturalWidth === 0) {
                        e.currentTarget.src = svgPlaceholder(s.title, 300);
                      }
                    }, 4000);
                  }}
                />

                {/* Subtle hover indicator */}
                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300 ${hoveredId === s.id ? 'bg-gray-400 scale-100' : 'bg-transparent scale-0'
                  }`} />
              </div>

              {/* Title - Minimal */}
              <div className="mt-3 text-sm font-normal text-gray-600 text-center truncate mx-auto group-hover/card:text-gray-900 transition-colors">
                {s.title}
              </div>

              {/* Inquiry Button - Minimal, appears on hover */}
              <div className="flex justify-center mt-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                <button
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-sm hover:bg-blue-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(s.path);
                  }}
                >
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Minimal, appear on hover */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full border border-gray-200 shadow-sm transition-all duration-300 opacity-0 group-hover/slider:opacity-100 hover:bg-gray-50 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-4 w-4 text-gray-600"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full border border-gray-200 shadow-sm transition-all duration-300 opacity-0 group-hover/slider:opacity-100 hover:bg-gray-50 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-4 w-4 text-gray-600"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Minimal Progress Dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {services.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStart(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${idx === start ? 'w-4 bg-gray-600' : 'w-1 bg-gray-300'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}