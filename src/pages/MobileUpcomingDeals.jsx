// MobileUpcomingDeals.jsx
import React, { useState, useEffect } from "react";
import { publicAxios } from "../api/axios";

const MobileUpcomingDeals = () => {
  const [upcomingDeals, setUpcomingDeals] = useState({
    total_upcoming: 0,
    next_deal: null,
    by_type: { flash: 0 },
  });

  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const fetchUpcomingDeals = async () => {
      try {
        const response = await publicAxios.get(
          "/api/ecommerce/public/upcoming-deals/"
        );

        const data = response.data;

        setUpcomingDeals({
          total_upcoming: data.total_upcoming || 0,
          next_deal: data.next_deal || null,
          by_type: { flash: data.by_type?.flash || 0 },
        });

        if (data.next_deal?.countdown_seconds) {
          const seconds = data.next_deal.countdown_seconds;

          setTimeLeft({
            hours: Math.floor(seconds / 3600),
            minutes: Math.floor((seconds % 3600) / 60),
            seconds: seconds % 60,
          });
        }
      } catch (error) {
        console.error("Error fetching upcoming deals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingDeals();
  }, []);

  useEffect(() => {
    if (!upcomingDeals.next_deal?.countdown_seconds) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [upcomingDeals.next_deal]);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "00";
    return num < 10 ? `0${num}` : num.toString();
  };

  if (loading) return null;

  if (!upcomingDeals.by_type?.flash) return null;

  // Animated Number Box
  const NumberBox = ({ value, label }) => (
    <div className="bg-blue-700 rounded-xl w-[58px] h-[58px] flex flex-col items-center justify-center shadow-sm overflow-hidden">
      <div
        key={value}
        className="text-white text-[22px] font-bold leading-none animate-slideUp"
      >
        {formatNumber(value)}
      </div>

      <div className="text-[8px] text-blue-100 uppercase mt-1 tracking-wide">
        {label}
      </div>
    </div>
  );

return (
  <>
    <style>
      {`
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease;
        }
      `}
    </style>

    <div className="px-3 mt-2">
      {/* Main Box */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-2 px-2">
        
        {/* Title */}
        <div className="text-center mb-1">
          <h3 className="text-[11px] font-bold text-black tracking-wide">
            UPCOMING FLASH DEAL
          </h3>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-center gap-1">

          {/* Hours */}
          <div className="bg-blue-700 rounded-md w-[48px] h-[42px] flex flex-col items-center justify-center overflow-hidden">
            <div
              key={timeLeft.hours}
              className="text-white text-[16px] font-bold leading-none animate-slideUp"
            >
              {formatNumber(timeLeft.hours)}
            </div>

            <div className="text-[6px] text-blue-100 uppercase mt-[2px] leading-none">
              HRS
            </div>
          </div>

          <span className="text-blue-700 font-bold text-sm">:</span>

          {/* Minutes */}
          <div className="bg-blue-700 rounded-md w-[48px] h-[42px] flex flex-col items-center justify-center overflow-hidden">
            <div
              key={timeLeft.minutes}
              className="text-white text-[16px] font-bold leading-none animate-slideUp"
            >
              {formatNumber(timeLeft.minutes)}
            </div>

            <div className="text-[6px] text-blue-100 uppercase mt-[2px] leading-none">
              MIN
            </div>
          </div>

          <span className="text-blue-700 font-bold text-sm">:</span>

          {/* Seconds */}
          <div className="bg-blue-700 rounded-md w-[48px] h-[42px] flex flex-col items-center justify-center overflow-hidden">
            <div
              key={timeLeft.seconds}
              className="text-white text-[16px] font-bold leading-none animate-slideUp"
            >
              {formatNumber(timeLeft.seconds)}
            </div>

            <div className="text-[6px] text-blue-100 uppercase mt-[2px] leading-none">
              SEC
            </div>
          </div>

        </div>
      </div>
    </div>
  </>
);

};

export default MobileUpcomingDeals;