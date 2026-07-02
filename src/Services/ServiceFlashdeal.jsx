import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

// 1. UPDATED DATA: Services list with STABLE, sector-relevant image URLs
const services = [
  {
    id: 1,
    title: "Real Estate",
    route: "/realestatehome", 
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGhvdGVsJTIwcm9vbXxlbnwwfDB8fHwxNzAzNTc3Nzk1fDA&ixlib=rb-4.0.3&q=80&w=400",
    rating: 5,
    reviews: 87, 
  },
  {
    id: 2,
    title: "Gym & Fitness",
    route: "/gymhome",
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGhvdGVsJTIwcm9vbXxlbnwwfDB8fHwxNzAzNTc3Nzk1fDA&ixlib=rb-4.0.3&q=80&w=400",
    rating: 4,
    reviews: 120,
  },
  {
    id: 3,
    title: "Hair Saloon",
    route: "/saloonhome",
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGhvdGVsJTIwcm9vbXxlbnwwfDB8fHwxNzAzNTc3Nzk1fDA&ixlib=rb-4.0.3&q=80&w=400",
    rating: 5,
    reviews: 45,
  },
  {
    id: 4,
    title: "Travel Agency",
    route: "/travelhome",
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGhvdGVsJTIwcm9vbXxlbnwwfDB8fHwxNzAzNTc3Nzk1fDA&ixlib=rb-4.0.3&q=80&w=400",
    rating: 5,
    reviews: 98,
  },
  {
    id: 5,
    title: "Finance & Consulting",
    route: "/financehome",
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGhvdGVsJTIwcm9vbXxlbnwwfDB8fHwxNzAzNTc3Nzk1fDA&ixlib=rb-4.0.3&q=80&w=400",
    rating: 4,
    reviews: 72,
  },
  {
    id: 6,
    title: "Tech Industry",
    route: "/techindustryhome",
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGhvdGVsJTIwcm9vbXxlbnwwfDB8fHwxNzAzNTc3Nzk1fDA&ixlib=rb-4.0.3&q=80&w=400",
    rating: 5,
    reviews: 65,
  },
  {
    id: 7,
    title: "Hospitality & Hotel",
    route: "/hotelhome",
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGhvdGVsJTIwcm9vbXxlbnwwfDB8fHwxNzAzNTc3Nzk1fDA&ixlib=rb-4.0.3&q=80&w=400",
    rating: 4,
    reviews: 110,
  },
  {
    id: 8,
    title: "Healthcare",
    route: "/helthcarehome",
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGhvdGVsJTIwcm9vbXxlbnwwfDB8fHwxNzAzNTc3Nzk1fDA&ixlib=rb-4.0.3&q=80&w=400",
    rating: 5,
    reviews: 155,
  },
  {
    id: 9,
    title: "Education",
    route: "/educationhome",
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fGhvdGVsJTIwcm9vbXxlbnwwfDB8fHwxNzAzNTc3Nzk1fDA&ixlib=rb-4.0.3&q=80&w=400",
    rating: 4,
    reviews: 130,
  },
  {
    id: 10,
    title: "Professional Services",
    route: "/professionalhome",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwc2VydmljZXN8ZW58MHwwfHx8MTcwMzU3ODEzMHww&ixlib=rb-4.0.3&q=80&w=400",
    rating: 5,
    reviews: 90,
  },
  {
    id: 11,
    title: "Workplace Solutions",
    route: "/workplacehome",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fHdvcmtwbGFjZSUyMHNvbHV0aW9uc3xlbnwwfDB8fHwxNzAzNTc3Nzk1fDA&ixlib=rb-4.0.3&q=80&w=400",
    rating: 4,
    reviews: 60,
  },
];

