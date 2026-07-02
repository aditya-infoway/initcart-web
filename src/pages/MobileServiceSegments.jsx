// MobileServiceSlider.jsx
import React, { useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

import realEstateIcon  from "../assets/service-icon/realestate.png";
import gymIcon         from "../assets/service-icon/gym.png";
import saloonIcon      from "../assets/service-icon/saloon.png";
import travelIcon      from "../assets/service-icon/travel-agency.png";
import financeIcon     from "../assets/service-icon/finance.png";
import techIcon        from "../assets/service-icon/tech-industry.png";
import hotelIcon       from "../assets/service-icon/hotel-resturant.png";
import healthcareIcon  from "../assets/service-icon/healthcare.png";
import educationIcon   from "../assets/service-icon/education.png";
import professionalIcon from "../assets/service-icon/professional.png";
import workplaceIcon   from "../assets/service-icon/workplace.png";

const servicesData = [
  { id: 1,  title: "Real Estate",  path: "/realestatehome",    img: realEstateIcon,   color: "from-emerald-500 to-teal-500"   },
  { id: 2,  title: "Gym",          path: "/gymhome",            img: gymIcon,          color: "from-orange-500 to-red-500"     },
  { id: 3,  title: "Saloon",       path: "/saloonhome",         img: saloonIcon,       color: "from-pink-500 to-rose-500"      },
  { id: 4,  title: "Travel",       path: "/travelhome",         img: travelIcon,       color: "from-sky-500 to-blue-500"       },
  { id: 5,  title: "Finance",      path: "/financehome",        img: financeIcon,      color: "from-green-500 to-emerald-500"  },
  { id: 6,  title: "Tech",         path: "/techindustryhome",   img: techIcon,         color: "from-purple-500 to-indigo-500"  },
  { id: 7,  title: "Hotel",        path: "/hotelhome",          img: hotelIcon,        color: "from-amber-500 to-yellow-500"   },
  { id: 8,  title: "Healthcare",   path: "/helthcarehome",      img: healthcareIcon,   color: "from-cyan-500 to-blue-500"      },
  { id: 9,  title: "Education",    path: "/educationhome",      img: educationIcon,    color: "from-violet-500 to-purple-500"  },
  { id: 10, title: "Professional", path: "/professionalhome",   img: professionalIcon, color: "from-slate-500 to-gray-500"     },
  { id: 11, title: "Work Place",   path: "/workplacehome",      img: workplaceIcon,    color: "from-indigo-500 to-blue-500"    },
];

// Poora list dono taraf clone — truly infinite dono directions
const CLONE_COUNT = servicesData.length; // 11

// [...11 clones, ...11 real, ...11 clones] = 33 items
const displayList = [
  ...servicesData,
  ...servicesData,
  ...servicesData,
];

const MobileServiceSlider = () => {
  const navigate = useNavigate();

  const scrollRef    = useRef(null);
  const autoTimer    = useRef(null);
  const resumeTimer  = useRef(null);
  const isUserActive = useRef(false);
  const isTeleport   = useRef(false);

  // Card width + gap step
  const getStep = useCallback(() => {
    const el = scrollRef.current?.children[0];
    return el ? el.offsetWidth + 6 : 84; // 78px card + 6px gap
  }, []);

  // Jump to middle of real zone on mount — dono taraf equal infinite room
  const jumpToReal = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isTeleport.current = true;
    const step = getStep();
    // Start at real-first card (CLONE_COUNT items ke baad)
    // Dono taraf CLONE_COUNT cards ka buffer hai → dono taraf infinite swipe
    el.scrollLeft = CLONE_COUNT * step;
    requestAnimationFrame(() => { isTeleport.current = false; });
  }, [getStep]);

  useEffect(() => {
    const t = setTimeout(jumpToReal, 60);
    return () => clearTimeout(t);
  }, [jumpToReal]);

  // Scroll listener: teleport when entering clone zone
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      if (isTeleport.current) return;
      const step      = getStep();
      const realStart = CLONE_COUNT * step;
      const realEnd   = realStart + servicesData.length * step;

      if (el.scrollLeft >= realEnd) {
        isTeleport.current = true;
        el.scrollLeft -= servicesData.length * step;
        requestAnimationFrame(() => { isTeleport.current = false; });
      } else if (el.scrollLeft < realStart) {
        isTeleport.current = true;
        el.scrollLeft += servicesData.length * step;
        requestAnimationFrame(() => { isTeleport.current = false; });
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [getStep]);

  // Auto scroll: one card left every 2s
  const startAutoScroll = useCallback(() => {
    clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => {
      if (!isUserActive.current && scrollRef.current) {
        scrollRef.current.scrollBy({ left: getStep(), behavior: "smooth" });
      }
    }, 2000);
  }, [getStep]);

  useEffect(() => {
    const t = setTimeout(startAutoScroll, 300);
    return () => {
      clearTimeout(t);
      clearInterval(autoTimer.current);
      clearTimeout(resumeTimer.current);
    };
  }, [startAutoScroll]);

  // Touch handlers
  const onStart = useCallback(() => {
    isUserActive.current = true;
    clearInterval(autoTimer.current);
    autoTimer.current = null;
    clearTimeout(resumeTimer.current);
  }, []);

  const onMove = useCallback(() => {
    if (!isUserActive.current) return;
    clearTimeout(resumeTimer.current);
  }, []);

  const onEnd = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isUserActive.current = false;
      startAutoScroll();
    }, 2000);
  }, [startAutoScroll]);

  return (
    <section className="py-2 px-2 bg-white">

      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
          <h2 className="text-[14px] font-bold text-black">Our Services</h2>
        </div>
        <button
          onClick={() => navigate("/servicelistpage")}
          className="text-[11px] text-purple-600 font-semibold flex items-center gap-0.5"
        >
          View All
          <FiChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Infinite Slider */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto touch-pan-x"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
        onTouchCancel={onEnd}
      >
        {displayList.map((service, index) => (
          <div
            key={`${service.id}-${index}`}
            onClick={() => navigate(service.path)}
            className="flex-shrink-0 w-[78px] cursor-pointer"
          >
            {/* Square icon box */}
            <div
              className={`w-[74px] h-[74px] mx-auto rounded-xl bg-gradient-to-br ${service.color} p-[2px] shadow-sm`}
            >
              <div className="w-full h-full bg-white rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src={service.img}
                  alt={service.title}
                  className="w-[53px] h-[53px] object-contain"
                  draggable={false}
                />
              </div>
            </div>

            {/* Title */}
            <p className="mt-1 text-[10px] font-medium text-gray-700 text-center leading-tight">
              {service.title}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
};

export default MobileServiceSlider;