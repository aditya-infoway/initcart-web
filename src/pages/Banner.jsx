import React, { useEffect, useState } from 'react'
import { publicAxios } from '../api/axios';

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        // ✅ सही API endpoint - banners app से combined-banners/
        const res = await publicAxios.get('api/banners/combined-banners/');
        
        // सिर्फ उन बैनर को फिल्टर करें जिनकी image है
        const validBanners = res.data.filter((banner) => banner.image);
        setBanners(validBanners);
      } catch (err) {
        console.error('Failed to fetch banners', err);
        
        // Fallback: पुरानी API
        try {
          const fallbackRes = await publicAxios.get('api/banners/init-slider/');
          const urls = fallbackRes.data.map((item, idx) => ({
            id: `fallback_${idx}`,
            type: 'regular',
            image: item.image,
            title: '',
            subtitle: '',
            button_text: '',
            button_url: '',
            product_id: null,
            campaign_id: null,
            campaign_name: null
          }));
          setBanners(urls);
        } catch (fallbackErr) {
          console.error('Fallback also failed', fallbackErr);
          setBanners([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto slide
  useEffect(() => {
    if (banners.length === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [banners]);

  const goPrev = () => setIndex((i) => (i - 1 + banners.length) % banners.length);
  const goNext = () => setIndex((i) => (i + 1) % banners.length);

  // Handle banner click
  const handleBannerClick = (banner) => {
    if (banner.type === 'deal_of_day') {
      if (banner.button_url) {
        window.location.href = banner.button_url;
      } else if (banner.product_id) {
        window.location.href = `/product/${banner.product_id}/`;
      }
    }
    // Regular banners image 
  };

  if (loading) {
    return (
      <div className="relative aspect-[16/5] overflow-hidden rounded-lg bg-slate-200 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading banners...</div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative aspect-[16/5] overflow-hidden rounded-lg bg-slate-200">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">No banners available</div>
        </div>
      </div>
    );
  }

  const currentBanner = banners[index];

  return (
    <div className="relative aspect-[16/5] overflow-hidden rounded-lg group">
      {/* Banner Image */}
      <div className="relative h-full w-full">
        <img
          key={currentBanner.id}
          src={currentBanner.image}
          alt={currentBanner.title || `Banner ${index + 1}`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
        
        {/* ✅ सिर्फ Deal of the Day के लिए ही gradient और content दिखाएँ */}
        {currentBanner.type === 'deal_of_day' && (
          <>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
            
            {/* Banner Content - Title, Subtitle, Button */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24">
              <div className="max-w-2xl">
                {/* Deal of the Day Badge */}
                <span className="inline-block px-3 py-1 mb-3 bg-blue-600 text-white text-xs font-semibold rounded-full">
                  Deal of the Day
                </span>
                
                {/* Title */}
                {currentBanner.title && (
                  <h2 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                    {currentBanner.title}
                  </h2>
                )}
                
                {/* Subtitle */}
                {currentBanner.subtitle && (
                  <p className="text-white/90 text-sm md:text-base lg:text-lg mb-4 drop-shadow-md max-w-xl">
                    {currentBanner.subtitle}
                  </p>
                )}
                
                {/* Shop Now Button */}
                <button
                  onClick={() => handleBannerClick(currentBanner)}
                  className="px-6 py-2.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg flex items-center gap-2 group"
                >
                  <span>{currentBanner.button_text || 'Shop Now'}</span>
                  <svg 
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Campaign Name */}
                {currentBanner.campaign_name && (
                  <p className="text-white/70 text-xs mt-3">
                    {currentBanner.campaign_name}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation Buttons - सभी banners के लिए */}
      <button 
        onClick={goPrev} 
        aria-label="Previous" 
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-800 shadow-lg hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      
      <button 
        onClick={goNext} 
        aria-label="Next" 
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-800 shadow-lg hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              i === index 
                ? 'bg-white w-6' 
                : 'bg-white/60 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
      
      {/* Banner Counter */}
      <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
        {index + 1} / {banners.length}
      </div>
    </div>
  );
}