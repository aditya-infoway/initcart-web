// UpcomingFlashDeals.jsx
import React, { useState, useEffect } from "react";
import { publicAxios } from "../api/axios";

const UpcomingFlashDeals = () => {
  const [upcomingDeals, setUpcomingDeals] = useState({
    total_upcoming: 0,
    next_deal: null,
    by_type: {
      flash: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Fetch upcoming deals from API
  useEffect(() => {
    const fetchUpcomingDeals = async () => {
      try {
        const response = await publicAxios.get("/api/ecommerce/public/upcoming-deals/");
        const data = response.data;
        
        setUpcomingDeals({
          total_upcoming: data.total_upcoming || 0,
          next_deal: data.next_deal || null,
          by_type: {
            flash: data.by_type?.flash || 0
          }
        });

        // Set initial countdown if next deal exists
        if (data.next_deal?.countdown_seconds) {
          const seconds = data.next_deal.countdown_seconds;
          setTimeLeft({
            hours: Math.floor(seconds / 3600),
            minutes: Math.floor((seconds % 3600) / 60),
            seconds: seconds % 60
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

  // Countdown timer
  useEffect(() => {
    if (!upcomingDeals.next_deal?.countdown_seconds) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
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

  // Format number
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "00";
    return num < 10 ? `0${num}` : num.toString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-400 rounded-lg p-6 shadow-sm animate-pulse">
        <div className="h-8 bg-blue-200 rounded w-48 mx-auto mb-4"></div>
        <div className="flex justify-center gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-blue-300 rounded-md p-3 w-20 h-16"></div>
          ))}
        </div>
      </div>
    );
  }

  // No upcoming flash deals
  if (!upcomingDeals.by_type?.flash || upcomingDeals.by_type.flash === 0) {
    return null;
  }

  return (
    <section className="bg-blue-50 border border-blue-400 rounded-lg p-6 shadow-sm">
      {/* Header - Sirf FLASH DEAL */}
      <h2 className="text-lg font-bold text-blue-900 text-center mb-4">
        UPCOMING FLASH DEAL
      </h2>

      {/* Countdown Timer - Center mein, exactly FlashDeal jaisa */}
      <div className="flex justify-center space-x-3 text-center">
        {['hours', 'minutes', 'seconds'].map((key) => (
          <div key={key} className="bg-blue-700 rounded-md p-3 min-w-[70px]">
            <div className="text-2xl font-bold text-white">
              {formatNumber(timeLeft[key])}
            </div>
            <div className="text-xs text-blue-200 uppercase tracking-wide mt-1">
              {key === 'hours' ? 'HRS' : key === 'minutes' ? 'MIN' : 'SEC'}
            </div>
          </div>
        ))}
      </div>

      {/* Total Flash Deals - Small text at bottom */}
      <p className="text-center text-sm text-blue-600 mt-3">
        {upcomingDeals.by_type.flash} Flash {upcomingDeals.by_type.flash === 1 ? 'Deal' : 'Deals'} Coming
      </p>
    </section>
  );
};

export default UpcomingFlashDeals;