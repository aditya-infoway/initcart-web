import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

// --- Icons ---
const PlaneIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="M17.8 19.2 20 21h2v-2l-1.2-2.2c-1-.7-1.3-2.1-.7-3.2L20 12c.7-1.1.4-2.5-.7-3.2L16.4 7h-6.8L9 5.6c-.6-1-.2-2.3.6-3.1L12 1h-2L6 2v2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2l-1.4 1.4c-.8.8-1 2-.7 3.1l.6 1.8c.4 1.1 1.5 1.8 2.7 1.8h7c1.2 0 2.3-.7 2.7-1.8Z" />
    <path d="m14 10-2-2" />
  </svg>
);

const WrenchIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.4 1.4a1 1 0 0 0 1.4 0l.7-.7a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0z" />
    <path d="m21.8 2.5-4-2.1a1 1 0 0 0-1.2 1.5l1.4 2.2-2 2-2.2-1.4a1 1 0 0 0-1.5 1.2l2.1 4-4 4-4-4-4-2.1a1 1 0 0 0-1.2 1.5l2.2 1.4 2 2-1.4 2.2a1 1 0 0 0 1.5 1.2l2.1-4 4 4 4 4 4-2.1a1 1 0 0 0 1.2-1.5l-1.4-2.2 2-2 2.2 1.4a1 1 0 0 0 1.5-1.2l-2.1-4 4-4z" />
  </svg>
);

const BuildingIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <rect x="3" y="6" width="18" height="15" rx="2" ry="2" />
    <path d="M9 18V9m6 9V9" />
  </svg>
);

const HeartIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const UserIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2m7-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
  </svg>
);

const ChevronLeftIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// --- Constants ---
const AUTO_SCROLL_INTERVAL = 10000;

