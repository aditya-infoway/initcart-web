// src/components/MobileServiceHeader.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import logo from "/logo.png";

// Service icons mapping
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
// import restaurantIcon from "../assets/service-icon/restaurant.png";

const servicesData = [
  { id: 1, title: "Real Estate", path: "/realestatehome", img: realEstateIcon },
  { id: 2, title: "Gym", path: "/gymhome", img: gymIcon },
  { id: 3, title: "Saloon", path: "/saloonhome", img: saloonIcon },
  { id: 4, title: "Travel", path: "/travelhome", img: travelIcon },
  { id: 5, title: "Finance", path: "/financehome", img: financeIcon },
  { id: 6, title: "Tech", path: "/techindustryhome", img: techIcon },
  { id: 7, title: "Hotel", path: "/hotelhome", img: hotelIcon },
  { id: 8, title: "Healthcare", path: "/helthcarehome", img: healthcareIcon },
  { id: 9, title: "Education", path: "/educationhome", img: educationIcon },
  { id: 10, title: "Professional", path: "/professionalhome", img: professionalIcon },
  { id: 11, title: "Work Place", path: "/workplacehome", img: workplaceIcon },
//   { id: 12, title: "Restaurant", path: "/restauranthome", img: restaurantIcon },
];

// Clone count for infinite scroll
const CLONE_COUNT = servicesData.length;
const displayList = [...servicesData, ...servicesData, ...servicesData];

export default function MobileServiceHeader({ onHeightChange }) {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const scrollRef = useRef(null);
  const autoTimer = useRef(null);
  const resumeTimer = useRef(null);
  const isUserActive = useRef(false);
  const isTeleport = useRef(false);

  const [searchText, setSearchText] = useState("");

  // ── Report header height to parent ──────────────────────────────────────
  useEffect(() => {
    if (!headerRef.current || !onHeightChange) return;
    const ro = new ResizeObserver((entries) => {
      onHeightChange(entries[0].contentRect.height);
    });
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, [onHeightChange]);

  // ── Infinite scroll: get step size ──────────────────────────────────────
  const getStep = useCallback(() => {
    const el = scrollRef.current?.children[0];
    return el ? el.offsetWidth + 8 : 80;
  }, []);

  // ── Jump to middle (real zone) ──────────────────────────────────────────
  const jumpToReal = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isTeleport.current = true;
    const step = getStep();
    el.scrollLeft = CLONE_COUNT * step;
    requestAnimationFrame(() => {
      isTeleport.current = false;
    });
  }, [getStep]);

  useEffect(() => {
    const t = setTimeout(jumpToReal, 80);
    return () => clearTimeout(t);
  }, [jumpToReal]);

  // ── Scroll teleport ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      if (isTeleport.current) return;
      const step = getStep();
      const realStart = CLONE_COUNT * step;
      const realEnd = realStart + servicesData.length * step;

      if (el.scrollLeft >= realEnd) {
        isTeleport.current = true;
        el.scrollLeft -= servicesData.length * step;
        requestAnimationFrame(() => {
          isTeleport.current = false;
        });
      } else if (el.scrollLeft < realStart) {
        isTeleport.current = true;
        el.scrollLeft += servicesData.length * step;
        requestAnimationFrame(() => {
          isTeleport.current = false;
        });
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [getStep]);

  // ── Auto scroll ──────────────────────────────────────────────────────────
  const startAutoScroll = useCallback(() => {
    clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => {
      if (!isUserActive.current && scrollRef.current) {
        scrollRef.current.scrollBy({ left: getStep(), behavior: "smooth" });
      }
    }, 2500);
  }, [getStep]);

  useEffect(() => {
    const t = setTimeout(startAutoScroll, 400);
    return () => {
      clearTimeout(t);
      clearInterval(autoTimer.current);
      clearTimeout(resumeTimer.current);
    };
  }, [startAutoScroll]);

  // ── Touch handlers ──────────────────────────────────────────────────────
  const onTouchStart = useCallback(() => {
    isUserActive.current = true;
    clearInterval(autoTimer.current);
    autoTimer.current = null;
    clearTimeout(resumeTimer.current);
  }, []);

  const onTouchEnd = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isUserActive.current = false;
      startAutoScroll();
    }, 2500);
  }, [startAutoScroll]);

  // ── Search handler ──────────────────────────────────────────────────────
  const handleSearch = () => {
    const query = searchText.trim();
    if (!query) return;
    navigate(`/searchservice?keyword=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div
      ref={headerRef}
      className="md:hidden fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: '#1565C0' }}
    >
      {/* ── Logo Row ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-0.5">
        <Link to="/servicehome" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
            <img
              src={logo}
              alt="Service"
              className="h-6 w-6 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <span
            className="font-bold text-sm tracking-wide"
            style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
          >
            InitCart
          </span>
        </Link>
      </div>

      {/* ── Service Categories Slider ────────────────────────────────────── */}
      <div className="px-2 pt-1 pb-1">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto touch-pan-x"
          style={{
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          {displayList.map((service, index) => (
            <div
              key={`${service.id}-${index}`}
              onClick={() => navigate(service.path)}
              className="flex-shrink-0 w-[68px] cursor-pointer"
            >
              {/* Square icon box with white background */}
              <div
                className="w-[60px] h-[60px] mx-auto rounded-xl flex items-center justify-center overflow-hidden shadow-sm"
                style={{
                  backgroundColor: '#ffffff',
                }}
              >
                <img
                  src={service.img}
                  alt={service.title}
                  className="w-[55px] h-[55px] rounded-xl object-contain"
                  draggable={false}
                />
              </div>
              {/* Title - White text */}
              <p
                className="mt-0.5 text-[9px] font-medium text-center leading-tight truncate max-w-[64px]"
                style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              >
                {service.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search Bar ──────────────────────────────────────────────────────── */}
      <div className="px-3 pb-2.5">
        <div
          className="flex items-center bg-white overflow-hidden shadow-md"
          style={{ borderRadius: 12, height: 38 }}
        >
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for gym, salon, hotel..."
            className="flex-1 px-3 py-1.5 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 text-white text-sm font-medium flex items-center justify-center"
            style={{
              backgroundColor: '#60A5FA',
              borderRadius: '0 12px 12px 0',
            }}
          >
            <FiSearch className="w-4 h-7" />
          </button>
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}