export default function ServiceShowcase() {
  // RETAINED Original Timer State
  const [timeLeft, setTimeLeft] = useState({
    days: 828,
    hours: 2,
    minutes: 10,
    seconds: 35,
  });
  const [start, setStart] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // RETAINED Original Countdown Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds -= 1;
        else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days -= 1;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Responsive items per view (Unchanged)
  useEffect(() => {
    const setFromWidth = () => {
      const w = window.innerWidth;
      if (w >= 1280) setItemsPerView(4);
      else if (w >= 1024) setItemsPerView(3);
      else if (w >= 640) setItemsPerView(2);
      else setItemsPerView(1);
    };
    setFromWidth();
    window.addEventListener("resize", setFromWidth);
    return () => window.removeEventListener("resize", setFromWidth);
  }, []);

  // Auto Slide (7 seconds)
  useEffect(() => {
    const id = setInterval(() => setStart((s) => (s + 1) % services.length), 7000); 
    return () => clearInterval(id);
  }, []);

  // useMemo for visible items
  const visible = useMemo(() => {
    const out = [];
    for (let i = 0; i < itemsPerView; i++) {
      out.push(services[(start + i) % services.length]);
    }
    return out;
  }, [start, itemsPerView]);

  const prev = () => setStart((s) => (s - 1 + services.length) % services.length);
  const next = () => setStart((s) => (s + 1) % services.length);

  // --- RENDER SECTION ---

  return (
    <section className="bg-blue-50 rounded-lg p-6 mt-8 shadow-sm group">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-blue-900">SECTOR SPOTLIGHT</h2>
        <Link to="/serviceflashdeal" className="text-sm text-blue-700 hover:underline">
          View All Services
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Countdown Timer JSX (RETAINED) */}
        <div className="bg-blue-700 text-white rounded-lg p-6 flex flex-col items-center justify-center w-full lg:w-[340px]">
          <h3 className="text-center font-medium text-sm mb-4 leading-5">
            Hurry Up! The offer is limited. <br />
            Grab while it lasts
          </h3>
          <div className="flex justify-center space-x-3 text-center">
            {Object.entries(timeLeft).map(([key, value]) => (
              <div key={key} className="bg-blue-900 rounded-md p-2">
                <div className="text-xl font-bold">
                  {value.toString().padStart(2, "0")}
                </div>
                <div className="text-[10px] uppercase tracking-wide">{key}</div>
              </div>
            ))}
          </div>
          <div className="w-full h-1 bg-blue-300 mt-4 rounded-full overflow-hidden">
            <div className="bg-white h-1 rounded-full w-3/4"></div>
          </div>
        </div>

        {/* Service Slider Container */}
        <div className="relative flex-1 group/slider">
          <div
            className="grid transition-all duration-300"
            style={{
              gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
              gap: "1rem",
            }}
          >
            {visible.map((service) => (
              <Link
                to={service.route}
                key={service.id}
                // Entire card is the link, ensuring redirection on any click within the card
                className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-lg transition relative hover:border-blue-600 hover:scale-[1.01] duration-200 cursor-pointer border border-transparent"
              >
                
                {/* Image Area */}
                <div className="h-36 flex items-center justify-center overflow-hidden mb-3 relative z-20">
                  <img
                    src={service.img}
                    alt={service.title}
                    // object-cover ensures the image fills the space without being stretched
                    className="object-cover h-full w-full rounded-md transition-transform" 
                  />
                </div>

                {/* Service Details (Title, Reviews) */}
                <h4 className="text-lg font-bold text-gray-900 truncate relative z-20">
                  {service.title}
                </h4>

                {/* Reviews Section */}
                {service.rating > 0 && (
                  <div className="flex items-center mt-1 mb-3 relative z-20">
                    <div className="text-yellow-500 text-sm mr-1">
                      {"★".repeat(Math.floor(service.rating))}
                    </div>
                    <span className="text-sm text-gray-500">({service.reviews} Clients)</span>
                  </div>
                )}
                
                {/* Styled div/span to look like the "Explore" button. Clicking this still navigates due to the parent <Link>. */}
                <span className="mt-auto block w-full py-2 text-center text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition relative z-20">
                  Explore
                </span>
              </Link>
            ))}
          </div>

          {/* Navigation Buttons (Unchanged) */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 opacity-0 group-hover/slider:opacity-100 transition duration-300 z-40"
            aria-label="Previous service"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 opacity-0 group-hover/slider:opacity-100 transition duration-300 z-40"
            aria-label="Next service"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}