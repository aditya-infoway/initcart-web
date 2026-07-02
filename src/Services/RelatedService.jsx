import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const relatedServices = [
  { id: 1, title: "Real Estate", img: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png", link: "/realestatehome" },
  { id: 2, title: "Gym", img: "https://cdn-icons-png.flaticon.com/512/892/892781.png", link: "/gymhome" },
  { id: 3, title: "Hair Saloon", img: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png", link: "/saloonhome" },
  { id: 4, title: "Travel Agency", img: "https://cdn-icons-png.flaticon.com/512/149/149060.png", link: "/travelhome" },
  { id: 5, title: "Finance", img: "https://cdn-icons-png.flaticon.com/512/2331/2331941.png", link: "/financehome" },
  { id: 6, title: "Tech Industry", img: "https://cdn-icons-png.flaticon.com/512/1040/1040251.png", link: "/techindustryhome" },
  { id: 7, title: "Hospitality", img: "https://cdn-icons-png.flaticon.com/512/2910/2910765.png", link: "/hotelhome" },
  { id: 8, title: "Healthcare", img: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png", link: "/helthcarehome" },
  { id: 9, title: "Education", img: "https://cdn-icons-png.flaticon.com/512/201/201818.png", link: "/educationhome" },
  { id: 10, title: "Professional Services", img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", link: "/professionalhome" },
  { id: 11, title: "Workplace", img: "https://cdn-icons-png.flaticon.com/512/3159/3159676.png", link: "/workplacehome" },
];

export default function RelatedServiceSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const navigate = useNavigate();

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else if (window.innerWidth < 1280) setVisibleCount(3);
      else setVisibleCount(4);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? relatedServices.length - visibleCount : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev >= relatedServices.length - visibleCount ? 0 : prev + 1
    );
  };

  return (
    <div className=" mx-auto px-4 py-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Related Services</h2>
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10"
        >
          &#8592;
        </button>

        {/* Slider */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
          >
            {relatedServices.map((service) => (
              <div
                key={service.id}
                className="shrink-0 px-2 cursor-pointer"
                style={{ width: `${100 / visibleCount}%` }}
                onClick={() => navigate(service.link)}
              >
                <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-40 object-contain rounded-lg mb-3"
                  />
                  <h3 className="text-center font-medium text-gray-700">{service.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
}
