import React, { useState, useEffect } from 'react';
import { publicAxios } from '../api/axios';
import CategorySlider from './CategorySliders';

const HomeSliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeSliders = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get('/ecommerce/public/web-home-categories/');
        
        if (response.data.success) {
          setSliders(response.data.data);
        } else {
          setError('Failed to load homepage sections');
        }
      } catch (err) {
        console.error('Error fetching home sliders:', err);
        setError('Network error. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeSliders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center my-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (sliders.length === 0) {
    return null; // Don't show anything if no sliders configured
  }

  return (
    <div className="space-y-8">
      {sliders.map((slider) => (
        <CategorySlider
          key={slider.category.id}
          category={slider.category}
          products={slider.products}
          totalProducts={slider.total_products}
        />
      ))}
    </div>
  );
};

export default HomeSliders;