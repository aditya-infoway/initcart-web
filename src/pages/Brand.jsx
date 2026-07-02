import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { publicAxios } from "../api/axios";

export default function BrandSlider() {
  const [itemsPerView, setItemsPerView] = useState(5);
  const [start, setStart] = useState(0);
  const [brandsData, setBrandsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API से brands fetch करें
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        // console.log("Fetching brands from API...");
        
        // आपके API के अनुसार endpoint
        const response = await publicAxios.get("/ecommerce/public/brands/");
        // console.log("Brands API Response:", response.data);
        
        // API response को हमारे component के format में map करें
        const mappedBrands = response.data.map((brand, index) => ({
          id: brand.id,
          uniqueId: `${brand.id}-${index}`,
          name: brand.brand_name,
          img: brand.brand_logo_url || `https://picsum.photos/seed/brand${brand.id}/300/300`,
          description: brand.description || "",
          product_count: brand.product_count || 0,
          status: brand.status
        }));
        
        // केवल active brands filter करें
        const activeBrands = mappedBrands.filter(brand => brand.status === "active");
        
        // Duplicate entries को remove करें
        const uniqueBrands = Array.from(
          new Map(activeBrands.map(item => [item.id, item])).values()
        );
        
        // console.log("Active unique brands loaded:", uniqueBrands.length);
        setBrandsData(uniqueBrands);
        setError(null);
        
      } catch (err) {
        console.error("Error fetching brands:", err);
        setError("Failed to load brands. Please try again later.");
        
        // Fallback data (API fail होने पर)
        const fallbackData = Array.from({ length: 12 }).map((_, i) => {
          const names = [
            "Nike", "Adidas", "Puma", "Reebok", 
            "Apple", "Samsung", "Sony", "LG", 
            "Canon", "Dell", "HP", "Lenovo"
          ];
          return {
            id: i + 1,
            uniqueId: `fallback-${i + 1}`,
            name: names[i % names.length],
            img: `https://picsum.photos/seed/brand${i}/300/300`,
            description: `${names[i % names.length]} brand products`,
            product_count: Math.floor(Math.random() * 100),
            status: "active"
          };
        });
        
        setBrandsData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const setFromWidth = () => {
      const w = window.innerWidth;
      if (w >= 1280) setItemsPerView(7);
      else if (w >= 1024) setItemsPerView(6);
      else if (w >= 768) setItemsPerView(3);
      else setItemsPerView(3);
    };
    setFromWidth();
    window.addEventListener("resize", setFromWidth);
    return () => window.removeEventListener("resize", setFromWidth);
  }, []);

  useEffect(() => setStart(0), [itemsPerView]);

  // Fixed: Duplicate key issues को resolve करने के लिए visible items logic
  const visible = useMemo(() => {
    if (brandsData.length === 0) return [];
    
    const out = [];
    for (let i = 0; i < itemsPerView; i += 1) {
      const itemIndex = (start + i) % brandsData.length;
      const item = brandsData[itemIndex];
      
      // Check for duplicates
      const isDuplicate = out.some(existingItem => existingItem.id === item.id);
      
      if (!isDuplicate) {
        out.push({
          ...item,
          sliderIndex: i
        });
      } else {
        // अगर duplicate है, तो next item लें
        const nextIndex = (itemIndex + 1) % brandsData.length;
        const nextItem = brandsData[nextIndex];
        if (nextItem && !out.some(existing => existing.id === nextItem.id)) {
          out.push({
            ...nextItem,
            sliderIndex: i
          });
        }
      }
    }
    return out;
  }, [start, itemsPerView, brandsData]);

  const prev = () => {
    if (brandsData.length === 0) return;
    setStart((s) => (s - 1 + brandsData.length) % brandsData.length);
  };
  
  const next = () => {
    if (brandsData.length === 0) return;
    setStart((s) => (s + 1) % brandsData.length);
  };

  // Auto-slide - केवल तभी जब brands हों
  useEffect(() => {
    if (brandsData.length === 0) return;
    
    const id = setInterval(() => {
      setStart((s) => (s + 1) % brandsData.length);
    }, 7000);
    
    return () => clearInterval(id);
  }, [brandsData.length]);

  // Loading state
  if (loading) {
    return (
      <section className="mt-10 overflow-hidden">
        <div className="flex items-center justify-between mb-4 px-2 md:px-0">
          <h2 className="text-lg font-semibold text-gray-900">Brands</h2>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
        <div className="relative overflow-hidden group/brands">
          <div
            className="grid transition-all duration-300 ease-in-out py-5"
            style={{
              gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
              gap: "1.75rem",
            }}
          >
            {Array.from({ length: itemsPerView }).map((_, i) => (
              <div key={`loading-${i}`} className="text-center">
                <div className="mx-auto h-28 w-28 md:w-36 md:h-36 rounded-full ring-1 ring-gray-200 bg-gray-200 shadow-sm overflow-hidden animate-pulse"></div>
                <div className="mt-3 w-28 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && brandsData.length === 0) {
    return (
      <section className="mt-10 overflow-hidden">
        <div className="flex items-center justify-between mb-4 px-2 md:px-0">
          <h2 className="text-lg font-semibold text-gray-900">Brands</h2>
        </div>
        <div className="text-center p-8 border border-red-200 bg-red-50 rounded-xl">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (brandsData.length === 0) {
    return (
      <section className="mt-10 overflow-hidden">
        <div className="flex items-center justify-between mb-4 px-2 md:px-0">
          <h2 className="text-lg font-semibold text-gray-900">Brands</h2>
        </div>
        <div className="text-center p-8 border border-gray-200 bg-gray-50 rounded-xl">
          <p className="text-gray-600">No brands available</p>
        </div>
      </section>
    );
  }

  // Debug log
  // console.log("Visible brands:", visible.map(b => ({ id: b.id, name: b.name })));

  return (
    <section className="mt-10 overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-2 md:px-0">
        <h2 className="text-lg font-semibold text-gray-900">BRANDS</h2>
        <Link
          to="/brandlist"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View all
        </Link>
      </div>

      <div className="relative overflow-hidden group/brands">
        <div
          className="grid transition-all duration-300 ease-in-out py-5"
          style={{
            gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
            gap: "1.75rem",
          }}
        >
          {visible.map((brand, index) => {
            // Unique key बनाएं duplicate error से बचने के लिए
            const uniqueKey = `${brand.id}-${brand.sliderIndex || index}-${start}`;
            
            return (
              <Link
                to={`/brand-products/?brand=${brand.id}`}
                key={uniqueKey}
                className="text-center group cursor-pointer"
              >
                <div className="mx-auto h-28 w-28 md:w-36 md:h-36 rounded-full ring-1 ring-blue-400 bg-white shadow-sm overflow-hidden relative transform transition duration-300 group-hover:scale-105 group-hover:shadow-md">
                  <img
                    src={brand.img}
                    alt={brand.name}
                    className="h-full w-full object-cover group-hover:opacity-90 transition duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://picsum.photos/seed/brand${brand.id}/300/300`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                </div>
                <div className="mt-3 w-28 text-sm font-medium text-gray-700 truncate mx-auto group-hover:text-blue-600 transition">
                  {brand.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {brand.product_count} products
                </div>
              </Link>
            );
          })}
        </div>

        {/* Navigation buttons - केवल तभी show करें जब itemsPerView से ज्यादा items हों */}
        {brandsData.length > itemsPerView && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow border border-gray-200 transition-opacity duration-300 opacity-0 group-hover/brands:opacity-100 hover:bg-gray-50 z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow border border-gray-200 transition-opacity duration-300 opacity-0 group-hover/brands:opacity-100 hover:bg-gray-50 z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}