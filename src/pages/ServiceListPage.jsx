import React, { useState, useEffect } from "react";
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
import MobileServiceListPage from "./mobile/MobileServiceList";

const allServices = [
    { id: 1,  title: "Real Estate",        keyword: "real estate,house",    path: "/realestatehome",   img: realEstateIcon },
    { id: 2,  title: "Gym",                keyword: "gym,fitness",          path: "/gymhome",          img: gymIcon },
    { id: 3,  title: "Saloon",             keyword: "salon,beauty",         path: "/saloonhome",       img: saloonIcon },
    { id: 4,  title: "Travel Agency",      keyword: "travel,holiday",       path: "/travelhome",       img: travelIcon },
    { id: 5,  title: "Finance",            keyword: "finance,money",        path: "/financehome",      img: financeIcon },
    { id: 6,  title: "Tech Industry",      keyword: "technology,startup",   path: "/techindustryhome", img: techIcon },
    { id: 7,  title: "Hotel & Restaurant", keyword: "hotel,restaurant",     path: "/hotelhome",        img: hotelIcon },
    { id: 8,  title: "Healthcare",         keyword: "healthcare,hospital",  path: "/helthcarehome",    img: healthcareIcon },
    { id: 9,  title: "Education",          keyword: "education,school",     path: "/educationhome",    img: educationIcon },
    { id: 10, title: "Professional",       keyword: "professional,office",  path: "/professionalhome", img: professionalIcon },
    { id: 11, title: "Work Place",         keyword: "coworking,office",     path: "/workplacehome",    img: workplaceIcon },
];

function svgPlaceholder(title, size = 200) {
    const initials = title.split(" ").map((s) => s[0] || "").slice(0, 2).join("").toUpperCase();
    const bg = "#f1f5f9";
    const fg = "#475569";
    const fontSize = Math.round(size / 3.5);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
    <rect width='100%' height='100%' fill='${bg}'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='${fontSize}' fill='${fg}'>${initials}</text>
  </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function ServiceListPage() {
    // ── HOOKS SABSE UPAR — koi bhi return se pehle ───────────────────────────
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // ── Derived values — hooks ke baad, return se pehle ─────────────────────
    const getUnsplashUrl = (keyword) =>
        `https://source.unsplash.com/featured/400x400/?${encodeURIComponent(keyword.split(",")[0])}`;

    const filteredServices = allServices.filter(
        (service) =>
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── Mobile early return — hooks ke BAAD ──────────────────────────────────
    if (isMobile) return <MobileServiceListPage />;

    // ── Desktop layout ────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
            <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Our Services</h1>
                            <p className="text-gray-600 mt-1">
                                Explore {allServices.length} premium services tailored for you
                            </p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-5 py-3 pl-12 pr-10 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
                            />
                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {filteredServices.length} Services
                        </span>
                        {searchTerm && (
                            <span className="text-gray-600 text-sm md:text-base">
                                Results for: <span className="font-semibold">{searchTerm}</span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        <span>11 Services</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6 place-items-center">
                    {filteredServices.map((service) => (
                        <div key={service.id} className="group cursor-pointer w-full flex flex-col items-center" onClick={() => navigate(service.path)}>
                            <div className="relative bg-white rounded-2xl p-3 sm:p-4 md:p-5 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group-hover:-translate-y-1 w-full max-w-[160px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[200px] xl:max-w-[220px]">
                                <div className="relative mb-3 sm:mb-4 md:mb-5 w-full flex justify-center">
                                    <div className="absolute -inset-1 sm:-inset-2 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-sm group-hover:blur transition duration-500"></div>
                                    <div className="relative rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-white to-gray-50 flex items-center justify-center overflow-hidden h-[100px] w-[100px] sm:h-[100px] sm:w-[100px] md:h-[110px] md:w-[110px] lg:h-[120px] lg:w-[120px] xl:h-[130px] xl:w-[130px]">
                                        <div className="rounded-full overflow-hidden h-[88px] w-[88px] sm:h-[88px] sm:w-[88px] md:h-[96px] md:w-[96px] lg:h-[104px] lg:w-[104px] xl:h-[112px] xl:w-[112px]">
                                            <img
                                                src={service.img || getUnsplashUrl(service.keyword)}
                                                alt={service.title}
                                                loading="lazy"
                                                decoding="async"
                                                referrerPolicy="no-referrer"
                                                className="h-full w-full object-cover transform transition duration-500 ease-out group-hover:scale-110"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = getUnsplashUrl(service.keyword);
                                                    setTimeout(() => {
                                                        if (!e.currentTarget.complete || e.currentTarget.naturalWidth === 0)
                                                            e.currentTarget.src = `https://picsum.photos/seed/service-${service.id}/300/300`;
                                                    }, 2000);
                                                    setTimeout(() => {
                                                        if (!e.currentTarget.complete || e.currentTarget.naturalWidth === 0)
                                                            e.currentTarget.src = svgPlaceholder(service.title, 300);
                                                    }, 4000);
                                                }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-blue-300/50 transition duration-300"></div>
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                    </div>
                                </div>
                                <div className="text-center space-y-2 md:space-y-3 w-full">
                                    <h3 className="text-xs sm:text-xs md:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition duration-300 truncate px-1">
                                        {service.title}
                                    </h3>
                                    <div className="pt-1 md:pt-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(service.path); }}
                                            className="w-full px-2 py-1.5 md:px-3 md:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg md:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow hover:shadow-md text-xs md:text-sm"
                                        >
                                            <span className="flex items-center justify-center gap-1">
                                                Inquiry Now
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredServices.length === 0 && (
                    <div className="text-center py-10 sm:py-20 px-4">
                        <div className="max-w-lg mx-auto">
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 sm:mb-8">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 blur-xl"></div>
                                <div className="relative rounded-full bg-white border-8 border-gray-100 h-32 w-32 sm:h-40 sm:w-40 flex items-center justify-center">
                                    <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">No services found</h3>
                            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                                We couldn't find any services matching "{searchTerm}". Try different keywords or browse all services.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <button onClick={() => setSearchTerm("")} className="px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-lg text-sm sm:text-base">
                                    View All Services
                                </button>
                                <button onClick={() => navigate("/")} className="px-6 sm:px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:border-blue-400 hover:text-blue-700 transition text-sm sm:text-base">
                                    Return Home
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}