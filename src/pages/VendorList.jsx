import React, { useState } from "react";
import { Link } from "react-router-dom";

const vendors = [
  {
    id: 1,
    name: "6valley CMS",
    rating: 4.8,
    reviews: 4,
    products: 195,
    banner: "https://picsum.photos/seed/banner1/400/200",
    logo: "https://picsum.photos/seed/logo1/80/80",
  },
  {
    id: 2,
    name: "Bicycle Shop",
    rating: 0,
    reviews: 0,
    products: 14,
    banner: "https://picsum.photos/seed/banner2/400/200",
    logo: "https://picsum.photos/seed/logo2/80/80",
  },
  {
    id: 3,
    name: "Book Store",
    rating: 4.5,
    reviews: 2,
    products: 20,
    banner: "https://picsum.photos/seed/banner3/400/200",
    logo: "https://picsum.photos/seed/logo3/80/80",
  },
  {
    id: 4,
    name: "Golden Jewellery",
    rating: 3.0,
    reviews: 1,
    products: 17,
    banner: "https://picsum.photos/seed/banner4/400/200",
    logo: "https://picsum.photos/seed/logo4/80/80",
  },
  {
    id: 5,
    name: "FootFinds",
    rating: 5.0,
    reviews: 1,
    products: 13,
    banner: "https://picsum.photos/seed/banner5/400/200",
    logo: "https://picsum.photos/seed/logo5/80/80",
  },
  {
    id: 6,
    name: "Phone Store",
    rating: 0,
    reviews: 0,
    products: 13,
    banner: "https://picsum.photos/seed/banner6/400/200",
    logo: "https://picsum.photos/seed/logo6/80/80",
  },
];

export default function VendorList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Default");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Stores</h1>
          <div className="mt-4 md:mt-0 relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search Store"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* ================= LEFT SIDEBAR ================= */}
          <aside className="md:col-span-1">
            <div className="sticky top-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-5">
              <h2 className="font-semibold text-gray-700 mb-3">Filter By</h2>

              {/* Filter Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Filter
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option>Default</option>
                  <option>Top Rated</option>
                  <option>Most Products</option>
                </select>
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Product Type
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option>All</option>
                  <option>Physical</option>
                  <option>Digital</option>
                </select>
              </div>

              {/* Categories (Scrollable) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Categories
                </label>
                <div className="border border-gray-200 rounded-md h-60 overflow-y-auto p-2 space-y-2">
                  {[
                    { name: "Health & Beauty", icon: "💅" },
                    { name: "Pet Supplies", icon: "🐾" },
                    { name: "Home & Kitchen", icon: "🏠" },
                    { name: "Baby & Toddler", icon: "🧸" },
                    { name: "Sports & Outdoor", icon: "⚽" },
                    { name: "Phone & Gadgets", icon: "📱" },
                    { name: "Electronics & Gadgets", icon: "💻" },
                    { name: "Fashion & Clothing", icon: "👗" },
                    { name: "Automotive", icon: "🚗" },
                    { name: "Furniture", icon: "🛋️" },
                    { name: "Groceries", icon: "🛒" },
                    { name: "Books & Stationery", icon: "📚" },
                    { name: "Gaming", icon: "🎮" },
                    { name: "Music", icon: "🎵" },
                  ].map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setCategory(cat.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border transition ${
                        category === cat.name
                          ? "bg-blue-50 border-blue-400 text-blue-700"
                          : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span> {cat.name}
                      </span>
                      {category === cat.name && (
                        <span className="text-blue-500 text-xs font-semibold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Brands
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option>All</option>
                  <option>Keithson</option>
                  <option>Electrical Charge</option>
                  <option>OTO Speedies</option>
                  <option>Power Energy</option>
                </select>
              </div>
            </div>
          </aside>

          {/* ================= RIGHT SIDE: VENDORS ================= */}
          <div className="md:col-span-3">
            {filteredVendors.length === 0 ? (
              <div className="text-center text-gray-500">No stores found</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <Link
                    to={`/vendor/${vendor.id}`}
                    key={vendor.id}
                    className="group block rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    {/* Banner */}
                    <div className="relative h-24 bg-gray-100">
                      <img
                        src={vendor.banner}
                        alt={vendor.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>

                    {/* Card */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={vendor.logo}
                            alt={vendor.name}
                            className="h-12 w-12 rounded-full ring-1 ring-gray-200"
                          />
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {vendor.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{vendor.rating} ★</span>
                              <span>|</span>
                              <span>{vendor.reviews} Reviews</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                          {vendor.products} Products
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
  