// --- Large Banners ---
const largeBanners = [
  {
    id: 1,
    title: "Time to fly at Lowest Airfares",
    buttonText: "Book Now",
    icon: PlaneIcon,
    bgColor: "bg-gradient-to-r from-blue-500 to-sky-400",
    visual: (
      <div className="absolute right-0 top-0 h-full w-1/2 p-4 flex items-center justify-center">
        <div className="relative w-40 h-40 md:w-52 md:h-52 bg-white/20 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center">
          <PlaneIcon size={80} className="text-white transform -rotate-45" />
          <div className="absolute text-sm font-bold text-white bottom-4">New Routes!</div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "New Deals on Home Services",
    buttonText: "Explore Vendors",
    icon: WrenchIcon,
    bgColor: "bg-gradient-to-r from-red-600 to-rose-500",
    visual: (
      <div className="absolute right-0 top-0 h-full w-1/2 p-2 flex items-center justify-center">
        <WrenchIcon size={120} className="text-white opacity-90" />
      </div>
    ),
  },
];

// --- Small Cards (with route paths) ---
const smallCards = [
  { id: 1, title: "REAL ESTATE", subtitle: "Finest Agents", icon: BuildingIcon, bgColor: "bg-[#6d28d9]", text: "white", path: "/realestate" },
  { id: 2, title: "GYM", subtitle: "Fitness & Wellness", icon: UserIcon, bgColor: "bg-[#1e3a8a]", text: "white", path: "/gymhome" },
  { id: 3, title: "SALOON", subtitle: "Style & Grooming", icon: HeartIcon, bgColor: "bg-[#4338ca]", text: "white", path: "/saloonhome" },
  { id: 4, title: "TRAVEL", subtitle: "Book Flights & Trips", icon: PlaneIcon, bgColor: "bg-blue-600", text: "white", path: "/travelhome" },
  { id: 5, title: "FINANCE", subtitle: "Loans & Planning", icon: WrenchIcon, bgColor: "bg-yellow-600", text: "black", path: "/financehome" },
  { id: 6, title: "TECH INDUSTRY", subtitle: "Modern Solutions", icon: WrenchIcon, bgColor: "bg-purple-700", text: "white", path: "/techindustryhome" },
  { id: 7, title: "HOSPITALITY", subtitle: "Hotels & Resorts", icon: BuildingIcon, bgColor: "bg-pink-600", text: "white", path: "/hotelhome" },
  { id: 8, title: "HEALTHCARE", subtitle: "Book Doctors", icon: HeartIcon, bgColor: "bg-green-600", text: "white", path: "/helthcarehome" },
  { id: 9, title: "EDUCATION", subtitle: "Find Top Courses", icon: PlaneIcon, bgColor: "bg-red-600", text: "white", path: "/educationhome" },
  { id: 10, title: "PROFESSIONAL", subtitle: "Expert Services", icon: WrenchIcon, bgColor: "bg-[#059669]", text: "white", path: "/professionalhome" },
  { id: 11, title: "WORKPLACE", subtitle: "Job Opportunities", icon: UserIcon, bgColor: "bg-[#2563eb]", text: "white", path: "/workplacehome" },
];

// --- Components ---
const LargeBannerCard = ({ banner }) => (
  <div className={`relative w-full h-full p-6 lg:p-10 ${banner.bgColor} rounded-2xl shadow-2xl overflow-hidden`}>
    {banner.visual}
    <div className="relative z-10 flex flex-col justify-center h-full max-w-sm">
      <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
        {banner.title}
      </h2>
      <button className="w-fit px-6 py-3 bg-blue-900 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-800 transition duration-300">
        {banner.buttonText}
      </button>
      <div className="mt-8 text-sm text-white/80 flex items-center">
        Powered by <PlaneIcon size={16} className="ml-1 mr-1" /> EasyTrip
      </div>
    </div>
  </div>
);

const SmallFeatureCard = ({ card }) => (
  <div className="flex-shrink-0 w-full p-1 sm:w-1/2 lg:w-1/3 xl:w-1/4">
    <Link to={card.path}>
      <div className={`${card.bgColor} ${card.text === "white" ? "text-white" : "text-black"} h-full p-4 rounded-xl shadow-lg flex flex-col justify-between transition duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
        <card.icon size={36} className="mb-2" />
        <div>
          <h3 className="text-xl font-bold leading-tight">{card.title}</h3>
          <p className={`text-sm ${card.text === "white" ? "text-white/80" : "text-black/70"}`}>
            {card.subtitle}
          </p>
        </div>
      </div>
    </Link>
  </div>
);

// --- Slider logic (unchanged) ---
const getSingleCardWidth = () => {
  const innerWidth = window.innerWidth;
  if (innerWidth >= 1280) return (innerWidth / 2) / 4;
  if (innerWidth >= 1024) return (innerWidth / 2) / 3;
  if (innerWidth >= 640) return (innerWidth / 2) / 2;
  return innerWidth / 2;
};

export default function ServiceSlider() {
  const [currentLgIndex, setCurrentLgIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const sliderRef = React.useRef(null);

  const nextSlideLg = useCallback(() => {
    setCurrentLgIndex((prevIndex) => (prevIndex + 1) % largeBanners.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlideLg, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(interval);
  }, [nextSlideLg]);

  const getNextOffset = useCallback((currentOffset) => {
    if (!sliderRef.current) return 0;
    const cardWidth = getSingleCardWidth();
    let nextOffset = currentOffset + cardWidth;
    const maxOffset = cardWidth * smallCards.length;
    if (nextOffset >= maxOffset) return 0;
    return nextOffset;
  }, []);

  const getPrevOffset = useCallback((currentOffset) => {
    const cardWidth = getSingleCardWidth();
    let prevOffset = currentOffset - cardWidth;
    return Math.max(0, prevOffset);
  }, []);

  const autoScrollSm = useCallback(() => {
    setScrollOffset((prevOffset) => getNextOffset(prevOffset));
  }, [getNextOffset]);

  useEffect(() => {
    const interval = setInterval(autoScrollSm, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(interval);
  }, [autoScrollSm]);

  const handleScrollSm = (direction) => {
    if (direction === "next") setScrollOffset((prev) => getNextOffset(prev));
    else setScrollOffset((prev) => getPrevOffset(prev));
  };

  return (
    <div>
      <h1 className=" text-2xl font-bold text-gray-800 mb-6 text-center lg:text-left">
        Featured Promotions & Services
      </h1>

      <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
        <div className="w-full lg:w-1/2 h-[380px]">
          <div className="w-full relative overflow-hidden rounded-2xl h-full">
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentLgIndex * 100}%)` }}
            >
              {largeBanners.map((banner) => (
                <div key={banner.id} className="flex-shrink-0 w-full h-full">
                  <LargeBannerCard banner={banner} />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
              {largeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentLgIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentLgIndex ? "bg-white w-6" : "bg-white/50"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- Right side scrollable cards --- */}
        <div className="w-full lg:w-1/2 h-[380px]">
          <div className="relative overflow-hidden rounded-2xl h-full">
            <div
              ref={sliderRef}
              className="flex h-full"
              style={{
                transform: `translateX(-${scrollOffset}px)`,
                transition: "transform 0.5s ease-in-out",
              }}
            >
              {[...smallCards, ...smallCards].map((card, index) => (
                <SmallFeatureCard key={`${card.id}-${index}`} card={card} />
              ))}
            </div>

            <button
              onClick={() => handleScrollSm("prev")}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full z-10 hover:bg-black/60 transition"
            >
              <ChevronLeftIcon size={24} />
            </button>

            <button
              onClick={() => handleScrollSm("next")}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full z-10 hover:bg-black/60 transition"
            >
              <ChevronRightIcon size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
