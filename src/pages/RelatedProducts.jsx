import React, { useState, useEffect } from "react";

const relatedProducts = [
  {
    id: 1,
    title: "Wireless Headphones",
    price: "$99",
    img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-17-66e96c995236e.webp",
  },
  {
    id: 2,
    title: "Smart Watch",
    price: "$149",
    img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-17-66e96c995236e.webp",
  },
  {
    id: 3,
    title: "DSLR Camera",
    price: "$499",
    img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-17-66e96c995236e.webp",
  },
  {
    id: 4,
    title: "Gaming Mouse",
    price: "$59",
    img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-17-66e96c995236e.webp",
  },
  {
    id: 5,
    title: "Bluetooth Speaker",
    price: "$89",
    img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-17-66e96c995236e.webp",
  },
  {
    id: 6,
    title: "Laptop Stand",
    price: "$79",
    img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-17-66e96c995236e.webp",
  },
];

export default function RelatedProductSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  // Adjust visible items on screen resize
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
      prev === 0 ? relatedProducts.length - visibleCount : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev >= relatedProducts.length - visibleCount ? 0 : prev + 1
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Related Products</h2>
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
            className="flex transition-transform duration-300"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
          >
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                className="shrink-0 px-2"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <div className="bg-white p-4 rounded-lg shadow">
                  <img
                    src={product.img}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded"
                  />
                  <h3 className="mt-2 font-medium">{product.title}</h3>
                  <p className="text-blue-600 font-semibold">
                    {product.price}
                  </p>
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
